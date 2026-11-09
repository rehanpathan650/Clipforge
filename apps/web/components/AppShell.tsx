"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/components/AuthProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, router, pathname]);

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center" aria-busy="true">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cobalt/20 border-t-cobalt" />
      </div>
    );
  }

  const link = (href: string, label: string) => (
    <Link
      href={href}
      aria-current={pathname.startsWith(href) ? "page" : undefined}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        pathname.startsWith(href) ? "bg-navy text-white" : "text-navy/70 hover:bg-navy/5 hover:text-navy"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-mist-line bg-mist/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3 sm:px-8">
          <Logo tone="dark" />
          <nav className="ml-2 hidden items-center gap-1 sm:flex">
            {link("/dashboard", "Projects")}
            {link("/billing", "Credits")}
          </nav>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link
              href="/billing"
              className="rounded-full bg-caption px-4 py-2 font-mono text-sm font-bold text-navy hover:bg-[#ffe45c]"
              aria-label={`${user.credits} credits. Open billing`}
            >
              {user.credits} credits
            </Link>
            <span className="hidden max-w-[12rem] truncate text-sm text-navy/60 md:block">{user.email}</span>
            <button
              onClick={() => void logout()}
              className="rounded-full p-2.5 text-navy/60 hover:bg-navy/5 hover:text-navy"
              aria-label="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
