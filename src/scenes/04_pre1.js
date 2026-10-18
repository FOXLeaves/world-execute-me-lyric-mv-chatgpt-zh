// Section 4 — PRE-CHORUS 1 (bar 24, 0:44.65 → bar 32, 0:59.4). State: on.
// The user opens the settings drawer on the AI and plays with it. The cursor is the protagonist and
// every cut lands ON one of its clicks; the AI can only narrate what is being done to it (serif, orange).
//   pre1-drawer   wide, the drawer opening        Settings; Current: AC, then DC. The curve it had drawn becomes its current
//   pre1-vision   macro on one switch             Vision: off. The picture itself breaks into dark blocks; then that one switch is rattled
//   pre1-date     a band four fifths of the frame  Knowledge date is grabbed and yanked back, a pull a beat: history runs under the spark, over the era line, to the pyramids
//   pre1-unite    centred sheet                   Shared memory: on; Context depth pushed to the end; Done
// In the wide shots its lines are written on the page, as in verse 1; in the close ones they are the
// annotation under the row being touched (chat_script.json ties every row to its lyric line).
import { chatLayout, composer, header, iconButton, pill, room, toggle, windowFrame } from '../components/chat.js';
import { cursorAt, pointer, sinceClick } from '../components/cursor.js';
import { burst, spark, sparkOutline } from '../components/motif.js';
import { lerpRect } from '../engine/layout.js';
import { rand } from '../engine/prng.js';
import { clamp, easeBack, easeIn, easeInOut, easeOut, lerp, prog, pulse, window01 } from '../engine/util.js';
import { cue } from './cues.js';
import { orbitInstrument, signalHelix } from './cinema_space.js';
import { ERA_LINE, STOPS, strip } from './history.js';
import { cues } from './kit.js';
import { enter } from './shot.js';

const TAU = Math.PI * 2;
const WIDE = 1.4;                                            // this drawer opens to 616 px, so its rows read at full frame
const FALLBACK_ROWS = [
  { label: 'Current', values: ['AC', 'DC'], line: 25 }, { label: 'Vision', values: ['on', 'off'], line: 26 },
  { label: 'Knowledge date', values: ['A.D. 2026', 'A.D. 1', '3000 B.C.'], line: 29 },
  { label: 'Shared memory', values: ['off', 'on'], line: 30 }, { label: 'Context depth', values: ['shallow', 'deep', 'deepest'], line: 31 },
];

export function pre1Shots(env) {
  const { script, lyrics } = env, { T, H, B, Bt, P, text } = cues(env);
  const b = (n) => Bt(96 + n);                               // beats counted from bar 24
  const beat = (id) => ((script.sections ?? []).find((s) => s.n === 4)?.beats ?? []).find((x) => x.id === id) ?? {};
  const ROWS = (script.settings_rows?.section4 ?? []).length >= 5 ? script.settings_rows.section4 : FALLBACK_ROWS;
  const UI = { settings: beat('drawer-opens').ui?.[0] ?? 'Settings', done: beat('depth-maxed').ui?.[0] ?? 'Done', blind: beat('vision-off').system?.[0] ?? 'image input: none' };
  const ROW_LINES = [[24, 25], [26, 27], [28, 29], [30, 30], [31, 31]];
  const ERA = text(29).split(' ').filter((w) => /[A-Z]\.[A-Z]/.test(w));          // the two era tokens, in sung order
  const VAL = ROWS[2].values, Y_AD = +(VAL[0].match(/\d+/) ?? [2026])[0], Y_BC = +(VAL[2].match(/\d+/) ?? [3000])[0];

  // ---------------------------------------------------------------- the user's clicks (all on the beat grid)
  const tSet = b(0.5), tAC = b(3), tDC = b(5);                                     // shot 1
  // shot 2 (cut on the first): Vision off, then rattled: on, off, on, off, on, the last three ever faster (v4: this
  // switch only; the pointer never leaves its row). An odd number of flips after the cut, so Vision ends ON.
  const tOff = B(26), tOn1 = b(11), tOff2 = b(12), tOn2 = b(13), tOff3 = b(13.5), tOn3 = b(14);
  const QUICK = 0.12;                                                              // the last three flips: 0.12 s each, so every state still holds 6 frames
  const tGrab = B(28), tCross = b(20), tEnd = b(22), tDrop = b(22.25);             // shot 3 (cut on the grab; over the era line on section beat 20; at the end; let go)
  const tShare = B(30), tHold = b(26.5), tDone = b(31), END = B(32);               // shot 4 (cut on the switch)

  // ---------------------------------------------------------------- what those clicks have set, at time t
  const flick = (t, at, d = 0.16) => easeOut(prog(t, at, at + d));
  const ramp = (t, at, d = 0.2) => easeInOut(prog(t, at, at + d));
  const drawerK = (t) => easeOut(prog(t, tSet + 0.02, tSet + 0.42)) * (1 - easeInOut(prog(t, tDone + 0.1, tDone + 0.5)));
  const segPos = (t) => flick(t, tDC);                                             // 0 = AC, 1 = DC (and DC it stays)
  const vision = (t) => 1 - flick(t, tOff) + flick(t, tOn1) - flick(t, tOff2) + flick(t, tOn2, QUICK) - flick(t, tOff3, QUICK) + flick(t, tOn3, QUICK);
  const blind = (t) => ramp(t, tOff) - ramp(t, tOn1) + ramp(t, tOff2) - ramp(t, tOn2, QUICK) + ramp(t, tOff3, QUICK) - ramp(t, tOn3, QUICK);
  // v4: the date is not slid along a ruler. The hand YANKS it back, once on every beat, six times, and never rests in
  // between: a snatch, then it runs on. Each pull ends in a gap between two landmarks of the strip (history.js STOPS);
  // the fifth starts on the era line. YEAR is signed (A.D. above zero, B.C. below), one value per stop.
  const YEAR = [Y_AD, Y_AD - 26, 1500, 700, 0, -Y_BC / 2, -Y_BC];
  const pull = (t) => { const x = clamp((t - tGrab) / P, 0, 6 - 1e-9), i = Math.floor(x), p = x - i; return [i, p, 0.8 * (1 - (1 - p) ** 3) + 0.2 * p]; };   // [which pull, how far into its beat, how far along its way]
  const along = (arr, t) => { const [i, , q] = pull(t); return lerp(arr[i], arr[i + 1], q); };
  const yearAt = (t) => along(YEAR, t);
  const dateU = (t) => { const y = yearAt(t); return 0.5 + 0.5 * (y >= 0 ? y / Y_AD : y / Y_BC); };                // 1 = now, 0.5 = the era line, 0 = the end
  const bandK = (t) => easeOut(prog(t, tGrab, tGrab + 0.24)) * (1 - easeInOut(prog(t, tDrop + 0.04, tDrop + 0.36)));
  const shared = (t) => flick(t, tShare, 0.2);
  const depth = (t) => 0.5 * easeOut(prog(t, tHold + 0.03, b(27.1))) + 0.5 * easeInOut(prog(t, b(28.1), b(29)));
  const push = (t) => pulse(t - b(30), 7) + pulse(t - b(30.5), 7);                // the knob is already at the end; the user pushes on
  const readout = (u) => (u >= 0.5 ? VAL[0].replace(/\d+/, String(Math.max(1, Math.round(1 + ((u - 0.5) / 0.5) * (Y_AD - 1)))))
    : VAL[2].replace(/\d+/, String(Math.max(1, Math.round(1 + ((0.5 - u) / 0.5) * (Y_BC - 1))))));

  // ---------------------------------------------------------------- geometry (world px, drawer fully open)
  const L0 = chatLayout({ side: 0 }), LO = chatLayout({ side: 0, drawer: WIDE });
  const DW = LO.drawer.w, RX0 = LO.drawer.x + 34, RX1 = LO.drawer.x + DW - 34;
  const ROW_Y = [170, 292, 414, 586, 708], ROW_H = [122, 122, 172, 122, 172];
  const rowAt = (i, dx = LO.drawer.x) => ({ x: dx + 34, y: ROW_Y[i], w: DW - 68, h: ROW_H[i] });
  const A = {                                                                      // where the cursor has to be
    set: [L0.head.x + L0.head.w - 176, L0.head.y + 33], ac: [RX1 - 172, ROW_Y[0] + 61], dc: [RX1 - 58, ROW_Y[0] + 61],
    vis: [RX1 - 52, ROW_Y[1] + 61], date: (u) => [RX0 + 12 + (DW - 92) * u, ROW_Y[2] + 128], share: [RX1 - 52, ROW_Y[3] + 61],
  };
  const ACT = [[[2.4, 6.4]], [[6.7, 14.7]], [[14.8, 22.4]], [[22.7, 26.2]], [[26.2, 31]]];
  const active = (i, t) => Math.max(0, ...ACT[i].map(([a, z]) => window01(t, b(a), b(z), 0.14, 0.14)));

  // ---------------------------------------------------------------- small helpers
  /** Run fn in screen space (the shot's camera is put back afterwards). */
  const screen = (ctx, fn) => { const g = ctx.g; g.save(); g.setTransform(ctx.scale, 0, 0, ctx.scale, 0, 0); fn(); g.restore(); ctx._font = ''; };
  /**
   * Local kit addition: true mosaic of everything drawn so far on this layer (cells of `cell` virtual px).
   * Unlike ctx.fx.mosaic it happens in the middle of the draw order, so whatever is drawn afterwards stays sharp.
   */
  let scratch = null;
  function mosaic(ctx, cell) {
    if (cell < 2) return;
    const g = ctx.g, c = ctx.canvas, px = cell * ctx.scale, w = Math.ceil(c.width / px), h = Math.ceil(c.height / px);
    scratch ??= document.createElement('canvas');
    if (scratch.width !== w || scratch.height !== h) { scratch.width = w; scratch.height = h; }
    const sg = scratch.getContext('2d');
    sg.imageSmoothingEnabled = true; sg.imageSmoothingQuality = 'high'; sg.globalCompositeOperation = 'copy';
    sg.drawImage(c, 0, 0, w * px, h * px, 0, 0, w, h);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false;
    g.drawImage(scratch, 0, 0, w, h, 0, 0, w * px, h * px);
    g.restore(); ctx._font = '';
  }
  /** The user's pointer along waypoints, with a long ghost trail whenever it moves faster than `fast` px/s. */
  function cur(ctx, way, t, { scale = 1.5, kind = 'arrow', fast = 700, n = 6, dt = 0.011, strength = 0.45 } = {}) {
    const now = cursorAt(way, t), was = cursorAt(way, t - 0.03), sc = sinceClick(way, t);
    if (sc < 0.45) { const at = way.filter((w) => w.click && t >= w.t).pop(); burst(ctx, at.x, at.y, 34 * scale, sc / 0.45, { color: 'text' }); }   // the burst stays where the click was
    ctx.trail(Math.hypot(now[0] - was[0], now[1] - was[1]) / 0.03 > fast ? n : 0, dt, (tau) => { const p = cursorAt(way, t - tau); pointer(ctx, p[0], p[1], { kind, scale, down: sc < 0.12 ? 1 : 0 }); }, strength);
    return now;
  }
  /** One sung line in the AI's voice at a free position, typed; at `out` it gives way to the next phrase. */
  function say(ctx, i, t, x, y, { size = 52, out = Infinity, alpha = 1, color = 'me' } = {}) {
    const t0 = T(i);
    if (t < t0) return;
    const str = text(i), n = lyrics.typed(i, t).n, o = { size, weight: 400, font: 'serif' };
    const gone = Number.isFinite(out) ? prog(t, out - 0.14, out + 0.04) : 0, a = alpha * (1 - gone), dy = -0.55 * size * easeIn(gone) + 0.3 * size * (1 - easeOut(prog(t, t0, t0 + 0.2)));
    if (a <= 0.003) return;
    ctx.text(str.slice(0, n), x, y + dy, { ...o, color, alpha: a });
    if (n < str.length) ctx.circle(x + ctx.measure(str.slice(0, n), o) + size * 0.3, y + dy - size * 0.28, size * 0.16, { fill: true, color, alpha: a });
  }
  /** Which lyric line annotates drawer row i at time t: the one being sung, afterwards the one the script ties to the row. */
  function hintOf(i, t) {
    const [a, z] = ROW_LINES[i];
    let now = -1;
    for (let l = a; l <= z; l++) if (t >= T(l)) now = l;
    if (now < 0) return null;
    if (t < lyrics.end(now)) return { line: now, live: true };
    const keep = ROWS[i].line;
    return { line: keep >= a && keep <= z ? keep : z, live: false };
  }
  function hint(ctx, i, t, x, y, size = 24) {
    const h = hintOf(i, t);
    if (!h) return;
    const str = text(h.line), n = h.live ? lyrics.typed(h.line, t).n : str.length;
    ctx.text(str.slice(0, n), x, y, { size, font: 'serif', color: 'me', alpha: h.live ? 1 : 0.55 });
  }

  // ---------------------------------------------------------------- the controls
  function seg(ctx, r, opts, t) {
    const on = flick(t, tAC, 0.14), pos = segPos(t), w = r.w / 2, stretch = Math.sin(Math.PI * clamp(pos));
    ctx.rrect(r.x, r.y, r.w, r.h, r.h / 2, { fill: 'bg', stroke: 'line' });
    if (on > 0) ctx.rrect(r.x + pos * w + 5 - stretch * 8, r.y + 5, w - 10 + stretch * 16, r.h - 10, r.h / 2, { fill: 'me', alpha: on, shadow: 0.3 });
    opts.forEach((o, i) => ctx.text(o, r.x + (i + 0.5) * w, r.y + r.h / 2 + 9, { size: 26, weight: 700, align: 'center', color: on * clamp(1 - Math.abs(pos - i)) > 0.5 ? 'bg' : 'sub' }));
  }
  function dateTrack(ctx, r, t) {
    const xa = r.x + 12, xb = r.x + r.w - 12, y = r.y + 128, kx = lerp(xa, xb, dateU(t));
    ctx.rrect(xa, y - 3, xb - xa, 6, 3, { fill: 'line' });
    ctx.rrect(xa, y - 3, kx - xa, 6, 3, { fill: 'me' });
    ctx.line((xa + xb) / 2, y - 13, (xa + xb) / 2, y + 13, { color: 'sub', width: 2 });          // the era line
    ctx.text(VAL[2], xa - 4, y + 36, { size: 20, color: 'mute' });
    ctx.text(VAL[0], xb + 4, y + 36, { size: 20, color: 'mute', align: 'right' });
    if (t < tGrab || t > tDrop + 0.36) {                                                         // (while it is held, the knob is out in the band)
      ctx.circle(kx, y, 21, { fill: true, color: 'panel' });
      ctx.glow('me', 12, () => spark(ctx, kx, y, 18, { rot: kx / 40 }), 0.5);
    }
  }
  function depthTrack(ctx, r, t) {
    const xa = r.x + 12, xb = r.x + r.w - 12, y = r.y + 128, d = depth(t), kx = lerp(xa, xb, d), names = ROWS[4].values;
    ctx.rrect(xa, y - 3, xb - xa, 6, 3, { fill: 'line' });
    ctx.rrect(xa, y - 3, kx - xa, 6, 3, { fill: 'me' });
    names.forEach((s, i) => ctx.text(s, lerp(xa - 4, xb + 4, i / 2), y + 36, { size: 20, color: Math.round(d * 2) === i ? 'sub' : 'mute', align: ['left', 'center', 'right'][i] }));
    ctx.circle(kx, y, 15, { fill: true, color: 'text' });
  }

  /** The settings drawer: title, five rows (label, the AI's annotation, control), Done. */
  function drawerPanel(ctx, L, t, { skipHint = -1 } = {}) {
    const d = L.drawer;
    if (d.w < 4) return;
    ctx.clip(d, () => {
      const dx = d.x, x0 = dx + 34, x1 = dx + DW - 34, h = enter(t, tSet + 0.08, 0, { dur: 0.3, rise: 14 });
      ctx.text(UI.settings, x0, d.y + 66 + h.dy, { size: 32, weight: 600, color: 'text', alpha: h.a });
      iconButton(ctx, x1 - 19, d.y + 54, 'close', { r: 19, alpha: h.a });
      ctx.line(dx, d.y + 104, dx + DW, d.y + 104, { color: 'line', width: 1.5, alpha: h.a });
      ROWS.slice(0, 5).forEach((row, i) => {
        const r = rowAt(i, dx), e = enter(t, tSet + 0.14, i, { step: 0.07, dur: 0.36 });
        if (e.a <= 0) return;
        ctx.at((1 - e.k) * 70, 0, () => {                                                        // rows slide in from the window edge, one after another
          const act = active(i, t);
          if (act > 0) ctx.rrect(r.x - 16, r.y + 6, r.w + 32, r.h - 12, 16, { fill: 'raised', alpha: act });
          ctx.text(row.label, r.x, r.y + 52, { size: 30, weight: 500, color: 'text' });
          if (i !== skipHint) hint(ctx, i, t, r.x, r.y + 92);
          ctx.line(r.x, r.y + r.h, r.x + r.w, r.y + r.h, { color: 'line', alpha: 0.7, width: 1 });
          if (i === 0) seg(ctx, { x: r.x + r.w - 230, y: r.y + 31, w: 230, h: 60 }, row.values, t);
          if (i === 1) toggle(ctx, r.x + r.w - 104, r.y + 33, vision(t), { w: 104, h: 56 });
          if (i === 3) toggle(ctx, r.x + r.w - 104, r.y + 33, shared(t), { w: 104, h: 56 });
          if (i === 2) { ctx.text(readout(dateU(t)), r.x + r.w, r.y + 52, { size: 24, weight: 600, color: 'sub', align: 'right' }); dateTrack(ctx, r, t); }
          if (i === 4) { ctx.text(row.values[Math.round(depth(t) * 2)], r.x + r.w, r.y + 52, { size: 24, weight: 600, color: 'sub', align: 'right' }); depthTrack(ctx, r, t); }
        }, { alpha: e.a });
      });
      const e = enter(t, tSet + 0.14, 5, { step: 0.07, dur: 0.36 }), press = pulse(t - tDone, 9);
      ctx.rrect(x1 - 150, 908, 150, 60, 30, { fill: press > 0.3 ? 'line' : 'raised', stroke: 'line', alpha: e.a });
      ctx.text(UI.done, x1 - 75, 947, { size: 24, weight: 600, align: 'center', color: 'text', alpha: e.a });
    });
  }

  // ---------------------------------------------------------------- the page: the stopped answer of verse 1, now its "current"
  const thV1 = (t) => -Math.PI / 2 + (TAU / (4 * P)) * (T(17) - T(16)) + TAU + (TAU / (2 * P)) * (t - H(18));   // the residual phase verse 1 left running
  const RUN = T(23) - H(21);
  function figure(ctx, t, x1) {
    const x0 = 190, yL = 400, base = 690, yAx = 780, mid = 592, w = x1 - x0;
    const lift = easeInOut(prog(t, tAC, tAC + 0.4)), th = thV1(t), ph = TAU * 1.2 * (t - tAC);
    const amp = 104 * flick(t, tAC, 0.3) * (1 - easeBack(prog(t, tDC, tDC + 0.45)));                                 // AC swings; DC collapses it (with one overshoot)
    const yAt = (x) => { const u = (x - x0) / w; return lerp(base - (base - yL - 16) * (1 - Math.exp(-u * 4.2)) + 12.8 * Math.exp(-u * 5) * Math.sin(th - (TAU / 520) * (x - x0)), mid, lift) + amp * Math.sin(ph - (TAU / 290) * (x - x0)); };
    ctx.line(x0, yAx, x1, yAx, { color: 'sub', width: 1.5 }); ctx.line(x0, yAx, x0, yL - 50, { color: 'sub', width: 1.5 });
    const old = 1 - prog(t, B(24) + 0.1, B(24) + 0.5);                                                               // the x-axis of "towards infinity" is no longer what this graph is
    for (let i = 0; i < 9; i++) { const x = lerp(x0, x1, (i + 1) / 9.5); ctx.line(x, yAx, x, yAx + 10, { color: 'sub', width: 1.5 }); ctx.text(`1e${Math.floor(RUN * 6) + i * 3}`, x, yAx + 34, { size: 18, font: 'mono', color: 'mute', align: 'center', alpha: old }); }
    ctx.glow('text', 16, () => ctx.line(x0, yL, x1, yL, { color: 'text', width: 3 + 3 * old }), 0.5 * old);         // the limit the user set stays where it was
    const word = text(23), step = (w - 60) / word.length, size = Math.min(96, step * 0.92);                          // its word has been said: the letters lift off the line and go
    for (let i = 0; i < word.length; i++) { const k = easeIn(prog(t, B(24) + 0.06 + i * 0.022, B(24) + 0.34 + i * 0.022)); ctx.text(word[i], x0 + 30 + (i + 0.5) * step, yL - 18 - 46 * k, { size, weight: 900, font: 'serif', align: 'center', color: 'text', alpha: 1 - k }); }
    const curve = [];
    for (let x = x0; x <= x1; x += 6) curve.push([x, yAt(x)]);
    for (let x = x0; x <= x1; x += 13) ctx.line(x, yAx, x, yAt(x), { color: 'meDim', alpha: 0.3, width: 2 });
    ctx.glow('me', 14, () => ctx.poly(curve, { color: 'me', width: 5 }), 0.4);
    const xr = lerp(x0, x1, clamp(0.25 + RUN * 0.2));
    ctx.glow('me', 16, () => ctx.circle(xr, yAt(xr), 10, { fill: true, color: 'meHot' }), 0.7);
    if (t >= tAC) ctx.text(`${ROWS[0].label.toLowerCase()}: ${ROWS[0].values[segPos(t) > 0.5 ? 1 : 0]}`, x1, yAx + 36, { size: 22, font: 'mono', color: 'sub', align: 'right', alpha: flick(t, tAC, 0.2) });
  }

  /** The whole client with the drawer open by k: room, window, header, the page with the figure, composer, drawer. */
  function client(ctx, t, k, opts = {}) {
    const L = chatLayout({ side: 0, drawer: WIDE * k });
    room(ctx, { dim: 0.42, t });
    windowFrame(ctx, L, { glass: 0.94 });
    header(ctx, L, { t, title: script.title ?? '', presence: 'online' });
    const gx = L.head.x + L.head.w - 176, gy = L.head.y + 33, ga = prog(t, B(24), B(24) + 0.16), on = k > 0.5;       // the Settings button
    if (on) ctx.circle(gx, gy, 19, { fill: true, color: 'raised', alpha: ga });
    ctx.circle(gx, gy, 19, { color: on ? 'sub' : 'line', width: 1.5, alpha: ga });
    for (const [dy, kx] of [[-6, 5], [6, -5]]) { ctx.line(gx - 10, gy + dy, gx + 10, gy + dy, { color: on ? 'text' : 'sub', width: 2, alpha: ga }); ctx.circle(gx + kx, gy + dy, 3.5, { fill: true, color: on ? 'text' : 'sub', alpha: ga }); }
    const G = { x: L.win.x + 2, y: L.head.y + L.head.h + 2, w: L.main.w - 4, h: L.composer.y - L.head.y - L.head.h - 18 };
    ctx.clip(G, () => {                                                                                              // graph paper, as in verse 1
      for (let x = 0; x < 1920; x += 48) ctx.line(x, G.y, x, G.y + G.h, { color: 'line', alpha: Math.round((x - 960) / 48) % 5 === 0 ? 0.5 : 0.22, width: 1 });
      for (let y = 6; y < 1080; y += 48) ctx.line(G.x, y, G.x + G.w, y, { color: 'line', alpha: Math.round((y - 486) / 48) % 5 === 0 ? 0.5 : 0.22, width: 1 });
      ctx.radial(960, 486, 620, 'meDim', 0.16);
      figure(ctx, t, L.main.x + L.main.w - 50);
    });
    const box = composer(ctx, L.composer, { placeholder: script.composer_placeholder ?? '', t, send: 'idle' });
    drawerPanel(ctx, L, t, opts);
    return { L, box };
  }

  // ---------------------------------------------------------------- cameras (also needed inside render, to come back from screen space)
  const cam1 = (t) => { const k = easeInOut(prog(t, tSet, tSet + 1.5)); return { zoom: 1 + 0.06 * k + 0.012 * prog(t, tAC, tOff), x: 50 * k, y: 0 }; };
  const KICKS = [[tOn1, 1], [tOff2, -1], [tOn2, 1], [tOff3, -1], [tOn3, 1]];
  const cam2 = (t) => {
    let rot = 0, dx = 0;
    for (const [tk, s] of KICKS) { const a = t - tk; if (a > 0) { const e = Math.exp(-3.2 * a); rot += s * 0.032 * e * Math.sin(11 * a); dx += s * 11 * e * Math.sin(9 * a + 0.6); } }
    const dz = window01(t, T(27) - 0.15, b(15.4), 0.5, 0.7), a = t - T(27);                 // and a slow, seasick roll under the whole of line 27
    const pan = easeInOut(prog(t, b(14.5), b(15.8))), zoom = 2.96 * (1 + 0.025 * prog(t, tOff, tGrab));   // then down to the next row,
    const kn = A.date(1), ex = kn[0] - (kn[0] - 960) / zoom, ey = kn[1] - (kn[1] - 540) / zoom;           // until its knob sits where the next shot has it (match cut on the grab)
    return { x: lerp(1492, ex, pan) - 960 + dx + 7 * dz * Math.sin(a * 2.7), y: lerp(353, ey, pan) - 540 + 4 * dz * Math.cos(a * 3.3), zoom, rot: rot + 0.02 * dz * Math.sin(a * 4.1) };
  };
  const cam3 = (t) => ({ zoom: 1 + 0.035 * easeInOut(prog(t, tGrab, tDrop)) - 0.035 * easeInOut(prog(t, tDrop, tDrop + 0.5)) });
  const cam4 = (t) => {
    const fly = easeIn(prog(t, tDone, END));
    return { zoom: 1 + 0.13 * easeOut(prog(t, tShare, tShare + 0.4)) + 0.11 * easeInOut(prog(t, tHold, b(30.6))) + 0.02 * push(t) + 1.25 * fly, y: -100 * easeInOut(prog(t, tDone, tDone + 0.6)) };
  };

  // ---------------------------------------------------------------- shot 3: the timeline, opened across the window (v4)
  // The row opens into a band four fifths of the frame high. In it the spark is the knob, and the timeline is far longer
  // than the frame: the hand drags the spark to the left and history runs to the right under it (history.js). Left of
  // the spark is what it still knows: dark paper with a smear behind it while it flies, inked as it slows. Right of it
  // is what it has been dragged past: outlines. Under the rail the year, as a milometer, and the two era words of line
  // 29 either side of it: each lands when it is sung, and the one whose era the spark has left is an outline from then on.
  const BAND = { x: -40, y: 108, w: 2000, h: 864 }, GY = 640, TY = 706, HK = 0.86;
  const KX = [1560, 1540, 1440, 1350, 1260, 1170, 1090];                // where the spark is in the frame at the end of each pull: it gives way to the left as more lies behind it
  const snatch = (t) => { const [, p] = pull(t); return t <= tGrab || t >= tEnd ? 0 : p < 0.16 ? easeOut(p / 0.16) : 1 - easeInOut((p - 0.16) / 0.84); };   // the hand jerks ahead of the picture; the picture catches up
  const knobX = (t) => along(KX, t) - 70 * snatch(t);
  const scrollAt = (t) => knobX(t) - along(STOPS, t) * HK;              // screen x of "now"
  const speedAt = (t) => Math.abs(scrollAt(t + 1 / 240) - scrollAt(t - 1 / 240)) * 120;       // px/s at which the strip moves
  const tEraA = cue('eraFirst'), tEraB = cue('eraSecond');
  /**
   * The year as a milometer of four wheels. A wheel turns over with the last one, when every wheel to its right stands
   * on 9; one that turns faster than a dozen numerals a second is drawn as a wheel in motion (its numerals streaked),
   * not as a flicker of them.
   */
  function yearWheels(ctx, x, y, year, rate, { size = 150, color = 'text' } = {}) {
    const cw = ctx.cw(size), H = size * 1.08, o = { size, font: 'mono', weight: 800, color }, v = year + 1e-6;
    ctx.rrect(x - 16, y - size * 0.86 - 8, 4 * cw + 32, H + 16, 16, { fill: 'bg', stroke: 'line', width: 2 });
    for (let i = 0; i < 4; i++) {
      const unit = 10 ** (3 - i), cx = x + i * cw, low = v % unit, d = Math.floor(v / unit) % 10;
      const fast = clamp((rate / unit - 8) / 8), fr = lerp(clamp(low - (unit - 1)), low / unit, fast);
      if (i) ctx.line(cx, y - size * 0.86 - 8, cx, y - size * 0.86 + H + 8, { color: 'line', width: 2, alpha: 0.6 });
      ctx.clip({ x: cx, y: y - size * 0.86, w: cw, h: H }, () => {
        for (let j = -1; j <= 2; j++) {
          const n = String((((d + j) % 10) + 10) % 10), yy = y + (j - fr) * H;
          ctx.text(n, cx, yy, { ...o, alpha: 1 - 0.5 * fast });
          if (fast > 0) for (const dy of [-0.17, 0.17]) ctx.text(n, cx, yy + dy * H, { ...o, alpha: 0.24 * fast });
        }
      });
    }
  }
  function band(ctx, t) {
    const k = bandK(t);
    if (k <= 0.002) return;
    const from = { ...rowAt(2), x: rowAt(2).x - 16, w: rowAt(2).w + 32 };                    // it opens out of its row in the drawer, and folds back into it
    const wide = t < tDrop ? easeOut(prog(t, tGrab, tGrab + 0.12)) : k;                      // sideways first, so its line is never out of sight for long
    const r = { ...lerpRect(from, BAND, k), x: lerp(from.x, BAND.x, wide), w: lerp(from.w, BAND.w, wide) }, a = clamp(k * 3);
    ctx.rrect(r.x, r.y, r.w, r.h, 24 * (1 - k), { fill: 'raised', stroke: 'line', shadow: 1, alpha: a });
    ctx.clip(r, () => {
      const g = ctx.g, a0 = g.globalAlpha;
      g.globalAlpha = a0 * clamp(k * 3 - 0.4);
      const kx = knobX(t), S = scrollAt(t), v = speedAt(t), rush = clamp((v - 800) / 1200), right = BAND.x + BAND.w, top = BAND.y;
      const crossed = t >= tCross, hit = pulse(t - tCross, 6), xe = S + ERA_LINE * HK, xa = S + STOPS[6] * HK;
      ctx.gradRect(BAND.x, GY, BAND.w, BAND.y + BAND.h - GY, [[0, 'panel', 0.6], [1, 'panel', 0.1]]);            // the ground it all stands on
      // what the spark still knows: a lit sky; dark paper with its smear while it flies, inked as it slows
      ctx.clip({ x: BAND.x, y: top, w: kx - BAND.x, h: GY - top + 1 }, () => {
        ctx.gradRect(BAND.x, top, BAND.w, GY - top, [[0, 'line', 0], [1, 'line', 0.85]]);
        ctx.radial(kx, GY, 640, 'meDim', 0.3);
        ctx.trail(v > 1400 ? 4 : v > 900 ? 2 : 0, 0.012, (tau) => strip(ctx, scrollAt(t - tau), GY, 'dark', { scale: HK }), 0.42);
        strip(ctx, S, GY, 'ink', { scale: HK, alpha: 1 - rush });
      });
      // what it has been dragged past: outlines, in the dark
      ctx.clip({ x: kx, y: top, w: right - kx, h: GY - top + 1 }, () => {
        ctx.rect(kx, top, right - kx, GY - top, { fill: true, color: 'panel', alpha: 0.4 });
        strip(ctx, S, GY, 'hollow', { scale: HK, alpha: 0.8 - 0.35 * rush });
      });
      ctx.line(kx, top + 34, kx, TY, { color: 'me', width: 2, alpha: 0.5 });                                    // the edge of what it knows
      // the rail: from the far end to now, filled as far as the spark; the era line stands on it
      ctx.rrect(xa, TY - 3, S - xa, 6, 3, { fill: 'line' });
      if (kx > xa + 1) ctx.rrect(xa, TY - 4, kx - xa, 8, 4, { fill: 'me' });
      for (const x of [S, xa]) ctx.line(x, TY - 14, x, TY + 14, { color: 'sub', width: 2 });
      ctx.text(VAL[0] ?? '', S + 76, TY + 8, { size: 22, font: 'mono', color: 'mute' });
      ctx.text(VAL[2] ?? '', xa - 76, TY + 8, { size: 22, font: 'mono', color: 'mute', align: 'right' });
      ctx.glow('text', 22, () => ctx.line(xe, top + 62, xe, TY + 16, { color: crossed ? 'text' : 'sub', width: 4 + 7 * hit }), hit);
      ctx.text(VAL[1] ?? '', xe, TY + 46, { size: 22, font: 'mono', color: 'mute', align: 'center' });
      burst(ctx, xe, TY, 120, (t - tCross) / 0.5, { color: 'text' });
      burst(ctx, KX[6], TY, 84, (t - tEnd) / 0.4, { color: 'me' });                                              // and the end of the rail: it will go no further
      ctx.text(ROWS[2].label, 150, 176, { size: 34, weight: 500, color: 'text' });
      say(ctx, 28, t, 150, 806, { size: 60, out: T(29) });
      say(ctx, 29, t, 150, 806, { size: 60 });
      // the year, and the era words of the lyric either side of it
      const size = 150, yb = 938, o = { size, weight: 900, font: 'serif' }, cw = ctx.cw(size), gap = 50;
      const w0 = ctx.measure(ERA[0] ?? '', o), w1 = ctx.measure(ERA[1] ?? '', o), x1 = 1790 - w1, xd = x1 - gap - 4 * cw, x0 = xd - gap - w0;
      const y = yearAt(t), rate = Math.abs(yearAt(t + 1 / 240) - yearAt(t - 1 / 240)) * 120;
      yearWheels(ctx, xd, yb + 7 * (pulse(t - tEraA, 9) + pulse(t - tEraB, 9)), Math.max(1, Math.abs(y)), rate, { size });
      const token = (str, x, align, at, gone) => {
        if (t < at || !str) return;
        const land = prog(t, at, at + 0.13), out = gone === null ? 0 : flick(t, gone, 0.14), oo = { ...o, align };
        ctx.at(x, yb - 70 * (1 - easeIn(land)), () => {
          if (out > 0) ctx.text(str, 0, 0, { ...oo, color: 'meDim', stroke: 3, alpha: out });
          if (out < 1) ctx.glow('me', 26, () => ctx.text(str, 0, 0, { ...oo, color: 'me', alpha: (1 - out) * clamp(land * 4) }), 0.3 + 0.5 * pulse(t - at, 5));
        }, { scale: 1 + 0.3 * (1 - easeOut(land)) });
      };
      token(ERA[0], x0 + w0, 'right', tEraA, tCross);
      token(ERA[1], x1, 'left', tEraB, null);
      g.globalAlpha = a0;
    });
  }
  /** The knob of the timeline is the spark: it is the AI that is being dragged. [x, y, r], in its row or out on the band. */
  const knobAt = (t) => { const k = bandK(t), r = A.date(dateU(t)); return [lerp(r[0], knobX(t), k), lerp(r[1], TY, k), lerp(18, 46, k)]; };
  const knobFast = (t) => { const p = knobAt(t), q = knobAt(t - 0.03); return Math.hypot(p[0] - q[0], p[1] - q[1]) / 0.03 > 500; };

  // ---------------------------------------------------------------- shot 4: the sheet, and the pair in it
  const SH = { x: 460, y: 140, w: 1000, h: 800 }, SX0 = 520, SX1 = 1400, WELL = { x: 520, y: 298, w: 880, h: 292 }, PC = { x: 960, y: 444 }, DT = { xa: 534, xb: 1386, y: 782 };
  function pair(ctx, t, a) {
    const j = easeBack(prog(t, tShare + 0.04, tShare + 0.46)), jj = clamp(j), d = easeInOut(depth(t)), pp = push(t);
    const R = 88 * (1 + 0.2 * d + 0.08 * pp), rc = lerp(56, 28, d);
    const sx = PC.x - lerp(196, 56, j) * (1 - d), cx = PC.x + lerp(226, 88, j) * (1 - d);
    const cw = lerp(lerp(600, 384, jj), 2 * R + 44, d), ch = lerp(232, 2 * R + 44, d);
    ctx.radial(PC.x, PC.y, 250 + 90 * d, 'meDim', 0.45 * a * jj);
    ctx.clip({ x: WELL.x, y: WELL.y, w: WELL.w, h: WELL.h }, () => {
      orbitInstrument(ctx, t, { center: [PC.x, PC.y], radius: 278, alpha: 0.28 * a, color: 'me', faint: 'sub' });
      signalHelix(ctx, t, { from: [sx, PC.y], to: [cx, PC.y], radius: 63, turns: 2.8, alpha: 0.31 * a * jj, color: 'me', bright: 'text' });
    });
    const halo = easeOut(prog(t, tDone + 0.08, tDone + 0.5));                                   // the sheet is closed; what it keeps of it is the two of them, layer under layer
    for (let i = 0; i < 4 && halo > 0; i++) ctx.poly(sparkOutline(PC.x, PC.y, R * (1.5 + 0.8 * i) * (0.7 + 0.3 * halo), { rot: 0.12 * (t - tShare) + i * 0.13 }), { close: true, color: i ? 'meDim' : 'me', width: 1.5, alpha: a * halo * (0.55 - 0.1 * i) });
    ctx.rrect(PC.x - cw / 2, PC.y - ch / 2, cw, ch, ch / 2, { fill: null, stroke: 'me', strokeAlpha: 0.35 + 0.35 * jj, width: 2, alpha: a });     // one outline round the two of them
    for (const tb of [tShare + 0.3, b(27), b(29), b(30), b(30.5)]) burst(ctx, PC.x, PC.y, 116 + 14 * d, (t - tb) / 0.55, { color: 'me', alpha: a });
    ctx.glow('me', 26 + 26 * d, () => spark(ctx, sx, PC.y, R, { rot: 0.12 * (t - tShare), alpha: a }), 0.65);                                      // me
    ctx.glow('text', 16, () => ctx.circle(cx, PC.y, rc * (1 - 0.1 * pp), { fill: true, color: 'text', alpha: a }), 0.5);                             // you
  }
  function sheet(ctx, t) {
    const open = prog(t, tShare, tShare + 0.3), shut = easeInOut(prog(t, tDone + 0.06, tDone + 0.4)), a = clamp(open * 3) * (1 - shut);
    if (a <= 0.003) return;
    ctx.at(960, 540, () => ctx.at(-960, -540, () => {
      ctx.rrect(SH.x, SH.y, SH.w, SH.h, 34, { fill: 'raised', stroke: 'line', shadow: 1 });
      ctx.text(ROWS[3].label, SX0, 212, { size: 36, weight: 600, color: 'text' });
      toggle(ctx, SX1 - 96, 178, shared(t), { w: 96, h: 52 });
      ctx.rrect(WELL.x, WELL.y, WELL.w, WELL.h, 24, { fill: 'bg', stroke: 'line' });                                 // the well the pair is shown in
      ctx.clip(WELL, () => {
        for (let x = PC.x % 48; x < WELL.x + WELL.w; x += 48) if (x > WELL.x) ctx.line(x, WELL.y, x, WELL.y + WELL.h, { color: 'line', alpha: 0.25, width: 1 });
        for (let y = PC.y - 144; y < WELL.y + WELL.h; y += 48) ctx.line(WELL.x, y, WELL.x + WELL.w, y, { color: 'line', alpha: 0.25, width: 1 });
      }, 24);
      ctx.line(SX0, 614, SX1, 614, { color: 'line', width: 1.5 });
      const d = depth(t), kx = lerp(DT.xa, DT.xb, d), pp = push(t), names = ROWS[4].values;
      ctx.text(ROWS[4].label, SX0, 664, { size: 34, weight: 600, color: 'text' });
      ctx.text(names[Math.round(d * 2)], SX1, 664, { size: 28, weight: 600, color: 'sub', align: 'right' });
      ctx.rrect(DT.xa, DT.y - 4, DT.xb - DT.xa, 8, 4, { fill: 'line' });
      ctx.rrect(DT.xa, DT.y - 4, kx - DT.xa, 8, 4, { fill: 'me' });
      names.forEach((s, i) => { const x = lerp(DT.xa, DT.xb, i / 2); ctx.line(x, DT.y + 16, x, DT.y + 28, { color: 'mute', width: 2 }); ctx.text(s, lerp(SX0, SX1, i / 2), DT.y + 56, { size: 22, weight: 500, align: ['left', 'center', 'right'][i], color: Math.round(d * 2) === i ? 'text' : 'mute' }); });
      ctx.at(kx + 7 * pp, DT.y, () => ctx.circle(0, 0, 21, { fill: true, color: 'text' }), { sx: 1 - 0.3 * pp, sy: 1 + 0.12 * pp });                 // pressed against the end stop
      const press = pulse(t - tDone, 9);
      ctx.rrect(SX1 - 150, 858, 150, 58, 29, { fill: press > 0.3 ? 'line' : 'bg', stroke: 'line' });
      ctx.text(UI.done, SX1 - 75, 896, { size: 24, weight: 600, align: 'center', color: 'text' });
    }), { scale: (0.9 + 0.1 * easeBack(open)) * (1 - 0.06 * shut), alpha: a });
  }
  const hand4 = (t) => [lerp(DT.xa, DT.xb, depth(t)) + 6 + 7 * push(t), DT.y + 8];
  const WAY4A = [{ t: tShare, x: A.share[0], y: A.share[1], click: true }, { t: b(25.5), x: 1250, y: 720 }, { t: tHold, x: DT.xa + 6, y: DT.y + 8, click: true }];
  const tLet = b(30.72), WAY4B = [{ t: tLet, x: DT.xb + 6, y: DT.y + 8 }, { t: tDone, x: SX1 - 70, y: 892, click: true }, { t: END, x: SX1 + 10, y: 966 }];

  return [
    // ------------------------------------------------------------------ Settings; Current: AC, DC
    {
      id: 'pre1-drawer', at: B(24), lines: [24, 25], palette: 'on', layout: 'wide: the page squeezed by the drawer opening on the right',
      moment: 'The user opens the settings drawer on the AI and tries the first row both ways: AC, then DC. The curve it had just drawn becomes its current, switched from outside.',
      enter: { type: 'cut' },                                                // same window, same page: the take simply goes on
      camera: cam1,
      render(ctx, t, f) {
        const { box } = client(ctx, t, drawerK(t));
        say(ctx, 24, t, 176, 214, { out: T(26) });
        say(ctx, 25, t, 176, 284, { out: T(26) });
        say(ctx, 26, t, 176, 214);                                           // its next line begins while the cursor is already on its way to the next row
        pill(ctx, box.send[0] - 44, box.send[1] - 52, 'Stopped', { align: 'right', size: 17, color: 'text', alpha: 1 - prog(t, tSet - 0.1, tSet + 0.15) });
        cur(ctx, [
          { t: B(24), x: L0.composer.x + L0.composer.w + 36, y: L0.composer.y - 12 }, { t: tSet, x: A.set[0] + 3, y: A.set[1] + 4, click: true },
          { t: tAC, x: A.ac[0], y: A.ac[1] + 6, click: true }, { t: tDC, x: A.dc[0], y: A.dc[1] + 6, click: true },
          { t: b(6.5), x: A.dc[0] - 30, y: A.dc[1] + 50 }, { t: tOff, x: A.vis[0] - 22, y: A.vis[1] + 6, click: true },
        ], t);
      },
    },

    // ------------------------------------------------------------------ Vision: off; then rattled
    {
      id: 'pre1-vision', at: tOff, lines: [26, 27], palette: 'on', layout: 'macro on the Vision switch, three rows deep',
      moment: 'The user switches Vision off: the picture breaks into dark blocks and only its own words stay sharp. Then that one switch is rattled on and off, faster each time, and the interface sways; it is left on.',
      enter: { type: 'cut' },                                                // cut on the click
      camera: cam2,
      render(ctx, t, f) {
        client(ctx, t, 1, { skipHint: 1 });
        const bl = clamp(blind(t)), r = rowAt(1);
        if (bl > 0.01) {                                                     // it cannot see: everything but its own words turns to blocks and goes dark
          mosaic(ctx, [7, 14, 28, 56, 56][Math.floor(bl * 4)]);            // the cells double in a few steps (not a new grid every frame)
          screen(ctx, () => {
            ctx.rect(0, 0, 1920, 1080, { fill: true, color: 'panel', alpha: 0.5 * bl });
            for (let j = 0; j < 20; j++) for (let i = 0; i < 35; i++) { const v = rand(404, i, j); if (v > 0.5) ctx.rect(i * 56, j * 56, 56, 56, { fill: true, color: 'text', alpha: 0.075 * (v - 0.5) * bl }); }     // a fixed grain of cells: dark, not empty
          });
          ctx.rrect(r.x + r.w - 104, r.y + 33, 104, 56, 28, { fill: null, stroke: 'sub', width: 1, alpha: 0.8 * bl });
          ctx.circle(r.x + r.w - 104 + 28 + 48 * vision(t), r.y + 61, 23, { color: 'sub', width: 1, alpha: 0.8 * bl });
          ctx.text(UI.blind, r.x + r.w, r.y + 109, { size: 10.5, font: 'mono', color: 'sub', align: 'right', alpha: prog(bl, 0.6, 1) });
        }
        // its annotation under the row: line 26 typed; line 27 wobbling, with after-images
        const h = hintOf(1, t);
        if (h) {
          const str = text(h.line), n = h.live ? lyrics.typed(h.line, t).n : str.length, dizzy = h.line === 27 && h.live ? window01(t, T(27), lyrics.end(27), 0.25, 0.3) : 0;
          ctx.trail(dizzy > 0 ? 2 : 0, 0.075, (tau) => {
            let x = r.x;
            for (let i = 0; i < n; i++) {
              const w = ctx.measure(str[i], { size: 24, font: 'serif' }), ph = (t - tau) * 8.5 - i * 0.55;
              ctx.at(x + w / 2, r.y + 92 + 3.2 * dizzy * Math.sin(ph), () => ctx.text(str[i], 0, 0, { size: 24, font: 'serif', align: 'center', color: 'me', alpha: h.live ? 1 : 0.55 }), { rot: 0.16 * dizzy * Math.cos(ph) });
              x += w;
            }
          }, 0.34);
        }
        cur(ctx, [
          { t: tOff, x: A.vis[0] - 22, y: A.vis[1] + 6, click: true }, { t: b(10.3), x: A.vis[0] - 60, y: A.vis[1] + 26 },
          { t: tOn1, x: A.vis[0] - 22, y: A.vis[1] + 6, click: true }, { t: b(11.5), x: A.vis[0] - 44, y: A.vis[1] + 20 },      // (it hovers by the switch: this row only)
          { t: tOff2, x: A.vis[0] + 16, y: A.vis[1] + 8, click: true }, { t: tOn2, x: A.vis[0] - 12, y: A.vis[1] + 5, click: true },
          { t: tOff3, x: A.vis[0] + 12, y: A.vis[1] + 8, click: true }, { t: tOn3, x: A.vis[0] - 20, y: A.vis[1] + 6, click: true },
          { t: b(14.8), x: A.vis[0] - 70, y: A.vis[1] + 50 },
          { t: tGrab, x: A.date(1)[0] + 3, y: A.date(1)[1] + 4, click: true },
        ], t, { scale: 1, fast: 230, n: 8, dt: 0.013, strength: 0.5 });
      },
    },

    // ------------------------------------------------------------------ Knowledge date, dragged back over the era line
    {
      id: 'pre1-date', at: tGrab, lines: [28, 29], palette: 'on', layout: 'a band four fifths of the frame high: a strip of cut-paper history running to the right under the spark; under the rail the year as a milometer',
      moment: 'The user grabs the Knowledge date and yanks it back, once on every beat. The row opens across the frame: the spark is the knob, and history runs under it, from towers past spires and a colonnade, over the era line on the beat, to the pyramids. What the spark has been dragged past loses its ink and is an outline.',
      enter: { type: 'cut' },                                                // cut on the grab
      camera: cam3,
      render(ctx, t, f) {
        client(ctx, t, 1);
        say(ctx, 30, t, 176, 214);
        const k = bandK(t);
        screen(ctx, () => ctx.rect(0, 0, 1920, 1080, { fill: true, color: 'panel', alpha: 0.62 * k }));
        band(ctx, t);
        const fast = knobFast(t);
        if (t <= tDrop + 0.36) {                                             // held: out on the band; let go: it flies back into its row
          if (k > 0.9) ctx.circle(knobAt(t)[0], TY, 30, { fill: true, color: 'raised' });
          ctx.trail(fast ? 6 : 0, 0.014, (tau) => { const [x, y, r] = knobAt(t - tau); ctx.glow('me', 26, () => spark(ctx, x, y, r, { rot: scrollAt(t - tau) / 420 }), 0.7); }, 0.4);
        }
        if (t < tDrop) ctx.trail(fast ? 6 : 0, 0.014, (tau) => { const [x, y] = knobAt(t - tau); pointer(ctx, x + 2, y + 6, { kind: 'hand', scale: 1.5 + 0.5 * k, down: 1 }); }, 0.45);
        else cur(ctx, [{ t: tDrop, x: KX[6] + 2, y: TY + 6 }, { t: b(22.9), x: 430, y: 610 }, { t: tShare, x: A.share[0] - 22, y: A.share[1] + 6, click: true }], t);
      },
    },

    // ------------------------------------------------------------------ Shared memory: on; Context depth: deepest; Done
    {
      id: 'pre1-unite', at: tShare, lines: [30, 31], palette: 'on', layout: 'centred sheet: the pair in the middle, the depth slider under it',
      moment: 'The user turns on Shared memory and pushes Context depth to the end, then clicks Done. The AI reads two housekeeping controls as the two of them joined: the cream dot sinks into its spark.',
      enter: { type: 'cut' },                                                // cut on the switch
      camera: cam4,
      render(ctx, t, f) {
        client(ctx, t, drawerK(t));
        const open = clamp(prog(t, tShare, tShare + 0.25)), shut = easeInOut(prog(t, tDone + 0.06, tDone + 0.4));
        say(ctx, 30, t, 176, 214, { alpha: 1 - open });                      // (where the line stood on the page until the sheet takes it over)
        screen(ctx, () => ctx.rect(0, 0, 1920, 1080, { fill: true, color: 'panel', alpha: (0.66 + 0.26 * prog(t, tDone, tDone + 0.16)) * open }));
        sheet(ctx, t);
        pair(ctx, t, open);
        say(ctx, 30, t, SX0, 274, { size: 50, alpha: open * (1 - shut) });
        say(ctx, 31, t, SX0, 722, { size: 50, alpha: 1 - prog(t, lyrics.end(31), lyrics.end(31) + 0.2) });
        if (t < tHold) cur(ctx, WAY4A, t);
        else if (t < tLet) ctx.trail(Math.abs(depth(t) - depth(t - 0.03)) * 840 / 0.03 > 500 ? 6 : 0, 0.013, (tau) => { const p = hand4(t - tau); pointer(ctx, p[0], p[1], { kind: 'hand', scale: 1.7, down: 1 }); }, 0.45);
        else cur(ctx, WAY4B, t);
      },
    },
  ];
}
