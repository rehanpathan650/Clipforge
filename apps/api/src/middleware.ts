import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError, type ZodTypeAny, type z } from "zod";
import { captureException, env, findSession, httpDuration, logger } from "@clipforge/core";
import { SESSION_COOKIE } from "./cookies";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function parse<T extends ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) throw new HttpError(400, result.error.issues[0]?.message ?? "Invalid request");
  return result.data;
}

export const requireUser: RequestHandler = async (req, _res, next) => {
  const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
  const session = token ? await findSession(token) : null;
  if (!token || !session) throw new HttpError(401, "Please sign in to continue");
  req.userId = session.user.id;
  req.sessionToken = token;
  next();
};

const allowedOrigins = env.WEB_ORIGIN.split(",").map((o) => o.trim());

/**
 * Defence in depth on top of SameSite=Lax cookies: state-changing requests from a browser
 * must come from our own web origin. (Server-to-server callers like webhooks send no Origin.)
 */
export const originGuard: RequestHandler = (req, _res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.get("origin");
  if (origin && !allowedOrigins.includes(origin)) throw new HttpError(403, "Request blocked");
  next();
};

export const requestMetrics: RequestHandler = (req, res, next) => {
  const end = httpDuration.startTimer();
  res.on("finish", () => {
    const route = req.route ? `${req.baseUrl}${req.route.path}` : "unmatched";
    end({ method: req.method, route, status: String(res.statusCode) });
  });
  next();
};

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: { message: "Not found" } });
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { message: err.message } });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({ error: { message: err.issues[0]?.message ?? "Invalid request" } });
    return;
  }
  logger.error({ err, path: req.path }, "unhandled error");
  captureException(err, { path: req.path });
  res.status(500).json({ error: { message: "Something went wrong on our side. Please try again." } });
};
