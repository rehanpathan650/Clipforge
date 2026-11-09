"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Pack } from "@/lib/types";

/** Shown if the API isn't reachable. Keep in sync with packages/core/src/pricing.ts (single source of truth for prices). */
export const FALLBACK_PACKS: Pack[] = [
  { id: "starter", name: "Starter", credits: 120, amountPaise: 49900, currency: "INR", minutes: 120, blurb: "About 2 hours of video" },
  { id: "creator", name: "Creator", credits: 600, amountPaise: 199900, currency: "INR", minutes: 600, blurb: "About 10 hours of video" },
  { id: "studio", name: "Studio", credits: 2000, amountPaise: 549900, currency: "INR", minutes: 2000, blurb: "About 33 hours of video" },
];

export function usePacks() {
  const [packs, setPacks] = useState<Pack[]>(FALLBACK_PACKS);
  useEffect(() => {
    api.get<Pack[]>("/api/billing/packs").then(setPacks).catch(() => undefined);
  }, []);
  return packs;
}
