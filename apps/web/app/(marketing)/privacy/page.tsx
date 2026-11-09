import type { Metadata } from "next";
import { LegalLayout } from "@/components/marketing/ui/LegalLayout";
import { PRIVACY, LEGAL_UPDATED } from "@/lib/content/legal";
import { pageMeta } from "@/lib/seo";

// DRAFT – review with a lawyer before launch. (Intentionally not shown on the page.)
export const metadata: Metadata = pageMeta({ title: "Privacy policy", description: "What ClipForge collects, why, and the choices you have.", path: "/privacy" });

export default function Page() {
  return <LegalLayout title="Privacy policy" updated={LEGAL_UPDATED} intro="What ClipForge collects, why, and the choices you have." sections={PRIVACY} />;
}
