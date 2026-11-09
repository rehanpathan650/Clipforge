import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { UnrecoverableError } from "bullmq";
import { deleteObjects, downloadToFile, keys, prisma, uploadFile, type RerenderJob } from "@clipforge/core";
import { parseStyle } from "./lib/captionStyles";
import { probe } from "./lib/exec";
import { renderClipFile } from "./steps/render";
import type { Word } from "./types";

/** Re-render one clip after the user trimmed it or changed captions/framing in the editor. No credits are charged. */
export async function processRerender(data: RerenderJob) {
  const clip = await prisma.clip.findUnique({ where: { id: data.clipId }, include: { project: true } });
  if (!clip) throw new UnrecoverableError("Clip not found");
  const project = clip.project;
  if (!project.sourceKey || project.sourceDeletedAt) throw new UnrecoverableError("The original video is no longer available");
  const transcript = await prisma.transcript.findUnique({ where: { projectId: project.id } });
  if (!transcript) throw new UnrecoverableError("Transcript not found");

  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "cf-edit-"));
  try {
    const file = path.join(dir, `source${path.extname(project.sourceKey)}`);
    await downloadToFile(project.sourceKey, file);
    const info = await probe(file);
    const end = Math.min(data.end, info.duration);
    if (end - data.start < 15) throw new UnrecoverableError("Clips must be at least 15 seconds long");

    const style = parseStyle(data.captionStyle);
    const reframe = data.reframe === "center" ? "center" : "auto";
    const out = await renderClipFile({
      file, dir, tag: "edit", start: data.start, end,
      words: transcript.words as unknown as Word[],
      style, reframe, width: info.width!, height: info.height!,
    });

    const version = clip.version + 1;
    const videoKey = keys.clip(project.id, clip.index, version);
    await uploadFile(videoKey, out.video, "video/mp4");
    let thumbKey: string | null = null;
    if (out.thumb) {
      thumbKey = keys.thumb(project.id, clip.index, version);
      await uploadFile(thumbKey, out.thumb, "image/jpeg");
    }

    await prisma.clip.update({
      where: { id: clip.id },
      data: {
        status: "READY", error: null, version, videoKey, thumbKey,
        startSec: data.start, endSec: end, captionStyle: style, reframe,
      },
    });
    // The old objects are only removed once the new version is live.
    await deleteObjects([clip.videoKey, clip.thumbKey ?? ""]).catch(() => undefined);
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
}
