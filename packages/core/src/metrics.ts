import http from "node:http";
import client from "prom-client";
import { env } from "./env";
import { logger } from "./logger";

export const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry, prefix: "clipforge_" });

export const httpDuration = new client.Histogram({
  name: "clipforge_http_request_duration_seconds",
  help: "API request duration",
  labelNames: ["method", "route", "status"],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [registry],
});

export const jobDuration = new client.Histogram({
  name: "clipforge_job_duration_seconds",
  help: "Worker job duration",
  labelNames: ["job", "outcome"],
  buckets: [5, 15, 30, 60, 120, 300, 600, 1200, 1800, 3600],
  registers: [registry],
});

export const jobsTotal = new client.Counter({
  name: "clipforge_jobs_total",
  help: "Worker jobs by outcome",
  labelNames: ["job", "outcome"],
  registers: [registry],
});

export const queueDepth = new client.Gauge({
  name: "clipforge_queue_jobs",
  help: "Jobs in the pipeline queue by state",
  labelNames: ["queue", "state"],
  registers: [registry],
});

export const creditsSpent = new client.Counter({
  name: "clipforge_credits_spent_total",
  help: "Credits debited for processing",
  registers: [registry],
});

/** Worker processes have no HTTP server, so expose /metrics on a side port (protect with METRICS_TOKEN or the network). */
export function startMetricsServer(port = env.METRICS_PORT) {
  const server = http.createServer(async (req, res) => {
    if (req.url !== "/metrics") {
      res.writeHead(404).end();
      return;
    }
    if (env.METRICS_TOKEN && req.headers.authorization !== `Bearer ${env.METRICS_TOKEN}`) {
      res.writeHead(401).end();
      return;
    }
    res.writeHead(200, { "Content-Type": registry.contentType });
    res.end(await registry.metrics());
  });
  server.listen(port, () => logger.info({ port }, "metrics server listening"));
  return server;
}
