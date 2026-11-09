import { ACTIVE_STATUSES, env, prisma } from "@clipforge/core";
import { HttpError } from "./middleware";

/** Cheap checks before accepting work. The exact charge happens in the worker once the duration is known. */
export async function assertCanStart(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { credits: true } });
  if (!user || user.credits < 1) {
    throw new HttpError(402, "You need credits to process a video. Buy a pack to continue.");
  }
  const active = await prisma.project.count({ where: { userId, status: { in: ACTIVE_STATUSES } } });
  if (active >= env.MAX_ACTIVE_PROJECTS) {
    throw new HttpError(429, `You can process ${env.MAX_ACTIVE_PROJECTS} videos at a time. Wait for one to finish.`);
  }
}
