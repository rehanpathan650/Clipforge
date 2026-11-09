import { cx } from "./ui/cx";

/** Dark-theme phone mockup used by the hero and the caption showcase. Decorative: parents hide it from assistive tech. */
export function PhoneFrame({
  tone = "from-[#3a4df0] to-[#07080F]",
  time,
  className,
  children,
}: {
  tone?: string;
  time?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        "relative aspect-[9/16] overflow-hidden rounded-[1.5rem] border border-white/20 bg-gradient-to-b shadow-[0_24px_60px_-20px_rgba(35,56,255,0.55)]",
        tone,
        className,
      )}
    >
      {time && <span className="absolute left-2.5 top-2.5 rounded-md bg-ink/70 px-1.5 py-0.5 font-mono text-[0.65rem] text-white">{time}</span>}
      <span className="absolute left-1/2 top-[26%] h-[22%] w-[30%] -translate-x-1/2 rounded-full bg-white/20" />
      <span className="absolute left-1/2 top-[46%] h-[34%] w-[68%] -translate-x-1/2 rounded-t-[50%] bg-white/15" />
      {children}
    </div>
  );
}
