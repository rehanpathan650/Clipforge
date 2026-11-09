import type { CaptionStyleId, Reframe } from "./types";

export const CAPTION_STYLES: { id: CaptionStyleId; name: string; note: string }[] = [
  { id: "karaoke", name: "Karaoke", note: "Words fill yellow as they're spoken" },
  { id: "pop", name: "Pop", note: "One big word at a time" },
  { id: "boxed", name: "Boxed", note: "Text on a dark bar" },
  { id: "clean", name: "Clean", note: "Plain white subtitles" },
];

export const REFRAMES: { id: Reframe; name: string; note: string }[] = [
  { id: "auto", name: "Follow the speaker", note: "Keeps the speaker's face in frame" },
  { id: "center", name: "Center crop", note: "Always uses the middle of the frame" },
];
