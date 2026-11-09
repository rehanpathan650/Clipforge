"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ChevronRight, Link2, Loader2, UploadCloud } from "lucide-react";
import { api } from "@/lib/api";
import { clock, timeAgo } from "@/lib/format";
import { isActive, type ProjectSummary } from "@/lib/types";

function StatusBadge({ p }: { p: ProjectSummary }) {
  if (p.status === "READY")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-cobalt/10 px-3 py-1 text-sm font-semibold text-cobalt">
        <CheckCircle2 size={15} /> {p.clipCount} {p.clipCount === 1 ? "clip" : "clips"}
      </span>
    );
  if (p.status === "FAILED")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rec/10 px-3 py-1 text-sm font-semibold text-rec">
        <AlertTriangle size={15} /> Failed
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-caption/40 px-3 py-1 text-sm font-semibold">
      <Loader2 size={15} className="animate-spin" /> {p.progress}%
    </span>
  );
}

export function ProjectList() {
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      setProjects(await api.get<ProjectSummary[]>("/api/projects"));
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const anyActive = projects?.some((p) => isActive(p.status)) ?? false;
  useEffect(() => {
    if (!anyActive) return;
    const t = setInterval(() => void load(), 4000);
    return () => clearInterval(t);
  }, [anyActive, load]);

  return (
    <section aria-labelledby="projects-h">
      <h2 id="projects-h" className="font-display text-2xl font-bold tracking-tight">
        Your projects
      </h2>

      {projects === null && !failed && (
        <div className="mt-5 space-y-3" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[4.5rem] animate-pulse rounded-2xl bg-white/70" />
          ))}
        </div>
      )}

      {failed && !projects && (
        <p className="mt-5 rounded-2xl bg-white p-6 text-navy/70">
          We couldn&apos;t load your projects.{" "}
          <button onClick={() => void load()} className="font-semibold text-cobalt underline underline-offset-4">
            Try again
          </button>
        </p>
      )}

      {projects?.length === 0 && (
        <div className="mt-5 rounded-2xl border-2 border-dashed border-mist-line p-10 text-center">
          <p className="font-display text-xl font-bold">Nothing here yet</p>
          <p className="mx-auto mt-2 max-w-xs text-navy/65">
            Upload a video or paste a YouTube link and your first clips will show up here.
          </p>
        </div>
      )}

      <ul className="mt-5 space-y-3">
        <AnimatePresence initial={false}>
          {projects?.map((p) => (
            <motion.li
              key={p.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href={`/projects/${p.id}`}
                className="group flex items-center gap-4 rounded-2xl bg-white p-4 transition-shadow hover:shadow-[0_8px_30px_-12px_rgba(11,16,51,0.25)]"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-navy text-white">
                  {p.sourceType === "YOUTUBE" ? <Link2 size={20} /> : <UploadCloud size={20} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{p.title}</p>
                  <p className="mt-0.5 truncate text-sm text-navy/60">
                    {isActive(p.status) ? p.stage : p.status === "FAILED" ? "Needs attention" : "Finished"}
                    {p.durationSec ? <span className="font-mono"> · {clock(p.durationSec)}</span> : null} · {timeAgo(p.createdAt)}
                  </p>
                </div>
                <StatusBadge p={p} />
                <ChevronRight size={18} className="shrink-0 text-navy/30 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}
