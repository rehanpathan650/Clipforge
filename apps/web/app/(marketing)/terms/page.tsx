import type { Metadata } from "next";
import { LegalLayout } from "@/components/marketing/ui/LegalLayout";
import { TERMS, LEGAL_UPDATED } from "@/lib/content/legal";
import { pageMeta } from "@/lib/seo";

// DRAFT – review with a lawyer before launch. (Intentionally not shown on the page.)
export const metadata: Metadata = pageMeta({ title: "Terms of service", description: "The rules for using ClipForge, including content permissions, credits and acceptable use.", path: "/terms" });

export default function Page() {
  return <LegalLayout title="Terms of service" updated={LEGAL_UPDATED} intro="The rules for using ClipForge, including content permissions, credits and acceptable use." sections={TERMS} />;
}
