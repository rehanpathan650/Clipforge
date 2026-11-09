"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Link2, Upload } from "lucide-react";
import { FACTS } from "@/lib/site";
import { PhoneFrame } from "./PhoneFrame";
import { Container } from "./ui/Container";
import { ButtonLink } from "./ui/Button";

gsap.registerPlugin(useGSAP);

const BARS = 110;
const SCAN = 4.2; // seconds the playhead takes to cross the timeline

// Where the "AI picks" land on the timeline, in % of its width.
const RANGES = [
  { left: 7, width: 13 },
  { left: 41, width: 10 },
  { left: 70, width: 15 },
];

const CLIPS = [
  { caption: ["NOBODY", "TELLS", "YOU"], time: "0:34", tilt: -4, drop: 0, tone: "from-[#3a4df0] to-[#07080F]" },
  { caption: ["THIS", "CHANGED", "EVERYTHING"], time: "0:48", tilt: 2, drop: 36, tone: "from-[#1b2bd6] to-[#07080F]" },
  { caption: ["HERE'S", "THE", "CATCH"], time: "0:27", tilt: -2, drop: 12, tone: "from-[#5a6bff] to-[#07080F]" },
];

const barHeight = (i: number) =>
  Math.min(100, 16 + Math.round(Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.23) + Math.sin(i * 1.9) * 0.35) * 64));

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const router = useRouter();
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = link.trim();
    if (!v) return router.push("/signup");
    if (!/^https?:\/\/\S+\.\S+/i.test(v)) return setError("Paste a full link that starts with https://");
    // carry the link through signup (and on to the dashboard) so it can be prefilled
    const q = encodeURIComponent(v);
    router.push(`/signup?link=${q}&next=${encodeURIComponent(`/dashboard?link=${q}`)}`);
  }

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(".h-word", { yPercent: 110, duration: 0.9, stagger: 0.12 })
          .from(".h-fade", { opacity: 0, y: 12, duration: 0.6, stagger: 0.1 }, "-=0.5")
          .from(".tl-bar", { scaleY: 0, duration: 0.5, stagger: { each: 0.005 } }, "-=0.7");

        // The playhead scans the long video; each pick grows as it passes, then becomes a clip.
        tl.addLabel("scan", ">-0.1").set(".playhead", { opacity: 1 }, "scan");
        tl.fromTo(".playhead", { left: "0%" }, { left: "100%", duration: SCAN, ease: "none" }, "scan");

        RANGES.forEach((r, i) => {
          const startAt = (r.left / 100) * SCAN;
          const endAt = ((r.left + r.width) / 100) * SCAN;
          tl.fromTo(`.range-${i}`, { scaleX: 0 }, { scaleX: 1, duration: endAt - startAt, ease: "none" }, `scan+=${startAt}`);
          tl.fromTo(
            `.phone-${i}`,
            { y: 100, opacity: 0, rotate: 0 },
            { y: 0, opacity: 1, rotate: CLIPS[i]!.tilt, duration: 0.8, ease: "back.out(1.5)" },
            `scan+=${endAt}`,
          );
          // captions fill yellow word by word, like the real output
          tl.to(`.phone-${i} .cap-word`, { color: "#FFD60A", duration: 0.1, stagger: 0.26 }, `scan+=${endAt + 0.5}`);
        });
        tl.to(".playhead", { opacity: 0, duration: 0.4 }, `scan+=${SCAN}`);
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".cap-word", { color: "#FFD60A" });
        CLIPS.forEach((c, i) => gsap.set(`.phone-${i}`, { rotate: c.tilt }));
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden">
      <div aria-hidden="true" className="mk-glow pointer-events-none absolute inset-x-0 top-0 h-[40rem]" />
      <div aria-hidden="true" className="mk-grid pointer-events-none absolute inset-0 h-[44rem]" />
      <Container className="relative pb-section pt-16 text-center sm:pt-24">
        <h1 className="font-display text-[clamp(3.2rem,9.5vw,7.5rem)] font-extrabold leading-[0.92] tracking-[-0.045em]">
          <span className="block overflow-hidden pb-[0.1em]">
            <span className="h-word inline-block">Hours in.</span>
          </span>
          <span className="block overflow-hidden pb-[0.12em]">
            <span className="h-word inline-block text-caption">Shorts out.</span>
          </span>
        </h1>
        <p className="h-fade mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-fg-muted sm:text-xl">
          Paste a YouTube link or upload a video. ClipForge finds the moments worth posting and hands you vertical clips with captions already burned in.
        </p>

        <form onSubmit={submit} className="h-fade mx-auto mt-9 max-w-2xl" noValidate>
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-surface p-2 pl-5 shadow-glow-cobalt focus-within:border-caption">
            <Link2 size={18} className="shrink-0 text-fg-subtle" aria-hidden="true" />
            <label htmlFor="hero-link" className="sr-only">
              YouTube link
            </label>
            <input
              id="hero-link"
              value={link}
              onChange={(e) => {
                setLink(e.target.value);
                setError(null);
              }}
              inputMode="url"
              autoComplete="off"
              placeholder="Paste a YouTube link or upload a video"
              aria-describedby={error ? "hero-link-error" : undefined}
              aria-invalid={error ? true : undefined}
              className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-fg placeholder:text-fg-subtle focus:outline-none focus-visible:outline-none"
            />
            <button
              type="submit"
              aria-label="Start clipping"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-caption text-ink transition-transform hover:bg-[#ffe45c] active:scale-95"
            >
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </div>
          <p id="hero-link-error" role="alert" className="mt-2 min-h-5 text-sm text-[#ff8f8b]">
            {error}
          </p>
          <div className="mt-1 flex items-center justify-center gap-3 text-sm text-fg-subtle">
            or
            <ButtonLink href="/signup" variant="secondary" size="sm">
              <Upload size={15} aria-hidden="true" /> Upload a video
            </ButtonLink>
          </div>
        </form>

        <ul className="h-fade mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-fg-muted">
          {["1080 × 1920 output", "Word-by-word captions", "Speaker tracking", "Up to 2 hours of video"].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-caption" aria-hidden="true" />
              {t}
            </li>
          ))}
        </ul>

        {/* Signature scene: scan the long video, picks become clips */}
        <div className="mx-auto mt-16 max-w-4xl" aria-hidden="true">
          <div className="mb-4 flex justify-center gap-3 sm:gap-5">
            {CLIPS.map((c, i) => (
              <div key={i} className={`phone-${i}`} style={{ marginTop: c.drop }}>
                <PhoneFrame tone={c.tone} time={c.time} className="w-[6.4rem] sm:w-36 lg:w-40">
                  <p className="absolute inset-x-2 bottom-[17%] text-center font-display text-[0.8rem] font-extrabold leading-tight sm:text-base">
                    {c.caption.map((w, j) => (
                      <span key={j} className="cap-word mr-1 inline-block text-white [text-shadow:0_2px_0_rgba(0,0,0,0.55)]">
                        {w}
                      </span>
                    ))}
                  </p>
                </PhoneFrame>
              </div>
            ))}
          </div>
          <div className="rounded-card border border-white/10 bg-surface p-4 text-left sm:p-6">
            <div className="mb-4 flex items-center justify-between font-mono text-xs text-fg-subtle">
              <span>sample-long-video.mp4</span>
              <span>58:12</span>
            </div>
            <div className="relative">
              <div className="flex h-24 items-end gap-[3px] sm:h-28">
                {Array.from({ length: BARS }, (_, i) => (
                  <span key={i} className="tl-bar block flex-1 origin-bottom rounded-[2px] bg-white/25" style={{ height: `${barHeight(i)}%` }} />
                ))}
              </div>
              {RANGES.map((r, i) => (
                <div
                  key={i}
                  className={`range-${i} absolute inset-y-0 origin-left rounded-md border-2 border-caption bg-caption/20`}
                  style={{ left: `${r.left}%`, width: `${r.width}%` }}
                />
              ))}
              <div className="playhead absolute inset-y-[-6px] z-10 w-0.5 -translate-x-1/2 bg-white opacity-0">
                <span className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-rec" />
              </div>
            </div>
            <div className="mt-3 flex justify-between font-mono text-[0.7rem] text-fg-subtle">
              {["0:00", "14:33", "29:06", "43:39", "58:12"].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
