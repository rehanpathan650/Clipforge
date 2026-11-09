"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Download, Loader2, Pencil } from "lucide-react";
import { clock } from "@/lib/format";
import type { Clip } from "@/lib/types";

export function ClipCard({ clip, i, editable }: { clip: Clip; i: number; editable: boolean }) {
  const rendering = clip.status === "RENDERING";
  return (
    <motion.article
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 26, delay: Math.min(i, 8) * 0.06 }}
      className="flex flex-col overflow-hidden rounded-3xl bg-white"
    >
      <div className="relative aspect-[9/16] bg-navy">
        {/* key={version}: the editor produces a new file, so the player must reload */}
        <video
          key={clip.version}
          className="h-full w-full object-cover"
          src={clip.videoUrl}
          poster={clip.thumbUrl ?? undefined}
          controls
          playsInline
          preload="none"
          aria-label={`Preview of clip: ${clip.title}`}
        />
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-caption px-2.5 py-1 text-xs font-bold text-navy">
          Score {clip.score}
        </span>
        {rendering && (
          <div className="absolute inset-0 grid place-items-center bg-navy/70 text-white" role="status">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <Loader2 className="animate-spin" size={18} /> Applying your edit
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold leading-snug tracking-tight">{clip.title}</h3>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-navy/65">{clip.reason}</p>
        {clip.error && <p className="mt-2 text-sm font-medium text-rec">{clip.error}</p>}
        <p className="mt-3 font-mono text-xs text-navy/55">
          {clock(clip.startSec)} – {clock(clip.endSec)} · {Math.round(clip.durationSec)}s
        </p>
        <div className="mt-4 flex gap-2">
          <a href={clip.downloadUrl} download className="btn-blue flex-1 py-2.5 text-sm">
            <Download size={16} /> Download
          </a>
          {editable && (
            <Link href={`/clips/${clip.id}/edit`} className="btn-quiet py-2.5 text-sm" aria-label={`Edit ${clip.title}`}>
              <Pencil size={16} /> Edit
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}
