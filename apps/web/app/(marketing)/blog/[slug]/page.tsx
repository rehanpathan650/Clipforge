import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/marketing/ui/Badge";
import { Container } from "@/components/marketing/ui/Container";
import { CtaBanner } from "@/components/marketing/ui/CtaBanner";
import { POSTS } from "@/lib/content/blog";
import { pageMeta } from "@/lib/seo";

type Params = { slug: string };
export const dynamicParams = false;
export const generateStaticParams = () => POSTS.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = POSTS.find((x) => x.slug === slug);
  return p ? pageMeta({ title: p.title, description: p.excerpt, path: `/blog/${p.slug}` }) : {};
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = POSTS.find((x) => x.slug === slug);
  if (!post) notFound();
  return (
    <>
      <Container className="py-16 lg:py-24">
        <article className="mx-auto max-w-prose">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg">
            <ArrowLeft size={15} aria-hidden="true" /> All posts
          </Link>
          <div className="mt-8 flex items-center gap-3">
            <Badge tone="blue">{post.category}</Badge>
            <span className="font-mono text-xs text-fg-subtle">{post.readMinutes} min read</span>
            {post.date && <time className="font-mono text-xs text-fg-subtle">{post.date}</time>}
          </div>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl">{post.title}</h1>
          <p className="mt-5 text-xl leading-relaxed text-fg-muted">{post.excerpt}</p>
          <div className="mk-prose mt-10">
            {post.body.map((b, i) => (
              <div key={i}>
                {b.h && <h2>{b.h}</h2>}
                <p>{b.p}</p>
              </div>
            ))}
          </div>
        </article>
      </Container>
      <CtaBanner />
    </>
  );
}
