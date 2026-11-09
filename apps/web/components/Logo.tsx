import Link from "next/link";

export function Logo({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="ClipForge home">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-caption">
        <span className="h-4 w-[3px] rotate-[18deg] rounded-full bg-navy" />
      </span>
      <span className={`font-display text-xl font-bold tracking-tight ${tone === "light" ? "text-white" : "text-navy"}`}>
        ClipForge
      </span>
    </Link>
  );
}
