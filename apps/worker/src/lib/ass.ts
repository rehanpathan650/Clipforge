import type { Word } from "../types";
import { CAPTION_STYLES, type CaptionStyleId, type StyleDef } from "./captionStyles";

const pad = (n: number) => String(n).padStart(2, "0");

export function ts(sec: number) {
  const total = Math.max(0, Math.round(sec * 100));
  const c = total % 100;
  const s = Math.floor(total / 100) % 60;
  const m = Math.floor(total / 6000) % 60;
  const h = Math.floor(total / 360000);
  return `${h}:${pad(m)}:${pad(s)}.${pad(c)}`;
}

/** Group words into short caption lines, breaking on length, long pauses and sentence ends. */
export function group(words: Word[], maxWords: number, maxChars: number): Word[][] {
  const out: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    const prev = cur[cur.length - 1];
    const chars = cur.reduce((n, x) => n + x.word.length + 1, 0) + w.word.length;
    if (prev && (cur.length >= maxWords || chars > maxChars || w.start - prev.end > 0.5)) {
      out.push(cur);
      cur = [];
    }
    cur.push(w);
    if (/[.!?]$/.test(w.word)) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  return out;
}

function header(d: StyleDef) {
  return `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${d.font},${d.size},${d.primary},${d.secondary},${d.outline},${d.back},-1,0,0,0,100,100,0,0,${d.borderStyle},${d.outlineWidth},${d.shadow},2,80,80,${d.marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
}

export function buildAss(words: Word[], clipStart: number, clipEnd: number, styleId: CaptionStyleId = "karaoke"): string {
  const d = CAPTION_STYLES[styleId];
  const rel = words
    .filter((w) => w.end > clipStart && w.start < clipEnd)
    .map((w) => ({
      word: w.word.replace(/[{}\\]/g, "").replace(/\s+/g, " ").trim(),
      start: Math.max(0, w.start - clipStart),
      end: Math.min(clipEnd, w.end) - clipStart,
    }))
    .filter((w) => w.word.length > 0);
  const casing = (s: string) => (d.uppercase ? s.toUpperCase() : s);
  const dialogue = (start: number, end: number, text: string, tags: string) =>
    `Dialogue: 0,${ts(start)},${ts(end)},Default,,0,0,0,,{${tags}}${text}`;

  const lines: string[] = [];

  if (d.mode === "word") {
    rel.forEach((w, i) => {
      const nextStart = rel[i + 1]?.start;
      const end = Math.max(w.end, Math.min(nextStart ?? Infinity, w.end + 0.4));
      lines.push(dialogue(w.start, end, casing(w.word), "\\fad(30,0)\\fscx70\\fscy70\\t(0,110,\\fscx100\\fscy100)"));
    });
  } else {
    const chunks = group(rel, d.maxWords, d.maxChars);
    chunks.forEach((chunk, i) => {
      const first = chunk[0]!;
      const last = chunk[chunk.length - 1]!;
      const nextStart = chunks[i + 1]?.[0]?.start;
      const end = Math.max(last.end, Math.min(nextStart ?? Infinity, last.end + 0.3));
      if (d.mode === "karaoke") {
        const text = chunk
          .map((w, j) => {
            const until = chunk[j + 1]?.start ?? w.end;
            const cs = Math.max(1, Math.round((until - w.start) * 100));
            return `{\\kf${cs}}${casing(w.word)}`;
          })
          .join(" ");
        lines.push(dialogue(first.start, end, text, "\\fad(40,0)\\fscx88\\fscy88\\t(0,90,\\fscx100\\fscy100)"));
      } else {
        lines.push(dialogue(first.start, end, casing(chunk.map((w) => w.word).join(" ")), "\\fad(60,60)"));
      }
    });
  }
  return header(d) + lines.join("\n") + "\n";
}
