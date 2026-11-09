import { cx } from "./cx";

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "yellow" | "blue"; children: React.ReactNode }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs",
        tone === "neutral" && "border-white/15 text-fg-muted",
        tone === "yellow" && "border-caption/40 bg-caption/10 text-caption",
        tone === "blue" && "border-cobalt/50 bg-cobalt/20 text-[#aab3ff]",
      )}
    >
      {children}
    </span>
  );
}
