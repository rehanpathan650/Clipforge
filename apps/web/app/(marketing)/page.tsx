import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/marketing/Hero";
import { StepRail } from "@/components/marketing/HowItWorks";
import { StatStrip } from "@/components/marketing/SpecsTable";
import { PricingGrid } from "@/components/marketing/PricingGrid";
import { CaptionShowcase } from "@/components/marketing/CaptionShowcase";
import { SpeakerTrackingVisual } from "@/components/marketing/SpeakerTracking";
import { UseCaseTabs } from "@/components/marketing/UseCaseTabs";
import { Accordion } from "@/components/marketing/ui/Accordion";
import { CtaBanner } from "@/components/marketing/ui/CtaBanner";
import { FeatureGrid } from "@/components/marketing/ui/FeatureGrid";
import { Placeholder } from "@/components/marketing/ui/Placeholder";
import { Section } from "@/components/marketing/ui/Section";
import { Hl, SectionHeader } from "@/components/marketing/ui/SectionHeader";
import { ButtonLink } from "@/components/marketing/ui/Button";
import { FAQ } from "@/lib/content/faq";
import { FEATURES } from "@/lib/content/features";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  ...pageMeta({ title: "Long videos in, short clips out", description: SITE.description, path: "/" }),
  title: { absolute: "ClipForge – long videos in, short clips out" },
};

export default function HomePage() {
  return (
    <>
      <Hero />

      <Section className="!py-0" aria-labelledby="proof-h">
        <div className="pb-section">
          <h2 id="proof-h" className="sr-only">
            Social proof
          </h2>
          {/* PLACEHOLDER: replace with real customer logos or a real quote once you have permission to show them. */}
          <Placeholder label="Social proof slot" hint="Real customer logos or a quote go here. Nothing is shown until you have real ones." ratio="wide" />
        </div>
      </Section>

      <Section id="how" tone="raised" aria-labelledby="how-h">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeader id="how-h" align="left" eyebrow="How it works" title={<>What happens after you <Hl>hit start</Hl></>} sub="Four steps, no timeline to scrub." />
            <ButtonLink href="/how-it-works" variant="secondary" className="mt-8">
              Full walkthrough and specs <ArrowRight size={16} aria-hidden="true" />
            </ButtonLink>
          </div>
          <StepRail />
        </div>
        <div className="mt-20">
          <StatStrip />
        </div>
      </Section>

      <Section id="features" glow aria-labelledby="features-h">
        <SectionHeader id="features-h" eyebrow="Features" title={<>Everything between the upload and the <Hl>post</Hl></>} sub="Transcription, moment picking, framing, captions and an editor, in one pipeline." />
        <FeatureGrid items={FEATURES.map((f) => ({ icon: f.icon, title: f.title, body: f.short }))} />
        <div className="mt-10 text-center">
          <ButtonLink href="/features" variant="secondary">
            Explore all features
          </ButtonLink>
        </div>
      </Section>

      <Section id="caption-styles" tone="raised" aria-labelledby="captions-h">
        <SectionHeader id="captions-h" eyebrow="Caption styles" title={<>Four ways to <Hl>caption</Hl> a clip</>} sub="Burned in at 1080 × 1920. Pick one per project and change it per clip in the editor." />
        <CaptionShowcase />
      </Section>

      <Section id="speaker-tracking" aria-labelledby="speaker-h">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader id="speaker-h" align="left" eyebrow="Speaker tracking" title={<>A camera that <Hl>follows the speaker</Hl></>} sub="Landscape in, vertical out. A virtual camera keeps the speaker's face in frame and moves smoothly instead of snapping." />
            <ul className="mt-8 space-y-3 text-fg-muted">
              <li>Face detection finds the largest face in each shot.</li>
              <li>The camera path is smoothed, so there is no jitter.</li>
              <li>Works best on front-facing talking heads. In multi-person shots it follows the largest face, and any clip can switch to a center crop.</li>
            </ul>
            <Link href="/features#auto-framing" className="mt-6 inline-flex items-center gap-1.5 font-semibold text-caption hover:underline">
              More on auto-framing <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <SpeakerTrackingVisual />
        </div>
      </Section>

      <Section id="use-cases" tone="raised" aria-labelledby="uc-h">
        <SectionHeader id="uc-h" eyebrow="Solutions" title={<>Built for people who record <Hl>long</Hl></>} sub="Whatever you record, the pipeline is the same." />
        <UseCaseTabs />
      </Section>

      <Section id="pricing" glow aria-labelledby="pricing-h">
        <SectionHeader id="pricing-h" eyebrow="Pricing" title={<>Pay for the <Hl>minutes</Hl> you process</>} sub="One credit covers one minute of source video. No subscription, and if a video can't be processed the credits come straight back." />
        <div className="mt-14">
          <PricingGrid />
        </div>
        <p className="mt-8 text-center text-sm text-fg-subtle">
          <Link href="/pricing" className="text-caption underline-offset-4 hover:underline">
            Full pricing details
          </Link>
        </p>
      </Section>

      <Section id="faq" tone="raised" aria-labelledby="faq-h">
        <SectionHeader id="faq-h" eyebrow="FAQ" title={<>Questions, <Hl>answered</Hl></>} />
        <div className="mx-auto mt-12 max-w-3xl">
          <Accordion items={FAQ} />
          <p className="mt-6 text-center text-sm text-fg-subtle">
            More in the{" "}
            <Link href="/help" className="text-caption underline-offset-4 hover:underline">
              help center
            </Link>
            .
          </p>
        </div>
      </Section>

      <CtaBanner />
    </>
  );
}
