import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { enqueueRerender, env, prisma, signedGetUrl } from "@clipforge/core";
import { HttpError, parse } from "../middleware";
import { serializeClip } from "../serialize";
import { STYLE_IDS } from "./styles";

export const clipsRouter = Router();

type Word = { word: string; start: number; end: number };

async function findOwned(id: string, userId: string) {
  const clip = await prisma.clip.findFirst({
    where: { id, project: { userId } },
    include: { project: true },
  });
  if (!clip) throw new HttpError(404, "Clip not found");
  return clip;
}

const sourceAvailable = (p: { sourceKey: string | null; sourceDeletedAt: Date | null }) =>
  Boolean(p.sourceKey) && !p.sourceDeletedAt;

clipsRouter.get("/:id", async (req, res) => {
  const clip = await findOwned(req.params.id, req.userId);
  const available = sourceAvailable(clip.project);
  const transcript = await prisma.transcript.findUnique({
    where: { projectId: clip.projectId },
    select: { words: true },
  });
  const words = ((transcript?.words as unknown as Word[] | undefined) ?? []).filter(
    (w) => w.end >= clip.startSec - 45 && w.start <= clip.endSec + 45,
  );
  res.json({
    clip: await serializeClip(clip),
    project: { id: clip.project.id, title: clip.project.title, durationSec: clip.project.durationSec, sourceAvailable: available },
    sourceUrl: available ? await signedGetUrl(clip.project.sourceKey!, { expiresIn: 4 * 3600 }) : null,
    words,
  });
});

/** Lightweight poll target while a re-render is running. */
clipsRouter.get("/:id/status", async (req, res) => {
  res.json(await serializeClip(await findOwned(req.params.id, req.userId)));
});

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: env.RERENDER_LIMIT_PER_HOUR,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => req.userId,
  message: { error: { message: "You've reached the hourly edit limit. Try again a bit later." } },
});

const renderSchema = z.object({
  start: z.number().min(0),
  end: z.number().positive(),
  captionStyle: z.enum(STYLE_IDS),
  reframe: z.enum(["auto", "center"]),
});

clipsRouter.post("/:id/render", limiter, async (req, res) => {
  const body = parse(renderSchema, req.body);
    const clip = await findOwned(String(req.params.id), req.userId);
  if (clip.status === "RENDERING") throw new HttpError(409, "This clip is already being re-rendered");
  if (!sourceAvailable(clip.project)) {
    throw new HttpError(410, `The original video is removed ${env.SOURCE_RETENTION_DAYS} days after upload, so this clip can no longer be edited.`);
  }
  const length = body.end - body.start;
  if (length < 15 || length > 90) throw new HttpError(400, "Clips must be between 15 and 90 seconds long");
  if (clip.project.durationSec && body.end > clip.project.durationSec + 0.5) {
    throw new HttpError(400, "The end time is past the end of the video");
  }

  const updated = await prisma.clip.update({ where: { id: clip.id }, data: { status: "RENDERING", error: null } });
  await enqueueRerender({ clipId: clip.id, ...body });
  res.status(202).json(await serializeClip(updated));
});
