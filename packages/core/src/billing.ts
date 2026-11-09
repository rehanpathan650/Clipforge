import { randomUUID } from "node:crypto";
import { verifyCheckoutSignature, verifyWebhookSignature } from "./crypto-utils";
import { prisma } from "./db";
import { env } from "./env";
import { getPack } from "./pricing";

const API = "https://api.razorpay.com/v1";

export const paymentsConfigured = () => Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);

function authHeader() {
  return "Basic " + Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64");
}

async function razorpay<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(API + path, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: authHeader(), ...(init?.headers ?? {}) },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Razorpay ${path} failed with ${res.status}`);
  return (await res.json()) as T;
}

export async function createCheckoutOrder(userId: string, packId: string) {
  const pack = getPack(packId);
  if (!pack) throw new Error("Unknown credit pack");
  const row = await prisma.payment.create({
    data: {
      userId,
      packId: pack.id,
      credits: pack.credits,
      amount: pack.amountPaise,
      currency: "INR",
      orderId: `pending_${randomUUID()}`,
    },
  });
  try {
    const order = await razorpay<{ id: string }>("/orders", {
      method: "POST",
      body: JSON.stringify({
        amount: pack.amountPaise,
        currency: "INR",
        receipt: row.id,
        notes: { userId, packId: pack.id, paymentRowId: row.id },
      }),
    });
    await prisma.payment.update({ where: { id: row.id }, data: { orderId: order.id } });
    return { orderId: order.id, amount: pack.amountPaise, currency: "INR", keyId: env.RAZORPAY_KEY_ID!, pack };
  } catch (err) {
    await prisma.payment.delete({ where: { id: row.id } }).catch(() => undefined);
    throw err;
  }
}

export const checkCheckoutSignature = (orderId: string, paymentId: string, signature: string) =>
  verifyCheckoutSignature(env.RAZORPAY_KEY_SECRET ?? "", orderId, paymentId, signature);

export const checkWebhookSignature = (raw: Buffer, signature: string) =>
  Boolean(env.RAZORPAY_WEBHOOK_SECRET) && verifyWebhookSignature(env.RAZORPAY_WEBHOOK_SECRET!, raw, signature);

export interface RazorpayPayment {
  id: string;
  order_id: string;
  amount: number;
  status: string;
}

/** Ask Razorpay directly, so we never trust a client callback alone. */
export const fetchRazorpayPayment = (paymentId: string) => razorpay<RazorpayPayment>(`/payments/${paymentId}`);

/**
 * Credits the user for a captured payment. Called from both the browser callback and the webhook;
 * whichever arrives first wins and the other is a harmless no-op.
 */
export async function fulfillPayment(input: { orderId: string; paymentId: string; amount: number }) {
  return prisma.$transaction(async (tx) => {
    const p = await tx.payment.findUnique({ where: { orderId: input.orderId } });
    if (!p) return { status: "unknown" as const };
    if (p.status === "PAID") return { status: "already" as const };
    if (p.amount !== input.amount) throw new Error(`Amount mismatch for order ${input.orderId}`);

    const claimed = await tx.payment.updateMany({
      where: { id: p.id, status: { not: "PAID" } },
      data: { status: "PAID", paymentId: input.paymentId, paidAt: new Date() },
    });
    if (claimed.count === 0) return { status: "already" as const };

    await tx.creditEntry.create({
      data: {
        userId: p.userId,
        delta: p.credits,
        reason: "PURCHASE",
        key: `purchase:${p.id}`,
        note: `${p.packId} pack`,
      },
    });
    await tx.user.update({ where: { id: p.userId }, data: { credits: { increment: p.credits } } });
    return { status: "fulfilled" as const, credits: p.credits };
  });
}
