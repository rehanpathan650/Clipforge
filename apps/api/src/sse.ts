import type { Response } from "express";
import { createRedis } from "@clipforge/core";

/** One shared Redis subscriber fans out progress events to all connected SSE clients. */
class Hub {
  private clients = new Map<string, Set<Response>>();
  private sub = createRedis();

  constructor() {
    void this.sub.psubscribe("project:*");
    this.sub.on("pmessage", (_pattern, channel, message) => {
      const id = channel.slice("project:".length);
      this.clients.get(id)?.forEach((res) => res.write(`data: ${message}\n\n`));
    });
  }

  add(projectId: string, res: Response) {
    let set = this.clients.get(projectId);
    if (!set) this.clients.set(projectId, (set = new Set()));
    set.add(res);
  }

  remove(projectId: string, res: Response) {
    const set = this.clients.get(projectId);
    set?.delete(res);
    if (set && set.size === 0) this.clients.delete(projectId);
  }

  async close() {
    await this.sub.quit().catch(() => undefined);
  }
}

let hub: Hub | undefined;
export const getHub = () => (hub ??= new Hub());
export const closeHub = () => hub?.close();
