import type { Metadata } from "next";
import Link from "next/link";
import { HelpSearch } from "@/components/marketing/HelpSearch";
import { Container } from "@/components/marketing/ui/Container";
import { PageHero } from "@/components/marketing/ui/PageHero";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({ title: "Help center", description: "Search answers about uploads, YouTube links, credits, captions and the clip editor.", path: "/help" });

export default function HelpPage() {
  return (
    <>
      <PageHero eyebrow="Help center" title="How can we help?" sub="Search the articles below." />
      <Container className="pb-section">
        <HelpSearch />
        <p className="mt-10 text-center text-fg-muted">
          Still stuck?{" "}
          <Link href="/contact" className="text-caption underline underline-offset-4">
            Contact us
          </Link>
          .
        </p>
      </Container>
    </>
  );
}
