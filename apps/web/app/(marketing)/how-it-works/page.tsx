import type { Metadata } from "next";
import { StepRail } from "@/components/marketing/HowItWorks";
import { SpecsTable, StatStrip } from "@/components/marketing/SpecsTable";
import { CtaBanner } from "@/components/marketing/ui/CtaBanner";
import { PageHero } from "@/components/marketing/ui/PageHero";
import { Section } from "@/components/marketing/ui/Section";
import { Hl, SectionHeader } from "@/components/marketing/ui/SectionHeader";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "How it works",
  description: "From upload to vertical clips in four steps: transcribe, pick moments, frame and caption, download. Includes output specs and limits.",
  path: "/how-it-works",
});

export default function HowItWorksPage() {
  return (
    <>
      <PageHero eyebrow="How it works" title={<>From long video to <Hl>vertical clips</Hl></>} sub="Four steps. You do the first one." />
      <Section tone="raised" aria-labelledby="steps-h">
        <h2 id="steps-h" className="sr-only">
          The four steps
        </h2>
        <div className="mx-auto max-w-2xl">
          <StepRail detailed />
        </div>
      </Section>
      <Section aria-labelledby="specs-h">
        <SectionHeader id="specs-h" eyebrow="Specs" title={<>Output and <Hl>limits</Hl></>} sub="Everything the pipeline produces and accepts." />
        <div className="mx-auto mt-12 max-w-3xl space-y-8">
          <StatStrip />
          <SpecsTable />
        </div>
      </Section>
      <CtaBanner />
    </>
  );
}
