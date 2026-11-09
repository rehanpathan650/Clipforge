import type { Metadata } from "next";
import { LegalLayout } from "@/components/marketing/ui/LegalLayout";
import { REFUND, LEGAL_UPDATED } from "@/lib/content/legal";
import { pageMeta } from "@/lib/seo";

// DRAFT – review with a lawyer before launch. (Intentionally not shown on the page.)
export const metadata: Metadata = pageMeta({ title: "Refunds and cancellation", description: "How credit refunds, re-renders, unused credits and cancellation work.", path: "/refund-policy" });

export default function Page() {
  return <LegalLayout title="Refunds and cancellation" updated={LEGAL_UPDATED} intro="How credit refunds, re-renders, unused credits and cancellation work." sections={REFUND} />;
}
