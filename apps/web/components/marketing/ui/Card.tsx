import { cx } from "./cx";

export function Card({
  className,
  raised,
  interactive,
  children,
}: {
  className?: string;
  raised?: boolean;
  interactive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        "rounded-card border border-white/10 p-6 shadow-card",
        raised ? "bg-surface-2" : "bg-surface",
        interactive && "transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-white/25",
        className,
      )}
    >
      {children}
    </div>
  );
}
