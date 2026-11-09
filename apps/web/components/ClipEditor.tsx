"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Download, Loader2, Play, Scissors } from "lucide-react";
import { ReframePicker, StylePicker } from "@/components/StylePicker";
import { api, errorMessage } from "@/lib/api";
import { clockTenths } from "@/lib/format";
import type { CaptionStyleId, Clip, ClipDetail, Reframe } from "@/lib/types";

const MIN_LEN = 15;
const MAX_LEN = 90;
const round1 = (n: number) => Math.round(n * 10) / 10;

export function ClipEditor({ id }: { id: string }) {
  const [data, setData] = useState<ClipDetail | null>(null);
  const [clip, setClip] = useState<Clip | null>(null);
  const [bounds, setBounds] = useState({ lo: 0, hi: 1 });
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [style, setStyle] = useState<CaptionStyleId>("karaoke");
  const [reframe, setReframe] = useState<Reframe>("auto");
  const [now, setNow] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stopAt = useRef<number | null>(null);

  useEffect(() => {
    api
      .get<ClipDetail>(`/api/clips/${id}`)
      .then((d) => {
        setData(d);
        setClip(d.clip);
        setStart(d.clip.startSec);
        setEnd(d.clip.endSec);
        setStyle(d.clip.captionStyle);
        setReframe(d.clip.reframe);
        const total = d.project.durationSec ?? d.clip.endSec + 60;
        setBounds({ lo: Math.max(0, d.clip.startSec - 60), hi: Math.min(total, d.clip.endSec + 60) });
      })
      .catch((e) => setError(errorMessage(e)));
  }, [id]);

  // While a re-render runs, poll the lightweight status endpoint until it settles.
  const rendering = clip?.status === "RENDERING";
  useEffect(() => {
    if (!rendering) return;
    const t = setInterval(async () => {
      try {
        const c = await api.get<Clip>(`/api/clips/${id}/status`);
        if (c.status === "RENDERING") return;
        setClip(c);
        setStart(c.startSec);
        setEnd(c.endSec);
        setSaving(false);
        if (c.error) setError(c.error);
        else setSaved(true);
      } catch {
        /* keep polling; transient errors shouldn't interrupt the edit */
      }
    }, 2000);
    return () => clearInterval(t);
  }, [rendering, id]);

  const setStartSafe = (v: number) => setStart(round1(Math.min(Math.max(v, bounds.lo, end - MAX_LEN), end - MIN_LEN)));
  const setEndSafe = (v: number) => setEnd(round1(Math.max(Math.min(v, bounds.hi, start + MAX_LEN), start + MIN_LEN)));

  const dirty = useMemo(
    () =>
      clip !== null &&
      (Math.abs(start - clip.startSec) > 0.05 || Math.abs(end - clip.endSec) > 0.05 || style !== clip.captionStyle || reframe !== clip.reframe),
    [clip, start, end, style, reframe],
  );

  function playSelection() {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = start;
    stopAt.current = end;
    void v.play();
  }

  async function apply() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      setClip(await api.post<Clip>(`/api/clips/${id}/render`, { start, end, captionStyle: style, reframe }));
    } catch (e) {
      setError(errorMessage(e));
      setSaving(false);
    }
  }

  if (error && !data) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16 text-center">
        <p className="font-display text-2xl font-bold">We couldn&apos;t open this clip</p>
        <p className="mt-2 text-navy/65">{error}</p>
        <Link href="/dashboard" className="btn-blue mt-6">Back to projects</Link>
      </main>
    );
  }
  if (!data || !clip) return <main className="mx-auto max-w-6xl px-5 py-10"><div className="h-96 animate-pulse rounded-3xl bg-white/70" /></main>;

  const editable = data.project.sourceAvailable && Boolean(data.sourceUrl);
  const pct = (t: number) => `${Math.min(100, Math.max(0, ((t - bounds.lo) / (bounds.hi - bounds.lo)) * 100))}%`;
  const length = end - start;

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <Link href={`/projects/${data.project.id}`} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-navy/65 hover:text-navy">
        <ArrowLeft size={16} /> {data.project.title}
      </Link>
      <h1 className="font-display text-3xl font-extrabold leading-tight tracking-[-0.025em] sm:text-4xl">{clip.title}</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <section aria-label="Trim" className="min-w-0 space-y-6">
          {!editable ? (
            <p className="rounded-2xl bg-caption/30 px-5 py-4 font-medium">
              The original video has been removed, so this clip can no longer be edited. You can still download it.
            </p>
          ) : (
            <>
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-navy">
                <video
                  ref={videoRef}
                  src={data.sourceUrl!}
                  controls
                  preload="metadata"
                  playsInline
                  className="h-full w-full object-contain"
                  onLoadedMetadata={() => {
                    if (videoRef.current) videoRef.current.currentTime = start;
                  }}
                  onTimeUpdate={(e) => {
                    const t = e.currentTarget.currentTime;
                    setNow(t);
                    if (stopAt.current !== null && t >= stopAt.current) {
                      e.currentTarget.pause();
                      stopAt.current = null;
                    }
                  }}
                />
                {reframe === "center" && (
                  <div className="pointer-events-none absolute inset-y-0 left-1/2 aspect-[9/16] -translate-x-1/2 border-2 border-caption" aria-hidden="true">
                    <span className="absolute left-1 top-1 rounded bg-caption px-1.5 py-0.5 text-[0.65rem] font-bold text-navy">Approx. crop</span>
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-white p-5 sm:p-6">
                <div className="relative h-10 rounded-lg bg-mist" aria-hidden="true">
                  <div className="absolute inset-y-0 rounded-lg border-2 border-cobalt bg-cobalt/20" style={{ left: pct(start), width: `calc(${pct(end)} - ${pct(start)})` }} />
                  <div className="absolute inset-y-[-4px] w-0.5 bg-rec" style={{ left: pct(now) }} />
                </div>
                <div className="mt-2 flex justify-between font-mono text-xs text-navy/50" aria-hidden="true">
                  <span>{clockTenths(bounds.lo)}</span>
                  <span className={length < MIN_LEN + 0.1 || length > MAX_LEN - 0.1 ? "font-bold text-rec" : "font-bold text-navy"}>
                    {length.toFixed(1)}s selected
                  </span>
                  <span>{clockTenths(bounds.hi)}</span>
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {(
                    [
                      ["Start", start, setStartSafe, bounds.lo, end - MIN_LEN],
                      ["End", end, setEndSafe, start + MIN_LEN, bounds.hi],
                    ] as const
                  ).map(([label, value, set, min, max]) => (
                    <div key={label}>
                      <div className="flex items-center justify-between">
                        <label htmlFor={`r-${label}`} className="text-sm font-semibold">{label}</label>
                        <span className="font-mono text-sm">{clockTenths(value)}</span>
                      </div>
                      <input
                        id={`r-${label}`} type="range" min={min} max={Math.max(min, max)} step={0.1} value={value}
                        onChange={(e) => set(Number(e.target.value))}
                        className="mt-2 w-full accent-cobalt"
                      />
                      <div className="mt-2 flex flex-wrap gap-2">
                        {[-0.5, 0.5].map((d) => (
                          <button key={d} type="button" onClick={() => set(value + d)} className="btn-quiet px-3 py-1.5 text-xs">
                            {d > 0 ? "+" : ""}{d}s
                          </button>
                        ))}
                        <button type="button" onClick={() => set(now)} className="btn-quiet px-3 py-1.5 text-xs">
                          Use current time
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button type="button" onClick={playSelection} className="btn-quiet mt-5 py-2.5 text-sm">
                  <Play size={16} /> Play selection
                </button>
              </div>

              <div className="rounded-2xl bg-white p-5 sm:p-6">
                <h2 className="font-display text-lg font-bold">Transcript</h2>
                <p className="mt-1 text-sm text-navy/60">Click a word to start the clip there. Shift-click to end it there.</p>
                <p className="mt-4 max-h-56 overflow-y-auto pr-2 leading-8">
                  {data.words.map((w, i) => {
                    const inside = w.start >= start - 0.01 && w.end <= end + 0.01;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={(e) => (e.shiftKey ? setEndSafe(w.end) : setStartSafe(w.start))}
                        className={`mr-1 rounded px-0.5 text-[0.95rem] transition-colors hover:bg-caption/50 ${inside ? "bg-cobalt/10 font-medium text-navy" : "text-navy/45"}`}
                      >
                        {w.word}
                      </button>
                    );
                  })}
                </p>
              </div>
            </>
          )}
        </section>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start" aria-label="Current clip and style">
          <div className="relative mx-auto aspect-[9/16] w-full max-w-[16rem] overflow-hidden rounded-3xl bg-navy">
            <video key={clip.version} src={clip.videoUrl} poster={clip.thumbUrl ?? undefined} controls playsInline preload="metadata" className="h-full w-full object-cover" />
            {rendering && (
              <div role="status" className="absolute inset-0 grid place-items-center bg-navy/75 text-white">
                <span className="flex items-center gap-2 text-sm font-semibold"><Loader2 className="animate-spin" size={18} /> Rendering your edit</span>
              </div>
            )}
          </div>
          <a href={clip.downloadUrl} download className="btn-quiet w-full py-2.5 text-sm"><Download size={16} /> Download this version</a>

          {editable && (
            <div className="space-y-5 rounded-2xl bg-white p-5">
              <div>
                <h2 className="mb-2 text-sm font-semibold">Captions</h2>
                <StylePicker value={style} onChange={setStyle} disabled={saving} />
              </div>
              <div>
                <h2 className="mb-2 text-sm font-semibold">Framing</h2>
                <ReframePicker value={reframe} onChange={setReframe} disabled={saving} />
              </div>
              <button onClick={() => void apply()} disabled={!dirty || saving} className="btn-blue w-full">
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Scissors size={18} />}
                {saving ? "Rendering" : "Apply changes"}
              </button>
              <p className="text-xs text-navy/55">Edits are free. Rendering takes about a minute.</p>
              {saved && !dirty && <p role="status" className="rounded-xl bg-cobalt/10 px-3 py-2 text-sm font-medium text-cobalt">Your edit is ready.</p>}
              {error && <p role="alert" className="rounded-xl bg-rec/10 px-3 py-2 text-sm font-medium text-rec">{error}</p>}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
