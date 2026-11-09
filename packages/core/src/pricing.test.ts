import assert from "node:assert/strict";
import { test } from "node:test";
import { PACKS, creditsForDuration, getPack } from "./pricing";

test("credits are billed per started minute, minimum 1", () => {
  assert.equal(creditsForDuration(1), 1);
  assert.equal(creditsForDuration(60), 1);
  assert.equal(creditsForDuration(61), 2);
  assert.equal(creditsForDuration(3600), 60);
});

test("packs have unique ids and positive values", () => {
  assert.equal(new Set(PACKS.map((p) => p.id)).size, PACKS.length);
  for (const p of PACKS) assert.ok(p.credits > 0 && p.amountPaise > 0);
  assert.equal(getPack("nope"), undefined);
});
