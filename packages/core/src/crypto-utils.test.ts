import assert from "node:assert/strict";
import { test } from "node:test";
import { hmacSha256Hex, verifyCheckoutSignature, verifyWebhookSignature } from "./crypto-utils";

test("checkout signature accepts the correct HMAC and rejects tampering", () => {
  const sig = hmacSha256Hex("secret", "order_1|pay_1");
  assert.equal(verifyCheckoutSignature("secret", "order_1", "pay_1", sig), true);
  assert.equal(verifyCheckoutSignature("secret", "order_1", "pay_2", sig), false);
  assert.equal(verifyCheckoutSignature("other", "order_1", "pay_1", sig), false);
  assert.equal(verifyCheckoutSignature("secret", "order_1", "pay_1", "short"), false);
});

test("webhook signature is computed over the raw body", () => {
  const body = Buffer.from('{"event":"payment.captured"}');
  const sig = hmacSha256Hex("whsec", body);
  assert.equal(verifyWebhookSignature("whsec", body, sig), true);
  assert.equal(verifyWebhookSignature("whsec", Buffer.from('{"event":"payment.captured" }'), sig), false);
});
