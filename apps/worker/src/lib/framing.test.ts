import assert from "node:assert/strict";
import { test } from "node:test";
import { cropGeometry, cropXExpr, smoothPath, type FaceSample } from "./framing";

/** Evaluate the ffmpeg expression in JS to prove the interpolation is right. */
function evalExpr(expr: string, t: number) {
  const js = expr.replace(/gte\(t,([\d.]+)\)/g, "((t)>=$1?1:0)").replace(/lt\(t,([\d.]+)\)/g, "((t)<$1?1:0)");
  return new Function("t", `return ${js}`)(t) as number;
}

test("crop geometry gives an even 9:16 window", () => {
  const land = cropGeometry(1920, 1080);
  assert.equal(land.ch, 1080);
  assert.equal(land.cw % 2, 0);
  assert.ok(Math.abs(land.cw / land.ch - 9 / 16) < 0.005);
  const portrait = cropGeometry(1080, 1920);
  assert.deepEqual([portrait.cw, portrait.ch, portrait.x0, portrait.y0], [1080, 1920, 0, 0]);
  const square = cropGeometry(1000, 1000);
  assert.deepEqual([square.cw, square.ch], [562, 1000]);
});

test("sparse detections fall back to centre crop", () => {
  assert.equal(smoothPath([{ t: 1, cx: 0.5 }], 30, 0.32), null);
});

const steady = (cx: number, seconds: number): FaceSample[] =>
  Array.from({ length: seconds * 5 }, (_, i) => ({ t: i / 5, cx }));

test("a steady speaker produces a constant crop", () => {
  const kf = smoothPath(steady(0.5, 20), 20, 0.32)!;
  assert.ok(kf);
  const expr = cropXExpr(kf, 1920, 606);
  assert.equal(expr, String(Math.round(0.5 * 1920 - 303)));
});

test("a moving speaker pans smoothly and never leaves the frame", () => {
  const samples = [...steady(0.3, 10), ...steady(0.7, 10).map((s) => ({ ...s, t: s.t + 10 }))];
  const kf = smoothPath(samples, 20, 0.32)!;
  const expr = cropXExpr(kf, 1920, 606);
  for (let t = 0; t <= 20; t += 0.25) {
    const x = evalExpr(expr, t);
    assert.ok(x >= 0 && x <= 1920 - 606, `x=${x} at t=${t}`);
  }
  assert.ok(evalExpr(expr, 19.9) > evalExpr(expr, 0.1) + 200, "camera should have panned right");
  // speed limit: never jumps more than ~0.1 of the frame per half second
  for (let t = 0; t < 19.5; t += 0.5) {
    assert.ok(Math.abs(evalExpr(expr, t + 0.5) - evalExpr(expr, t)) <= 0.11 * 1920 + 1);
  }
});

test("gaps in detection hold the last known position", () => {
  const samples = [...steady(0.4, 5), ...steady(0.4, 5).map((s) => ({ ...s, t: s.t + 15 }))];
  const kf = smoothPath(samples, 20, 0.32)!;
  assert.ok(kf.every((k) => Math.abs(k.cx - 0.4) < 0.01));
});
