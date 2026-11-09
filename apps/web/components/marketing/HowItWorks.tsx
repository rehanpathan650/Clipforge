"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { STEPS } from "@/lib/content/steps";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** The 4-step flow with a scroll-driven progress rail. `detailed` adds bullet lists (used on /how-it-works). */
export function StepRail({ detailed = false }: { detailed?: boolean }) {
  const root = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".rail-fill",
          { scaleY: 0 },
          { scaleY: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top 65%", end: "bottom 70%", scrub: true } },
        );
        gsap.utils.toArray<HTMLElement>(".step").forEach((el) => {
          const dot = el.querySelector(".dot");
          ScrollTrigger.create({
            trigger: el,
            start: "top 65%",
            onEnter: () => gsap.to(dot, { backgroundColor: "#FFD60A", color: "#07080F", borderColor: "#FFD60A", duration: 0.25 }),
            onLeaveBack: () => gsap.to(dot, { backgroundColor: "#161A2E", color: "#F5F6FB", borderColor: "rgba(255,255,255,0.15)", duration: 0.25 }),
          });
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".rail-fill", { scaleY: 1 });
        gsap.set(".dot", { backgroundColor: "#FFD60A", color: "#07080F", borderColor: "#FFD60A" });
      });
    },
    { scope: root },
  );

  return (
    <ol ref={root} className="relative space-y-14 pl-14">
      <span className="absolute bottom-2 left-[1.05rem] top-2 w-[3px] rounded-full bg-white/10" aria-hidden="true" />
      <span className="rail-fill absolute bottom-2 left-[1.05rem] top-2 w-[3px] origin-top rounded-full bg-caption" aria-hidden="true" />
      {STEPS.map((s, i) => (
        <li key={s.title} className="step relative">
          <span className="dot absolute -left-14 top-0 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-surface-2 font-mono text-sm text-fg">
            {i + 1}
          </span>
          <h3 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{s.title}</h3>
          <p className="mt-2 max-w-lg text-lg leading-relaxed text-fg-muted">{s.body}</p>
          {detailed && (
            <ul className="mt-4 max-w-lg space-y-2 text-fg-muted">
              {s.detail.map((d) => (
                <li key={d} className="flex gap-3">
                  <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-caption" aria-hidden="true" />
                  {d}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}
