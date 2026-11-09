"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { NAV_GROUPS, NAV_TOP, type NavGroup } from "@/lib/site";
import { ButtonLink } from "./ui/Button";

function Dropdown({ group, open, onToggle, onClose }: { group: NavGroup; open: boolean; onToggle: () => void; onClose: () => void }) {
  return (
    <div className="relative" onMouseEnter={() => !open && onToggle()} onMouseLeave={() => open && onClose()}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={onToggle}
        className="flex items-center gap-1 rounded-full px-3.5 py-2 text-[0.95rem] font-medium text-fg-muted hover:text-fg"
      >
        {group.label}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={15} aria-hidden="true" />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="menu"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute left-0 top-full z-50 w-72 pt-2"
          >
            <div className="rounded-card border border-white/10 bg-surface-2 p-2 shadow-card">
              {group.items.map((it) => (
                <li key={it.href} role="none">
                  <Link role="menuitem" href={it.href} onClick={onClose} className="block rounded-xl px-3 py-2.5 hover:bg-white/5">
                    <span className="block font-semibold text-fg">{it.label}</span>
                    {it.note && <span className="block text-sm text-fg-subtle">{it.note}</span>}
                  </Link>
                </li>
              ))}
            </div>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const bar = useRef<HTMLElement>(null);

  // close everything on navigation
  useEffect(() => {
    setOpenGroup(null);
    setMobile(false);
  }, [pathname]);

  // Esc + outside click
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenGroup(null);
        setMobile(false);
      }
    };
    const onDown = (e: MouseEvent) => {
      if (bar.current && !bar.current.contains(e.target as Node)) setOpenGroup(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, []);

  // lock scroll behind the mobile menu
  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobile]);

  return (
    <header ref={bar} className="sticky top-0 z-50 border-b border-white/10 bg-ink/70 backdrop-blur-xl">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-full focus:bg-caption focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <div className="mx-auto flex h-16 w-full max-w-container items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {NAV_GROUPS.map((g) => (
              <Dropdown
                key={g.label}
                group={g}
                open={openGroup === g.label}
                onToggle={() => setOpenGroup(openGroup === g.label ? null : g.label)}
                onClose={() => setOpenGroup(null)}
              />
            ))}
            {NAV_TOP.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-full px-3.5 py-2 text-[0.95rem] font-medium text-fg-muted hover:text-fg">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/login" className="rounded-full px-4 py-2 text-[0.95rem] font-medium text-fg-muted hover:text-fg">
            Log in
          </Link>
          <ButtonLink href="/signup" size="sm">
            Get started
          </ButtonLink>
        </div>
        <button
          type="button"
          aria-label={mobile ? "Close menu" : "Open menu"}
          aria-expanded={mobile}
          aria-controls="mobile-menu"
          onClick={() => setMobile((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-fg lg:hidden"
        >
          {mobile ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>

      <AnimatePresence>
        {mobile && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto bg-ink px-5 pb-10 pt-6 lg:hidden"
          >
            <nav aria-label="Mobile" className="mx-auto max-w-lg">
              {NAV_GROUPS.map((g, gi) => (
                <motion.div key={g.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + gi * 0.06 }} className="mb-6">
                  <p className="font-mono text-xs text-fg-subtle">{g.label}</p>
                  <ul className="mt-2">
                    {g.items.map((it) => (
                      <li key={it.href}>
                        <Link href={it.href} className="block border-b border-white/10 py-3.5 font-display text-2xl font-bold tracking-tight">
                          {it.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Link href="/pricing" className="block border-b border-white/10 py-3.5 font-display text-2xl font-bold tracking-tight">
                  Pricing
                </Link>
                <div className="mt-8 grid gap-3">
                  <ButtonLink href="/signup" size="lg">
                    Get started
                  </ButtonLink>
                  <ButtonLink href="/login" variant="secondary" size="lg">
                    Log in
                  </ButtonLink>
                </div>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
