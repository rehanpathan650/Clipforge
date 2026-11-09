import Link from "next/link";
import { Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { Logo } from "@/components/Logo";
import { FOOTER_COLUMNS, SITE } from "@/lib/site";
import { Container } from "./ui/Container";

/** PLACEHOLDER: add real profile URLs. Icons without an href render as inert, non-link icons (no dead links). */
const SOCIALS = [
  { label: "X / Twitter", icon: Twitter, href: null as string | null },
  { label: "YouTube", icon: Youtube, href: null as string | null },
  { label: "Instagram", icon: Instagram, href: null as string | null },
  { label: "LinkedIn", icon: Linkedin, href: null as string | null },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-surface/60">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_repeat(5,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-fg-muted">{SITE.tagline} Vertical clips with word-by-word captions, ready to post.</p>
            <ul className="mt-6 flex gap-2">
              {SOCIALS.map(({ label, icon: Icon, href }) => (
                <li key={label}>
                  {href ? (
                    <a href={href} aria-label={label} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-fg-muted hover:text-fg">
                      <Icon size={16} aria-hidden="true" />
                    </a>
                  ) : (
                    <span title={`${label} (profile coming soon)`} className="grid h-9 w-9 place-items-center rounded-full border border-dashed border-white/15 text-fg-subtle">
                      <Icon size={16} aria-hidden="true" />
                      <span className="sr-only">{label} (coming soon)</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.label} aria-label={col.label}>
              <p className="font-display text-sm font-bold">{col.label}</p>
              <ul className="mt-4 space-y-2.5">
                {col.items.map((it) => (
                  <li key={it.href}>
                    <Link href={it.href} className="text-sm text-fg-muted hover:text-fg">
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>{SITE.consent}</p>
        </div>
      </Container>
    </footer>
  );
}
