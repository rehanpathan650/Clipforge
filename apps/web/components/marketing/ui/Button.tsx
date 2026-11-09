import Link from "next/link";
import { cx } from "./cx";

type Variant = "primary" | "secondary" | "ghost" | "blue";
type Size = "md" | "lg" | "sm";

export const buttonClass = (variant: Variant = "primary", size: Size = "md", className?: string) =>
  cx(
    "inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold transition-[transform,background-color,box-shadow,border-color] duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50",
    size === "sm" && "px-4 py-2 text-sm",
    size === "md" && "px-6 py-3 text-[0.95rem]",
    size === "lg" && "px-8 py-4 text-base",
    variant === "primary" && "bg-caption text-ink hover:bg-[#ffe45c] hover:shadow-glow-yellow",
    variant === "secondary" && "border border-white/15 bg-white/5 text-fg hover:border-white/30 hover:bg-white/10",
    variant === "ghost" && "text-fg-muted hover:text-fg",
    variant === "blue" && "bg-cobalt text-white hover:bg-[#3a4dff]",
    className,
  );

type LinkProps = { href: string; variant?: Variant; size?: Size; className?: string; children: React.ReactNode };

export function ButtonLink({ href, variant, size, className, children }: LinkProps) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}

export function Button({
  variant,
  size,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button {...props} className={buttonClass(variant, size, className)} />;
}
