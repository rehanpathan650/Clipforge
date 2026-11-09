import { UnrecoverableError, Worker, type Job } from "bullmq";
import {
  MAINTENANCE_QUEUE,
  PIPELINE_QUEUE,
  RERENDER_QUEUE,
  captureException,
  closeQueue,
  createRedis,
  ensureBucket,
  env,
  getQueue,
  initSentry,
  jobDuration,
  jobsTotal,
  logger,
  prisma,
  refundProject,
  setProgress,
  startMetricsServer,
  type RerenderJob,
} from "@clipforge/core";
import { runMaintenance } from "./maintenance";
import { processProject } from "./pipeline";
import { processRerender } from "./rerender";

function instrument<T>(name: string, fn: (job: Job<T>) => Promise<unknown>) {
  return async (job: Job<T>) => {
    const stop = jobDuration.startTimer({ job: name });
    try {
      const result = await fn(job);
      stop({ outcome: "ok" });
      jobsTotal.inc({ job: name, outcome: "ok" });
      return result;
    } catch (err) {
      stop({ outcome: "error" });
      jobsTotal.inc({ job: name, outcome: "error" });
      throw err;
    }
  };
}

const isFinal = (job: Job, err: Error) => err instanceof UnrecoverableError || job.attemptsMade >= (job.opts.attempts ?? 1);

async function main() {
  for (const key of ["TRANSCRIBE_API_KEY", "ANTHROPIC_API_KEY"] as const) {
    if (!env[key]) {
      logger.fatal(`${key} is required to run the worker`);
      process.exit(1);
    }
  }
  await initSentry("worker");
  await ensureBucket().catch((err) => logger.warn({ err }, "could not verify the storage bucket"));
  const metricsServer = startMetricsServer();

  const pipeline = new Worker<{ projectId: string }>(
    PIPELINE_QUEUE,
    instrument("process", (job) => processProject(job.data.projectId)),
    { connection: createRedis(), concurrency: env.WORKER_CONCURRENCY, lockDuration: 120_000 },
  );

  pipeline.on("failed", async (job, err) => {
    if (!job) return;
    const { projectId } = job.data;
    const final = isFinal(job, err);
    logger.error({ projectId, err, attempt: job.attemptsMade, final }, "pipeline job failed");
    try {
      if (final) {
        if (!(err instanceof UnrecoverableError)) captureException(err, { projectId });
        const project = await prisma.project.findUnique({ where: { id: projectId }, select: { runs: true } });
        await setProgress(projectId, {
          status: "FAILED",
          stage: "Failed",
          error:
            err instanceof UnrecoverableError
              ? err.message
              : "Something went wrong while processing this video. Your credits were refunded. Please try again.",
        });
        if (project) await refundProject(projectId, project.runs);
      } else {
        await setProgress(projectId, { stage: "Hit a snag, retrying…" });
      }
    } catch (e) {
      logger.error({ projectId, err: e }, "could not record job failure");
    }
  });

  const rerender = new Worker<RerenderJob>(
    RERENDER_QUEUE,
    instrument("rerender", (job) => processRerender(job.data)),
    { connection: createRedis(), concurrency: env.RERENDER_CONCURRENCY, lockDuration: 120_000 },
  );

  rerender.on("failed", async (job, err) => {
    if (!job) return;
    logger.error({ clipId: job.data.clipId, err, final: isFinal(job, err) }, "rerender job failed");
    if (!isFinal(job, err)) return;
    if (!(err instanceof UnrecoverableError)) captureException(err, { clipId: job.data.clipId });
    // The previous version is still intact, so just hand the clip back with a message.
    await prisma.clip
      .update({
        where: { id: job.data.clipId },
        data: {
          status: "READY",
          error: err instanceof UnrecoverableError ? err.message : "We couldn't apply that edit. Your previous version is unchanged.",
        },
      })
      .catch((e) => logger.error({ err: e }, "could not reset clip after failed re-render"));
  });

  const maintenance = new Worker(MAINTENANCE_QUEUE, instrument("maintenance", () => runMaintenance()), {
    connection: createRedis(),
    concurrency: 1,
  });
  // Idempotent: every replica upserts the same scheduler id, so only one schedule exists.
  await getQueue(MAINTENANCE_QUEUE).upsertJobScheduler("hourly-maintenance", { every: 3_600_000 }, { name: "maintenance" });

  for (const w of [pipeline, rerender, maintenance]) w.on("error", (err) => logger.error({ err }, "worker error"));
  logger.info({ concurrency: env.WORKER_CONCURRENCY }, "worker started");

  let closing = false;
  async function shutdown(signal: string) {
    if (closing) return;
    closing = true;
    logger.info({ signal }, "worker shutting down (waiting for active jobs to finish)");
    await Promise.allSettled([pipeline.close(), rerender.close(), maintenance.close()]);
    metricsServer.close();
    await Promise.allSettled([closeQueue(), prisma.$disconnect()]);
    process.exit(0);
  }
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

process.on("unhandledRejection", (err) => {
  logger.error({ err }, "unhandled rejection");
  captureException(err);
});

main().catch((err) => {
  logger.fatal({ err }, "worker failed to start");
  process.exit(1);
});
