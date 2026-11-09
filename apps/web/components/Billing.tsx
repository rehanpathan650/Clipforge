"use client";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { api, errorMessage } from "@/lib/api";
import { rupees, timeAgo } from "@/lib/format";
import type { LedgerEntry, Pack } from "@/lib/types";

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
interface RazorpayInstance {
  open(): void;
  on(event: string, cb: (r: { error?: { description?: string } }) => void): void;
}
declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => RazorpayInstance;
  }
}

function loadCheckout() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const REASON: Record<LedgerEntry["reason"], string> = {
  PURCHASE: "Bought credits",
  USAGE: "Processed a video",
  REFUND: "Refund",
  BONUS: "Welcome credits",
};

interface Balance {
  credits: number;
  ledger: LedgerEntry[];
  paymentsEnabled: boolean;
}

export function Billing() {
  const { user, refresh } = useAuth();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [buying, setBuying] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    const [p, b] = await Promise.all([api.get<Pack[]>("/api/billing/packs"), api.get<Balance>("/api/billing/balance")]);
    setPacks(p);
    setBalance(b);
  }, []);

  useEffect(() => {
    load().catch((e) => setNotice({ tone: "error", text: errorMessage(e) }));
  }, [load]);

  async function settle(tries = 0) {
    // After a "pending" verification the webhook credits the account; poll briefly for it.
    await Promise.all([load(), refresh()]);
    if (tries < 6) setTimeout(() => void settle(tries + 1), 4000);
  }

  async function buy(pack: Pack) {
    setBuying(pack.id);
    setNotice(null);
    try {
      const order = await api.post<{ orderId: string; amount: number; currency: string; keyId: string; credits: number }>(
        "/api/billing/orders",
        { packId: pack.id },
      );
      if (!(await loadCheckout()) || !window.Razorpay) throw new Error("Couldn't load the payment window. Check your connection.");

      const rz = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "ClipForge",
        description: `${order.credits} credits`,
        prefill: { email: user?.email },
        theme: { color: "#2338FF" },
        modal: { ondismiss: () => setBuying(null) },
        handler: async (r: RazorpayResponse) => {
          try {
            const res = await api.post<{ status: string }>("/api/billing/verify", {
              orderId: r.razorpay_order_id,
              paymentId: r.razorpay_payment_id,
              signature: r.razorpay_signature,
            });
            if (res.status === "pending") {
              setNotice({ tone: "ok", text: "Payment received. Your credits will appear in a moment." });
              void settle();
            } else {
              setNotice({ tone: "ok", text: `${order.credits} credits added to your account.` });
              await Promise.all([load(), refresh()]);
            }
          } catch (e) {
            // The webhook will still credit a captured payment, so don't alarm the user needlessly.
            setNotice({ tone: "error", text: `${errorMessage(e)} If you were charged, your credits will arrive shortly.` });
            void settle();
          } finally {
            setBuying(null);
          }
        },
      });
      rz.on("payment.failed", (r) => {
        setNotice({ tone: "error", text: r.error?.description ?? "The payment didn't go through. You haven't been charged." });
        setBuying(null);
      });
      rz.open();
    } catch (e) {
      setNotice({ tone: "error", text: errorMessage(e) });
      setBuying(null);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <h1 className="font-display text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">Credits</h1>
      <p className="mt-3 max-w-xl text-lg text-navy/70">
        1 credit covers 1 minute of source video. If a video can&apos;t be processed, its credits come back automatically.
      </p>

      <div className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-3xl bg-navy p-6 text-white sm:p-8">
        <span className="font-mono text-5xl font-bold tabular-nums text-caption">{balance?.credits ?? user?.credits ?? 0}</span>
        <span className="text-lg text-white/75">credits available</span>
      </div>

      {notice && (
        <p
          role={notice.tone === "error" ? "alert" : "status"}
          className={`mt-5 rounded-xl px-4 py-3 text-sm font-medium ${notice.tone === "error" ? "bg-rec/10 text-rec" : "bg-cobalt/10 text-cobalt"}`}
        >
          {notice.text}
        </p>
      )}

      <section className="mt-12" aria-labelledby="packs-h">
        <h2 id="packs-h" className="font-display text-2xl font-bold tracking-tight">Buy a pack</h2>
        {balance && !balance.paymentsEnabled && (
          <p className="mt-3 rounded-xl bg-caption/30 px-4 py-3 text-sm font-medium">
            Payments aren&apos;t configured on this server yet. Add Razorpay keys to enable checkout.
          </p>
        )}
        <ul className="mt-4 divide-y divide-navy/15 border-y border-navy/15">
          {packs.map((p) => (
            <motion.li key={p.id} layout className="flex flex-wrap items-center gap-x-6 gap-y-3 py-5">
              <div className="min-w-[10rem] flex-1">
                <p className="font-display text-2xl font-bold">{p.name}</p>
                <p className="text-sm text-navy/60">{p.blurb}</p>
              </div>
              <p className="w-32 font-mono text-sm text-navy/70">{p.credits} credits</p>
              <p className="w-28 text-sm text-navy/60">{rupees(Math.round(p.amountPaise / (p.credits / 60)))} per hour</p>
              <p className="w-24 text-right font-display text-2xl font-bold">{rupees(p.amountPaise)}</p>
              <button onClick={() => void buy(p)} disabled={buying !== null || !balance?.paymentsEnabled} className="btn-blue w-28 py-2.5">
                {buying === p.id ? <Loader2 className="animate-spin" size={18} /> : "Buy"}
              </button>
            </motion.li>
          ))}
        </ul>
      </section>

      <section className="mt-12" aria-labelledby="history-h">
        <h2 id="history-h" className="font-display text-2xl font-bold tracking-tight">History</h2>
        {balance?.ledger.length === 0 && <p className="mt-3 text-navy/60">Nothing yet. Your purchases and usage will show up here.</p>}
        <ul className="mt-4 divide-y divide-navy/10">
          {balance?.ledger.map((l) => (
            <li key={l.id} className="flex items-center justify-between gap-4 py-3.5">
              <div>
                <p className="font-medium">{REASON[l.reason]}</p>
                <p className="text-sm text-navy/55">{l.note ? `${l.note} · ` : ""}{timeAgo(l.createdAt)}</p>
              </div>
              <p className={`font-mono text-lg font-bold tabular-nums ${l.delta > 0 ? "text-cobalt" : "text-navy"}`}>
                {l.delta > 0 ? "+" : ""}{l.delta}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
