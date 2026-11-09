import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/marketing/ui/Badge";
import { Card } from "@/components/marketing/ui/Card";
import { Container } from "@/components/marketing/ui/Container";
import { PageHero } from "@/components/marketing/ui/PageHero";
import { POSTS } from "@/lib/content/blog";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({ title: "Blog", description: "Guides and notes on turning long videos into short clips.", path: "/blog" });

export default function BlogIndex() {
  return (
    <>
      <PageHero eyebrow="Blog" title="Guides and notes" sub="How ClipForge works and how to get better clips out of it." />
      <Container className="pb-section">
        <ul className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
          {POSTS.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="block h-full">
                <Card interactive className="h-full">
                  <div className="flex items-center gap-3">
                    <Badge tone="blue">{p.category}</Badge>
                    <span className="font-mono text-xs text-fg-subtle">{p.readMinutes} min read</span>
                  </div>
                  <h2 className="mt-4 font-display text-2xl font-bold leading-tight tracking-tight">{p.title}</h2>
                  <p className="mt-2 leading-relaxed text-fg-muted">{p.excerpt}</p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
