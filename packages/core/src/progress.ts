import type IORedis from "ioredis";
import { prisma, type ProjectStatus } from "./db";
import { createRedis } from "./redis";

export type ProgressEvent = {
  projectId: string;
  status: ProjectStatus;
  stage: string;
  progress: number;
  error: string | null;
};

export const progressChannel = (projectId: string) => `project:${projectId}`;

let pub: IORedis | undefined;

export async function setProgress(
  projectId: string,
  patch: {
    status?: ProjectStatus;
    stage?: string;
    progress?: number;
    error?: string | null;
    title?: string;
    durationSec?: number;
    language?: string | null;
  },
) {
  const p = await prisma.project.update({
    where: { id: projectId },
    data: patch,
    select: { id: true, status: true, stage: true, progress: true, error: true },
  });
  pub ??= createRedis();
  const event: ProgressEvent = {
    projectId: p.id,
    status: p.status,
    stage: p.stage,
    progress: p.progress,
    error: p.error,
  };
  // Live updates are best-effort; the DB is the source of truth.
  await pub.publish(progressChannel(projectId), JSON.stringify(event)).catch(() => undefined);
  return p;
}
