export const STYLE_IDS = ["karaoke", "pop", "boxed", "clean"] as const;
export type StyleId = (typeof STYLE_IDS)[number];
