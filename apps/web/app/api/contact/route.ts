import { NextResponse } from "next/server";

/** Stub: validates input and acknowledges. Wire to email/helpdesk (Resend, Postmark, Zendesk...) before launch. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof body.website === "string" && body.website) return NextResponse.json({ ok: true }); // honeypot: pretend success

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();
  const errors: Record<string, string> = {};
  if (name.length < 1 || name.length > 100) errors.name = "Enter your name.";
  if (!EMAIL.test(email) || email.length > 200) errors.email = "Enter a valid email address.";
  if (message.length < 10 || message.length > 5000) errors.message = "Write at least 10 characters (max 5000).";
  if (Object.keys(errors).length) return NextResponse.json({ error: "Please check the form.", errors }, { status: 422 });

  // TODO: deliver the message (email / helpdesk). Intentionally not logged to avoid storing personal data.
  return NextResponse.json({ ok: true });
}
