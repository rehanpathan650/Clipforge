/** Pure geometry + camera-path maths for 9:16 reframing (no I/O, so it's unit-tested). */

export type FaceSample = { t: number; cx: number }; // t in seconds from clip start, cx = face centre as 0..1 of source width
export type Keyframe = { t: number; cx: number };

const even = (n: number) => Math.max(2, Math.floor(n / 2) * 2);

/** Largest 9:16 window that fits inside the source, centred. */
export function cropGeometry(srcW: number, srcH: number) {
  const target = 9 / 16;
  let cw: number;
  let ch: number;
  if (srcW / srcH > target) {
    ch = even(srcH);
    cw = even(srcH * target);
  } else {
    cw = even(srcW);
    ch = even(srcW / target);
  }
  return { cw, ch, x0: Math.floor((srcW - cw) / 2), y0: Math.floor((srcH - ch) / 2) };
}

const SAMPLE_RATE = 5; // detections per second produced by track.py
const STEP = 0.5; // seconds between camera keyframes

/**
 * Turns noisy per-frame face positions into a calm "virtual camera" path:
 * median per half-second, gaps held, then a dead-zone + speed limit so the frame
 * only moves when the speaker really leaves it. Returns null if a face was rarely
 * found (the caller then falls back to a centre crop).
 */
export function smoothPath(samples: FaceSample[], duration: number, cropFrac: number): Keyframe[] | null {
  if (duration <= 0) return null;
  if (samples.length < Math.max(3, duration * SAMPLE_RATE * 0.25)) return null;

  const sorted = [...samples].sort((a, b) => a.t - b.t);
  const n = Math.ceil(duration / STEP);
  const raw: number[] = [];
  for (let i = 0; i <= n; i++) {
    const g = Math.min(duration, i * STEP);
    const near = sorted
      .filter((s) => Math.abs(s.t - g) <= STEP)
      .map((s) => s.cx)
      .sort((a, b) => a - b);
    raw.push(near.length ? near[Math.floor(near.length / 2)]! : NaN);
  }
  let last = NaN;
  for (let i = 0; i < raw.length; i++) {
    if (!Number.isNaN(raw[i]!)) last = raw[i]!;
    else if (!Number.isNaN(last)) raw[i] = last;
  }
  let next = NaN;
  for (let i = raw.length - 1; i >= 0; i--) {
    if (!Number.isNaN(raw[i]!)) next = raw[i]!;
    else if (!Number.isNaN(next)) raw[i] = next;
  }

  const dead = cropFrac * 0.15;
  const maxStep = 0.1;
  let c = raw[0]!;
  return raw.map((target, i) => {
    const d = target - c;
    if (Math.abs(d) > dead) c += Math.sign(d) * Math.min(Math.abs(d) - dead * 0.5, maxStep);
    return { t: Math.min(duration, i * STEP), cx: c };
  });
}

/**
 * ffmpeg `crop` x expression: piecewise-linear interpolation between keyframes using t.
 * Each segment is gated with gte/lt so exactly one term is non-zero at any time.
 */
export function cropXExpr(keyframes: Keyframe[], srcW: number, cropW: number): string {
  const xs = keyframes.map((k) => Math.round(Math.min(srcW - cropW, Math.max(0, k.cx * srcW - cropW / 2))));
  if (xs.every((x) => x === xs[0])) return String(xs[0]);

  const f = (n: number) => n.toFixed(2);
  const terms: string[] = [];
  for (let i = 0; i < keyframes.length - 1; i++) {
    const t0 = keyframes[i]!.t;
    const t1 = keyframes[i + 1]!.t;
    if (t1 <= t0) continue;
    const x0 = xs[i]!;
    const x1 = xs[i + 1]!;
    const gate = `gte(t,${f(t0)})*lt(t,${f(t1)})`;
    terms.push(x0 === x1 ? `${gate}*${x0}` : `${gate}*(${x0}+(${x1 - x0})*(t-${f(t0)})/${f(t1 - t0)})`);
  }
  terms.push(`gte(t,${f(keyframes[keyframes.length - 1]!.t)})*${xs[xs.length - 1]}`);
  return terms.join("+");
}
