"use client";
import Link from "next/link";
import { Check } from "lucide-react";
import { usePacks } from "@/lib/packs";
import { rupees } from "@/lib/format";
import { buttonClass } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Card } from "./ui/Card";

const SIGNUP = `/signup?next=${encodeURIComponent("/billing")}`;
const perHour = (p: { amountPaise: number; credits: number }) => Math.round(p.amountPaise / (p.credits / 60));

/** Pack cards. Data comes from the API with the shared fallback (same source as the app's billing). */
export function PricingGrid() {
  const packs = usePacks();
  const lowest = Math.min(...packs.map(perHour));
  return (
    <ul className="grid gap-4 lg:grid-cols-3">
      {packs.map((p) => {
        const best = perHour(p) === lowest && packs.length > 1;
        return (
          <li key={p.id} data-reveal>
            <Card raised={best} className={`flex h-full flex-col ${best ? "border-caption/50 shadow-glow-yellow" : ""}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl font-bold">{p.name}</h3>
                {best && <Badge tone="yellow">Lowest per hour</Badge>}
              </div>
              <p className="mt-6 font-display text-5xl font-extrabold tracking-tight">{rupees(p.amountPaise)}</p>
              <p className="mt-1 text-sm text-fg-subtle">one-time, no subscription</p>
              <ul className="mt-6 space-y-3 text-[0.95rem] text-fg-muted">
                <li className="flex gap-3">
                  <Check size={18} className="mt-0.5 shrink-0 text-caption" aria-hidden="true" />
                  <span>
                    <span className="font-mono text-fg">{p.credits}</span> credits ({p.blurb.toLowerCase()})
                  </span>
                </li>
                <li className="flex gap-3">
                  <Check size={18} className="mt-0.5 shrink-0 text-caption" aria-hidden="true" />
                  {rupees(perHour(p))} per hour of source video
                </li>
                <li className="flex gap-3">
                  <Check size={18} className="mt-0.5 shrink-0 text-caption" aria-hidden="true" />
                  Credits never expire
                </li>
                <li className="flex gap-3">
                  <Check size={18} className="mt-0.5 shrink-0 text-caption" aria-hidden="true" />
                  Refunded automatically if processing fails
                </li>
              </ul>
              <Link href={SIGNUP} className={buttonClass(best ? "primary" : "secondary", "md", "mt-8 w-full")}>
                Get started
              </Link>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}

export function PackTable() {
  const packs = usePacks();
  return (
    <div className="overflow-x-auto rounded-card border border-white/10 bg-surface">
      <table className="w-full min-w-[34rem] text-left text-[0.95rem]">
        <caption className="sr-only">Credit pack comparison</caption>
        <thead className="border-b border-white/10 font-mono text-xs text-fg-subtle">
          <tr>
            {["Pack", "Credits", "Source video", "Price", "Per hour", "Per minute"].map((h) => (
              <th key={h} scope="col" className="px-5 py-3 font-normal">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {packs.map((p) => (
            <tr key={p.id}>
              <th scope="row" className="px-5 py-4 font-display text-lg font-bold">
                {p.name}
              </th>
              <td className="px-5 py-4 font-mono">{p.credits}</td>
              <td className="px-5 py-4 text-fg-muted">{p.blurb.replace("About ", "≈ ")}</td>
              <td className="px-5 py-4 font-medium">{rupees(p.amountPaise)}</td>
              <td className="px-5 py-4 text-fg-muted">{rupees(perHour(p))}</td>
              <td className="px-5 py-4 text-fg-muted">{rupees(Math.round(p.amountPaise / p.credits))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
