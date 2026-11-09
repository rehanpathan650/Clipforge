import Anthropic from "@anthropic-ai/sdk";
import { UnrecoverableError } from "bullmq";
import { z } from "zod";
import { env, logger } from "@clipforge/core";
import { mapPool } from "../lib/pool";
import type { PickedClip, Segment, Word } from "../types";

const WINDOW = 720; // seconds of transcript per LLM call
const STEP = 660; // 60 s overlap so moments on a boundary aren't lost
const MIN_LEN = 15;
const MAX_LEN = 90;

const SYSTEM = `You are an expert short-form video editor. You find the moments in a long video's transcript that will perform best as standalone 9:16 clips on Instagram Reels, TikTok and YouTube Shorts.

A great clip:
- opens with a hook in the first 3 seconds (a bold claim, a question, a surprising fact, a story opening)
- makes complete sense without the rest of the video
- covers one idea, tells a mini-story, or delivers one clear payoff
- ends right after the payoff, never mid-sentence
- is usually 20 to 60 seconds long (never under ${MIN_LEN} or over ${MAX_LEN})

Avoid: introductions and outros, sponsor reads, housekeeping, filler, and moments that depend on visuals the transcript can't convey.
Timestamps are in seconds. Choose start and end times that match the transcript timestamps. Score each clip 0-100 for viral potential and be honest: most clips are below 80.
Write titles as a punchy headline under 70 characters, and "reason" as one short sentence on why the clip works.`;

const tool: Anthropic.Tool = {
  name: "submit_clips",
  description: "Submit the best clip candidates found in this transcript window.",
  input_schema: {
    type: "object",
    properties: {
      clips: {
        type: "array",
        items: {
          type: "object",
          properties: {
            start: { type: "number", description: "Clip start time in seconds" },
            end: { type: "number", description: "Clip end time in seconds" },
            title: { type: "string" },
            reason: { type: "string" },
            score: { type: "integer", minimum: 0, maximum: 100 },
          },
          required: ["start", "end", "title", "reason", "score"],
        },
      },
    },
    required: ["clips"],
  },
};

const candidateSchema = z.object({
  start: z.number(),
  end: z.number(),
  title: z.string().min(1),
  reason: z.string().min(1),
  score: z.number(),
});

export function targetClipCount(durationSec: number) {
  return Math.min(10, Math.max(3, Math.round(durationSec / 60 / 3)));
}

/** Nearest word boundary so cuts never land mid-word. Words are sorted ascending. */
function snap(words: Word[], t: number, edge: "start" | "end") {
  let best = words[0]!;
  let bestDist = Infinity;
  for (const w of words) {
    const v = edge === "start" ? w.start : w.end;
    const d = Math.abs(v - t);
    if (d < bestDist) {
      bestDist = d;
      best = w;
    } else if (v > t) break;
  }
  return edge === "start" ? best.start : best.end;
}

async function askWindow(client: Anthropic, segments: Segment[], ws: number, we: number, total: number, max: number) {
  const lines = segments
    .filter((s) => s.start >= ws && s.start < we)
    .map((s) => `[${s.start.toFixed(1)}] ${s.text.trim()}`);
  if (lines.length < 5) return [];

  const msg = await client.messages.create({
    model: env.CLIP_MODEL,
    max_tokens: 2000,
    system: SYSTEM,
    tools: [tool],
    tool_choice: { type: "tool", name: tool.name },
    messages: [
      {
        role: "user",
        content: `Full video length: ${Math.round(total)} seconds. Find up to ${max} clips inside this transcript window (${Math.round(ws)}s to ${Math.round(we)}s).\n\n${lines.join("\n")}`,
      },
    ],
  });

  const block = msg.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
  const raw = (block?.input as { clips?: unknown[] } | undefined)?.clips ?? [];
  const out: z.infer<typeof candidateSchema>[] = [];
  for (const c of raw) {
    const parsed = candidateSchema.safeParse(c);
    if (parsed.success) out.push(parsed.data);
  }
  return out;
}

export async function pickClips(opts: {
  segments: Segment[];
  words: Word[];
  duration: number;
}): Promise<PickedClip[]> {
  const { segments, words, duration } = opts;
  if (words.length === 0) throw new UnrecoverableError("No speech was detected in this video.");

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 4 });
  const target = targetClipCount(duration);
  const starts: number[] = [];
  for (let t = 0; t < duration; t += STEP) starts.push(t);

  const perWindow = await mapPool(starts, 3, (ws) =>
    askWindow(client, segments, ws, ws + WINDOW, duration, Math.max(3, Math.ceil(target / starts.length) + 2)),
  );

  const lastWordEnd = words[words.length - 1]!.end;
  const candidates = perWindow
    .flat()
    .map((c) => {
      let start = snap(words, Math.max(0, c.start), "start");
      let end = snap(words, Math.min(lastWordEnd, c.end), "end");
      if (end - start > MAX_LEN) end = snap(words, start + MAX_LEN, "end");
      if (end - start > MAX_LEN) end = start + MAX_LEN;
      // small breathing room so cuts don't feel clipped
      start = Math.max(0, start - 0.15);
      end = Math.min(duration, end + 0.35);
      return {
        start,
        end,
        title: c.title.trim().slice(0, 80),
        reason: c.reason.trim().slice(0, 200),
        score: Math.round(Math.min(100, Math.max(0, c.score))),
      };
    })
    .filter((c) => c.end - c.start >= MIN_LEN);

  // Greedy pick by score, rejecting clips that mostly overlap an already chosen one.
  const chosen: typeof candidates = [];
  for (const c of [...candidates].sort((a, b) => b.score - a.score)) {
    const overlaps = chosen.some((o) => {
      const overlap = Math.min(o.end, c.end) - Math.max(o.start, c.start);
      return overlap > 0.3 * Math.min(o.end - o.start, c.end - c.start);
    });
    if (!overlaps) chosen.push(c);
    if (chosen.length >= target) break;
  }

  if (chosen.length === 0) {
    throw new UnrecoverableError("We couldn't find strong standalone moments in this video.");
  }
  logger.info({ candidates: candidates.length, chosen: chosen.length }, "clip selection done");
  return chosen.sort((a, b) => a.start - b.start).map((c, i) => ({ ...c, index: i + 1 }));
}
