// The film's recurring identity mark. The original radial flower was tied to the
// prior character; this edition draws a sixfold interlaced knot to echo both
// ChatGPT's visual language and the white dragon's knot-rose hair ornament.
// Keep the same public API and twelve reference points so all match cuts,
// timings, click bursts and geometrical transitions remain deterministic.
import { clamp } from '../engine/util.js';

const TAU = Math.PI * 2;
/** Petal lengths: slightly uneven, like something cut by hand. */
const LEN = [1, 0.8, 0.94, 0.74, 0.98, 0.82, 0.9, 0.76, 1, 0.8, 0.95, 0.78];
export const RAYS = 12;

/**
 * Six interleaving curved ribbons / stylised knot mark.
 * lit lights its ribbons in sequence, preserving all old progress cues.
 * Unlit ribbons are quiet grey; all geometry depends only on the arguments.
 */
export function spark(ctx, cx, cy, r, { rays = RAYS, rot = 0, color = 'me', off = 'mute', alpha = 1, lit = 1, grow = 1, fat = 0.105, inner = 0.17, pulse = null, core = 0.1, offAlpha = 0.35 } = {}) {
  if (alpha <= 0.003 || r <= 0) return;
  const g = ctx.g, loops = Math.max(3, Math.round(rays / 2)), nLit = lit * loops;
  const band = Math.max(0.75, fat / 0.105);
  for (let i = 0; i < loops; i++) {
    const on = clamp(nLit - i);
    const len = r * grow * (pulse ? pulse(i) : 1);
    if (len < r * inner) continue;
    for (const pass of [0, 1]) {
      const k = pass ? on : 1 - on;
      if (k <= 0.001) continue;
      g.save();
      g.translate(cx, cy);
      g.rotate(rot + i / loops * TAU - Math.PI / 2);
      g.scale(len, len);
      g.beginPath();
      g.moveTo(0.19, -0.29);
      g.bezierCurveTo(0.33, -0.76, 0.74, -0.99, 0.94, -0.73);
      g.bezierCurveTo(1.17, -0.44, 0.91, -0.07, 0.61, 0.23);
      g.lineTo(0.61 - 0.13 * band, 0.23 - 0.18 * band);
      g.bezierCurveTo(0.72, -0.13, 0.85, -0.42, 0.71, -0.52);
      g.bezierCurveTo(0.59, -0.67, 0.38, -0.42, 0.35, -0.14);
      g.closePath();
      g.fillStyle = ctx.col(pass ? color : off, alpha * k * (pass ? 1 : offAlpha));
      g.fill();
      g.restore();
    }
  }
  if (core > 0) {
    // Deliberately keep the hexagonal centre open instead of printing the old solid hub.
    const a = Math.min(1, Math.max(0.12, lit));
    g.save(); g.beginPath();
    for (let i = 0; i <= 6; i++) {
      const th = rot + i * TAU / 6, rr = r * grow * (inner + core * 0.62);
      const x = cx + Math.cos(th) * rr, y = cy + Math.sin(th) * rr;
      if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.lineWidth = Math.max(1, r * 0.035 * grow);
    g.strokeStyle = ctx.col(lit > 0 ? color : off, alpha * a);
    g.stroke(); g.restore();
  }
}

/** The spark while the AI is thinking: a wave runs round the petals and the whole thing turns slowly. */
export function thinking(ctx, cx, cy, r, t, { color = 'me', alpha = 1, speed = 1, stuck = 0 } = {}) {
  // stuck 0..1: the wave stalls and stutters (a thought that will not finish), from 12 steps a second down to 3
  const q = 12 - 9 * clamp(stuck), tt = stuck > 0 ? Math.floor(t * q) / q : t;
  spark(ctx, cx, cy, r, { color, alpha, rot: tt * 0.5 * speed, pulse: (i) => 0.66 + 0.34 * Math.sin(tt * 7 * speed - i * 0.62) });
}

/** Tips of the petals, for match cuts (points that gather into the burst, rays that become lines). */
export function sparkTips(cx, cy, r, rot = 0, rays = RAYS) {
  return Array.from({ length: rays }, (_, i) => { const a = rot + (i / rays) * TAU - Math.PI / 2; return [cx + Math.cos(a) * r * LEN[i % 12], cy + Math.sin(a) * r * LEN[i % 12]]; });
}

/** Closed outline of the burst with n points (same convention as shapes.js: starts at 12 o'clock, clockwise). */
export function sparkOutline(cx, cy, r, { rot = 0, n = 180, rays = RAYS, inner = 0.34 } = {}) {
  const out = [];
  for (let k = 0; k < n; k++) {
    const u = (k / n) * rays, i = Math.floor(u), f = u - i;                 // within petal i: tip at f = 0, valley at f = 0.5
    // (the last petal runs back into petal 0, so the outline closes for any number of rays)
    const rr = r * (inner + (LEN[i % 12] * (1 - f) + LEN[((i + 1) % rays) % 12] * f - inner) * Math.pow(Math.abs(Math.cos(f * Math.PI)), 1.6));
    const a = rot + (k / n) * TAU - Math.PI / 2;
    out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return out;
}

/** A click, a hit, a notification: petals fly outwards and thin out. k = 0..1 age of the burst. */
export function burst(ctx, cx, cy, r, k, { color = 'text', rays = RAYS, alpha = 1, rot = 0 } = {}) {
  if (k <= 0 || k >= 1) return;
  const e = 1 - Math.pow(1 - k, 3);
  for (let i = 0; i < rays; i++) {
    const a = rot + (i / rays) * TAU, c = Math.cos(a), s = Math.sin(a), r0 = r * (0.35 + 0.65 * e), r1 = r0 + r * 0.42 * (1 - k) * LEN[i % 12];
    ctx.line(cx + c * r0, cy + s * r0, cx + c * r1, cy + s * r1, { color, alpha: alpha * (1 - k), width: Math.max(1.5, r * 0.07 * (1 - k)) });
  }
}
