import type { Metadata } from "next";
import { Check } from "lucide-react";
import { CtaBanner } from "@/components/marketing/ui/CtaBanner";
import { FeatureVisual } from "@/components/marketing/FeatureVisual";
import { PageHero } from "@/components/marketing/ui/PageHero";
import { Section } from "@/components/marketing/ui/Section";
import { Hl } from "@/components/marketing/ui/SectionHeader";
import { ButtonLink } from "@/components/marketing/ui/Button";
import { FEATURES } from "@/lib/content/features";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Features",
  description: "Word-timestamp transcription, scored AI moment picking, speaker-tracking framing, four caption styles, a clip editor and ZIP download.",
  path: "/features",
});

export default function FeaturesPage() {
  return (
    <>
      <PageHero eyebrow="Features" title={<>The whole pipeline, <Hl>explained</Hl></>} sub="What ClipForge does to your video, step by step, and what you can change afterward.">
        <ButtonLink href="/signup">Get started</ButtonLink>
        <ButtonLink href="/how-it-works" variant="secondary">
          How it works
        </ButtonLink>
      </PageHero>
      {FEATURES.map((f, i) => (
        <Section key={f.id} id={f.id} tone={i % 2 ? "raised" : "base"}>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div data-reveal className={i % 2 ? "lg:order-2" : ""}>
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-caption/10 text-caption">
                <f.icon size={24} aria-hidden="true" />
              </span>
              <h2 className="mt-5 font-display text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl">{f.title}</h2>
              <p className="mt-4 text-lg leading-relaxed text-fg-muted">{f.body}</p>
              <ul className="mt-6 space-y-3">
                {f.points.map((p) => (
                  <li key={p} className="flex gap-3 text-fg-muted">
                    <Check size={18} className="mt-1 shrink-0 text-caption" aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div data-reveal className={i % 2 ? "lg:order-1" : ""}>
              <FeatureVisual id={f.id} />
            </div>
          </div>
        </Section>
      ))}
      <CtaBanner />
    </>
  );
}
