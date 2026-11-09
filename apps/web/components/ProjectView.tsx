"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Archive, RotateCcw, Trash2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { ClipCard } from "@/components/ClipCard";
import { Stepper } from "@/components/Stepper";
import { useProject } from "@/hooks/useProject";
import { api, apiBase, errorMessage } from "@/lib/api";
import { clock, daysLeft } from "@/lib/format";
import { isActive } from "@/lib/types";

export function ProjectView({ id }: { id: string }) {
  const router = useRouter();
  const { refresh } = useAuth();
  const { project, error, reload } = useProject(id);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Credits change when a run is charged or refunded, so refresh the header balance when it settles.
  const lastStatus = useRef<string | null>(null);
  useEffect(() => {
    if (!project) return;
    if (lastStatus.current && lastStatus.current !== project.status && !isActive(project.status)) void refresh();
    if (!lastStatus.current && isActive(project.status)) void refresh();
    lastStatus.current = project.status;
  }, [project, refresh]);

  async function retry() {
    setBusy(true);
    setActionError(null);
    try {
      await api.post(`/api/projects/${id}/retry`);
      await Promise.all([reload(), refresh()]);
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm("Delete this project and all of its clips? This can't be undone.")) return;
    setBusy(true);
    setActionError(null);
    try {
      await api.del(`/api/projects/${id}`);
      router.push("/dashboard");
    } catch (e) {
      setActionError(errorMessage(e));
      setBusy(false);
    }
  }

  const needsCredits = project?.error ? /credits/i.test(project.error) : false;

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-navy/65 hover:text-navy">
        <ArrowLeft size={16} /> All projects
      </Link>

      {error && !project && (
        <div className="rounded-3xl bg-white p-10 text-center">
          <p className="font-display text-2xl font-bold">We couldn&apos;t open this project</p>
          <p className="mt-2 text-navy/65">{error}</p>
          <Link href="/dashboard" className="btn-blue mt-6">
            Back to projects
          </Link>
        </div>
      )}

      {!project && !error && <div className="h-56 animate-pulse rounded-3xl bg-white/70" aria-hidden="true" />}

      {project && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-display text-3xl font-extrabold leading-tight tracking-[-0.025em] sm:text-5xl">{project.title}</h1>
              <p className="mt-2 text-navy/60">
                {project.sourceType === "YOUTUBE" ? "From a YouTube link" : "Uploaded file"}
                {project.durationSec ? <span className="font-mono"> · {clock(project.durationSec)}</span> : null}
                {project.creditsCharged > 0 && <span> · {project.creditsCharged} credits</span>}
              </p>
            </div>
            {!isActive(project.status) && (
              <div className="flex gap-2">
                {project.status === "READY" && project.clips.length > 0 && (
                  <a href={`${apiBase}/api/projects/${id}/download`} className="btn-blue px-4 py-2.5 text-sm">
                    <Archive size={16} /> Download all
                  </a>
                )}
                <button onClick={remove} disabled={busy} className="btn-quiet px-4 py-2.5 text-sm">
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            )}
          </div>

          <div className="mt-8">
            {isActive(project.status) && <Stepper status={project.status} stage={project.stage} progress={project.progress} />}

            {project.status === "FAILED" && (
              <div role="alert" className="rounded-3xl border-2 border-rec/30 bg-white p-6 sm:p-8">
                <p className="font-display text-2xl font-bold">This project didn&apos;t finish</p>
                <p className="mt-2 max-w-2xl text-navy/75">{project.error ?? "Something went wrong."}</p>
                <p className="mt-1 text-sm text-navy/55">Any credits used for this attempt were returned to you.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {needsCredits && (
                    <Link href="/billing" className="btn-yellow">
                      Buy credits
                    </Link>
                  )}
                  <button onClick={retry} disabled={busy} className="btn-blue">
                    <RotateCcw size={16} /> Try again
                  </button>
                </div>
              </div>
            )}

            {project.status === "READY" && (
              <>
                <p className="mb-6 text-lg text-navy/70">
                  {project.clips.length} {project.clips.length === 1 ? "clip" : "clips"} ready, in the order they appear in
                  your video.{" "}
                  <span className="text-navy/50">
                    Kept for {daysLeft(project.expiresAt)} more days.
                    {!project.sourceAvailable && " The original video has been removed, so clips can no longer be edited."}
                  </span>
                </p>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {project.clips.map((c, i) => (
                    <ClipCard key={c.id} clip={c} i={i} editable={project.sourceAvailable} />
                  ))}
                </div>
              </>
            )}
          </div>

          {actionError && (
            <p role="alert" className="mt-6 rounded-xl bg-rec/10 px-4 py-3 text-sm font-medium text-rec">
              {actionError}
            </p>
          )}
        </>
      )}
    </main>
  );
}
