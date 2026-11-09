export type CaptionStyleId = "karaoke" | "pop" | "boxed" | "clean";

export interface StyleDef {
  font: string;
  size: number;
  /** ASS colours are &HAABBGGRR. Primary = "already spoken" colour, secondary = "not yet spoken". */
  primary: string;
  secondary: string;
  outline: string;
  back: string;
  /** 1 = outline + shadow, 3 = opaque box drawn with the outline colour. */
  borderStyle: 1 | 3;
  outlineWidth: number;
  shadow: number;
  marginV: number;
  uppercase: boolean;
  /** karaoke: words fill as spoken · word: one word at a time · phrase: plain text lines */
  mode: "karaoke" | "word" | "phrase";
  maxWords: number;
  maxChars: number;
}

const YELLOW = "&H000AD6FF";
const WHITE = "&H00FFFFFF";
const BLACK = "&H00000000";

export const CAPTION_STYLES: Record<CaptionStyleId, StyleDef> = {
  karaoke: {
    font: "DejaVu Sans", size: 78, primary: YELLOW, secondary: WHITE, outline: BLACK, back: "&H64000000",
    borderStyle: 1, outlineWidth: 7, shadow: 2, marginV: 520, uppercase: true, mode: "karaoke", maxWords: 3, maxChars: 22,
  },
  pop: {
    font: "DejaVu Sans", size: 124, primary: YELLOW, secondary: YELLOW, outline: BLACK, back: "&H64000000",
    borderStyle: 1, outlineWidth: 10, shadow: 3, marginV: 700, uppercase: true, mode: "word", maxWords: 1, maxChars: 20,
  },
  boxed: {
    font: "DejaVu Sans", size: 62, primary: YELLOW, secondary: WHITE, outline: "&H00140F0B", back: "&H00140F0B",
    borderStyle: 3, outlineWidth: 16, shadow: 0, marginV: 460, uppercase: false, mode: "karaoke", maxWords: 4, maxChars: 28,
  },
  clean: {
    font: "DejaVu Sans", size: 60, primary: WHITE, secondary: WHITE, outline: BLACK, back: "&H64000000",
    borderStyle: 1, outlineWidth: 4, shadow: 1, marginV: 380, uppercase: false, mode: "phrase", maxWords: 6, maxChars: 34,
  },
};

export function parseStyle(value: string | null | undefined): CaptionStyleId {
  return value && value in CAPTION_STYLES ? (value as CaptionStyleId) : "karaoke";
}
