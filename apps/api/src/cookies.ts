import type { CookieOptions, Response } from "express";
import { env } from "@clipforge/core";

export const SESSION_COOKIE = "cf_session";

const base = (): CookieOptions => ({
  httpOnly: true,
  sameSite: "lax",
  secure: env.NODE_ENV === "production",
  domain: env.COOKIE_DOMAIN,
  path: "/",
});

export const setSessionCookie = (res: Response, token: string, expires: Date) =>
  res.cookie(SESSION_COOKIE, token, { ...base(), expires });

export const clearSessionCookie = (res: Response) => res.clearCookie(SESSION_COOKIE, base());
