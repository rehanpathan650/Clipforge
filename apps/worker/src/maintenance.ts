import { ACTIVE_STATUSES, deleteObjects, deletePrefix, env, getPipelineQueue, keys, abortMultipart, logger, prisma, refundProject } from "@clipforge/core";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** Hourly housekeeping. Every step is independent: one failing never blocks the others. */
export async function runMaintenance() {
  const log = logger.child({ job: "maintenance" });
  const now = Date.now();
  const steps: [string, () => Promise<number>][] = [
    ["abandoned uploads", async () => {
      const stale = await prisma.project.findMany({
        where: { status: "PENDING_UPLOAD", createdAt: { lt: new Date(now - DAY) } },
        take: 100,
      });
      for (const p of stale) {
        if (p.sourceKey && p.uploadId) await abortMultipart(p.sourceKey, p.uploadId).catch(() => undefined);
        await deletePrefix(keys.prefix(p.id)).catch(() => undefined);
        await prisma.project.delete({ where: { id: p.id } });
      }
      return stale.length;
    }],

    ["stuck projects", async () => {
      // A healthy job updates progress constantly; three hours of silence means the worker died.
      const stuck = await prisma.project.findMany({
        where: { status: { in: ACTIVE_STATUSES }, updatedAt: { lt: new Date(now - 3 * HOUR) } },
        take: 50,
      });
      for (const p of stuck) {
        await getPipelineQueue().remove(p.id).catch(() => undefined);
        await prisma.project.update({
          where: { id: p.id },
          data: { status: "FAILED", stage: "Failed", error: "This project took too long and was cancelled. Your credits were refunded." },
        });
        await refundProject(p.id, p.runs);
      }
      return stuck.length;
    }],

    ["expired source videos", async () => {
      const old = await prisma.project.findMany({
        where: {
          sourceKey: { not: null },
          sourceDeletedAt: null,
          status: { in: ["READY", "FAILED"] },
          createdAt: { lt: new Date(now - env.SOURCE_RETENTION_DAYS * DAY) },
        },
        take: 100,
      });
      for (const p of old) {
        await deleteObjects([p.sourceKey!]);
        await prisma.project.update({ where: { id: p.id }, data: { sourceKey: null, sourceDeletedAt: new Date() } });
      }
      return old.length;
    }],

    ["expired projects", async () => {
      const old = await prisma.project.findMany({
        where: { status: { in: ["READY", "FAILED"] }, createdAt: { lt: new Date(now - env.CLIP_RETENTION_DAYS * DAY) } },
        select: { id: true },
        take: 50,
      });
      for (const p of old) {
        await deletePrefix(keys.prefix(p.id));
        await prisma.project.delete({ where: { id: p.id } });
      }
      return old.length;
    }],

    ["expired sessions", async () => (await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } })).count],
  ];

  for (const [name, fn] of steps) {
    try {
      const n = await fn();
      if (n > 0) log.info({ count: n }, `cleaned ${name}`);
    } catch (err) {
      log.error({ err }, `maintenance step failed: ${name}`);
    }
  }
}
