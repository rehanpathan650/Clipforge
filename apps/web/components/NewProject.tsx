"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Film, Link2, Loader2, UploadCloud, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { ReframePicker, StylePicker } from "@/components/StylePicker";
import { api, errorMessage } from "@/lib/api";
import { fileSize } from "@/lib/format";
import { uploadFile } from "@/lib/upload";
import type { CaptionStyleId, ProjectSummary, Reframe } from "@/lib/types";

const MAX_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB ?? 2048);
const EXT = /\.(mp4|mov|mkv|webm|m4v|avi)$/i;
type Tab = "upload" | "link";

export function NewProject() {
  const router = useRouter();
  const { user } = useAuth();
  const [captionStyle, setCaptionStyle] = useState<CaptionStyleId>("karaoke");
  const [reframe, setReframe] = useState<Reframe>("auto");
  const [tab, setTab] = useState<Tab>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");
  const [rights, setRights] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function pick(f: File | undefined) {
    if (!f) return;
    if (!EXT.test(f.name)) return setError("Use an MP4, MOV, MKV, WebM, M4V or AVI file.");
    if (f.size > MAX_MB * 1024 * 1024) return setError(`Files can be up to ${MAX_MB} MB.`);
    setError(null);
    setFile(f);
  }

  async function submitUpload() {
    if (!file) return;
    setBusy(true);
    setError(null);
    setProgress(0);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const id = await uploadFile(file, { captionStyle, reframe }, setProgress, ctrl.signal);
      router.push(`/projects/${id}`);
    } catch (e) {
      if (!ctrl.signal.aborted) setError(errorMessage(e));
      setBusy(false);
    }
  }

  async function submitLink() {
    setBusy(true);
    setError(null);
    try {
      const p = await api.post<ProjectSummary>("/api/projects/url", { url: url.trim(), confirmRights: rights, captionStyle, reframe });
      router.push(`/projects/${p.id}`);
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-[0_1px_0_rgba(11,16,51,0.06)] sm:p-8">
      <h2 className="font-display text-2xl font-bold tracking-tight">New project</h2>

      <div role="tablist" aria-label="Video source" className="relative mt-5 flex gap-1 rounded-full bg-mist p-1">
        {(["upload", "link"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            disabled={busy}
            onClick={() => {
              setTab(t);
              setError(null);
            }}
            className="relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold"
          >
            {tab === t && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 -z-10 rounded-full bg-white shadow-sm"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            {t === "upload" ? <UploadCloud size={16} /> : <Link2 size={16} />}
            {t === "upload" ? "Upload a file" : "YouTube link"}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <AnimatePresence mode="wait" initial={false}>
          {tab === "upload" ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.18 }}
            >
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  if (!busy) pick(e.dataTransfer.files[0]);
                }}
                className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
                  dragging ? "border-cobalt bg-cobalt/5" : "border-mist-line"
                }`}
              >
                {file ? (
                  <div className="flex items-center gap-3 text-left">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cobalt/10 text-cobalt">
                      <Film size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{file.name}</p>
                      <p className="text-sm text-navy/60">{fileSize(file.size)}</p>
                    </div>
                    {!busy && (
                      <button
                        onClick={() => setFile(null)}
                        aria-label="Remove file"
                        className="rounded-full p-2 text-navy/50 hover:bg-mist hover:text-navy"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ) : (
                  <button onClick={() => inputRef.current?.click()} className="w-full py-6">
                    <UploadCloud className="mx-auto text-cobalt" size={30} />
                    <p className="mt-3 font-semibold">Drop a video here, or choose a file</p>
                    <p className="mt-1 text-sm text-navy/60">MP4, MOV, MKV or WebM, up to {MAX_MB / 1024} GB</p>
                  </button>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept="video/*,.mkv"
                  className="sr-only"
                  tabIndex={-1}
                  onChange={(e) => pick(e.target.files?.[0])}
                />
              </div>

              {busy && (
                <div className="mt-5" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-2 overflow-hidden rounded-full bg-mist">
                    <motion.div className="h-full rounded-full bg-cobalt" animate={{ width: `${progress * 100}%` }} transition={{ ease: "linear", duration: 0.2 }} />
                  </div>
                  <p className="mt-2 text-sm text-navy/60">Uploading {Math.round(progress * 100)}%</p>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button onClick={submitUpload} disabled={!file || busy} className="btn-blue flex-1">
                  {busy ? <Loader2 className="animate-spin" size={18} /> : null}
                  {busy ? "Uploading" : "Start clipping"}
                </button>
                {busy && (
                  <button onClick={() => abortRef.current?.abort()} className="btn-quiet">
                    Cancel
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="link"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
              onSubmit={(e) => {
                e.preventDefault();
                void submitLink();
              }}
            >
              <label htmlFor="yt" className="text-sm font-semibold">
                YouTube link
              </label>
              <input
                id="yt"
                type="url"
                inputMode="url"
                required
                placeholder="https://www.youtube.com/watch?v=…"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={busy}
                className="field mt-2"
              />
              <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm text-navy/75">
                <input
                  type="checkbox"
                  checked={rights}
                  onChange={(e) => setRights(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-cobalt"
                />
                <span>I own this video or have permission to make clips from it.</span>
              </label>
              <button type="submit" disabled={busy || !url.trim() || !rights} className="btn-blue mt-6 w-full">
                {busy ? <Loader2 className="animate-spin" size={18} /> : null}
                {busy ? "Adding" : "Start clipping"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <details className="group mt-6 rounded-2xl border border-mist-line p-4">
          <summary className="cursor-pointer text-sm font-semibold marker:content-none">
            Captions and framing
            <span className="ml-2 font-normal text-navy/55">
              {captionStyle === "karaoke" ? "Karaoke" : captionStyle[0]!.toUpperCase() + captionStyle.slice(1)},{" "}
              {reframe === "auto" ? "follows the speaker" : "center crop"}
            </span>
          </summary>
          <div className="mt-4 space-y-4">
            <StylePicker value={captionStyle} onChange={setCaptionStyle} disabled={busy} />
            <ReframePicker value={reframe} onChange={setReframe} disabled={busy} />
          </div>
        </details>

        <p className="mt-4 text-sm text-navy/60">
          1 credit = 1 minute of video.{" "}
          {user && user.credits < 1 ? (
            <Link href="/billing" className="font-semibold text-cobalt underline underline-offset-4">
              You have no credits. Buy a pack.
            </Link>
          ) : (
            <>You have {user?.credits ?? 0}.</>
          )}
        </p>

        <AnimatePresence>
          {error && (
            <motion.p
              role="alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden rounded-xl bg-rec/10 px-4 py-3 text-sm font-medium text-rec"
            >
              {error}
              {/credits/i.test(error) && (
                <>
                  {" "}
                  <Link href="/billing" className="underline underline-offset-4">
                    Buy credits
                  </Link>
                </>
              )}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
