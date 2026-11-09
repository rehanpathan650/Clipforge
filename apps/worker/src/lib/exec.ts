import { spawn } from "node:child_process";

export function run(
  cmd: string,
  args: string[],
  opts: { cwd?: string; timeoutMs?: number } = {},
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: opts.cwd, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    let err = "";
    const timer = opts.timeoutMs
      ? setTimeout(() => {
          child.kill("SIGKILL");
          reject(new Error(`${cmd} timed out after ${Math.round(opts.timeoutMs! / 1000)}s`));
        }, opts.timeoutMs)
      : undefined;

    child.stdout.on("data", (d) => {
      if (out.length < 50_000_000) out += d;
    });
    child.stderr.on("data", (d) => {
      err = (err + d).slice(-4000);
    });
    child.on("error", (e: NodeJS.ErrnoException) => {
      if (timer) clearTimeout(timer);
      reject(e.code === "ENOENT" ? new Error(`${cmd} is not installed or not on PATH`) : e);
    });
    child.on("close", (code) => {
      if (timer) clearTimeout(timer);
      if (code === 0) resolve(out);
      else reject(new Error(`${cmd} exited with code ${code}: ${err.trim()}`));
    });
  });
}

export async function probe(file: string) {
  const out = await run("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", file], {
    timeoutMs: 60_000,
  });
  const json = JSON.parse(out) as {
    format?: { duration?: string };
    streams?: { codec_type?: string; width?: number; height?: number }[];
  };
  const video = json.streams?.find((s) => s.codec_type === "video");
  const audio = json.streams?.find((s) => s.codec_type === "audio");
  return {
    duration: Number(json.format?.duration) || 0,
    hasVideo: Boolean(video),
    hasAudio: Boolean(audio),
    width: video?.width,
    height: video?.height,
  };
}
