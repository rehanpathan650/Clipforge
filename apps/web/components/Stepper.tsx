"use client";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { STEPS, type ProjectStatus } from "@/lib/types";

export function Stepper({ status, stage, progress }: { status: ProjectStatus; stage: string; progress: number }) {
  const current = status === "QUEUED" ? -1 : STEPS.findIndex((s) => s.status === status);

  return (
    <div className="rounded-3xl bg-navy p-6 text-white sm:p-8" role="status" aria-live="polite">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {status === "QUEUED" ? "Waiting for a free worker" : stage}
          </p>
          <p className="mt-1 text-sm text-white/60">You can leave this page. We&apos;ll keep working.</p>
        </div>
        <p className="font-mono text-3xl tabular-nums text-caption">{progress}%</p>
      </div>

      <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/15">
        <motion.div
          className="h-full rounded-full bg-caption"
          initial={false}
          animate={{ width: `${Math.max(progress, 2)}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 24 }}
        />
      </div>

      <ol className="mt-6 grid gap-3 sm:grid-cols-4">
        {STEPS.map((s, i) => {
          const done = i < current;
          const now = i === current;
          return (
            <li key={s.status} className="flex items-center gap-3">
              <span
                className={`relative grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors ${
                  done ? "bg-caption text-navy" : now ? "bg-white text-navy" : "bg-white/10 text-white/50"
                }`}
              >
                {done ? <Check size={15} strokeWidth={3} /> : i + 1}
                {now && (
                  <motion.span
                    className="absolute inset-0 rounded-full border-2 border-caption"
                    animate={{ scale: [1, 1.5], opacity: [0.9, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
              </span>
              <span className={`text-sm font-medium ${now ? "text-white" : done ? "text-white/80" : "text-white/45"}`}>
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
