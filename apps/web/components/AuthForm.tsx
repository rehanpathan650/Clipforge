"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { api, errorMessage } from "@/lib/api";

const safeNext = (n: string | null) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/dashboard");

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signup = mode === "signup";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post(`/api/auth/${mode}`, signup ? { email, password, name: name || undefined } : { email, password });
      router.replace(next);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-cobalt p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Logo />
        <div>
          <p className="font-display text-6xl font-extrabold leading-[0.95] tracking-[-0.04em]">
            Your next ten shorts are hiding in that long video.
          </p>
          <p className="mt-6 max-w-md text-lg text-white/80">
            Upload it, and ClipForge returns vertical clips with captions already burned in.
          </p>
        </div>
        <p className="text-sm text-white/60">Only upload videos you own or have permission to use.</p>
      </aside>

      <main className="flex items-center justify-center px-5 py-12">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden">
            <Logo tone="dark" />
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-[-0.03em]">
            {signup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-navy/65">
            {signup ? "Already have an account? " : "New to ClipForge? "}
            <Link
              href={`${signup ? "/login" : "/signup"}?next=${encodeURIComponent(next)}`}
              className="font-semibold text-cobalt underline underline-offset-4"
            >
              {signup ? "Log in" : "Create an account"}
            </Link>
          </p>

          <div className="mt-8 space-y-4">
            {signup && (
              <div>
                <label htmlFor="name" className="text-sm font-semibold">
                  Name <span className="font-normal text-navy/50">(optional)</span>
                </label>
                <input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="field mt-1.5" />
              </div>
            )}
            <div>
              <label htmlFor="email" className="text-sm font-semibold">Email</label>
              <input
                id="email" type="email" required autoComplete="email" value={email}
                onChange={(e) => setEmail(e.target.value)} className="field mt-1.5"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-semibold">Password</label>
              <input
                id="password" type="password" required minLength={signup ? 10 : 1}
                autoComplete={signup ? "new-password" : "current-password"} value={password}
                onChange={(e) => setPassword(e.target.value)} className="field mt-1.5"
              />
              {signup && <p className="mt-1.5 text-sm text-navy/55">Use at least 10 characters.</p>}
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-5 rounded-xl bg-rec/10 px-4 py-3 text-sm font-medium text-rec">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn-blue mt-6 w-full">
            {busy && <Loader2 className="animate-spin" size={18} />}
            {signup ? "Create account" : "Log in"}
          </button>
        </motion.form>
      </main>
    </div>
  );
}
