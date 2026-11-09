import { env } from "./env";
import { logger } from "./logger";

type SentryModule = typeof import("@sentry/node");
let sentry: SentryModule | undefined;

/** No-op unless SENTRY_DSN is set. */
export async function initSentry(service: string) {
  if (!env.SENTRY_DSN) return;
  sentry = await import("@sentry/node");
  sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    serverName: service,
    tracesSampleRate: 0.05,
  });
  logger.info({ service }, "sentry enabled");
}

export function captureException(err: unknown, context?: Record<string, unknown>) {
  sentry?.captureException(err, { extra: context });
}
