import { Router } from "express";
import { z } from "zod";
import {
  PACKS,
  checkCheckoutSignature,
  checkWebhookSignature,
  createCheckoutOrder,
  fetchRazorpayPayment,
  fulfillPayment,
  getPack,
  logger,
  paymentsConfigured,
  prisma,
} from "@clipforge/core";
import { HttpError, parse, requireUser } from "../middleware";

export const billingRouter = Router();

// Public: the landing page shows pricing before sign-up.
billingRouter.get("/packs", (_req, res) => {
  res.json(PACKS.map((p) => ({ ...p, currency: "INR", minutes: p.credits })));
});

billingRouter.use(requireUser);

billingRouter.get("/balance", async (req, res) => {
  const [user, ledger] = await Promise.all([
    prisma.user.findUnique({ where: { id: req.userId }, select: { credits: true } }),
    prisma.creditEntry.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, delta: true, reason: true, note: true, projectId: true, createdAt: true },
    }),
  ]);
  res.json({ credits: user?.credits ?? 0, ledger, paymentsEnabled: paymentsConfigured() });
});

billingRouter.post("/orders", async (req, res) => {
  if (!paymentsConfigured()) throw new HttpError(503, "Payments aren't set up on this server yet.");
  const { packId } = parse(z.object({ packId: z.string() }), req.body);
  if (!getPack(packId)) throw new HttpError(400, "Choose a valid credit pack");
  const order = await createCheckoutOrder(req.userId, packId);
  res.status(201).json({
    orderId: order.orderId,
    amount: order.amount,
    currency: order.currency,
    keyId: order.keyId,
    packName: order.pack.name,
    credits: order.pack.credits,
  });
});

const verifySchema = z.object({ orderId: z.string(), paymentId: z.string(), signature: z.string() });

/** Browser callback after Checkout. The webhook is the safety net if this call never arrives. */
billingRouter.post("/verify", async (req, res) => {
  const body = parse(verifySchema, req.body);
  const row = await prisma.payment.findFirst({ where: { orderId: body.orderId, userId: req.userId } });
  if (!row) throw new HttpError(404, "Order not found");
  if (!checkCheckoutSignature(body.orderId, body.paymentId, body.signature)) {
    throw new HttpError(400, "We couldn't verify this payment.");
  }
  // Never trust the client alone: confirm with Razorpay that the money was actually captured.
  const payment = await fetchRazorpayPayment(body.paymentId);
  if (payment.order_id !== body.orderId) throw new HttpError(400, "Payment doesn't match this order.");
  if (payment.status !== "captured") {
    res.status(202).json({ status: "pending" }); // credits arrive via webhook once captured
    return;
  }
  const result = await fulfillPayment({ orderId: body.orderId, paymentId: payment.id, amount: payment.amount });
  const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { credits: true } });
  res.json({ status: result.status, credits: user?.credits ?? 0 });
});

interface RazorpayWebhook {
  event: string;
  payload?: { payment?: { entity?: { id: string; order_id: string | null; amount: number; status: string } } };
}

/** Mounted separately in app.ts with a raw body parser, because the signature covers the exact bytes. */
export async function razorpayWebhook(
  req: import("express").Request,
  res: import("express").Response,
) {
  const signature = req.get("x-razorpay-signature") ?? "";
  const raw = req.body as Buffer;
  if (!Buffer.isBuffer(raw) || !signature || !checkWebhookSignature(raw, signature)) {
    res.status(400).json({ error: { message: "Invalid signature" } });
    return;
  }
  let event: RazorpayWebhook;
  try {
    event = JSON.parse(raw.toString("utf8"));
  } catch {
    res.status(400).json({ error: { message: "Invalid payload" } });
    return;
  }

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const p = event.payload?.payment?.entity;
    if (p?.order_id && p.status === "captured") {
      try {
        const result = await fulfillPayment({ orderId: p.order_id, paymentId: p.id, amount: p.amount });
        logger.info({ orderId: p.order_id, result: result.status }, "razorpay webhook processed");
      } catch (err) {
        // 5xx makes Razorpay retry, which is what we want for transient database errors.
        logger.error({ err, orderId: p.order_id }, "webhook fulfilment failed");
        res.status(500).json({ error: { message: "Could not process event" } });
        return;
      }
    }
  }
  res.json({ ok: true });
}
