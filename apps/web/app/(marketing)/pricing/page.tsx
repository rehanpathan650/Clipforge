import type { Metadata } from "next";
import { Infinity as Inf, RotateCcw, Timer } from "lucide-react";
import { Accordion } from "@/components/marketing/ui/Accordion";
import { PackTable, PricingGrid } from "@/components/marketing/PricingGrid";
import { Card } from "@/components/marketing/ui/Card";
import { CtaBanner } from "@/components/marketing/ui/CtaBanner";
import { PageHero } from "@/components/marketing/ui/PageHero";
import { Section } from "@/components/marketing/ui/Section";
import { Hl, SectionHeader } from "@/components/marketing/ui/SectionHeader";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Pricing",
  description: "Buy credits, not a subscription. 1 credit = 1 minute of source video. Credits don't expire and are refunded if processing fails.",
  path: "/pricing",
});

const PRICING_FAQ = [
  { q: "What is a credit?", a: "One credit covers one minute of source video. A 45-minute video uses 45 credits. Partial minutes round up, with a minimum of one credit." },
  { q: "Do credits expire?", a: "No. They stay in your account until you use them." },
  { q: "What if processing fails?", a: "The credits for that run are returned automatically. You don't need to contact anyone." },
  { q: "Do re-renders and edits cost credits?", a: "No. Trimming, restyling and re-rendering a clip are free while the source video is still stored." },
  { q: "Is there a subscription?", a: "No. Packs are one-off purchases, so nothing renews and there is nothing to cancel." },
  { q: "How do I pay?", a: "At checkout inside the app. Payments are verified on the server before credits are added." },
];

const PERKS = [
  { icon: RotateCcw, t: "Refund on failure", b: "If a video can't be processed, the credits for that run come back automatically." },
  { icon: Inf, t: "Credits don't expire", b: "Buy once and use them over weeks or months." },
  { icon: Timer, t: "Per started minute", b: "Billed on source length, so clip count doesn't change the price." },
];

export default function PricingPage() {
  return (
    <>
      <PageHero eyebrow="Pricing" title={<>Pay for the <Hl>minutes</Hl> you process</>} sub="1 credit = 1 minute of source video. Pick a pack, use it whenever you publish." />
      <section aria-labelledby="packs-h" className="mx-auto w-full max-w-container px-5 pb-section sm:px-8">
        <h2 id="packs-h" className="sr-only">
          Credit packs
        </h2>
        <PricingGrid />
        <ul className="mt-10 grid gap-4 sm:grid-cols-3">
          {PERKS.map(({ icon: I, t, b }) => (
            <li key={t}>
              <Card className="h-full">
                <I className="text-caption" size={22} aria-hidden="true" />
                <p className="mt-4 font-display text-lg font-bold">{t}</p>
                <p className="mt-1 text-sm leading-relaxed text-fg-muted">{b}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>
      <Section tone="raised" aria-labelledby="compare-h">
        <SectionHeader id="compare-h" title={<>Compare the <Hl>packs</Hl></>} sub="Same product in every pack. The only difference is how many minutes you buy at once." />
        <div className="mt-12">
          <PackTable />
        </div>
      </Section>
      <Section aria-labelledby="pfaq-h">
        <SectionHeader id="pfaq-h" title="Pricing questions" />
        <div className="mx-auto mt-12 max-w-3xl">
          <Accordion items={PRICING_FAQ} />
        </div>
      </Section>
      <CtaBanner />
    </>
  );
}
