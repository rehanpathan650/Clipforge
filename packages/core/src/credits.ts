import { prisma } from "./db";

export class InsufficientCreditsError extends Error {
  constructor(
    public needed: number,
    public balance: number,
  ) {
    super(`Not enough credits. This video needs ${needed}, and you have ${balance}.`);
  }
}

const isUniqueViolation = (e: unknown) => typeof e === "object" && e !== null && (e as { code?: string }).code === "P2002";

export async function getBalance(userId: string) {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { credits: true } });
  return u?.credits ?? 0;
}

export async function assertBalance(userId: string, needed: number) {
  const balance = await getBalance(userId);
  if (balance < needed) throw new InsufficientCreditsError(needed, balance);
}

/**
 * Debits `credits` for one run of a project. Atomic and idempotent:
 *  - the ledger `key` is unique per (project, run), so a retried job never charges twice
 *  - the conditional UPDATE guarantees the balance can't go negative under concurrency
 */
export async function chargeProject(userId: string, projectId: string, run: number, credits: number) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.creditEntry.create({
        data: { userId, delta: -credits, reason: "USAGE", key: `usage:${projectId}:${run}`, projectId },
      });
      const updated = await tx.$executeRaw`
        UPDATE "User" SET credits = credits - ${credits} WHERE id = ${userId} AND credits >= ${credits}`;
      if (updated === 0) throw new InsufficientCreditsError(credits, 0);
    });
    return { charged: true };
  } catch (e) {
    if (isUniqueViolation(e)) return { charged: false }; // already charged for this run
    if (e instanceof InsufficientCreditsError) throw new InsufficientCreditsError(credits, await getBalance(userId));
    throw e;
  }
}

/** Gives back whatever was charged for this run. Safe to call repeatedly. */
export async function refundProject(projectId: string, run: number) {
  const usage = await prisma.creditEntry.findUnique({ where: { key: `usage:${projectId}:${run}` } });
  if (!usage) return { refunded: false };
  const credits = -usage.delta;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.creditEntry.create({
        data: {
          userId: usage.userId,
          delta: credits,
          reason: "REFUND",
          key: `refund:${projectId}:${run}`,
          projectId,
          note: "Refund for a project that couldn't be completed",
        },
      });
      await tx.user.update({ where: { id: usage.userId }, data: { credits: { increment: credits } } });
    });
    return { refunded: true };
  } catch (e) {
    if (isUniqueViolation(e)) return { refunded: false };
    throw e;
  }
}
