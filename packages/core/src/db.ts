import { PrismaClient } from "@prisma/client";
import { env } from "./env";

const g = globalThis as unknown as { __prisma?: PrismaClient };

export const prisma =
  g.__prisma ??
  new PrismaClient({ log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"] });

if (env.NODE_ENV !== "production") g.__prisma = prisma;

export { Prisma, ProjectStatus, SourceType } from "@prisma/client";
export type { Project, Clip, Transcript } from "@prisma/client";

import type { ProjectStatus as PS } from "@prisma/client";
/** Statuses where a worker is (or will soon be) busy with the project. */
export const ACTIVE_STATUSES: PS[] = ["QUEUED", "DOWNLOADING", "TRANSCRIBING", "ANALYZING", "RENDERING"];
