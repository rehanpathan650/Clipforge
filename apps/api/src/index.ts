import { captureException, closeQueue, ensureBucket, env, initSentry, logger, prisma } from "@clipforge/core";
import { buildApp } from "./app";
import { closeHub } from "./sse";

async function main() {
  await initSentry("api");
  await ensureBucket()
    .then((r) => r === "created" && logger.info("created storage bucket"))
    .catch((err) => logger.warn({ err }, "could not verify the storage bucket"));

  const app = buildApp();
  const server = app.listen(env.API_PORT, () => logger.info(`API listening on :${env.API_PORT}`));
  // Longer than typical load-balancer idle timeouts to avoid sporadic 502s.
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;

  let shuttingDown = false;
  async function shutdown(signal: string) {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, "shutting down");
    const force = setTimeout(() => server.closeAllConnections(), 10_000);
    force.unref();
    server.close(async () => {
      await Promise.allSettled([closeHub(), closeQueue(), prisma.$disconnect()]);
      process.exit(0);
    });
  }
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

process.on("unhandledRejection", (err) => {
  logger.error({ err }, "unhandled rejection");
  captureException(err);
});

main().catch((err) => {
  logger.fatal({ err }, "failed to start");
  process.exit(1);
});
