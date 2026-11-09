"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CAPTION_STYLES } from "@/lib/styles";
import { PhoneFrame } from "./PhoneFrame";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const WORDS = ["THIS", "ONE", "SETTING", "CHANGES", "EVERYTHING"];
const TONES: Record<string, string> = {
  karaoke: "from-[#3a4df0] to-[#07080F]",
  pop: "from-[#1b2bd6] to-[#07080F]",
  boxed: "from-[#5a6bff] to-[#07080F]",
  clean: "from-[#2a3ad0] to-[#07080F]",
};

/** The four real caption styles as looping phone mockups. Each loop pauses when off-screen. */
export function CaptionShowcase() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const make = (id: string, build: (tl: gsap.core.Timeline, q: (s: string) => HTMLElement[]) => void) => {
          const el = root.current!.querySelector<HTMLElement>(`[data-style="${id}"]`);
          if (!el) return;
          const q = (s: string) => gsap.utils.toArray<HTMLElement>(s, el);
          const tl = gsap.timeline({ repeat: -1, paused: true });
          build(tl, q);
          ScrollTrigger.create({ trigger: el, start: "top 95%", end: "bottom 5%", onToggle: (self) => (self.isActive ? tl.play() : tl.pause()) });
        };

        make("karaoke", (tl, q) => {
          tl.set(q(".w"), { color: "#fff" }).to(q(".w"), { color: "#FFD60A", duration: 0.12, stagger: 0.45 }).to({}, { duration: 0.9 });
        });
        make("pop", (tl, q) => {
          q(".w").forEach((w) => {
            tl.fromTo(w, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.18, ease: "back.out(2.5)" }).to(w, { opacity: 0, duration: 0.1 }, "+=0.28");
          });
        });
        make("boxed", (tl, q) => {
          tl.set(q(".w"), { opacity: 0 }).to(q(".w"), { opacity: 1, duration: 0.15, stagger: 0.4 }).to({}, { duration: 1 }).to(q(".w"), { opacity: 0, duration: 0.2 });
        });
        make("clean", (tl, q) => {
          tl.fromTo(q(".line-a"), { opacity: 0 }, { opacity: 1, duration: 0.3 })
            .to({}, { duration: 1.4 })
            .to(q(".line-a"), { opacity: 0, duration: 0.3 })
            .fromTo(q(".line-b"), { opacity: 0 }, { opacity: 1, duration: 0.3 })
            .to({}, { duration: 1.4 })
            .to(q(".line-b"), { opacity: 0, duration: 0.3 });
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set('[data-style="karaoke"] .w', { color: "#FFD60A" });
        gsap.set('[data-style="pop"] .w', { opacity: 0 });
        gsap.set('[data-style="pop"] .w:first-child', { opacity: 1 });
        gsap.set('[data-style="clean"] .line-b', { opacity: 0 });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {CAPTION_STYLES.map((s) => (
        <figure key={s.id} data-style={s.id} data-reveal className="text-center">
          <div aria-hidden="true" className="mx-auto w-40 sm:w-44">
            <PhoneFrame tone={TONES[s.id]}>
              {s.id === "karaoke" && (
                <p className="absolute inset-x-2 bottom-[16%] text-center font-display text-[0.95rem] font-extrabold leading-tight [text-shadow:0_2px_0_rgba(0,0,0,0.6)]">
                  {WORDS.map((w) => (
                    <span key={w} className="w mr-1 inline-block text-white">
                      {w}
                    </span>
                  ))}
                </p>
              )}
              {s.id === "pop" && (
                <p className="absolute inset-x-0 bottom-[22%] h-12 text-center font-display text-3xl font-extrabold text-caption [text-shadow:0_3px_0_rgba(0,0,0,0.6)]">
                  {WORDS.map((w, i) => (
                    <span key={w} className="w absolute inset-x-0" style={{ opacity: i === 0 ? 1 : 0 }}>
                      {w}
                    </span>
                  ))}
                </p>
              )}
              {s.id === "boxed" && (
                <p className="absolute inset-x-3 bottom-[16%] rounded-lg bg-ink/85 px-2 py-2 text-center font-display text-[0.8rem] font-bold leading-snug text-white">
                  {WORDS.map((w) => (
                    <span key={w} className="w mr-1 inline-block">
                      {w}
                    </span>
                  ))}
                </p>
              )}
              {s.id === "clean" && (
                <div className="absolute inset-x-3 bottom-[16%] h-10 text-center text-[0.8rem] font-semibold leading-snug text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
                  <span className="line-a absolute inset-x-0">This one setting changes</span>
                  <span className="line-b absolute inset-x-0 opacity-0">everything about the look</span>
                </div>
              )}
            </PhoneFrame>
          </div>
          <figcaption className="mt-5">
            <p className="font-display text-xl font-bold">{s.name}</p>
            <p className="mt-1 text-sm text-fg-muted">{s.note}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
