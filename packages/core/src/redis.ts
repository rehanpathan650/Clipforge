import IORedis from "ioredis";
import { env } from "./env";

/** BullMQ requires maxRetriesPerRequest = null. */
export function createRedis() {
  return new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null, enableReadyCheck: true });
}
