import archiver from "archiver";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { deletePrefix, enqueueProject, getObjectStream, keys, logger, prisma, ACTIVE_STATUSES } from "@clipforge/core";
import { assertCanStart } from "../limits";
import { HttpError, parse } from "../middleware";
import { serializeProject, serializeSummary, slug } from "../serialize";
import { getHub } from "../sse";
import { STYLE_IDS } from "./styles";

export const projectsRouter = Router();

const YT_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be"]);

const linkLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => req.userId,
  message: { error: { message: "Too many requests. Please try again later." } },
});

const urlSchema = z.object({
  url: z.string().url().max(500),
  confirmRights: z.literal(true, {
    errorMap: () => ({ message: "Confirm that you have the rights to use this video" }),
  }),
  captionStyle: z.enum(STYLE_IDS).default("karaoke"),
  reframe: z.enum(["auto", "center"]).default("auto"),
});

projectsRouter.post("/url", linkLimiter, async (req, res) => {
  const body = parse(urlSchema, req.body);
  const url = new URL(body.url);
  // Strict allow-list: the worker fetches this URL, so never accept arbitrary hosts (SSRF).
  if (url.protocol !== "https:" || !YT_HOSTS.has(url.hostname)) {
    throw new HttpError(400, "Paste a YouTube link, for example https://www.youtube.com/watch?v=…");
  }
  await assertCanStart(req.userId);
  const project = await prisma.project.create({
    data: {
      userId: req.userId,
      title: "YouTube video",
      sourceType: "YOUTUBE",
      sourceUrl: url.toString(),
      captionStyle: body.captionStyle,
      reframe: body.reframe,
      status: "QUEUED",
      stage: "Queued",
    },
  });
  await enqueueProject(project.id);
  res.status(201).json(serializeSummary(project));
});

projectsRouter.get("/", async (req, res) => {
  const projects = await prisma.project.findMany({
    where: { userId: req.userId, status: { not: "PENDING_UPLOAD" } },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { _count: { select: { clips: true } } },
  });
  res.json(projects.map(serializeSummary));
});

async function findOwned(id: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: { clips: { orderBy: { index: "asc" } } },
  });
  if (!project) throw new HttpError(404, "Project not found");
  return project;
}

projectsRouter.get("/:id", async (req, res) => {
  res.json(await serializeProject(await findOwned(req.params.id, req.userId)));
});

projectsRouter.get("/:id/events", async (req, res) => {
  const project = await findOwned(req.params.id, req.userId);
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  const snapshot = {
    projectId: project.id,
    status: project.status,
    stage: project.stage,
    progress: project.progress,
    error: project.error,
  };
  res.write(`retry: 3000\ndata: ${JSON.stringify(snapshot)}\n\n`);

  const hub = getHub();
  hub.add(project.id, res);
  const heartbeat = setInterval(() => res.write(": ping\n\n"), 15_000);
  req.on("close", () => {
    clearInterval(heartbeat);
    hub.remove(project.id, res);
  });
});

/** All clips in one ZIP. MP4s are already compressed, so the archive uses "store" (no CPU, constant memory). */
projectsRouter.get("/:id/download", async (req, res) => {
  const project = await findOwned(req.params.id, req.userId);
  if (project.status !== "READY" || project.clips.length === 0) throw new HttpError(409, "This project has no clips yet");

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="${slug(project.title)}-clips.zip"`);
  const archive = archiver("zip", { store: true });
  archive.on("error", (err) => {
    logger.error({ err, projectId: project.id }, "zip failed");
    res.destroy(err);
  });
  req.on("close", () => archive.abort());
  archive.pipe(res);
  for (const c of project.clips) {
    archive.append(await getObjectStream(c.videoKey), { name: `${String(c.index).padStart(2, "0")}-${slug(c.title)}.mp4` });
  }
  await archive.finalize();
});

projectsRouter.post("/:id/retry", async (req, res) => {
  const project = await findOwned(req.params.id, req.userId);
  if (project.status !== "FAILED") throw new HttpError(409, "Only failed projects can be retried");
  await assertCanStart(req.userId);
  // A new run number means a new billing key: the previous attempt was refunded, this one is charged afresh.
  const updated = await prisma.project.update({
    where: { id: project.id },
    data: { status: "QUEUED", stage: "Queued", progress: 0, error: null, runs: { increment: 1 }, creditsCharged: 0 },
  });
  await enqueueProject(project.id);
  res.json(serializeSummary(updated));
});

projectsRouter.delete("/:id", async (req, res) => {
  const project = await findOwned(req.params.id, req.userId);
  if (ACTIVE_STATUSES.includes(project.status)) {
    throw new HttpError(409, "This project is still processing. Delete it once it finishes.");
  }
  await deletePrefix(keys.prefix(project.id));
  await prisma.project.delete({ where: { id: project.id } });
  res.status(204).end();
});
