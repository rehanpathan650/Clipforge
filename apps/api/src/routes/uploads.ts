import { Router } from "express";
import rateLimit from "express-rate-limit";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { z } from "zod";
import {
  abortMultipart,
  completeMultipart,
  deletePrefix,
  enqueueProject,
  env,
  initMultipart,
  keys,
  objectSize,
  presignParts,
  prisma,
} from "@clipforge/core";
import { assertCanStart } from "../limits";
import { HttpError, parse } from "../middleware";
import { serializeSummary } from "../serialize";
import { STYLE_IDS } from "./styles";

export const uploadsRouter = Router();

const MB = 1024 * 1024;
const ALLOWED_EXT = new Set([".mp4", ".mov", ".mkv", ".webm", ".m4v", ".avi"]);

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => req.userId,
  message: { error: { message: "Too many uploads. Please try again later." } },
});

const initSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().regex(/^video\//, "Only video files can be uploaded"),
  size: z.number().int().positive(),
  captionStyle: z.enum(STYLE_IDS).default("karaoke"),
  reframe: z.enum(["auto", "center"]).default("auto"),
});

uploadsRouter.post("/init", limiter, async (req, res) => {
  const body = parse(initSchema, req.body);
  await assertCanStart(req.userId);

  const max = env.MAX_UPLOAD_MB * MB;
  if (body.size > max) throw new HttpError(413, `Files can be up to ${env.MAX_UPLOAD_MB} MB`);
  const ext = path.extname(body.filename).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) throw new HttpError(415, "Use an MP4, MOV, MKV, WebM, M4V or AVI file");

  const id = randomUUID();
  const key = keys.source(id, ext);
  const partSize = Math.max(16 * MB, Math.ceil(body.size / 9000));
  const partCount = Math.ceil(body.size / partSize);

  const uploadId = await initMultipart(key, body.contentType);
  try {
    await prisma.project.create({
      data: {
        id,
        userId: req.userId,
        title: path.basename(body.filename, ext).replace(/[_-]+/g, " ").trim().slice(0, 120) || "Untitled video",
        sourceType: "UPLOAD",
        sourceKey: key,
        uploadId,
        captionStyle: body.captionStyle,
        reframe: body.reframe,
        stage: "Waiting for upload",
      },
    });
  } catch (err) {
    await abortMultipart(key, uploadId).catch(() => undefined);
    throw err;
  }

  const partUrls = await presignParts(key, uploadId, partCount);
  res.status(201).json({ projectId: id, partSize, partUrls });
});

const completeSchema = z.object({
  projectId: z.string().uuid(),
  parts: z
    .array(z.object({ partNumber: z.number().int().min(1).max(10000), etag: z.string().min(1) }))
    .min(1),
});

uploadsRouter.post("/complete", async (req, res) => {
  const body = parse(completeSchema, req.body);
  const project = await prisma.project.findFirst({
    where: { id: body.projectId, userId: req.userId, status: "PENDING_UPLOAD" },
  });
  if (!project?.sourceKey || !project.uploadId) throw new HttpError(404, "Upload not found");
  await assertCanStart(req.userId);

  await completeMultipart(project.sourceKey, project.uploadId, body.parts);

  const size = await objectSize(project.sourceKey);
  if (size > env.MAX_UPLOAD_MB * MB) {
    await deletePrefix(keys.prefix(project.id));
    await prisma.project.delete({ where: { id: project.id } });
    throw new HttpError(413, `Files can be up to ${env.MAX_UPLOAD_MB} MB`);
  }

  const updated = await prisma.project.update({
    where: { id: project.id },
    data: { status: "QUEUED", uploadId: null, stage: "Queued", progress: 0 },
  });
  await enqueueProject(project.id);
  res.json(serializeSummary(updated));
});

uploadsRouter.post("/abort", async (req, res) => {
  const { projectId } = parse(z.object({ projectId: z.string().uuid() }), req.body);
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: req.userId, status: "PENDING_UPLOAD" },
  });
  if (project) {
    if (project.sourceKey && project.uploadId) {
      await abortMultipart(project.sourceKey, project.uploadId).catch(() => undefined);
    }
    await prisma.project.delete({ where: { id: project.id } });
  }
  res.status(204).end();
});
