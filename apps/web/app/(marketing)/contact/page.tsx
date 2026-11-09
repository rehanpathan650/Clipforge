import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { ContactForm } from "@/components/marketing/ContactForm";
import { Container } from "@/components/marketing/ui/Container";
import { PageHero } from "@/components/marketing/ui/PageHero";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Contact",
  description: "Questions, billing issues or copyright notices: send us a message or email support.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Talk to us" sub="Questions about a project, a payment or a takedown request? Send a message." />
      <Container className="pb-section">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_20rem]">
          <ContactForm />
          <aside className="space-y-4">
            <div className="rounded-card border border-white/10 bg-surface p-6">
              <Mail className="text-caption" size={22} aria-hidden="true" />
              <p className="mt-4 font-display text-lg font-bold">Email support</p>
              {/* PLACEHOLDER: set the real support address in lib/site.ts */}
              <a href={`mailto:${SITE.supportEmail}`} className="mt-1 block break-all text-fg-muted underline underline-offset-4 hover:text-fg">
                {SITE.supportEmail}
              </a>
            </div>
            <p className="text-sm leading-relaxed text-fg-subtle">Include the email on your account and, for a failed project, its title. Copyright notices should name the work and where it appears.</p>
          </aside>
        </div>
      </Container>
    </>
  );
}
