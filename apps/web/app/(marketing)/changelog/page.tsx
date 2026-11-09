import type { Metadata } from "next";
import { Badge } from "@/components/marketing/ui/Badge";
import { Container } from "@/components/marketing/ui/Container";
import { PageHero } from "@/components/marketing/ui/PageHero";
import { RELEASES } from "@/lib/content/changelog";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Changelog",
  description: "What has shipped in ClipForge: pipeline, editor, credits and speaker tracking.",
  path: "/changelog",
});

export default function ChangelogPage() {
  return (
    <>
      <PageHero eyebrow="Changelog" title="What shipped" sub="Release notes, newest first." />
      <Container className="pb-section">
        <ol className="mx-auto max-w-3xl space-y-10 border-l border-white/10 pl-8">
          {RELEASES.map((r) => (
            <li key={r.label} data-reveal className="relative">
              <span className="absolute -left-[2.45rem] top-1.5 h-3 w-3 rounded-full border-2 border-caption bg-ink" aria-hidden="true" />
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone="yellow">{r.label}</Badge>
                {r.date && <time className="font-mono text-xs text-fg-subtle">{r.date}</time>}
              </div>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight">{r.title}</h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-fg-muted">
                {r.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Container>
    </>
  );
}
