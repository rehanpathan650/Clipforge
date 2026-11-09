import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { Accordion } from "@/components/marketing/ui/Accordion";
import { Card } from "@/components/marketing/ui/Card";
import { CtaBanner } from "@/components/marketing/ui/CtaBanner";
import { ButtonLink } from "@/components/marketing/ui/Button";
import { PageHero } from "@/components/marketing/ui/PageHero";
import { Section } from "@/components/marketing/ui/Section";
import { SectionHeader } from "@/components/marketing/ui/SectionHeader";
import { getSolution, SOLUTIONS } from "@/lib/content/solutions";
import { pageMeta } from "@/lib/seo";

type Params = { slug: string };

export const dynamicParams = false;
export const generateStaticParams = () => SOLUTIONS.map((s) => ({ slug: s.slug }));

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const s = getSolution((await params).slug);
  if (!s) return {};
  return pageMeta({ title: `ClipForge for ${s.label.toLowerCase()}`, description: s.meta, path: `/solutions/${s.slug}` });
}

export default async function SolutionPage({ params }: { params: Promise<Params> }) {
  const s = getSolution((await params).slug);
  if (!s) notFound();
  return (
    <>
      <PageHero eyebrow={s.eyebrow} title={s.title} sub={s.sub}>
        <ButtonLink href="/signup" size="lg">
          Get started
        </ButtonLink>
        <ButtonLink href="/pricing" variant="secondary" size="lg">
          See pricing
        </ButtonLink>
      </PageHero>

      <Section tone="raised" aria-labelledby="pain-h">
        <SectionHeader id="pain-h" title="The problem with doing it by hand" />
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {s.pains.map((p) => (
            <li key={p.title} data-reveal>
              <Card className="h-full">
                <h3 className="font-display text-xl font-bold tracking-tight">{p.title}</h3>
                <p className="mt-2 leading-relaxed text-fg-muted">{p.body}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <Section aria-labelledby="flow-h">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader id="flow-h" align="left" title="Your workflow" />
            <ol className="mt-8 space-y-3">
              {s.workflow.map((w, i) => (
                <li key={w} className="flex gap-4 rounded-xl border border-white/10 bg-surface px-5 py-4">
                  <span className="font-mono text-caption">{i + 1}</span>
                  {w}
                </li>
              ))}
            </ol>
          </div>
          <ul className="space-y-4 lg:pt-4">
            {s.benefits.map(({ icon: I, title, body }) => (
              <li key={title} data-reveal className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-caption/10 text-caption">
                  <I size={22} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold">{title}</h3>
                  <p className="mt-1 text-fg-muted">{body}</p>
                </div>
              </li>
            ))}
            <li className="flex gap-3 pt-2 text-sm text-fg-subtle">
              <Check size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              1080 × 1920 output · word-by-word captions · 15 to 90 second clips
            </li>
          </ul>
        </div>
      </Section>

      <Section tone="raised" aria-labelledby="sfaq-h">
        <SectionHeader id="sfaq-h" title="Common questions" />
        <div className="mx-auto mt-12 max-w-3xl">
          <Accordion items={s.faq} />
        </div>
      </Section>
      <CtaBanner />
    </>
  );
}
