import { Router } from "express";
import rateLimit from "express-rate-limit";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  createSession,
  deletePrefix,
  destroySession,
  env,
  hashPassword,
  keys,
  prisma,
  verifyPassword,
} from "@clipforge/core";
import { clearSessionCookie, setSessionCookie } from "../cookies";
import { HttpError, parse, requireUser } from "../middleware";

export const authRouter = Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: { message: "Too many attempts. Please wait a few minutes and try again." } },
});

const email = z.string().trim().toLowerCase().email("Enter a valid email address").max(254);

const signupSchema = z.object({
  email,
  password: z.string().min(10, "Use at least 10 characters for your password").max(200),
  name: z.string().trim().max(80).optional(),
});

const loginSchema = z.object({ email, password: z.string().min(1).max(200) });

authRouter.post("/signup", limiter, async (req, res) => {
  const body = parse(signupSchema, req.body);
  const bonus = env.SIGNUP_BONUS_CREDITS;
  const id = randomUUID();
  let user;
  try {
    user = await prisma.user.create({
      data: {
        id,
        email: body.email,
        name: body.name || null,
        passwordHash: await hashPassword(body.password),
        credits: bonus,
        ledger: bonus > 0 ? { create: { delta: bonus, reason: "BONUS", key: `bonus:${id}`, note: "Welcome credits" } } : undefined,
      },
    });
  } catch (e) {
    if (typeof e === "object" && e !== null && (e as { code?: string }).code === "P2002") {
      throw new HttpError(409, "An account with this email already exists. Try signing in instead.");
    }
    throw e;
  }
  const { token, expiresAt } = await createSession(user.id, req.get("user-agent"));
  setSessionCookie(res, token, expiresAt);
  res.status(201).json({ id: user.id, email: user.email, name: user.name, credits: user.credits });
});

authRouter.post("/login", limiter, async (req, res) => {
  const body = parse(loginSchema, req.body);
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  const ok = await verifyPassword(body.password, user?.passwordHash ?? null);
  if (!user || !ok) throw new HttpError(401, "Incorrect email or password.");
  const { token, expiresAt } = await createSession(user.id, req.get("user-agent"));
  setSessionCookie(res, token, expiresAt);
  res.json({ id: user.id, email: user.email, name: user.name, credits: user.credits });
});

authRouter.post("/logout", requireUser, async (req, res) => {
  await destroySession(req.sessionToken);
  clearSessionCookie(res);
  res.status(204).end();
});

authRouter.get("/me", requireUser, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, name: true, credits: true },
  });
  if (!user) throw new HttpError(401, "Please sign in to continue");
  res.json(user);
});

/** Self-serve account deletion: removes stored media first, then the user (everything else cascades). */
authRouter.delete("/account", requireUser, async (req, res) => {
  const { password } = parse(z.object({ password: z.string().min(1).max(200) }), req.body);
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new HttpError(403, "That password is incorrect.");
  }
  const projects = await prisma.project.findMany({ where: { userId: user.id }, select: { id: true } });
  for (const p of projects) await deletePrefix(keys.prefix(p.id));
  await prisma.user.delete({ where: { id: user.id } });
  clearSessionCookie(res);
  res.status(204).end();
});
