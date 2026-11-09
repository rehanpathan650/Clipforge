import type { Metadata } from "next";
import { Accordion } from "@/components/marketing/ui/Accordion";
import { CtaBanner } from "@/components/marketing/ui/CtaBanner";
import { PageHero } from "@/components/marketing/ui/PageHero";
import { Section } from "@/components/marketing/ui/Section";
import { FAQ } from "@/lib/content/faq";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "FAQ",
  description: "Answers about pricing, limits, YouTube links, framing, captions and editing in ClipForge.",
  path: "/faq",
});

export default function FaqPage() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHero eyebrow="FAQ" title="Frequently asked questions" sub="Can't find it? The help center and contact page are one click away." />
      <Section tone="raised">
        <div className="mx-auto max-w-3xl">
          <Accordion items={FAQ} />
        </div>
      </Section>
      <CtaBanner />
    </>
  );
}
