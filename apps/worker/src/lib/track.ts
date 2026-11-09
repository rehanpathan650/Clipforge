import fs from "node:fs";
import path from "node:path";
import { env, logger } from "@clipforge/core";
import { run } from "./exec";
import type { FaceSample } from "./framing";

function scriptPath() {
  // dev runs from apps/worker, the Docker image runs from /app
  return [path.resolve(process.cwd(), "python/track.py"), path.resolve(process.cwd(), "apps/worker/python/track.py")].find(
    (p) => fs.existsSync(p),
  );
}

/** Face positions over [start, end] of the source. Returns null on any failure so callers can centre-crop instead. */
export async function trackFaces(file: string, start: number, end: number, dir: string): Promise<FaceSample[] | null> {
  const script = scriptPath();
  if (!script) {
    logger.warn("python/track.py not found, using centre crop");
    return null;
  }
  const out = path.join(dir, `track_${Date.now()}.json`);
  try {
    await run(env.PYTHON_BIN, [script, file, start.toFixed(3), end.toFixed(3), out], { timeoutMs: 5 * 60_000 });
    const json = JSON.parse(await fs.promises.readFile(out, "utf8")) as { samples: FaceSample[] };
    return json.samples;
  } catch (err) {
    logger.warn({ err }, "face tracking failed, using centre crop");
    return null;
  } finally {
    await fs.promises.rm(out, { force: true });
  }
}
