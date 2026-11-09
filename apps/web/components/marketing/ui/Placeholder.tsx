import { cx } from "./cx";

/**
 * PLACEHOLDER: marks a slot that needs real content (social proof, real clips, etc.).
 * Every usage is listed in the hand-off summary. Search the codebase for <Placeholder to find them all.
 */
export function Placeholder({
  label,
  hint,
  className,
  ratio,
}: {
  label: string;
  hint: string;
  className?: string;
  ratio?: "video" | "phone" | "wide";
}) {
  return (
    <div
      data-placeholder={label}
      className={cx(
        "grid place-items-center rounded-card border border-dashed border-caption/40 bg-caption/[0.04] p-6 text-center",
        ratio === "video" && "aspect-video",
        ratio === "phone" && "aspect-[9/16]",
        ratio === "wide" && "min-h-28",
        className,
      )}
    >
      <div>
        <p className="font-mono text-xs text-caption">Placeholder</p>
        <p className="mt-1 font-display text-lg font-bold">{label}</p>
        <p className="mx-auto mt-1 max-w-xs text-sm text-fg-muted">{hint}</p>
      </div>
    </div>
  );
}
