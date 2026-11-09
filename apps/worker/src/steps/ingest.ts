import fs from "node:fs/promises";
import path from "node:path";
import { UnrecoverableError } from "bullmq";
import { downloadToFile, env, prisma, type Project } from "@clipforge/core";
import { probe, run } from "../lib/exec";

const fatal = (msg: string) => new UnrecoverableError(msg);

function classifyYtdlpError(message: string): Error {
  const m = message.toLowerCase();
  if (m.includes("sign in to confirm") || m.includes("not a bot") || m.includes("http error 429")) {
    return fatal("YouTube blocked the download from our servers. Please upload the video file instead.");
  }
  if (m.includes("private video") || m.includes("members-only") || m.includes("video unavailable")) {
    return fatal("This video is private or unavailable. Check the link, or upload the file instead.");
  }
  if (m.includes("age") && m.includes("restricted")) {
    return fatal("This video is age-restricted and can't be downloaded. Please upload the file instead.");
  }
  return new Error(message); // transient: let BullMQ retry
}

async function downloadYoutube(
  project: Project,
  dir: string,
  precheck: (durationSec: number) => Promise<void>,
): Promise<string> {
  const url = project.sourceUrl!;
  const base = ["--no-playlist", "--no-warnings", "--socket-timeout", "30", "--retries", "3"];
  if (env.YTDLP_COOKIES_FILE) base.push("--cookies", env.YTDLP_COOKIES_FILE);
  if (env.YTDLP_PROXY) base.push("--proxy", env.YTDLP_PROXY);

  try {
    const meta = JSON.parse(await run("yt-dlp", [...base, "-J", "--no-download", url], { timeoutMs: 120_000 })) as {
      title?: string;
      duration?: number;
      is_live?: boolean;
    };
    if (meta.is_live) throw fatal("Live streams can't be clipped until they finish.");
    if (meta.duration && meta.duration > env.MAX_VIDEO_MINUTES * 60) {
      throw fatal(`Videos can be up to ${env.MAX_VIDEO_MINUTES} minutes long.`);
    }
    // Fail before downloading gigabytes if the user can't afford this video.
    if (meta.duration) await precheck(meta.duration);
    await prisma.project.update({
      where: { id: project.id },
      data: { title: (meta.title ?? "YouTube video").slice(0, 120), durationSec: meta.duration ?? null },
    });

    await run(
      "yt-dlp",
      [
        ...base,
        "-f", "bv*[height<=1080]+ba/b[height<=1080]/b",
        "--merge-output-format", "mp4",
        "-o", path.join(dir, "source.%(ext)s"),
        url,
      ],
      { timeoutMs: 30 * 60_000 },
    );
  } catch (err) {
    if (err instanceof UnrecoverableError) throw err;
    throw classifyYtdlpError(err instanceof Error ? err.message : String(err));
  }

  const files = (await fs.readdir(dir)).filter((f) => f.startsWith("source.") && !f.endsWith(".part"));
  if (!files[0]) throw new Error("Download finished but no file was produced");
  return path.join(dir, files[0]);
}

export async function ingest(
  project: Project,
  dir: string,
  onProgress: (progress: number, stage: string) => Promise<unknown>,
  precheck: (durationSec: number) => Promise<void>,
): Promise<{ file: string; duration: number; width: number; height: number }> {
  let file: string;
  if (project.sourceType === "UPLOAD") {
    await onProgress(5, "Preparing your upload");
    file = path.join(dir, `source${path.extname(project.sourceKey!)}`);
    await downloadToFile(project.sourceKey!, file);
  } else if (project.sourceKey) {
    // A previous attempt already saved the download to storage, so don't hit YouTube again.
    await onProgress(5, "Fetching saved video");
    file = path.join(dir, `source${path.extname(project.sourceKey)}`);
    await downloadToFile(project.sourceKey, file);
  } else {
    await onProgress(5, "Downloading from YouTube");
    file = await downloadYoutube(project, dir, precheck);
  }

  const info = await probe(file).catch(() => {
    throw fatal("We couldn't read this file as a video. Try re-exporting it as MP4.");
  });
  if (!info.hasVideo || !info.width || !info.height) throw fatal("This file doesn't contain a video track.");
  if (!info.hasAudio) throw fatal("This video has no audio, so there is nothing to transcribe.");
  if (info.duration < 30) throw fatal("Videos need to be at least 30 seconds long.");
  if (info.duration > env.MAX_VIDEO_MINUTES * 60) throw fatal(`Videos can be up to ${env.MAX_VIDEO_MINUTES} minutes long.`);
  await precheck(info.duration);
  return { file, duration: info.duration, width: info.width, height: info.height };
}
