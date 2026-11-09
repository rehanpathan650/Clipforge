"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * One GSAP + ScrollTrigger controller for the whole marketing layout (replaces per-page effects):
 *  - [data-reveal]  : fade/slide in once, only for elements that start below the fold (no flash, no layout shift)
 *  - [data-count]   : number counter, text already holds the final value for SSR / reduced motion
 * Skipped entirely when the visitor prefers reduced motion.
 */
export function ScrollEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const vh = window.innerHeight;
      const els = gsap.utils.toArray<HTMLElement>("[data-reveal]").filter((el) => el.getBoundingClientRect().top > vh * 0.92);
      els.forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 24,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const end = Number(el.dataset.count);
        if (!Number.isFinite(end)) return;
        const fmt = new Intl.NumberFormat("en-IN");
        const obj = { v: 0 };
        el.textContent = "0";
        gsap.to(obj, {
          v: end,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
          onUpdate: () => {
            el.textContent = fmt.format(Math.round(obj.v));
          },
          onComplete: () => {
            el.textContent = fmt.format(end);
          },
        });
      });
      ScrollTrigger.refresh();
    });
    return () => mm.revert();
  }, [pathname]);

  return null;
}
