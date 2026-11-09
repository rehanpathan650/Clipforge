import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { UnrecoverableError } from "bullmq";
import {
  InsufficientCreditsError,
  Prisma,
  assertBalance,
  chargeProject,
  creditsForDuration,
  creditsSpent,
  keys,
  logger,
  prisma,
  setProgress,
  uploadFile,
} from "@clipforge/core";
import { parseStyle } from "./lib/captionStyles";
import { ingest } from "./steps/ingest";
import { pickClips } from "./steps/pick";
import { renderClips } from "./steps/render";
import { transcribe } from "./steps/transcribe";
import type { Segment, Word } from "./types";

/** Out-of-credits is permanent until the user buys more, so don't burn retries on it. */
function creditsError(e: unknown) {
  return e instanceof InsufficientCreditsError ? new UnrecoverableError(`${e.message} Buy more credits, then try again.`) : e;
}

/**
 * Stages and progress bands:
 *   fetch 0-20 · transcribe 20-55 · analyse 55-65 · render 65-100
 * Each stage is safe to re-run, so BullMQ retries are idempotent: billing uses a per-run ledger key,
 * an existing transcript is reused, and clips are replaced atomically.
 */
export async function processProject(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new UnrecoverableError("Project not found");
  if (project.status === "READY") return;

  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "cf-"));
  const log = logger.child({ projectId });
  try {
    await setProgress(projectId, { status: "DOWNLOADING", stage: "Fetching video", progress: 2, error: null });
    const { file, duration, width, height } = await ingest(
      project,
      dir,
      (progress, stage) => setProgress(projectId, { status: "DOWNLOADING", stage, progress }),
      async (sec) => {
        try {
          await assertBalance(project.userId, creditsForDuration(sec));
        } catch (e) {
          throw creditsError(e);
        }
      },
    );
    await setProgress(projectId, { durationSec: duration, stage: "Fetched video", progress: 20 });
    log.info({ duration }, "ingest done");

    // Charge once the exact duration is known. Refunded automatically if the project ultimately fails.
    const credits = creditsForDuration(duration);
    try {
      const { charged } = await chargeProject(project.userId, projectId, project.runs, credits);
      if (charged) creditsSpent.inc(credits);
    } catch (e) {
      throw creditsError(e);
    }
    await prisma.project.update({ where: { id: projectId }, data: { creditsCharged: credits } });

    // Keep the source (until the retention window ends) so clips can be edited and re-rendered later.
    if (project.sourceType === "YOUTUBE" && !project.sourceKey) {
      const key = keys.source(projectId, path.extname(file) || ".mp4");
      await uploadFile(key, file, "video/mp4");
      await prisma.project.update({ where: { id: projectId }, data: { sourceKey: key } });
    }

    let transcript = await prisma.transcript.findUnique({ where: { projectId } });
    if (!transcript) {
      await setProgress(projectId, { status: "TRANSCRIBING", stage: "Transcribing speech", progress: 22 });
      const t = await transcribe(file, dir, (done, total) =>
        setProgress(projectId, {
          stage: `Transcribing speech (${done}/${total})`,
          progress: 22 + Math.round((done / total) * 33),
        }),
      );
      transcript = await prisma.transcript.create({
        data: {
          projectId,
          text: t.text,
          language: t.language,
          words: t.words as unknown as Prisma.InputJsonValue,
          segments: t.segments as unknown as Prisma.InputJsonValue,
        },
      });
      await setProgress(projectId, { language: t.language });
    }
    const words = transcript.words as unknown as Word[];
    const segments = transcript.segments as unknown as Segment[];

    await setProgress(projectId, { status: "ANALYZING", stage: "Finding the best moments", progress: 58 });
    const clips = await pickClips({ segments, words, duration });
    log.info({ clips: clips.length }, "clips picked");

    await setProgress(projectId, { status: "RENDERING", stage: `Rendering clip 0 of ${clips.length}`, progress: 65 });
    await renderClips({
      projectId, file, dir, clips, words, width, height,
      style: parseStyle(project.captionStyle),
      reframe: project.reframe === "center" ? "center" : "auto",
      onProgress: (done, total) =>
        setProgress(projectId, {
          stage: `Rendering clip ${done} of ${total}`,
          progress: 65 + Math.round((done / total) * 34),
        }),
    });

    await setProgress(projectId, { status: "READY", stage: "Ready", progress: 100, error: null });
    log.info("project ready");
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
}
