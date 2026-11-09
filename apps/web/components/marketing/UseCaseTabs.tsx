"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SOLUTIONS } from "@/lib/content/solutions";

/** Accessible tabs (arrow keys, roving tabindex). Framer Motion handles the panel swap. */
export function UseCaseTabs() {
  const [i, setI] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const cur = SOLUTIONS[i]!;

  function onKey(e: React.KeyboardEvent) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const n = (i + (e.key === "ArrowRight" ? 1 : -1) + SOLUTIONS.length) % SOLUTIONS.length;
    setI(n);
    tabs.current[n]?.focus();
  }

  return (
    <div className="mt-12">
      <div role="tablist" aria-label="Use cases" onKeyDown={onKey} className="mx-auto flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-white/10 bg-surface p-1">
        {SOLUTIONS.map((s, n) => (
          <button
            key={s.slug}
            ref={(el) => {
              tabs.current[n] = el;
            }}
            role="tab"
            id={`uc-tab-${s.slug}`}
            aria-selected={n === i}
            aria-controls="uc-panel"
            tabIndex={n === i ? 0 : -1}
            onClick={() => setI(n)}
            className="relative rounded-full px-5 py-2.5 text-[0.95rem] font-semibold"
          >
            {n === i && <motion.span layoutId="uc-pill" className="absolute inset-0 rounded-full bg-caption" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
            <span className={`relative ${n === i ? "text-ink" : "text-fg-muted hover:text-fg"}`}>{s.label}</span>
          </button>
        ))}
      </div>

      <div id="uc-panel" role="tabpanel" aria-labelledby={`uc-tab-${cur.slug}`} className="mx-auto mt-8 max-w-4xl">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={cur.slug}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid gap-8 rounded-panel border border-white/10 bg-surface p-6 sm:p-10 md:grid-cols-[1.2fr_1fr]"
          >
            <div>
              <h3 className="font-display text-3xl font-bold leading-tight tracking-tight">{cur.title}</h3>
              <p className="mt-4 leading-relaxed text-fg-muted">{cur.summary}</p>
              <Link href={`/solutions/${cur.slug}`} className="mt-6 inline-flex items-center gap-1.5 font-semibold text-caption hover:underline">
                See how it works for {cur.label.toLowerCase()} <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <ul className="space-y-3">
              {cur.workflow.map((w, n) => (
                <li key={w} className="flex gap-3 rounded-xl bg-surface-2 px-4 py-3 text-[0.95rem]">
                  <span className="font-mono text-caption">{n + 1}</span>
                  {w}
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
