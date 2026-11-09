/** 1 credit = 1 minute of source video. Prices are placeholders: tune them against your real unit costs. */
export interface Pack {
  id: string;
  name: string;
  credits: number;
  amountPaise: number;
  blurb: string;
}

export const PACKS: Pack[] = [
  { id: "starter", name: "Starter", credits: 120, amountPaise: 49900, blurb: "About 2 hours of video" },
  { id: "creator", name: "Creator", credits: 600, amountPaise: 199900, blurb: "About 10 hours of video" },
  { id: "studio", name: "Studio", credits: 2000, amountPaise: 549900, blurb: "About 33 hours of video" },
];

export const getPack = (id: string) => PACKS.find((p) => p.id === id);

/** Billed per started minute of source video, minimum 1. */
export const creditsForDuration = (durationSec: number) => Math.max(1, Math.ceil(durationSec / 60));
