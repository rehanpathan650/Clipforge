"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/Button";

type Errors = Partial<Record<"name" | "email" | "message", string>>;

export function ContactForm() {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setState("busy");
    setErrors({});
    setFormError(null);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = (await res.json()) as { error?: string; errors?: Errors };
      if (!res.ok) {
        setErrors(json.errors ?? {});
        setFormError(json.error ?? "Something went wrong. Please try again.");
        setState("idle");
        return;
      }
      setState("done");
    } catch {
      setFormError("Can't reach the server. Check your connection and try again.");
      setState("idle");
    }
  }

  if (state === "done")
    return (
      <div role="status" className="rounded-card border border-caption/40 bg-caption/[0.06] p-8">
        <p className="font-display text-2xl font-bold">Message received</p>
        <p className="mt-2 text-fg-muted">Thanks. We'll reply to the email you gave us.</p>
      </div>
    );

  const field = (id: keyof Errors) => ({ "aria-invalid": errors[id] ? true : undefined, "aria-describedby": errors[id] ? `${id}-err` : undefined });
  const Err = ({ id }: { id: keyof Errors }) => (errors[id] ? <p id={`${id}-err`} className="mt-1.5 text-sm text-[#ff8f8b]">{errors[id]}</p> : null);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5 rounded-card border border-white/10 bg-surface p-6 sm:p-8">
      <div>
        <label htmlFor="c-name" className="text-sm font-semibold">Name</label>
        <input id="c-name" name="name" autoComplete="name" required className="mk-field mt-1.5" {...field("name")} />
        <Err id="name" />
      </div>
      <div>
        <label htmlFor="c-email" className="text-sm font-semibold">Email</label>
        <input id="c-email" name="email" type="email" autoComplete="email" required className="mk-field mt-1.5" {...field("email")} />
        <Err id="email" />
      </div>
      <div>
        <label htmlFor="c-message" className="text-sm font-semibold">How can we help?</label>
        <textarea id="c-message" name="message" rows={6} required className="mk-field mt-1.5 resize-y" {...field("message")} />
        <Err id="message" />
      </div>
      {/* honeypot: hidden from people, tempting to bots */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="c-website">Website</label>
        <input id="c-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {formError && (
        <p role="alert" className="rounded-xl bg-rec/15 px-4 py-3 text-sm font-medium text-[#ff8f8b]">
          {formError}
        </p>
      )}
      <Button type="submit" disabled={state === "busy"} size="lg" className="w-full sm:w-auto">
        {state === "busy" && <Loader2 className="animate-spin" size={18} aria-hidden="true" />}
        Send message
      </Button>
    </form>
  );
}
