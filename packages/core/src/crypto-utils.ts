import { createHmac, timingSafeEqual } from "node:crypto";

export const hmacSha256Hex = (secret: string, data: string | Buffer) =>
  createHmac("sha256", secret).update(data).digest("hex");

export function safeEqualHex(a: string, b: string) {
  const A = Buffer.from(a, "utf8");
  const B = Buffer.from(b, "utf8");
  return A.length === B.length && timingSafeEqual(A, B);
}

/** Razorpay Checkout success callback: HMAC_SHA256(order_id|payment_id, key_secret). */
export const verifyCheckoutSignature = (keySecret: string, orderId: string, paymentId: string, signature: string) =>
  safeEqualHex(hmacSha256Hex(keySecret, `${orderId}|${paymentId}`), signature);

/** Razorpay webhook: HMAC_SHA256(raw request body, webhook_secret). Must use the *raw* bytes. */
export const verifyWebhookSignature = (secret: string, rawBody: Buffer | string, signature: string) =>
  safeEqualHex(hmacSha256Hex(secret, rawBody), signature);
