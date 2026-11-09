import type { Metadata } from "next";
import { CaptionShowcase } from "@/components/marketing/CaptionShowcase";
import { CtaBanner } from "@/components/marketing/ui/CtaBanner";
import { PageHero } from "@/components/marketing/ui/PageHero";
import { Placeholder } from "@/components/marketing/ui/Placeholder";
import { Section } from "@/components/marketing/ui/Section";
import { Hl, SectionHeader } from "@/components/marketing/ui/SectionHeader";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Examples",
  description: "Sample ClipForge clips and the four caption styles: Karaoke, Pop, Boxed and Clean.",
  path: "/showcase",
});

const SLOTS = ["Podcast clip", "Creator clip", "Interview clip", "Tutorial clip", "Talking-head clip", "Agency client clip"];

export default function ShowcasePage() {
  return (
    <>
      <PageHero eyebrow="Examples" title={<>See what the <Hl>output</Hl> looks like</>} sub="Vertical 1080 × 1920 clips with captions burned in." />
      <Section id="gallery" aria-labelledby="gal-h">
        <SectionHeader id="gal-h" title="Clip gallery" sub="Real clips will go in these slots. Until you add them, they stay clearly marked as placeholders." />
        <ul className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {SLOTS.map((s) => (
            <li key={s}>
              {/* PLACEHOLDER: swap for a real <video> (poster + captions on) from your own footage. */}
              <Placeholder label={s} hint="Add a real 9:16 sample video" ratio="phone" />
            </li>
          ))}
        </ul>
      </Section>
      <Section id="caption-styles" tone="raised" aria-labelledby="cs-h">
        <SectionHeader id="cs-h" eyebrow="Caption styles" title={<>Four <Hl>caption</Hl> styles</>} sub="Pick one per project, change it per clip." />
        <CaptionShowcase />
      </Section>
      <CtaBanner />
    </>
  );
}
