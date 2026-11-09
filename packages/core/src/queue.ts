import { Queue, type JobsOptions } from "bullmq";
import { createRedis } from "./redis";

export const PIPELINE_QUEUE = "pipeline";
export const RERENDER_QUEUE = "rerender";
export const MAINTENANCE_QUEUE = "maintenance";

export interface RerenderJob {
  clipId: string;
  start: number;
  end: number;
  captionStyle: string;
  reframe: string;
}

const defaults: Record<string, JobsOptions> = {
  [PIPELINE_QUEUE]: {
    attempts: 3,
    backoff: { type: "exponential", delay: 15_000 },
    removeOnComplete: true,
    removeOnFail: true,
  },
  [RERENDER_QUEUE]: {
    attempts: 2,
    backoff: { type: "fixed", delay: 5_000 },
    removeOnComplete: true,
    removeOnFail: true,
  },
  [MAINTENANCE_QUEUE]: { attempts: 1, removeOnComplete: 20, removeOnFail: 50 },
};

const queues = new Map<string, Queue>();

export function getQueue(name: string) {
  let q = queues.get(name);
  if (!q) {
    q = new Queue(name, { connection: createRedis(), defaultJobOptions: defaults[name] });
    queues.set(name, q);
  }
  return q;
}

export const getPipelineQueue = () => getQueue(PIPELINE_QUEUE);

/** jobId = projectId makes enqueueing idempotent while a job for that project exists. */
export async function enqueueProject(projectId: string) {
  await getPipelineQueue().add("process", { projectId }, { jobId: projectId });
}

export async function enqueueRerender(data: RerenderJob) {
  await getQueue(RERENDER_QUEUE).add("rerender", data);
}

export async function closeQueue() {
  await Promise.allSettled([...queues.values()].map((q) => q.close()));
  queues.clear();
}
