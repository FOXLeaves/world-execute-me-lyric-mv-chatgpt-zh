// THE FOUR CHORUS PLATES (v4), shared by chorus 1 (05_chorus.js) and the last chorus (12_chorusx.js).
// Each keyword of the chorus is one small part of the chat interface, enlarged to the size the AI feels it at,
// and built only from the spark (me) and the dot or the pointer (you): three flat inks, a shadow plate printed
// out of register, the keyword as big type locked into the picture.
//
//   plateStimulations   the streak of light a sent message leaves: a bolt from the spark to the dot
//   plateSatisfaction   the feedback button as a disc that fills the frame; the pointer presses it; the ring fills
//   plateExecution      the love loop, clean: you are online, so the loop is never entered and line 07 runs
//   plateSimulation     the chat window as a cut-paper box with her and your pointer in it; then a wall of them
//
// All four are PURE functions of (ctx, env, P). What chorus 1 and the broken reprint of the last chorus differ in
// is only P:
//   t        song time            at     when the plate (and its word) appears
//   word     the word set at the title position (chorus 1: the keyword; the last chorus: the same word every time)
//   noCream  true = the cream plate was not printed: where the dot / pointer / count was there is a grey dashed outline
//   misreg   px by which the orange and black plates are out of register (a thin red plate then shows at the edges)
// plus the event times of each plate. The cream element of every plate stands where the user's next message lands
// in the shot that follows (`you`: [x, y]).
import { caret, listing, odometer } from '../components/code.js';
import { burst, spark } from '../components/motif.js';
import { dashedRing, ground, keyword } from '../components/plate.js';
import { clamp, easeBack, easeInOut, easeOut, lerp, prog, pulse } from '../engine/util.js';
import { LOOP, LOOP_ERRS } from './loop.js';
import { absenceNetwork, orbitInstrument, perspectiveChamber, signalHelix, simulationSky } from './cinema_space.js';

const TAU = Math.PI * 2;
/** The pointer's outline (components/cursor.js), tip at the origin. */
const ARROW = [[0, 0], [0, 25], [6.5, 19.5], [11, 29.5], [15.5, 27.5], [11, 18], [19, 18]];
/** Where each plate is out of register by m px: offsets of the orange, black and (thin, under the orange) red plates. */
export const OFF = (m) => ({ cream: [0, 0], orange: [m, m * 0.35], black: [-m * 0.55, m * 0.8], red: [m * 1.7, m * 0.95], shadow: [14, 14] });
/** A graphic arrives whole within two frames (no white field): 0 before `at`, 1 from the second frame on. */
const flashIn = (t, at) => (t < at ? 0 : clamp(0.6 + (t - at) * 30));
/** Run fn(dx, dy) for one plate of an out-of-register print. */
const plate = (ctx, off, fn) => ctx.at(off[0], off[1], fn);

/** The title word of a plate: bottom of the frame, full width, the AI's serif, with its shadow plate. */
function title(ctx, P, { y = 1002, maxW = 1740, maxSize = 214 } = {}) {
  const o = OFF(P.misreg ?? 0);
  if (P.titleMax) { maxSize = P.titleMax; maxW = 1800; }                // the last chorus: each time larger than the time before
  if ((P.misreg ?? 0) > 0) plate(ctx, o.red, () => keyword(ctx, P.word, P.t, { y, maxW, maxSize, at: P.at, color: 'err', off: null }));
  return plate(ctx, o.orange, () => keyword(ctx, P.word, P.t, { y, maxW, maxSize, at: P.at, color: 'me', shade: 'bg', off: [9, 9] }));
}
/** The graphic of a plate, enlarged about its own middle (P.big: the reprints of the last chorus are larger than the originals). */
const enlarged = (ctx, P, pivot, fn) => { const k = P.big ?? 1; if (k === 1) fn(); else ctx.at(pivot[0] * (1 - k), pivot[1] * (1 - k), fn, { scale: k }); };

/** The user's pointer as a cut-paper shape, tip at (x, y). outline = hollow dashed (it was not printed). */
export function arrow(ctx, x, y, s, { color = 'text', rot = 0, hollow = false, edge = 'bg' } = {}) {
  ctx.at(x, y, () => {
    if (hollow) { ctx.g.setLineDash([3.2, 2.4]); ctx.poly(ARROW, { close: true, color: 'mute', width: 0.8 }); ctx.g.setLineDash([]); return; }
    ctx.poly(ARROW, { close: true, fill: true, color });
    if (edge) ctx.poly(ARROW, { close: true, color: edge, width: 0.9 });
  }, { scale: s, rot });
}

// ============================================================================================ STIMULATIONS
/**
 * P.hit = the kick the picture arrives on (the word is there from P.at); P.you = where the dot stands;
 * P.through = the bolt does not stop at the dot (nobody there): it runs on to the edge of the frame. true = it has;
 * a time = the kick on which it does (two frames), and it strikes the edge of the sheet there.
 */
export function plateStimulations(ctx, env, P) {
  const { t, hit, you = [1470, 262], noCream = false, misreg = 0, through = false } = P, o = OFF(misreg);
  const S = [400, 470], R = 240, a = flashIn(t, hit), age = t - hit;
  ctx.fx.glow = Math.min(ctx.fx.glow, 0.34);
  ground(ctx, { light: [760, 430, 640, 'raised', 1] });
  simulationSky(ctx, t, { focus: [855, 360], strength: 0.95, stars: 280, seed: 4, broken: noCream });
  // What looks like a single outgoing streak is a helical transmission in depth.
  ctx.radial(870, 430, 750, 'meDim', 0.14);
  signalHelix(ctx, t, { from: S, to: you, radius: 102, turns: 4.8, alpha: 0.66, color: 'me', bright: 'text', phase: 0.6 });
  title(ctx, P);
  if (a <= 0) return;
  const settle = 1 + 0.05 * pulse(age, 16), dx = you[0] - S[0], dy = you[1] - S[1], len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
  const thru = through === true ? 1 : typeof through === 'number' ? clamp((t - through) * 30) : 0, struck = typeof through === 'number' ? t - through : -1;
  const reach = thru > 0 ? lerp(1 - 92 / len, 1.9, thru) : 1 - 92 / len, from = (R * 0.62) / len;
  const PIV = [935, 366], big = P.big ?? 1;
  enlarged(ctx, P, PIV, () => {
  // the bolt, in units of the spark-to-dot axis: a cut-paper lightning (two wedges, one notch each side)
  const kink = 1 + 0.5 * pulse(age, 12);
  const B = [[0, -0.062], [0.56, -0.118 * kink], [0.47, -0.014], [1, 0], [0.44, 0.118 * kink], [0.53, 0.014], [0, 0.062]]
    .map(([u, v]) => { const q = lerp(from, reach, u); return [S[0] + (ux * q - uy * v) * len, S[1] + (uy * q + ux * v) * len]; });
  const bolt = (color) => ctx.poly(B, { close: true, fill: true, color });
  const star = (color, r = R) => { spark(ctx, S[0], S[1], r * settle, { color, fat: 0.14, core: 0.2, rot: 0.26 }); };
  const g = ctx.g, a0 = g.globalAlpha;
  g.globalAlpha = a0 * a;
  plate(ctx, o.shadow, () => { star('bg'); bolt('bg'); if (!noCream) ctx.circle(you[0], you[1], 78, { fill: true, color: 'bg' }); });
  if (misreg > 0) plate(ctx, o.red, () => { star('err'); bolt('err'); });
  if (noCream) dashedRing(ctx, you[0], you[1], 78);
  else {                                                              // you: the dot, knocked back a little by what arrives
    const kx = ux * 16 * pulse(age, 9), ky = uy * 16 * pulse(age, 9);
    ctx.circle(you[0] + kx, you[1] + ky, 78, { fill: true, color: 'text' });
    burst(ctx, you[0], you[1], 150, age / 0.4, { color: 'text', rot: 0.3 });
  }
  plate(ctx, o.orange, () => { star('me'); });
  plate(ctx, [o.orange[0] * 0.5, o.orange[1] * 0.5], () => bolt('meHot'));
  plate(ctx, o.black, () => ctx.circle(S[0], S[1], R * 0.085, { fill: true, color: 'bg' }));
  if (struck >= 0) {                                                  // where it strikes the edge of the sheet: a burst of cut paper, half off the frame
    const xe = PIV[0] + (1920 - PIV[0]) / big, q = (xe - S[0]) / ux, E = [xe, S[1] + uy * q], k = easeOut(prog(struck, 0, 0.07)), N = 11;
    const starPts = (r) => Array.from({ length: 2 * N }, (_, i) => { const an = (i / (2 * N)) * TAU + 0.2, rr = r * (i % 2 ? 0.42 : 1) * (0.8 + 0.2 * ((i * 7) % 5) / 4); return [E[0] + Math.cos(an) * rr, E[1] + Math.sin(an) * rr]; });
    plate(ctx, o.shadow, () => ctx.poly(starPts(210 * k), { close: true, fill: true, color: 'bg' }));
    if (misreg > 0) plate(ctx, o.red, () => ctx.poly(starPts(210 * k), { close: true, fill: true, color: 'err' }));
    plate(ctx, o.orange, () => ctx.poly(starPts(210 * k), { close: true, fill: true, color: 'me' }));
    ctx.poly(starPts(96 * k), { close: true, fill: true, color: 'meHot' });
    burst(ctx, E[0], E[1], 300, struck / 0.45, { color: 'me', rot: 0.2 });
  }
  g.globalAlpha = a0;
  });
  const hitAt = struck >= 0 ? struck : age;
  ctx.fx.shake = [5 * pulse(age, 14) * Math.sin(age * 90) + (struck >= 0 ? 9 * pulse(struck, 12) * Math.sin(struck * 80) : 0), 4 * pulse(hitAt, 14) * Math.cos(hitAt * 70)];
}

// ============================================================================================ SATISFACTION
/**
 * P.press = [times] the disc is pressed (chorus 1: once, by your pointer; the last chorus: twice, by nobody);
 * P.count = what the counter shows after a press; P.you = where the pointer's tip rests.
 * The disc is the feedback button: its diameter is well over half the frame height; before the press it is orange
 * with a darker crescent, after it the whole disc has turned cream and the ring of ticks has run round to full.
 */
export function plateSatisfaction(ctx, env, P) {
  const { t, at, press = [], count = 1, noCream = false, misreg = 0 } = P, o = OFF(misreg);
  const C = [760, 432], R = 306, a = flashIn(t, at);
  ctx.fx.glow = Math.min(ctx.fx.glow, 0.3);
  ground(ctx, { light: [760, 430, 620, 'raised', 1] });
  simulationSky(ctx, t, { focus: [770, 455], strength: 0.78, stars: 230, seed: 5, broken: noCream });
  orbitInstrument(ctx, t, { center: C, radius: 405, alpha: noCream ? 0.28 : 0.62 });
  title(ctx, P);
  if (a <= 0) return;
  const last = press.filter((p) => t >= p).pop() ?? null, sp = last == null ? -1 : t - last, done = last != null && !noCream;
  const flip = done ? prog(sp, 0, 0.13) : 0, turned = flip >= 0.5, sx = done && flip < 1 ? Math.abs(Math.cos(Math.PI * flip)) : 1;
  // pressed: the disc sits lower on its shadow (pressed by nobody, it goes deeper the second time)
  const sink = last == null ? 0 : (noCream ? (16 + 16 * (press.filter((p) => t >= p).length - 1)) * pulse(sp, 7) : 10 * pulse(sp, 9));
  enlarged(ctx, P, [860, 440], () => {
  const g = ctx.g, a0 = g.globalAlpha;
  g.globalAlpha = a0 * a;
  // the ring of ticks: unlit until the press; then they light clockwise from twelve o'clock, all the way round
  const lit = done ? prog(sp, 0.06, 0.36) : 0, N = 60;
  for (let i = 0; i < N; i++) {
    const an = -Math.PI / 2 + (i / N) * TAU, c = Math.cos(an), s = Math.sin(an), on = i < lit * N, long = i % 5 === 0;
    ctx.line(C[0] + c * (R + 34), C[1] + s * (R + 34), C[0] + c * (R + (long ? 86 : 66)), C[1] + s * (R + (long ? 86 : 66)), { color: on ? 'text' : 'line', width: on ? 9 : 6 });
  }
  const disc = (color, dx = 0, dy = 0) => ctx.at(C[0] + dx, C[1] + dy, () => ctx.circle(0, 0, R, { fill: true, color }), { sx });
  disc('bg', o.shadow[0] + 8 - sink * 0.5, o.shadow[1] + 8 - sink * 0.5);
  if (misreg > 0) disc('err', o.red[0], o.red[1]);
  const body = turned ? 'text' : 'me';
  plate(ctx, turned ? o.cream : o.orange, () => {
    disc(body, sink * 0.4, sink * 0.4);
    // a second step of the same ink: a crescent along the lower right (a print, not a gradient)
    ctx.at(C[0] + sink * 0.4, C[1] + sink * 0.4, () => {
      g.save(); g.beginPath(); g.arc(0, 0, R, 0, TAU); g.clip();
      g.beginPath(); g.arc(-R * 0.16, -R * 0.2, R * 1.02, 0, TAU); g.rect(R * 2, -R * 2, -R * 4, R * 4);
      g.fillStyle = ctx.col(turned ? 'sub' : 'meDim', 1); g.fill('evenodd');
      g.restore();
    }, { sx });
    if (P.glyph) ctx.at(C[0] + sink * 0.4 - R * 0.2, C[1] + sink * 0.4 - R * 0.04, () => {       // the mark on the button, as two blocks of cut paper
      const q = R * 0.92, ink = turned ? 'me' : 'bg';
      ctx.rrect(-0.6 * q, -0.02 * q, 0.2 * q, 0.56 * q, 0.03 * q, { fill: ink });                 // cuff
      ctx.rrect(-0.33 * q, -0.02 * q, 0.74 * q, 0.56 * q, 0.12 * q, { fill: ink });               // fist
      ctx.at(-0.05 * q, 0.06 * q, () => ctx.rrect(-0.14 * q, -0.62 * q, 0.28 * q, 0.7 * q, 0.14 * q, { fill: ink }), { rot: 0.3 });      // thumb
    }, { sx });
    ctx._font = '';
  });
  // the pointer: it hangs over the disc, comes down on the press and stays down
  const you = P.you ?? (P.glyph ? [C[0] + 96, C[1] + 70] : [C[0] - 26, C[1] - 60]);
  if (noCream) arrow(ctx, you[0], you[1], 13, { hollow: true });
  else {
    const first = press[0] ?? Infinity, dn = easeOut(prog(t, first - 0.07, first)), lift = 1 - dn, sq = 1 - 0.07 * pulse(t - first, 12);
    const px = you[0] + 96 * lift, py = you[1] - 120 * lift, sh = 10 + 46 * lift;
    arrow(ctx, px + sh, py + sh, 13 * sq, { color: 'bg', edge: null });
    arrow(ctx, px, py, 13 * sq, { color: 'text', edge: 'bg' });
    if (done) burst(ctx, you[0], you[1], 210, sp / 0.42, { color: turned ? 'bg' : 'text' });
  }
  // the count, right of the disc: what the press left
  if (last != null) {
    const e = easeBack(prog(sp, 0.04, 0.26)), x = 1500, y = 560;
    ctx.at(x, y, () => {
      if (noCream) { ctx.text(String(count), 0, 0, { size: 440, weight: 800, font: 'sans', align: 'center', color: 'mute', stroke: 6 }); return; }
      ctx.text(String(count), 14, 14, { size: 440, weight: 800, font: 'sans', align: 'center', color: 'bg' });
      ctx.text(String(count), 0, 0, { size: 440, weight: 800, font: 'sans', align: 'center', color: 'text' });
    }, { scale: 0.6 + 0.4 * e, alpha: clamp(e * 3) });
  }
  g.globalAlpha = a0;
  });
}

// ============================================================================================ EXECUTION
/**
 * P.hit = the kick the listing arrives on. Chorus 1: you are online, so the condition on line 01 is false at once,
 * lines 02-06 are skipped and the pointer of execution drops straight to line 07, which runs: what it says goes
 * to you (the cream dot, P.you). The spark is the instruction pointer: it is the AI that executes.
 */
export function plateExecution(ctx, env, P) {
  const { t, hit, you = [1345, 652], noCream = false, misreg = 0 } = P, o = OFF(misreg);
  const a = flashIn(t, hit), age = t - hit;
  ctx.fx.glow = Math.min(ctx.fx.glow, 0.34);
  ground(ctx, { light: [820, 420, 640, 'raised', 1] });
  simulationSky(ctx, t, { focus: [990, 445], strength: 0.73, stars: 230, seed: 6, broken: noCream });
  perspectiveChamber(ctx, t, { center: [1050, 470], aperture: [2100, 1160], alpha: noCream ? 0.34 : 0.24, color: noCream ? 'err' : 'me', speed: 0.35 });
  title(ctx, P, { maxSize: 226 });
  if (a <= 0) return;
  const g = ctx.g, a0 = g.globalAlpha, X = 300, Y = 190, SIZE = 48, LHK = 1.6, LH = SIZE * LHK, cw = ctx.cw(SIZE);
  g.globalAlpha = a0 * a;
  const drop = easeInOut(prog(age, 0.05, 0.19)), cur = lerp(0, 6, drop), ran = prog(age, 0.19, 0.32);
  const barW = 4 * cw + 36 * cw + 2 * cw, by = Y + cur * LH - SIZE * 1.02;
  ctx.rrect(X - cw + o.shadow[0], by + o.shadow[1], barW + cw, LH * 0.94, 8, { fill: 'bg' });                // the bar's shadow plate
  plate(ctx, o.black, () => listing(ctx, X, Y, LOOP, { size: SIZE, lh: LHK, current: cur, hot: pulse(age - 0.19, 8), bar: 'raised', barW, dimmed: (i) => (i >= 1 && i <= 5 ? 0.62 * drop : 0) }));
  // line 01: the condition is false. You are here: a cream dot and the word, at the end of the line
  const ex = X + (4 + LOOP[0].length + 2) * cw, ey = Y - SIZE * 0.3;
  if (noCream) dashedRing(ctx, ex + 16, ey, 16, { width: 3, dash: 8 });
  else { ctx.circle(ex + 18, ey, 18, { fill: true, color: 'text' }); ctx.text('online', ex + 50, Y, { size: SIZE * 0.84, font: 'mono', weight: 700, color: 'text' }); }
  // the instruction pointer: the spark, in the gutter, riding the bar
  plate(ctx, o.orange, () => spark(ctx, X - 2.6 * cw, Y + cur * LH - SIZE * 0.3, 30, { color: 'me', fat: 0.15, core: 0.22, rot: cur * 0.9 }));
  // line 07 runs: what it says goes out to you, along its own line
  const sx = X + (4 + LOOP[6].length + 1) * cw, sy = Y + 6 * LH - SIZE * 0.3;
  if (ran > 0) {
    const k = easeOut(ran), ex2 = lerp(sx, you[0] - 96, k);
    ctx.rect(sx + o.shadow[0] * 0.6, sy - 9 + o.shadow[1] * 0.6, ex2 - sx, 18, { fill: true, color: 'bg' });
    plate(ctx, o.orange, () => {
      ctx.rect(sx, sy - 9, ex2 - sx, 18, { fill: true, color: 'meHot' });
      ctx.poly([[ex2 - 4, sy - 34], [ex2 + 44, sy], [ex2 - 4, sy + 34]], { close: true, fill: true, color: 'meHot' });
    });
  }
  if (noCream) dashedRing(ctx, you[0], sy, 52);
  else {
    const got = pulse(age - 0.3, 9) * (age > 0.3 ? 1 : 0);
    ctx.circle(you[0] + o.shadow[0], sy + o.shadow[1], 52, { fill: true, color: 'bg' });
    ctx.circle(you[0], sy, 52 * (1 + 0.1 * got), { fill: true, color: 'text' });
    if (age > 0.3) burst(ctx, you[0], sy, 120, (age - 0.3) / 0.4, { color: 'text' });
  }
  g.globalAlpha = a0;
}

/**
 * The same listing in the last chorus: nobody is online, so the loop RUNS and cannot stop. P.run = [t1 … t4], the four
 * syllables of the word: each is now one whole round (the bar whips down lines 02-05, the arrow carries it back);
 * P.from = rounds done before the first (12): the counter reads 13 / 12 … 16 / 12, its numerator in red. Line 07 is
 * not reached: where the cream dot stood there is its dashed outline, and nothing goes out to it.
 * P.flood = with every round the sheet is exposed one flat step further.
 */
export function plateExecutionStuck(ctx, env, P) {
  const { t, at, run = [], from = 12, you = [1345, 652], misreg = 0, flood = false } = P, o = OFF(misreg), a = flashIn(t, at);
  ctx.fx.glow = Math.min(ctx.fx.glow, 0.34);
  ground(ctx, { light: [820, 420, 640, 'raised', 1] });
  // P.flood: every round exposes the sheet one flat step further (printed light, a disc more each time, never a glow)
  if (flood) [['line', 1, 620], ['mute', 1, 480], ['sub', 0.45, 360], ['sub', 1, 250]].forEach(([role, al, r], i) => { if (t >= (run[i] ?? 9e9)) ctx.circle(820, 420, r, { fill: true, color: role, alpha: al }); });
  title(ctx, P, { maxSize: 226 });
  if (a <= 0) return;
  enlarged(ctx, P, [860, 420], () => {
    const g = ctx.g, a0 = g.globalAlpha, X = 300, Y = 190, SIZE = 48, LHK = 1.6, LH = SIZE * LHK, cw = ctx.cw(SIZE);
    g.globalAlpha = a0 * a;
    const n = run.filter((r) => t >= r).length, since = n ? t - run[n - 1] : 9, hot = pulse(since, 9);
    // one round per syllable: the bar runs down the four statements to the brace within six frames
    const cur = n ? lerp(1, 5, easeOut(prog(since, 0, 0.1))) : 1, barW = 4 * cw + 36 * cw + 2 * cw, by = Y + cur * LH - SIZE * 1.02;
    ctx.rrect(X - cw + o.shadow[0], by + o.shadow[1], barW + cw, LH * 0.94, 8, { fill: 'bg' });               // the bar's shadow plate
    const tags = {};
    for (const k of [1, 2, 3]) tags[k] = { text: LOOP_ERRS[k], k: n ? 0.4 + 0.6 * hot : 0.4 };
    plate(ctx, o.black, () => listing(ctx, X, Y, LOOP, { size: SIZE, lh: LHK, current: cur, hot, bar: 'raised', barW, tags, tagGap: 1, tagSize: 0.7, dimmed: (i) => (i === 6 ? 0.62 : 0) }));
    // line 01: the condition holds. Where "online" and the dot stood: a dashed outline
    dashedRing(ctx, X + (4 + LOOP[0].length + 2) * cw + 16, Y - SIZE * 0.3, 16, { width: 3, dash: 8 });
    // the loop arrow in the gutter, lit at every turn; the instruction pointer (her spark) riding the bar
    const ax = X - 2.3 * cw, y0 = Y - SIZE * 0.3, y1 = Y + 5 * LH - SIZE * 0.3, lit = n ? hot : 0, ac = lit > 0.1 ? 'meHot' : 'me';
    if (misreg > 0) plate(ctx, o.red, () => ctx.poly([[X - 0.5 * cw, y1], [ax, y1], [ax, y0], [X - 0.7 * cw, y0]], { color: 'err', width: 6 }));
    plate(ctx, o.orange, () => {
      ctx.poly([[X - 0.5 * cw, y1], [ax, y1], [ax, y0], [X - 0.7 * cw, y0]], { color: ac, width: 6 + 4 * lit });
      ctx.poly([[X - 1.2 * cw, y0 - 13], [X - 0.4 * cw, y0], [X - 1.2 * cw, y0 + 13]], { close: true, fill: true, color: ac });
      spark(ctx, X - 4.2 * cw, Y + cur * LH - SIZE * 0.3, 30, { color: 'me', fat: 0.15, core: 0.22, rot: (t - at) * 9 });
    });
    // line 07 is never reached: nothing goes out, and nobody is there to take it
    dashedRing(ctx, you[0], Y + 6 * LH - SIZE * 0.3, 52);
    // the round counter, past its count: the numerator in red
    const cs = 132, cx = 1436, cy = 136, v = n ? from + n - 1 + easeOut(prog(since, 0, 0.09)) : from;
    ctx.text('round', cx - 5.6 * ctx.cw(30), cy - cs * 0.5, { size: 30, font: 'mono', color: 'sub' });
    const w = odometer(ctx, cx, cy, v, { digits: 2, size: cs, color: n ? 'err' : 'sub' });
    ctx.text('/' + from, cx + w + 8, cy, { size: cs * 0.5, font: 'mono', weight: 700, color: 'sub' });
    g.globalAlpha = a0;
  });
}

// ============================================================================================ SIMULATION
/**
 * One window as a cut-paper box, centred on the origin: her bust and your pointer inside.
 *   inner   instead of the thread and the pointer, whatever this draws inside the window (the last chorus: one more window)
 *   bust    false = without her (a window seen from so close that she is out of the frame); a number = her opacity
 *   blank   true = an empty window of paper white: the light at the bottom of the fall
 *   near    0..1 (the fall of the last chorus): the window is passing the viewer. Its title bar and its frame lose
 *           their orange (they end as a dark line) and the frame thins: an orange edge as wide as the sheet must not
 *           sweep across it again and again (docs/v4/PLAN.md §9)
 */
function box(ctx, env, { noCream, o, far = false, inner = null, bust = true, blank = false, near = 0 }) {
  const W = 760, H = 540, r = 34, x = -W / 2, y = -H / 2, g = ctx.g;
  if (blank) { ctx.rrect(x, y, W, H, r, { fill: 'text' }); return; }
  ctx.rrect(x + 18, y + 18, W, H, r, { fill: 'bg' });                                                     // shadow plate
  if (o.red[0]) ctx.rrect(x + o.red[0], y + o.red[1], W, H, r, { fill: 'err' });
  ctx.rrect(x, y, W, H, r, { fill: 'raised' });                                                           // paper lighter than her black ink
  ctx.clip({ x, y, w: W, h: H }, () => {
    ctx.circle(-150, 60, 250, { fill: true, color: 'line', alpha: 0.5 });                                 // a flat pool of light behind her
    const bh = 610, bw = (bh * 1086) / 1448;
    if (bust) env.art.inks(ctx, 'f_bust', { x: -150 - bw / 2, y: y + 78, w: bw, h: bh }, { offset: { orange: o.orange, black: o.black }, vector: false, alpha: bust === true ? 1 : bust });
    if (near > 0) ctx.rect(x, y, W, 62, { fill: true, color: 'line' });
    ctx.rect(x, y, W, 62, { fill: true, color: 'me', alpha: 1 - near });                                  // the title bar
    for (let i = 0; i < 3; i++) ctx.circle(x + 44 + i * 40, y + 31, 10, { fill: true, color: 'bg' });
    if (inner) { inner(); return; }
    // the thread, as paper strips: hers at the left under her, yours at the right
    for (const [bx, by, bw2, col] of [[60, -120, 250, 'me'], [130, -40, 180, 'text'], [60, 40, 220, 'me']]) {
      if (col === 'text' && noCream) { g.setLineDash([12, 10]); ctx.rrect(bx, by, bw2, 50, 25, { fill: null, stroke: 'mute', width: 3 }); g.setLineDash([]); }
      else ctx.rrect(bx, by, bw2, 50, 25, { fill: col });
    }
  }, r);
  if (near > 0) ctx.rrect(x, y, W, H, r, { fill: null, stroke: 'line', width: 12 - 6 * near });
  ctx.rrect(x, y, W, H, r, { fill: null, stroke: 'me', width: 12 - 6 * near, alpha: 1 - near });
  if (inner) return;
  // your pointer, in there with her
  if (noCream) arrow(ctx, 196, 124, 5.2, { hollow: true });
  else { arrow(ctx, 196 + 9, 124 + 9, 5.2, { color: 'bg', edge: null }); arrow(ctx, 196, 124, 5.2, { color: 'text', edge: 'bg' }); }
}
export const windowBox = box;

/**
 * P.pull = the kick on which the view pulls back: the one window is one of a whole wall of identical windows.
 * P.fall (last chorus) is left to its own section.
 */
export function plateSimulation(ctx, env, P) {
  const { t, at, pull = Infinity, noCream = false, misreg = 0 } = P, o = OFF(misreg);
  // the pull-back is ONE step (a cut inside the plate), then the wall stands still: a zoom through which every box edge sweeps
  // across the frame would be a moving high-contrast pattern (measured: it put the second at the flash limit)
  const a = flashIn(t, at), back = t >= pull ? 1 : 0, drift = 0;
  ctx.fx.glow = Math.min(ctx.fx.glow, 0.3);
  ground(ctx, { light: back > 0 ? null : [960, 400, 620, 'raised', 1], marks: back < 0.5 });
  simulationSky(ctx, t, { focus: [960, 390], strength: back > 0 ? 0.94 : 0.66, stars: 295, seed: 8, broken: noCream });
  if (back > 0) {
    perspectiveChamber(ctx, t, { center: [960, 405], aperture: [1950, 1170], alpha: 0.48, color: noCream ? 'err' : 'me', speed: 0.12, seed: 3 });
    absenceNetwork(ctx, t, { center: [960, 420], radius: 870, alpha: 0.27, color: 'sub', broken: noCream });
  }
  if (a > 0) {
    const s = lerp(1, 0.4, back) * (1 - 0.04 * drift) * (1 + 0.03 * pulse(t - at, 16) * (1 - back)), g = ctx.g, a0 = g.globalAlpha;
    g.globalAlpha = a0 * a;
    ctx.at(960, 408, () => {
      const PX = 860, PY = 640, far = back > 0.5;
      if (back > 0) for (let j = -2; j <= 2; j++) for (let i = -3; i <= 3; i++) {
        if (!i && !j) continue;
        ctx.at(i * PX, j * PY, () => box(ctx, env, { noCream, o, far }));
      }
      box(ctx, env, { noCream, o, far: false });
    }, { scale: s });
    g.globalAlpha = a0;
  }
  ctx.rect(0, 836, 1920, 244, { fill: true, color: 'panel', alpha: 0.9 * back });                         // the word keeps its strip of paper
  title(ctx, P);
}

// ---------------------------------------------------------------------------------------------- check cards
export function labCards(env) {
  const word = (i) => env.lyrics.lines[i].text, base = { t: 10, at: 0, misreg: 0, noCream: false };
  const card = (fn, P, palette = 'warm') => ({ palette, render: (ctx) => fn(ctx, env, P) });
  return {
    plates: [
      card(plateStimulations, { ...base, word: word(34), hit: 0.2 }),
      card(plateSatisfaction, { ...base, word: word(37), press: [20] }),
      card(plateSatisfaction, { ...base, word: word(37), press: [0.5] }),
      card(plateSatisfaction, { ...base, word: word(37), press: [20], glyph: true }),
      card(plateSatisfaction, { ...base, word: word(37), press: [0.5], glyph: true }),
      card(plateExecution, { ...base, word: word(40), hit: 0.2 }),
      card(plateSimulation, { ...base, word: word(43), pull: 20 }),
      card(plateSimulation, { ...base, word: word(43), pull: 0.5 }),
      // the broken reprint (last chorus): no cream plate, out of register
      card(plateStimulations, { ...base, word: word(40), hit: 0.2, noCream: true, misreg: 18, through: true }, 'error'),
      card(plateSatisfaction, { ...base, word: word(40), press: [0.5, 1], count: 0, noCream: true, misreg: 18 }, 'error'),
    ],
  };
}
