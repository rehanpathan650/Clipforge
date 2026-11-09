import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import pinoHttp from "pino-http";
import {
  MAINTENANCE_QUEUE,
  PIPELINE_QUEUE,
  RERENDER_QUEUE,
  env,
  getQueue,
  logger,
  prisma,
  queueDepth,
  registry,
} from "@clipforge/core";
import {
  errorHandler,
  notFound,
  originGuard,
  requestMetrics,
  requireUser,
} from "./middleware";
import { authRouter } from "./routes/auth";
import { billingRouter, razorpayWebhook } from "./routes/billing";
import { clipsRouter } from "./routes/clips";
import { projectsRouter } from "./routes/projects";
import { uploadsRouter } from "./routes/uploads";

export function buildApp() {
  const app = express();
  app.set("trust proxy", env.TRUST_PROXY);
  app.disable("x-powered-by");

  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => ["/healthz", "/readyz", "/metrics"].includes(req.url ?? "") } }));
  app.use(helmet());
  app.use(requestMetrics);

  // Webhooks are server-to-server: no CORS, no cookies, and the signature needs the raw body.
  app.post("/api/webhooks/razorpay", express.raw({ type: "application/json", limit: "1mb" }), razorpayWebhook);

  app.use(
    cors({
      origin: env.WEB_ORIGIN.split(",").map((o) => o.trim()),
      credentials: true,
      methods: ["GET", "POST", "DELETE"],
      maxAge: 600,
    }),
  );
  app.use(cookieParser());
  app.use(express.json({ limit: "100kb" }));
  app.use(originGuard);
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: env.RATE_LIMIT_GLOBAL,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      skip: (req) => ["/healthz", "/readyz", "/metrics"].includes(req.path),
    }),
  );

  // Liveness: the process is up. Readiness: it can actually serve traffic.
  app.get("/healthz", (_req, res) => void res.json({ ok: true }));
  app.get("/readyz", async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      await getQueue(PIPELINE_QUEUE).getJobCounts("waiting");
      res.json({ ok: true });
    } catch (err) {
      logger.error({ err }, "readiness check failed");
      res.status(503).json({ ok: false });
    }
  });

  // Prometheus scrape endpoint. Disabled in production unless METRICS_TOKEN is set.
  app.get("/metrics", async (req, res) => {
    if (env.METRICS_TOKEN ? req.get("authorization") !== `Bearer ${env.METRICS_TOKEN}` : env.NODE_ENV === "production") {
      res.status(404).end();
      return;
    }
    for (const q of [PIPELINE_QUEUE, RERENDER_QUEUE, MAINTENANCE_QUEUE]) {
      const counts = await getQueue(q).getJobCounts("waiting", "active", "delayed", "failed");
      for (const [state, n] of Object.entries(counts)) queueDepth.set({ queue: q, state }, n);
    }
    res.setHeader("Content-Type", registry.contentType);
    res.end(await registry.metrics());
  });

  app.use("/api/auth", authRouter);
  app.use("/api/billing", billingRouter);
  app.use("/api/uploads", requireUser, uploadsRouter);
  app.use("/api/projects", requireUser, projectsRouter);
  app.use("/api/clips", requireUser, clipsRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
