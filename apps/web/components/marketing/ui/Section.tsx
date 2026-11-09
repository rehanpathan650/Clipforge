import { Container } from "./Container";
import { cx } from "./cx";

interface Props {
  id?: string;
  tone?: "base" | "raised";
  glow?: boolean;
  className?: string;
  children: React.ReactNode;
  "aria-labelledby"?: string;
}

/** Standard vertical rhythm for every marketing section. */
export function Section({ id, tone = "base", glow, className, children, ...rest }: Props) {
  return (
    <section
      id={id}
      aria-labelledby={rest["aria-labelledby"]}
      className={cx("relative scroll-mt-20 overflow-hidden", tone === "raised" && "border-y border-white/10 bg-surface", className)}
    >
      {glow && <div aria-hidden="true" className="mk-glow pointer-events-none absolute inset-x-0 top-0 h-[28rem] opacity-60" />}
      <Container className="relative py-section lg:py-section-lg">{children}</Container>
    </section>
  );
}
