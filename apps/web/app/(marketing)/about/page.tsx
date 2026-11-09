import type { Metadata } from "next";
import { Card } from "@/components/marketing/ui/Card";
import { CtaBanner } from "@/components/marketing/ui/CtaBanner";
import { PageHero } from "@/components/marketing/ui/PageHero";
import { Section } from "@/components/marketing/ui/Section";
import { Hl, SectionHeader } from "@/components/marketing/ui/SectionHeader";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "About",
  description: "Why ClipForge exists, how it started and the principles behind it.",
  path: "/about",
});

const PRINCIPLES = [
  { t: "Say what it does", b: "Plain descriptions of the product, including where it falls short. Speaker tracking, for example, follows the largest face and is best on talking heads." },
  { t: "Charge for what you use", b: "Credits map to minutes of source video. If a run fails, the credits come back." },
  { t: "Respect other people's work", b: "Only upload or link videos you own or have permission to use." },
  { t: "Keep you in control", b: "AI proposes, you decide. Every clip can be trimmed, restyled and re-rendered." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About" title={<>Long videos deserve a <Hl>second life</Hl></>} sub="ClipForge exists so a good hour of conversation doesn't stay buried in a single upload." />
      <Section tone="raised" aria-labelledby="mission-h">
        <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-2">
          <div>
            <h2 id="mission-h" className="font-display text-3xl font-extrabold tracking-tight">Mission</h2>
            <p className="mt-4 text-lg leading-relaxed text-fg-muted">Make it quick and affordable to turn long-form video into short, captioned clips that are ready to post.</p>
          </div>
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight">Story</h2>
            {/* PLACEHOLDER: replace with your real founding story, team and location. */}
            <p className="mt-4 text-lg leading-relaxed text-fg-muted">Finding the good 40 seconds in a 90-minute recording is slow work. ClipForge automates the finding, the cutting, the framing and the captions, and leaves the final call to you.</p>
          </div>
        </div>
      </Section>
      <Section aria-labelledby="prin-h">
        <SectionHeader id="prin-h" title="Principles" />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <li key={p.t} data-reveal>
              <Card className="h-full">
                <h3 className="font-display text-xl font-bold">{p.t}</h3>
                <p className="mt-2 leading-relaxed text-fg-muted">{p.b}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Section>
      <CtaBanner />
    </>
  );
}
