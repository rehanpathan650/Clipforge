"use client";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { HELP } from "@/lib/content/help";
import { Badge } from "./ui/Badge";

export function HelpSearch() {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? HELP.filter((a) => `${a.title} ${a.body} ${a.category}`.toLowerCase().includes(t)) : HELP;
  }, [q]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg-subtle" size={18} aria-hidden="true" />
        <label htmlFor="help-q" className="sr-only">
          Search help articles
        </label>
        <input id="help-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search: credits, YouTube, captions…" className="mk-field !rounded-full !py-3.5 pl-12" />
      </div>
      <p role="status" aria-live="polite" className="mt-3 text-sm text-fg-subtle">
        {results.length} {results.length === 1 ? "article" : "articles"}
      </p>
      <ul className="mt-4 space-y-3">
        {results.map((a) => (
          <li key={a.id}>
            <details className="group rounded-card border border-white/10 bg-surface open:bg-surface-2">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-display text-lg font-semibold">
                {a.title}
                <Badge>{a.category}</Badge>
              </summary>
              <p className="px-5 pb-5 leading-relaxed text-fg-muted">{a.body}</p>
            </details>
          </li>
        ))}
      </ul>
      {results.length === 0 && <p className="mt-6 text-fg-muted">Nothing matched. Try another word, or use the contact page.</p>}
    </div>
  );
}
