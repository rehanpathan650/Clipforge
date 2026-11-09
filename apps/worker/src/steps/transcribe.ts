import fs from "node:fs/promises";
import path from "node:path";
import OpenAI, { toFile } from "openai";
import { env } from "@clipforge/core";
import { run, probe } from "../lib/exec";
import { mapPool } from "../lib/pool";
import type { Segment, Word } from "../types";

const CHUNK_SECONDS = 600;

type RawWord = { word: string; start: number; end: number };
type RawSegment = { text: string; start: number; end: number };

/** Some providers omit word timestamps; spread each segment's words evenly as a fallback. */
function wordsFromSegments(segments: Segment[]): Word[] {
  return segments.flatMap((seg) => {
    const tokens = seg.text.trim().split(/\s+/).filter(Boolean);
    const step = (seg.end - seg.start) / Math.max(tokens.length, 1);
    return tokens.map((word, i) => ({ word, start: seg.start + i * step, end: seg.start + (i + 1) * step }));
  });
}

export async function transcribe(
  file: string,
  dir: string,
  onProgress: (done: number, total: number) => Promise<unknown>,
) {
  const audioDir = path.join(dir, "audio");
  await fs.mkdir(audioDir);
  // 16 kHz mono MP3 @ 48 kbps ≈ 3.6 MB per 10 min, far below provider upload limits.
  await run(
    "ffmpeg",
    [
      "-nostdin", "-y", "-i", file, "-vn", "-ac", "1", "-ar", "16000",
      "-c:a", "libmp3lame", "-b:a", "48k",
      "-f", "segment", "-segment_time", String(CHUNK_SECONDS), "-reset_timestamps", "1",
      path.join(audioDir, "chunk_%03d.mp3"),
    ],
    { timeoutMs: 20 * 60_000 },
  );

  const chunks = (await fs.readdir(audioDir)).filter((f) => f.endsWith(".mp3")).sort();
  // Use real chunk durations so timestamps never drift across chunk boundaries.
  const offsets: number[] = [];
  let acc = 0;
  for (const name of chunks) {
    offsets.push(acc);
    acc += (await probe(path.join(audioDir, name))).duration;
  }

  const client = new OpenAI({
    apiKey: env.TRANSCRIBE_API_KEY,
    baseURL: env.TRANSCRIBE_BASE_URL,
    maxRetries: 4,
    timeout: 5 * 60_000,
  });

  let done = 0;
  const results = await mapPool(chunks, 2, async (name, i) => {
    const buffer = await fs.readFile(path.join(audioDir, name));
    const res = (await client.audio.transcriptions.create({
      file: await toFile(buffer, name, { type: "audio/mpeg" }),
      model: env.TRANSCRIBE_MODEL,
      response_format: "verbose_json",
      timestamp_granularities: ["word", "segment"],
    } as never)) as unknown as { language?: string; words?: RawWord[]; segments?: RawSegment[]; text?: string };
    await onProgress(++done, chunks.length);
    return { offset: offsets[i]!, res };
  });

  const segments: Segment[] = [];
  let words: Word[] = [];
  let language: string | null = null;
  for (const { offset, res } of results) {
    language ??= res.language ?? null;
    for (const s of res.segments ?? []) {
      segments.push({ text: s.text, start: s.start + offset, end: s.end + offset });
    }
    for (const w of res.words ?? []) {
      words.push({ word: String(w.word).trim(), start: w.start + offset, end: w.end + offset });
    }
  }
  if (words.length === 0) words = wordsFromSegments(segments);
  words = words.filter((w) => w.word.length > 0);

  return { text: segments.map((s) => s.text.trim()).join(" "), words, segments, language };
}
