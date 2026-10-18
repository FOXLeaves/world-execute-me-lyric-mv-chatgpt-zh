// V8 — cinematic interface finishing. A shared material vocabulary for the
// dialogue client, settings and refusal windows. Purely drawn: no DOM or CSS.
const clamp = (x) => Math.max(0, Math.min(1, x));

/** Light on the upper glass edge, a subdued lower reflection and one accent rail. */
export function glassFinish(ctx, r, { alpha = 1, accent = 'me', focus = 0, t = 0, inset = 1 } = {}) {
  if (!r || r.w < 6 || r.h < 6 || alpha <= 0.003) return;
  const a = clamp(alpha), x = r.x + inset, y = r.y + inset, w = r.w - 2 * inset, h = r.h - 2 * inset;
  ctx.clip({ x, y, w, h }, () => {
    ctx.gradRect(x, y, w, Math.min(h, 138), [[0, 'text', 0.07 * a], [0.15, 'text', 0.025 * a], [1, 'text', 0]], 'v');
    ctx.gradRect(x, y, Math.min(w * 0.4, 185), h, [[0, accent, 0.034 * a], [1, accent, 0]], 'h');
    ctx.gradRect(x, y + h - Math.min(70, h * 0.4), w, Math.min(70, h * 0.4),
      [[0, 'text', 0], [1, 'text', 0.02 * a]]);
  });
  ctx.line(x + 20, y + 1, x + w - 20, y + 1, { color: 'text', alpha: 0.20 * a, width: 1.1 });
  ctx.line(x + 20, y + h - 1, x + w - 20, y + h - 1, { color: 'line', alpha: 0.35 * a, width: 1 });
  if (focus > 0) {
    const f = clamp(focus), px = x + 28 + (w - 56) * (0.5 + 0.5 * Math.sin(t * 0.38));
    ctx.gradRect(x + 25, y + 2, w - 50, 2, [[0, accent, 0], [0.5, accent, 0.33 * f * a], [1, accent, 0]], 'h');
    ctx.circle(px, y + 3, 2.4, { fill: true, color: accent, alpha: 0.32 * f * a });
  }
}

/** Four tiny etched brackets. They belong to physical glass, not a selection box. */
export function cornerEtch(ctx, r, { alpha = 1, color = 'sub', len = 15, inset = 14, width = 1.2 } = {}) {
  if (!r || r.w < 40 || r.h < 40) return;
  const x = r.x + inset, y = r.y + inset, x2 = r.x + r.w - inset, y2 = r.y + r.h - inset;
  const o = { color, width, alpha: 0.36 * clamp(alpha) };
  for (const [cx, cy, sx, sy] of [[x, y, 1, 1], [x2, y, -1, 1], [x, y2, 1, -1], [x2, y2, -1, -1]]) {
    ctx.line(cx, cy, cx + sx * len, cy, o);
    ctx.line(cx, cy, cx, cy + sy * len, o);
  }
}

/** Quiet division marks for a settings surface: vertical activity cue + label rule. */
export function settingAccent(ctx, r, { alpha = 1, active = 0, color = 'me' } = {}) {
  const a = clamp(alpha), k = clamp(active);
  if (r.w < 20 || r.h < 20) return;
  ctx.rrect(r.x - 13, r.y + 13, 3, r.h - 26, 1.5, { fill: k > 0.03 ? color : 'line', alpha: a * (0.34 + 0.64 * k) });
  ctx.line(r.x + 5, r.y + r.h - 2, r.x + Math.min(r.w - 8, 96 + r.w * 0.22), r.y + r.h - 2,
    { color, alpha: a * (0.08 + 0.3 * k), width: 1.8 });
}

/** A restrained error/data-card engraving, keeping the information legible. */
export function cardEngineering(ctx, r, { alpha = 1, color = 'err', state = 0 } = {}) {
  const a = clamp(alpha);
  if (r.w < 90 || r.h < 50) return;
  glassFinish(ctx, r, { alpha: a, accent: color, focus: state });
  ctx.line(r.x + 25, r.y + 16, r.x + Math.min(95, r.w * 0.25), r.y + 16, { color, width: 2.2, alpha: 0.55 * a });
  for (let i = 0; i < 4; i++) {
    const px = r.x + r.w - 64 + 12 * i;
    ctx.line(px, r.y + 14, px, r.y + 20 + (i % 2 ? 5 : 0), { color, width: 1.4, alpha: 0.27 * a });
  }
}
