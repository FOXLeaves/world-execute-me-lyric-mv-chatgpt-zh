// Section 3 — VERSE 1 (beat 63, 0:29.4 → bar 24, 0:44.65). State: on.
// The AI answers the question with mathematics, drawn on the page of the conversation itself.
// Colour carries the grammar of every line: what "I am" is ORANGE, what it gives "you" is CREAM —
// and the cream things are made by the user's own cursor.
//   v1-points   the answer begins     the spark's twelve tips scatter into a point set; cream edges give it DIMENSION
//   v1-circle   text on the ring      the lattice's silhouette relaxes into a circle; the cursor runs its CIRCUMFERENCE
//   v1-sine     text riding the wave  the circle unrolls into a sine wave; the cursor sits on it, a TANGENT under it
//   v1-limit    graph                 the wave is damped towards a line; the user presses Stop: that line is the LIMIT
// One outline is carried across every cut (match cuts): burst → points → cube silhouette → circle → wave → curve.
import { chatLayout, pill } from '../components/chat.js';
import { drawCursor, pointer } from '../components/cursor.js';
import { spark, sparkTips } from '../components/motif.js';
import { MESH, drawSegs, project, rot } from '../engine/geom.js';
import { rand } from '../engine/prng.js';
import { hullOutline, morph, place } from '../engine/shapes.js';
import { big, onPath } from '../engine/type.js';
import { clamp, easeInOut, easeOut, lerp, prog, pulse } from '../engine/util.js';
import { HANDOFF } from './02_title.js';
import { aiLine, cues } from './kit.js';
import { LINE } from './shared.js';
import { localizeUI } from '../components/ui_zh.js';

const TAU = Math.PI * 2;
const fmt = (v) => (v < 0 ? '' : ' ') + v.toFixed(2);

export function verse1Shots(env) {
  const { script, lyrics } = env, { T, H, B, Bt, P, text } = cues(env);
  const L = chatLayout({ side: 0 });                       // the sidebar is folded away: the answer has the page
  const START = Bt(63), hitDim = T(LINE.DIMENSION), cutCircle = H(LINE.CIRCLE), tHand = T(LINE.GIVE_2);
  const hitCirc = T(LINE.CIRCUMFERENCE), cutSine = H(LINE.SINE), tSit = T(LINE.SIT), hitTan = T(LINE.TANGENTS);
  const cutLimit = H(LINE.INFINITY), hitLim = T(LINE.LIMITATIONS), END = B(24);
  const SWEEP = 0.68;
  // The geometry is now a full-frame drawing, not a small plot inside a web app.
  const C = { x: HANDOFF.cx, y: HANDOFF.cy }, R_CUBE = 305, R_CIRCLE = 330;
  const CUBE = MESH.cube;
  const AXIS = CUBE.edges.map(([i, j]) => [0, 1, 2].find((c) => Math.abs(CUBE.verts[i][c] - CUBE.verts[j][c]) > 0.1));
  const cam = { cx: C.x, cy: C.y, scale: R_CUBE };
  const spin = (t) => { const k = easeOut(prog(t, START, START + 1.2)); return [0.36 * k, 0.5 * (t - START) * k, 0]; };
  const TIPS = sparkTips(HANDOFF.cx, HANDOFF.cy, HANDOFF.r, HANDOFF.rot).map(([x, y]) => [(x - C.x) / R_CUBE, (y - C.y) / R_CUBE, 0]);
  const cubeHull = hullOutline(CUBE.verts.map((v) => project(rot(v, ...spin(cutCircle)), cam)));
  const circle = place('circle', { cx: C.x, cy: C.y, r: R_CIRCLE });
  const G = { x: L.win.x + 2, y: L.head.y + L.head.h + 2, w: L.win.w - 4, h: L.composer.y - L.head.y - L.head.h - 18 };   // the page area the figures live on

  const handAngle = (t) => -Math.PI / 2 + (TAU / (4 * P)) * (Math.min(t, hitCirc) - tHand) + TAU * easeInOut(prog(t, hitCirc, hitCirc + SWEEP));
  const sineGeo = (t) => {
    const k = easeInOut(prog(t, cutSine, cutSine + 0.75));
    const Rc = lerp(R_CIRCLE, 128, k), ccx = lerp(C.x, 330, k), th = handAngle(cutSine) + (TAU / (2 * P)) * (t - cutSine);
    const X0 = ccx + Rc + 74, kx = TAU / 520;
    return { k, Rc, ccx, ccy: C.y, th, X0, X1: 1760, kx, yAt: (x) => C.y + Rc * Math.sin(th - kx * (x - X0)), slope: (x) => -Rc * kx * Math.cos(th - kx * (x - X0)) };
  };

  /**
   * The reply escapes the client. Four mathematical proofs are printed on a single
   * over-sized notebook sheet, like personal working notes, NOT inside the browser UI.
   * A hairline at the bottom is the remnant of the composer; the Stop point stays
   * in its old position so the user's cursor can still end the answer.
   */
  function stage(ctx, t, { busy = true, titleAt = START + P } = {}) {
    ctx.rect(0, 0, 1920, 1080, { fill: true, color: 'bg' });
    // Scuffed, imperfect graph paper: five-grid major lines, with pencil registration ticks.
    for (let x = 0, i = 0; x < 1920; x += 48, i++) ctx.line(x, 0, x, 1080, { color: 'line', alpha: i % 5 === 0 ? 0.42 : 0.17, width: i % 5 === 0 ? 1.7 : 1 });
    for (let y = 0, i = 0; y < 1080; y += 48, i++) ctx.line(0, y, 1920, y, { color: 'line', alpha: i % 5 === 0 ? 0.42 : 0.17, width: i % 5 === 0 ? 1.7 : 1 });
    ctx.radial(960, 440, 720, 'meDim', 0.18);
    const title = localizeUI(script.title ?? ''), n = Math.floor(clamp((t - titleAt) * 22, 0, title.length));
    ctx.rect(0, 0, 1920, 124, { fill: true, color: 'raised', alpha: 0.78 });
    ctx.line(96, 124, 1824, 124, { color: 'text', alpha: 0.75, width: 2 });
    ctx.text('ChatGPT', 98, 76, { size: 45, weight: 700, color: 'me' });
    ctx.text(' / FIELD NOTES', 336, 74, { size: 26, font: 'mono', color: 'sub' });
    ctx.text(n ? title.slice(0, n) : 'New conversation', 1820, 76, { size: 27, font: 'serif', italic: true, color: 'text', align: 'right' });
    // A hand-drawn page edge: this bottom line has no rounded card or button.
    ctx.gradRect(0, 850, 1920, 230, [[0, 'bg', 0], [1, 'bg', 0.85]]);
    ctx.line(108, 996, 1788, 996, { color: 'text', alpha: 0.7, width: 2.5 });
    ctx.text('OUTPUT  /  4 PROOFS', 108, 1040, { size: 21, font: 'mono', color: 'sub' });
    ctx.text(busy ? 'generating...' : 'stopped by you', 1618, 1040, { size: 22, font: 'mono', color: busy ? 'me' : 'text', align: 'right' });
    const send = [L.composer.x + L.composer.w - 48, L.composer.y + L.composer.h / 2];
    ctx.circle(send[0], send[1], 26, { color: busy ? 'me' : 'text', alpha: 0.85, width: 2.5 });
    if (busy) ctx.rect(send[0] - 7, send[1] - 7, 14, 14, { fill: true, color: 'me' });
    else ctx.line(send[0] - 12, send[1], send[0] + 12, send[1], { color: 'text', width: 3 });
    return { send };
  }
  /** The two sung lines of a phrase, in the AI's voice, stacked. */
  const say = (ctx, t, a, b, x = 176, y = 214, size = 40) => { aiLine(ctx, env, a, t, x, y, { size, hold: 9 }); if (b != null) aiLine(ctx, env, b, t, x, y + size * 1.36, { size, hold: 9, color: 'me' }); };
  /** A gift: the keyword in the AI's serif, but CREAM, because it now belongs to the user. */
  const gift = (ctx, i, t, at, cx, cy, maxW, maxSize = 132) => {
    const age = t - at;
    if (age < 0) return;
    const str = text(i), size = ctx.fit(str, maxW, { font: 'serif', weight: 900, maxSize }), sp = size * 0.02;
    let x = cx - (ctx.measure(str, { size, weight: 900, font: 'serif', spacing: sp }) - sp) / 2;
    for (let k = 0; k < str.length; k++) {
      const w = ctx.measure(str[k], { size, weight: 900, font: 'serif' }), e = easeOut(prog(age, k * 0.022, k * 0.022 + 0.16));
      if (e > 0) ctx.at(x + w / 2, cy, () => ctx.text(str[k], 0, 0, { size, weight: 900, font: 'serif', align: 'center', color: 'text', alpha: e }), { scale: 1.9 - 0.9 * e });
      x += w + sp;
    }
  };

  return [
    // ------------------------------------------------------------------ points -> DIMENSION
    {
      id: 'v1-points', at: START, lines: [12, 14], palette: (t) => ['on', 'paper', easeInOut(prog(t, START, START + 0.6))], state: 'on > paper', hud: 0, layout: 'full-bleed drafting paper: point set centre, annotations on the left',
      moment: 'The answer begins. As a point set, what it gives the user is a dimension: cream edges grow between its orange points.',
      enter: { type: 'cut', flash: 0.25, flashColor: 'me' },                 // match cut: the burst's twelve tips are the points
      render(ctx, t, f) {
        const box = stage(ctx, t);
        const loose = easeOut(prog(t, START, START + 1.0)), gather = easeInOut(prog(t, T(LINE.GIVE_1), hitDim - 0.03));
        const s = spin(t), groupT = (ax) => hitDim + ax * (P / 2);
        const pts = TIPS.map((tip, i) => {
          const w = [0, 1, 2].map((c) => (rand(66, i, c) - 0.5) * 2.5 + 0.16 * Math.sin(t * (0.7 + 0.2 * c) + i * 1.7 + c));
          const free = [0, 1, 2].map((c) => lerp(tip[c], w[c], loose));
          return i < 8 ? [0, 1, 2].map((c) => lerp(free[c], CUBE.verts[i][c], gather)) : free.map((v) => v * (1 + 0.5 * gather));
        });
        if (t < START + 0.5) spark(ctx, C.x, C.y, HANDOFF.r, { rot: HANDOFF.rot, alpha: 1 - prog(t, START, START + 0.35) });   // the burst lets go of its tips
        if (t >= hitDim) {                                                   // the gift: one axis per eighth note, in cream
          drawSegs(ctx, CUBE.segs, cam, { rot: s, color: 'text', grow: (i) => easeOut(prog(t, groupT(AXIS[i]), groupT(AXIS[i]) + 0.16)), width: 3 + 2 * pulse(t - hitDim, 6) });
          for (let d = 1; d < 3; d++) ctx.flash(0.1 * pulse(t - groupT(d), 10), 'text');
        }
        const hot = f.onsetPulse > 0.45;
        pts.forEach((p, i) => {
          const q = project(rot(p, s[0], s[1]), cam), a = i < 8 ? 1 : 1 - gather;
          if (a <= 0) return;
          ctx.glow('me', 16, () => ctx.circle(q[0], q[1], (hot ? 12 : 9.5) * clamp(q[2], 0.7, 1.3), { fill: true, color: hot ? 'meHot' : 'me', alpha: a }), 0.6 * a);
          if (i < 8) ctx.text(`p${i}`, q[0] + 16, q[1] - 12, { size: 17, font: 'mono', color: 'mute', alpha: prog(t, START + 0.4, START + 0.9) * (1 - prog(t, hitDim, hitDim + 0.4)) });
        });
        say(ctx, t, 12, 13);
        // Coordinates run down the paper's margin as typeset marginalia; no code card.
        const ca = prog(t, START + P, START + 1.6 * P) * (1 - prog(t, cutCircle - 0.3, cutCircle));
        ctx.line(166, 308, 166, 655, { color: 'me', width: 4, alpha: ca });
        ctx.text('COORDINATES  /  12', 198, 350, { size: 18, font: 'mono', color: 'sub', alpha: ca });
        pts.slice(0, 8).forEach((p, i) => { if (t > START + P + i * 0.06) ctx.text(`p${i} (${fmt(p[0])},${fmt(-p[1])},${fmt(p[2])})`, 198, 389 + 32 * i, { size: 20, font: 'mono', color: 'sub', alpha: ca }); });
        if (t >= hitDim) {                                                   // the word itself gains dimensions: line, plane, solid
          const dims = Math.min(3, 1 + Math.floor((t - hitDim) / (P / 2))), word = text(LINE.DIMENSION);
          const size = ctx.fit(word, 600, { font: 'serif', weight: 900 }), punch = 1 + 0.07 * pulse(t - groupT(dims - 1), 8);
          ctx.at(1420, 770, () => {
            if (dims >= 3) for (let l = 8; l >= 1; l--) big(ctx, word, l * 4.5, -l * 4.5, { size, weight: 900, color: 'sub', alpha: 0.2, stroke: 1.5 });
            big(ctx, word, 0, 0, { size, weight: 900, color: 'text' });
          }, { sx: punch, sy: dims === 1 ? 0.05 : punch });
          pill(ctx, 1420, 690, `${dims}D`, { align: 'center', font: 'mono', size: 20, color: 'text' });
        }
        ctx.flash(0.28 * pulse(t - hitDim, 9), 'text');
        drawCursor(ctx, [{ t: START, x: 1600, y: 320 }, { t: hitDim - 0.3, x: C.x + 330, y: C.y + 30 }, { t: cutCircle, x: C.x + 300, y: C.y - 150 }], t);
        void box;
      },
    },

    // ------------------------------------------------------------------ circle -> CIRCUMFERENCE
    {
      id: 'v1-circle', at: cutCircle, lines: [15, 17], palette: 'paper', hud: 0, layout: 'drafting sheet, centred ring, lyric set on the ring',
      moment: 'If it is a circle, it gives its circumference: the user runs the cursor round the edge and the orange ring turns cream behind it.',
      enter: { type: 'cut', flash: 0.12, flashColor: 'me' },                 // match cut: the lattice's silhouette is this outline
      render(ctx, t, f) {
        stage(ctx, t);
        const relax = easeInOut(prog(t, cutCircle, cutCircle + 1.6 * P)), measured = prog(t, hitCirc, hitCirc + SWEEP);
        spark(ctx, C.x, C.y, R_CIRCLE * 0.86, { color: 'meDim', alpha: 0.28 * relax, core: 0, rot: 0.05 * (t - cutCircle) });   // the motif, inside the circle
        ctx.glow('me', 18, () => ctx.poly(morph(cubeHull, circle, relax), { close: true, color: 'me', width: 5 }), 0.4);
        ctx.line(C.x - 10, C.y, C.x + 10, C.y, { color: 'sub' }); ctx.line(C.x, C.y - 10, C.x, C.y + 10, { color: 'sub' });
        const rr = R_CIRCLE + 36, fade = 1 - prog(t, hitCirc - 0.1, hitCirc + 0.12);
        onPath(ctx, text(LINE.CIRCLE), (d) => { const a = -2.42 + d / rr; return [C.x + Math.cos(a) * rr, C.y + Math.sin(a) * rr, a + Math.PI / 2]; },
          { size: 54, weight: 600, spacingEm: 0.14, reveal: lyrics.typed(LINE.CIRCLE, t).n, alpha: fade });
        if (t >= tHand) {
          const r2 = R_CIRCLE + 66;
          onPath(ctx, text(LINE.GIVE_2), (d) => { const a = 2.5 - d / r2; return [C.x + Math.cos(a) * r2, C.y + Math.sin(a) * r2, a - Math.PI / 2]; },
            { size: 40, weight: 400, spacingEm: 0.1, reveal: lyrics.typed(LINE.GIVE_2, t).n, alpha: fade });
          const th = handAngle(t), len = R_CIRCLE * easeOut(prog(t, tHand, tHand + 0.3));
          ctx.line(C.x, C.y, C.x + Math.cos(th) * len, C.y + Math.sin(th) * len, { color: 'me', width: 3 });
          ctx.text('r', C.x + Math.cos(th) * len * 0.5 + 14, C.y + Math.sin(th) * len * 0.5 - 12, { size: 30, font: 'serif', italic: true, color: 'me' });
        }
        const a0 = handAngle(hitCirc), th = handAngle(t);
        const rim = [C.x + Math.cos(th) * R_CIRCLE, C.y + Math.sin(th) * R_CIRCLE];
        if (measured > 0) {                                                  // the gift: the edge, measured by the user's own hand
          const swept = TAU * easeInOut(measured), word = text(LINE.CIRCUMFERENCE), step = TAU / word.length;
          ctx.circle(C.x, C.y, R_CIRCLE, { a0, a1: a0 + swept, width: 8, color: 'text' });
          for (let i = 0; i < word.length; i++) {
            const off = (i + 0.5) * step;
            if (off > swept) break;
            const a = a0 + off, k = pulse(swept - off, 2.2);
            ctx.at(C.x + Math.cos(a) * (R_CIRCLE + 62), C.y + Math.sin(a) * (R_CIRCLE + 62), () => ctx.text(word[i], 0, 0, { size: 84, weight: 900, font: 'serif', align: 'center', color: 'text' }), { rot: a + Math.PI / 2, scale: 1 + 0.45 * k });
          }
          ctx.text(`C = 2 * PI * r = ${(TAU * easeInOut(measured)).toFixed(4)}`, C.x, C.y + 70, { size: 26, font: 'mono', align: 'center', color: 'text' });
        }
        ctx.flash(0.25 * pulse(t - hitCirc, 9), 'text');
        // the cursor comes to the rim, then rides the sweep
        if (t < hitCirc) drawCursor(ctx, [{ t: cutCircle, x: C.x + 300, y: C.y - 150 }, { t: tHand, x: C.x + 420, y: C.y + 60 }, { t: hitCirc - 0.02, x: C.x + Math.cos(a0) * R_CIRCLE, y: C.y + Math.sin(a0) * R_CIRCLE, click: true }], t);
        else ctx.trail(measured < 1 ? 7 : 0, 0.0035, (tau) => { const a = handAngle(t - tau); pointer(ctx, C.x + Math.cos(a) * R_CIRCLE, C.y + Math.sin(a) * R_CIRCLE, { scale: 1.5, down: 1 }); }, 0.3);
        void rim;
      },
    },

    // ------------------------------------------------------------------ sine -> TANGENTS
    {
      id: 'v1-sine', at: cutSine, lines: [18, 20], palette: 'paper', hud: 0, layout: 'full-width drafting sheet: circle left, wave across, lyric riding it',
      moment: 'If it is a sine wave, the user may sit on its tangents: the cursor rests on the wave and a cream tangent tilts under it.',
      enter: { type: 'cut' },                                                // match cut: same circle, same place
      render(ctx, t, f) {
        stage(ctx, t);
        const g = sineGeo(t), { Rc, ccx, ccy, th, X0, X1, yAt, slope } = g;
        ctx.glow('me', 14, () => ctx.circle(ccx, ccy, Rc, { color: 'me', width: 5 }), 0.35);
        const hx = ccx + Math.cos(th) * Rc, hy = ccy + Math.sin(th) * Rc;
        ctx.line(ccx, ccy, hx, hy, { color: 'me', width: 3 }); ctx.circle(hx, hy, 7, { fill: true, color: 'me' });
        ctx.line(ccx - Rc - 20, ccy, X1, ccy, { color: 'sub', alpha: 0.6 * g.k, width: 1.5 });
        ctx.g.setLineDash([6, 8]); ctx.line(hx, hy, X0, hy, { color: 'sub', alpha: g.k, width: 1.5 }); ctx.g.setLineDash([]);
        const xEnd = lerp(X0, X1, easeOut(prog(t, cutSine + 0.3, cutSine + 1.0)));
        for (let x = X0; x <= xEnd; x += 13) ctx.line(x, ccy, x, yAt(x), { color: 'meDim', alpha: 0.55 * (0.6 + 0.4 * f.rmsEnv), width: 2 });   // hatching between axis and curve
        const curve = [];
        for (let x = X0; x <= xEnd; x += 6) curve.push([x, yAt(x)]);
        ctx.glow('me', 14, () => ctx.poly(curve, { color: 'me', width: 5 }), 0.4);
        say(ctx, t, 18, null);
        if (t >= tSit) {
          onPath(ctx, text(LINE.SIT), (d) => { const x = X0 + 70 + d; return [x, yAt(x) - 30, Math.atan(slope(x))]; },
            { size: 42, weight: 600, spacingEm: 0.22, reveal: lyrics.typed(LINE.SIT, t).n });
          // the user sits on the wave: the cursor rides it, and what it sits on is a tangent
          const xr = lerp(X0, X1, 0.74), yr = yAt(xr), m = slope(xr), l = Math.hypot(1, m), half = 170 * easeOut(prog(t, tSit, tSit + 0.3));
          ctx.line(xr - half / l, yr - (half * m) / l, xr + half / l, yr + (half * m) / l, { color: 'text', width: 4 });
          ctx.circle(xr, yr, 7, { fill: true, color: 'text' });
          pointer(ctx, xr - 4, yr - 2 - 220 * (1 - easeOut(prog(t, tSit, tSit + 0.35))), { kind: 'hand', scale: 1.5, alpha: prog(t, tSit, tSit + 0.12) });
        }
        if (t >= hitTan) {
          [0.16, 0.36, 0.56].forEach((u, i) => {
            const x = lerp(X0, X1, u), y = yAt(x), m = slope(x), l = Math.hypot(1, m), half = 150 * easeOut(prog(t, hitTan + i * 0.03, hitTan + i * 0.03 + 0.16));
            ctx.line(x - half / l, y - (half * m) / l, x + half / l, y + (half * m) / l, { color: 'text', width: 4 });
            ctx.circle(x, y, 7, { fill: true, color: 'text' });
          });
          gift(ctx, LINE.TANGENTS, t, hitTan, 1060, 800, 900, 150);
        }
        ctx.flash(0.28 * pulse(t - hitTan, 8), 'text');
      },
    },

    // ------------------------------------------------------------------ infinity -> LIMITATIONS
    {
      id: 'v1-limit', at: cutLimit, lines: [21, 23], palette: (t) => ['paper', 'on', easeInOut(prog(t, END - 0.72, END))], state: 'paper > on', hud: 0, layout: 'drafting sheet fades back to the client as a limit is imposed',
      moment: 'If it approaches infinity, the user can be its limit: they press Stop, and the cream line where the reply was cut is the limit.',
      enter: { type: 'cut' },                                                // match cut: the same wave, now damped
      render(ctx, t, f) {
        const stopped = t >= hitLim, box = stage(ctx, t, { busy: !stopped });
        const g = sineGeo(t), k = easeInOut(prog(t, cutLimit, cutLimit + 2 * P));
        const X0 = lerp(g.X0, 190, k), X1 = 1760, yL = 400, base = lerp(C.y, 690, k), locked = prog(t, hitLim, hitLim + 0.25), run = Math.min(t, hitLim) - cutLimit;
        const yAt = (x) => {
          const u = (x - X0) / (X1 - X0);
          return base - (base - yL - 16) * (1 - Math.exp(-u * 4.2)) * k + g.Rc * lerp(1, Math.exp(-u * 5), k) * (1 - 0.9 * locked) * Math.sin(g.th - g.kx * (x - X0));
        };
        ctx.circle(g.ccx, g.ccy, g.Rc, { color: 'me', width: 5, alpha: 1 - prog(t, cutLimit, cutLimit + 0.35) });
        ctx.line(X0, base + 90, X1, base + 90, { color: 'sub', width: 1.5 }); ctx.line(X0, base + 90, X0, yL - 50, { color: 'sub', width: 1.5 });
        for (let i = 0; i < 9; i++) { const x = lerp(X0, X1, (i + 1) / 9.5); ctx.line(x, base + 90, x, base + 100, { color: 'sub', width: 1.5 }); ctx.text(`1e${Math.floor(run * 6) + i * 3}`, x, base + 124, { size: 18, font: 'mono', color: 'mute', align: 'center', alpha: k }); }
        ctx.g.setLineDash(locked > 0 ? [] : [14, 12]);                       // the limit: cream, because the user sets it
        ctx.glow('text', 16, () => ctx.line(X0, yL, X1, yL, { color: 'text', width: 3 + 3 * locked, alpha: prog(t, cutLimit + P, cutLimit + 2 * P) }), 0.5 * locked);
        ctx.g.setLineDash([]);
        const curve = [];
        for (let x = X0; x <= X1; x += 6) curve.push([x, yAt(x)]);
        for (let x = X0; x <= X1; x += 13) ctx.line(x, base + 90, x, yAt(x), { color: 'meDim', alpha: 0.3 * k, width: 2 });
        ctx.glow('me', 14, () => ctx.poly(curve, { color: 'me', width: 5 }), 0.4);
        const xr = lerp(X0, X1, clamp(0.25 + run * 0.2)), yr = yAt(xr);
        ctx.glow('me', 16, () => ctx.circle(xr, yr, 10, { fill: true, color: 'meHot' }), 0.7);
        say(ctx, t, 21, 22, 176, 214, 40);
        if (stopped) {                                                       // the word sits on the line
          const word = text(LINE.LIMITATIONS), step = (X1 - X0 - 60) / word.length;
          for (let i = 0; i < word.length; i++) {
            const ki = easeOut(prog(t, hitLim + i * 0.02, hitLim + i * 0.02 + 0.14));
            if (ki > 0) ctx.text(word[i], X0 + 30 + (i + 0.5) * step, yL - 18 - (1 - ki) * 90, { size: 96, weight: 900, font: 'serif', align: 'center', color: 'text', alpha: ki });
          }
          pill(ctx, box.send[0] - 44, box.send[1] - 52, 'Stopped', { align: 'right', size: 17, color: 'text', alpha: prog(t, hitLim, hitLim + 0.2) });
        }
        ctx.flash(0.3 * pulse(t - hitLim, 8), 'text');
        drawCursor(ctx, [{ t: cutLimit, x: 1500, y: 560 }, { t: hitLim - 1.2 * P, x: 1380, y: 700 }, { t: hitLim, x: box.send[0] + 3, y: box.send[1] + 4, click: true }, { t: END, x: box.send[0] + 80, y: box.send[1] - 90 }], t);
      },
    },
  ];
}
