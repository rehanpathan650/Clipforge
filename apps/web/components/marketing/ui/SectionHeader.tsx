import { cx } from "./cx";

interface Props {
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2";
}

export function SectionHeader({ id, eyebrow, title, sub, align = "center", as: H = "h2" }: Props) {
  return (
    <header className={cx("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && (
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-3 py-1 font-mono text-xs text-caption">
          <span className="h-1.5 w-1.5 rounded-full bg-caption" aria-hidden="true" />
          {eyebrow}
        </p>
      )}
      <H id={id} className="font-display text-4xl font-extrabold leading-[1.04] tracking-[-0.03em] text-fg sm:text-5xl lg:text-[3.5rem]">
        {title}
      </H>
      {sub && <p className="mt-5 text-lg leading-relaxed text-fg-muted">{sub}</p>}
    </header>
  );
}

/** Highlight a key phrase in the accent colour. */
export function Hl({ children }: { children: React.ReactNode }) {
  return <span className="text-caption">{children}</span>;
}
