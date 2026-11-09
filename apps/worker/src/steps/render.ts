import fs from "node:fs/promises";
import path from "node:path";
import { keys, prisma, uploadFile } from "@clipforge/core";
import { buildAss } from "../lib/ass";
import type { CaptionStyleId } from "../lib/captionStyles";
import { run } from "../lib/exec";
import { cropGeometry, cropXExpr, smoothPath } from "../lib/framing";
import { trackFaces } from "../lib/track";
import type { PickedClip, Word } from "../types";

export type Reframe = "auto" | "center";

/** Renders one 1080x1920 clip with burned-in captions. Shared by the first render and editor re-renders. */
export async function renderClipFile(o: {
  file: string;
  dir: string;
  tag: string;
  start: number;
  end: number;
  words: Word[];
  style: CaptionStyleId;
  reframe: Reframe;
  width: number;
  height: number;
}) {
  const { file, dir, tag, start, end } = o;
  const duration = end - start;
  const assName = `sub_${tag}.ass`;
  const scriptName = `filter_${tag}.txt`;
  const video = path.join(dir, `clip_${tag}.mp4`);
  const thumb = path.join(dir, `clip_${tag}.jpg`);

  await fs.writeFile(path.join(dir, assName), buildAss(o.words, start, end, o.style), "utf8");

  const geo = cropGeometry(o.width, o.height);
  let xExpr = String(geo.x0);
  let tracked = false;
  if (o.reframe === "auto") {
    const samples = await trackFaces(file, start, end, dir);
    const path_ = samples ? smoothPath(samples, duration, geo.cw / o.width) : null;
    if (path_) {
      xExpr = cropXExpr(path_, o.width, geo.cw);
      tracked = true;
    }
  }

  // The filter lives in a script file: the tracking expression can be several KB and full of commas.
  await fs.writeFile(
    path.join(dir, scriptName),
    `crop=w=${geo.cw}:h=${geo.ch}:x='${xExpr}':y=${geo.y0},scale=1080:1920:flags=lanczos,setsar=1,subtitles=${assName}`,
    "utf8",
  );

  await run(
    "ffmpeg",
    [
      "-nostdin", "-y",
      "-ss", start.toFixed(3), "-i", file, "-t", duration.toFixed(3),
      "-filter_script:v", scriptName,
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "21", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "128k",
      "-movflags", "+faststart",
      path.basename(video),
    ],
    { cwd: dir, timeoutMs: 15 * 60_000 },
  );

  let thumbPath: string | null = thumb;
  try {
    await run("ffmpeg", ["-nostdin", "-y", "-ss", "1", "-i", video, "-frames:v", "1", "-q:v", "3", thumb], {
      timeoutMs: 60_000,
    });
  } catch {
    thumbPath = null; // a missing poster should never fail the whole clip
  }

  await Promise.all([assName, scriptName].map((f) => fs.rm(path.join(dir, f), { force: true })));
  return { video, thumb: thumbPath, tracked };
}

export async function renderClips(opts: {
  projectId: string;
  file: string;
  dir: string;
  clips: PickedClip[];
  words: Word[];
  style: CaptionStyleId;
  reframe: Reframe;
  width: number;
  height: number;
  onProgress: (done: number, total: number) => Promise<unknown>;
}) {
  const { projectId, clips, onProgress } = opts;
  const rows: {
    projectId: string; index: number; title: string; reason: string; score: number;
    startSec: number; endSec: number; captionStyle: string; reframe: string; version: number;
    videoKey: string; thumbKey: string | null;
  }[] = [];

  for (const [n, clip] of clips.entries()) {
    const out = await renderClipFile({
      file: opts.file, dir: opts.dir, tag: String(clip.index), start: clip.start, end: clip.end,
      words: opts.words, style: opts.style, reframe: opts.reframe, width: opts.width, height: opts.height,
    });

    const videoKey = keys.clip(projectId, clip.index, 1);
    await uploadFile(videoKey, out.video, "video/mp4");
    let thumbKey: string | null = null;
    if (out.thumb) {
      thumbKey = keys.thumb(projectId, clip.index, 1);
      await uploadFile(thumbKey, out.thumb, "image/jpeg");
    }
    rows.push({
      projectId, index: clip.index, title: clip.title, reason: clip.reason, score: clip.score,
      startSec: clip.start, endSec: clip.end, captionStyle: opts.style, reframe: opts.reframe, version: 1,
      videoKey, thumbKey,
    });

    // free disk as we go
    await Promise.all([out.video, out.thumb].filter((f): f is string => Boolean(f)).map((f) => fs.rm(f, { force: true })));
    await onProgress(n + 1, clips.length);
  }

  // Replace any clips from a previous (partial) attempt atomically.
  await prisma.$transaction([
    prisma.clip.deleteMany({ where: { projectId } }),
    prisma.clip.createMany({ data: rows }),
  ]);
}
