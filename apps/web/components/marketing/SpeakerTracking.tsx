"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/** Landscape frame with a 9:16 crop window that glides after the speaker's face. */
export function SpeakerTrackingVisual() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut", duration: 2.4 } });
        // face and crop move together, with the crop slightly lagging (smoothed camera)
        tl.to(".face", { left: "70%" }, 0).to(".crop", { left: "58%", duration: 2.8 }, 0).to(".face", { left: "30%" }, 2.6).to(".crop", { left: "18%", duration: 3 }, 2.6);
      });
    },
    { scope: root },
  );
  return (
    <div ref={root} role="img" aria-label="A vertical crop window following a speaker across a landscape frame" className="rounded-card border border-white/10 bg-surface p-4 sm:p-6">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-[#161a2e] to-[#0b1033]">
        <div className="crop absolute inset-y-0 left-[38%] w-[31.6%] rounded-lg border-2 border-caption bg-caption/10 shadow-[0_0_0_999px_rgba(7,8,15,0.55)]">
          <span className="absolute left-2 top-2 rounded bg-caption px-1.5 py-0.5 font-mono text-[0.65rem] font-bold text-ink">9:16</span>
        </div>
        <div className="face absolute left-[50%] top-[22%] w-[9%] -translate-x-1/2">
          <span className="block aspect-square rounded-full bg-white/80" />
          <span className="mx-auto mt-1 block h-[7rem] w-[190%] -translate-x-[22%] rounded-t-[50%] bg-white/35 sm:h-[9rem]" />
        </div>
        <span className="absolute bottom-3 right-3 font-mono text-xs text-fg-subtle">16:9 source</span>
      </div>
    </div>
  );
}
