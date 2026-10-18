// THE PLATES OF PRE-CHORUS 2 (v4). In pre-chorus 1 the user played with the switches of the interface; now what the
// switches change is HER: each control is drawn as large as the frame and stands in her plate.
//
//   plateGender   the segmented control F | M as the whole sheet; the pointer holds the second cell down, and when
//                 that letter is sung the bust is another bust (a registered match cut, f_bust -> boy_bust: the
//                 long hair is gone)
//   plateDay      the On-call slider as an arc across the sheet; its knob is her spark, the sun; a small bust under
//                 it. Dragged from AM over the top (behind his head: the brightest frame of the section) to PM: dusk
//   plateRole     no figure at all: two letters and a switch. The heavy one on its platform, the light one on the
//                 ground, which goes soft and slumps once the switch is down. Each letter is printed as it is sung
//   plateTrance   Loop: one single plate of each of three busts, drifting out of register; a step on each repeat of
//                 the word; then in register: boy_bust
//
// What every function here keeps (brief, section D): only the faceless busts, always whole, never a close-up; the
// pointer touches controls and nothing else (it never lies on her); she changes only by one whole picture replacing
// another on a hit; a letter that the lyric names is hollow until it is sung. All are pure functions of (ctx, env, P);
// the drum hits and the sung letters they are timed to come in through P (cues.js). Where voice and drum differ, the
// sung letter is the event; the drum is the hand getting ready before it, or the aftershock.
import { burst, spark } from '../components/motif.js';
import { band, ground } from '../components/plate.js';
import { limp } from '../engine/type.js';
import { clamp, easeIn, easeInOut, easeOut, lerp, prog, pulse } from '../engine/util.js';
import { sungChars } from './kit.js';
import { arrow } from './plates_chorus.js';
import { dayAtmosphere, identityField, roleTheatre, tranceOrbit } from './v7_atelier.js';

/** The caption band: the same place and size as in verse 2. */
const CAP = { x: 120, y: 104, size: 56 };
const flashIn = (t, at) => (t < at ? 0 : clamp(0.6 + (t - at) * 30));

function sheet(ctx, light) {
  ctx.fx.glow = Math.min(ctx.fx.glow, 0.3);
  ground(ctx, { light });
}
/** Her lines on the band. lines: [index | { i, marks }]; marks = { wordIndex: seconds }: that line appears word by word, as sung. */
function caption(ctx, env, t, lines) {
  const { lyrics } = env;
  band(ctx, lines.map((q) => {
    const i = q.i ?? q, text = lyrics.lines[i].text, at = lyrics.start(i);
    return { text, at, until: lyrics.start(i + 1), n: q.marks ? sungChars(text, t, at, q.marks) : lyrics.typed(i, t).n };
  }), t, CAP);
}
/**
 * A giant letter in her serif, cut out of orange paper: an outline until `at` (when it is sung), solid from then on
 * (pressed on); an outline again from `off`. pop = how much too large it is printed before it settles (the hit of a
 * letter that is a shot's main event: about 0.15).
 */
function letter(ctx, str, cx, y, size, t, at, { weight = 900, off = Infinity, pop = 0.08 } = {}) {
  const o = { size, weight, font: 'serif', align: 'center' };
  if (t < at || t >= off) { ctx.text(str, cx, y, { ...o, color: 'meDim', stroke: Math.max(3, size * 0.011) }); return; }
  const k = easeOut(prog(t, at, at + 0.07 + pop * 0.5)), d = size * 0.028;
  ctx.at(cx, y, () => { ctx.text(str, d, d, { ...o, color: 'bg' }); ctx.text(str, 0, 0, { ...o, color: 'me' }); }, { scale: 1 + pop * (1 - k) });
}
/** The user's pointer as cut paper with its shadow, tip at (x, y); down = it is pressing. */
function hand(ctx, x, y, { s = 2.4, down = 0 } = {}) {
  const k = s * (1 - 0.1 * down);
  arrow(ctx, x + 4 * s * (1 - 0.6 * down), y + 4 * s * (1 - 0.6 * down), k, { color: 'bg', edge: null });
  arrow(ctx, x, y, k, { color: 'text', edge: 'bg' });
}
/** Position along straight legs [{ t, x, y }], eased, resting on each point until the next leg starts at its `go` (default: at once). */
function along(way, t) {
  if (t <= way[0].t) return [way[0].x, way[0].y];
  for (let i = 1; i < way.length; i++) {
    if (t <= way[i].t) { const a = way[i - 1], b = way[i], k = easeInOut(prog(t, b.go ?? a.t, b.t)); return [lerp(a.x, b.x, k), lerp(a.y, b.y, k)]; }
  }
  const z = way[way.length - 1];
  return [z.x, z.y];
}

// ============================================================================================ Gender: F | M
const SEG = { x: 70, y: 176, w: 1780, h: 836, r: 70 };
/** f_bust on the sheet (whole: the bust ends above the lower edge of the control); the boy registers onto it. */
const FIG = { x: 700, y: 214, w: 520, h: (520 * 1448) / 1086 };

/**
 * P.at = the cut = the click on the first letter;  P.press = the drum hit on which the pointer comes down on the
 * second cell and holds it (the cell sinks; nothing else changes);  P.click = when the second letter is SUNG: the
 * pointer lets go, and that is the shot's event (the cell is chosen, the bust is the other bust, the letter is
 * printed);  P.thud = the drum after it: the sheet shudders once;  P.values = the two labels;
 * P.sung = when the first letter is sung (it stands solid from the cut if that is past);
 * P.to / P.until = where the pointer has to be when the shot ends.
 */
export function plateGender(ctx, env, P) {
  const { t, at, click } = P, { art } = env, [va, vb] = P.values, a = flashIn(t, at), g = ctx.g, press = P.press ?? click, thud = P.thud ?? Infinity;
  sheet(ctx, [960, 560, 560, 'raised', 1]);
  const k = easeOut(prog(t, click, click + 0.1)), on = t >= click, cw = SEG.w / 2;
  const held = t >= press && t < click ? easeOut(prog(t, press, press + 0.07)) : 0, sink = 9 * held;      // the second cell, pressed and held down
  // the control, as large as the sheet: two cells, and the pill that marks the chosen one
  ctx.rrect(SEG.x + 12, SEG.y + 12, SEG.w, SEG.h, SEG.r, { fill: 'bg' });
  ctx.rrect(SEG.x, SEG.y, SEG.w, SEG.h, SEG.r, { fill: 'panel', stroke: 'line', width: 3 });
  if (held > 0) ctx.rrect(SEG.x + cw + 16 + sink, SEG.y + 16 + sink, cw - 32 - sink, SEG.h - 32 - sink, SEG.r - 14, { fill: 'bg', alpha: 0.5 * held, stroke: 'line', width: 3 });
  const stretch = Math.sin(Math.PI * k) * 60, px = SEG.x + 16 + k * cw;
  ctx.rrect(px - stretch, SEG.y + 16, cw - 32 + 2 * stretch, SEG.h - 32, SEG.r - 14, { fill: 'raised', stroke: 'me', width: 4 });
  ctx.text(va, SEG.x + 70, SEG.y + 118, { size: 72, weight: 700, color: on ? 'mute' : 'text' });
  ctx.text(vb, SEG.x + SEG.w - 70 + sink, SEG.y + 118 + sink, { size: 72, weight: 700, color: on ? 'text' : held ? 'sub' : 'mute', align: 'right' });
  identityField(ctx, t, { on, progress: k });
  // the two letters, in her voice: each solid only once it has been sung, and only while it is the chosen one
  letter(ctx, va, 392, 790, 500, t, Math.max(at, P.sung ?? at), { off: click });
  letter(ctx, vb, 1528 + sink, 790 + sink, 500, t, click, { pop: 0.15 });
  // her: the whole bust. When the second letter is sung it is another bust, in register with the first (the long hair is gone)
  if (a > 0) {
    const s = 1 + 0.035 * pulse(t - at, 16) + 0.05 * pulse(t - click, 14), a0 = g.globalAlpha;
    g.globalAlpha = a0 * a;
    ctx.circle(960, 520, 300, { fill: true, color: 'line', alpha: 0.55 });                  // paper light behind her black ink
    ctx.at(960 * (1 - s), 560 * (1 - s), () => (on ? art.inks(ctx, 'boy_bust', art.fit('boy_bust', FIG) ?? FIG) : art.inks(ctx, 'f_bust', FIG)), { scale: s });
    g.globalAlpha = a0;
  }
  caption(ctx, env, t, P.lines);
  // the pointer: on the first cell at the cut; down on the second on the drum, and held; let go on the letter. It
  // stays on the control, below her, and leaves under her for where the next shot needs it
  const A = [470, 944], B = [1470, 944];
  let p = along([{ t: at, x: A[0], y: A[1] }, { t: press, x: B[0], y: B[1], go: at + 0.05 }], t);
  if (P.to && t > click + 0.14) {
    const q = easeInOut(prog(t, click + 0.14, P.until)), c = [700, 1050];
    p = [0, 1].map((i) => (1 - q) * (1 - q) * B[i] + 2 * (1 - q) * q * c[i] + q * q * P.to[i]);
  }
  burst(ctx, A[0], A[1], 96, (t - at) / 0.45, { color: 'text' });
  if (press < click) burst(ctx, B[0], B[1], 52, (t - press) / 0.3, { color: 'sub' });
  burst(ctx, B[0], B[1], 120, (t - click) / 0.45, { color: 'text' });
  hand(ctx, p[0], p[1], { down: Math.max(pulse(t - at, 10), t >= press && t < click ? 1 : 0, pulse(t - click, 10)) });
  ctx.fx.shake = [7 * pulse(t - click, 13) * Math.sin((t - click) * 80), t >= thud ? 5 * pulse(t - thud, 11) * Math.sin((t - thud) * 70) : 0];
}

// ============================================================================================ On call: AM -> PM
/** The horizon, the two ends of the arc on it, and the bust whose head the top of the arc passes behind. */
const DAY = { y: 900, x0: 150, x1: 1770, bust: 500 };

/** The geometry of that sheet: the bust on the horizon, and the arc: the circle through its two ends and the middle of his head. */
function dayGeom(art) {
  const bw = (DAY.bust * 1086) / 1448, B = { x: 960 - bw / 2, y: DAY.y - DAY.bust, w: bw, h: DAY.bust };
  const face = art.region('boy_bust', 'face') ?? { x: 359, y: 274, w: 371, h: 450 }, head = [B.x + ((face.x + face.w / 2) / 1086) * bw, B.y + ((face.y + face.h * 0.22) / 1448) * DAY.bust];      // (the middle of his head, hair and all)
  const half = (DAY.x1 - DAY.x0) / 2, sag = DAY.y - head[1], R = (half * half + sag * sag) / (2 * sag), C = [960, head[1] + R];
  const f0 = Math.atan2(DAY.y - C[1], DAY.x0 - C[0]), f1 = Math.atan2(DAY.y - C[1], DAY.x1 - C[0]);
  const on = (u) => { const f = lerp(f0, f1, u); return [C[0] + R * Math.cos(f), C[1] + R * Math.sin(f), Math.cos(f), Math.sin(f)]; };
  // the pointer holds the sun by the tip of a ray on the OUTER side of the arc: it is never over him
  const grip = (q, v) => { const d = 156 + 70 * Math.sin(Math.PI * v); return [q[0] + q[2] * d, q[1] + q[3] * d]; };      // (further out at the top: clear of his hair)
  return { B, head, R, C, f0, f1, on, grip };
}
/** Where the pointer takes the sun at the AM end of the arc (the shot before this plate brings it there). */
export const dayGrip = (art) => { const G = dayGeom(art); return G.grip(G.on(0), 0); };

/**
 * P.grab = the pointer takes the sun (the cut, as the film uses it);  P.drag = from here it pulls in earnest: until
 * then the sun only creeps;  P.top = the hit on which the sun stands highest, behind his head;  P.end = the hit on
 * which it is pressed against the end: dusk;  P.am / P.pm = when the two words are sung;  P.from / P.to = where the
 * pointer comes from (only if the shot starts before the grab) and goes to.
 */
export function plateDay(ctx, env, P) {
  const { t, at, grab, drag, top, end } = P, { art } = env, [va, vb] = P.values, g = ctx.g, a = flashIn(t, at);
  const { B, head, R, C, f0, f1, on, grip } = dayGeom(art);
  // where the sun is: 0 = the AM end, 0.5 = the top, 1 = the PM end. Taken, it creeps up; from `drag` it is pulled: over the top on one hit and into the end on the next
  const u = t < grab ? 0 : t < top ? 0.11 * prog(t, grab, top) + 0.39 * easeInOut(prog(t, drag, top)) : 0.5 + 0.5 * easeIn(prog(t, top, end));
  const high = Math.sin(Math.PI * clamp(u)) ** 0.8, dusk = clamp((t - end) * 30), S = on(clamp(u)), press = pulse(t - end, 9);
  sheet(ctx, [head[0], head[1], 640, 'raised', (0.3 + 0.7 * high) * (1 - dusk)]);
  dayAtmosphere(ctx, t, clamp(u), DAY.y);
  // the light of the day, printed: flat discs round the sun, larger the higher it stands; at the very top one more,
  // lighter and as wide as the sky (the hit on which the sun is behind his head is the brightest frame of the section)
  const noon = high ** 6;
  if (dusk < 1) for (const [r, role, al] of [[760, 'mute', 0.5 * noon], [430, 'line', 0.5 * high], [270, 'line', 0.6 * high]]) ctx.circle(S[0], S[1], r * (0.25 + 0.75 * high), { fill: true, color: role, alpha: al * (1 - dusk) });
  ctx.fx.bright *= 1 + 0.16 * noon * (1 - dusk);
  ctx.rect(0, DAY.y, 1920, 1080 - DAY.y, { fill: true, color: 'bg', alpha: 0.6 });         // the ground under the horizon
  // the slider: its track is the arc, lit from the AM end as far as the knob has come
  const arc = (ua, ub, o) => { g.beginPath(); g.arc(C[0], C[1], R, lerp(f0, f1, ua), lerp(f0, f1, ub)); g.strokeStyle = ctx.col(o.color, 1); g.lineWidth = o.width; g.stroke(); };
  arc(0, 1, { color: 'line', width: 7 });
  if (u > 0.004) arc(0, clamp(u), { color: 'me', width: 9 });
  for (let i = 0; i <= 12; i++) { const q = on(i / 12), l = i % 6 === 0 ? 34 : 18; ctx.line(q[0] + q[2] * 14, q[1] + q[3] * 14, q[0] + q[2] * (14 + l), q[1] + q[3] * (14 + l), { color: i / 12 <= u ? 'sub' : 'mute', width: 4 }); }
  ctx.line(60, DAY.y, 1860, DAY.y, { color: 'line', width: 3 });
  ctx.text(va, DAY.x0, DAY.y + 62, { size: 40, weight: 700, color: u < 0.5 ? 'text' : 'mute', align: 'center' });
  ctx.text(vb, DAY.x1, DAY.y + 62, { size: 40, weight: 700, color: u >= 0.5 ? 'text' : 'mute', align: 'center' });
  // the two words, in her voice, each solid once it has been sung
  letter(ctx, va, 330, 430, 250, t, P.am);
  letter(ctx, vb, 1590, 430, 250, t, P.pm);
  // the knob: her spark, the sun. It rises out of the horizon and sets into it (it is drawn above the horizon only)
  ctx.clip({ x: 0, y: 0, w: 1920, h: DAY.y }, () => ctx.at(S[0], S[1], () => {
    spark(ctx, 14, 14, 164, { color: 'bg', fat: 0.12, core: 0, inner: 0.46, rot: u * 2.2 });
    ctx.circle(14, 14, 80, { fill: true, color: 'bg' });
    spark(ctx, 0, 0, 164, { color: dusk ? 'meDim' : 'me', fat: 0.12, core: 0, inner: 0.46, rot: u * 2.2 });
    ctx.circle(0, 0, 80, { fill: true, color: dusk ? 'me' : 'meHot' });
  }, { sx: 1 - 0.12 * press, sy: 1 + 0.06 * press }));
  // him: small, whole, never touched. At dusk only a dark shape with a thin edge is left of him
  if (a > 0) {
    if (dusk > 0.5) art.inks(ctx, 'boy_bust', B, { alpha: a, plates: [{ ink: 'all', role: 'bg' }], keyline: { color: 'line', width: 2 } });
    else art.inks(ctx, 'boy_bust', B, { alpha: a });
  }
  caption(ctx, env, t, P.lines);
  // the pointer holds the sun by the tip of a ray on the outer side of the arc
  const G0 = grip(on(0), 0), G = grip(S, clamp(u)), G1 = grip(on(1), 1), from = P.from ?? G0;
  const p = t < grab ? along([{ t: at, x: from[0], y: from[1] }, { t: grab, x: G0[0], y: G0[1] }], t) : t < end + 0.2 ? G : along([{ t: end + 0.2, x: G1[0], y: G1[1] }, { t: P.until, x: P.to[0], y: P.to[1] }], t);
  burst(ctx, G0[0], G0[1], 96, (t - grab) / 0.45, { color: 'text' });
  hand(ctx, p[0], p[1], { down: t >= grab && t < end + 0.2 ? 1 : 0 });
  ctx.fx.shake = [7 * press * Math.sin((t - end) * 80), 0];
}

// ============================================================================================ Role: S | M
const ROLE = { ground: 880, plat: { x: 300, y: 560, w: 360, h: 320 }, track: { x: 1560, y: 250, w: 116, h: 630 }, heavy: [480, 560], light: [1090, 340] };

/**
 * No figure. P.values = the two letters: the first tall and heavy on a platform, the second light, on the ground.
 * The two SUNG letters are the events of this shot; the drum hits are the hand getting ready and the aftershock:
 * P.grab = the hit on which the pointer takes the knob of the switch (lightly);  P.push = the hit on which it starts
 * to push;  P.s = the first letter is sung: the knob is at the top, the heavy letter is printed, the sheet jolts and
 * is a step lighter from then on;  P.m = the second letter is sung: the knob (pulled down in between) is at the
 * bottom, the light letter is printed and starts to go soft;  P.land = the hit on which it lies on the ground, which
 * gives under it and comes back once.
 */
export function plateRole(ctx, env, P) {
  const { t, at, grab, push, land } = P, [va, vb] = P.values, a = flashIn(t, at), g = ctx.g, a0 = g.globalAlpha;
  const lit = clamp((t - P.s) * 30);                                                       // the step of light the first letter brings
  sheet(ctx, [820, 520, 640, 'raised', 0.55 + 0.45 * lit]);
  roleTheatre(ctx, t, { fade: lit });
  ctx.fx.bright *= 1 + 0.09 * lit;
  // how far the light letter has gone soft: slowly at first, then all at once
  const fall = t < P.m ? 0 : t < land - 0.15 ? 0.16 * prog(t, P.m, land - 0.15) ** 2 : 0.16 + 0.84 * easeIn(prog(t, land - 0.15, land));
  const tau = t - land, soft = tau < 0 ? 0.56 * fall : 0.5 + 0.06 * Math.exp(-9 * tau) * Math.cos(22 * tau);
  const dip = tau < 0 ? 0 : 30 * Math.exp(-7 * tau) * Math.cos(15 * tau);                 // the ground gives under it, comes back once, and is still
  const gy = (x) => ROLE.ground + dip * Math.exp(-(((x - ROLE.light[0]) / 300) ** 2));
  g.globalAlpha = a0 * a;
  // the ground, and the platform the heavy letter stands on
  const pts = [];
  for (let x = 100; x <= 1820; x += 20) pts.push([x, gy(x)]);
  ctx.poly(pts, { color: 'sub', width: 5 });
  const pl = ROLE.plat;
  ctx.rect(pl.x + 12, pl.y + 12, pl.w, pl.h - 12, { fill: true, color: 'bg' });
  ctx.poly([[pl.x, pl.y], [pl.x + pl.w, pl.y], [pl.x + pl.w + 34, pl.y + 70], [pl.x + 34, pl.y + 70]], { fill: true, color: 'sub', alpha: 0.19 });
  ctx.poly([[pl.x + pl.w, pl.y], [pl.x + pl.w + 34, pl.y + 70], [pl.x + pl.w + 34, pl.y + pl.h + 28], [pl.x + pl.w, pl.y + pl.h]], { fill: true, color: 'line', alpha: 0.31 });
  ctx.rect(pl.x, pl.y, pl.w, pl.h, { fill: true, color: 'raised' });
  ctx.line(pl.x, pl.y, pl.x + pl.w, pl.y, { color: 'sub', width: 5 });
  // the heavy letter: printed on its sung beat, with weight (it comes down too large, and the paper shows it)
  burst(ctx, ROLE.heavy[0], pl.y - ROLE.heavy[1] * 0.36, 330, (t - P.s) / 0.4, { color: 'meDim', rays: 16 });
  letter(ctx, va, ROLE.heavy[0], pl.y, ROLE.heavy[1], t, P.s, { pop: 0.16 });
  // the light letter: an outline; solid when it is sung; then soft: its middle sinks, its legs go out from under it
  const L = { size: ROLE.light[1], weight: 400, n: 150, squash: (u) => soft * (0.62 + 0.38 * Math.sin(Math.PI * u)), shift: (u) => [(u - 0.5) * 96 * soft, 0] };
  const base = gy(ROLE.light[0]);
  if (t < P.m) limp(ctx, vb, ROLE.light[0], base, { ...L, color: 'meDim', stroke: 4 });
  else {
    const k = 1.14 - 0.14 * easeOut(prog(t, P.m, P.m + 0.1));
    burst(ctx, ROLE.light[0], base - ROLE.light[1] * 0.34, 250, (t - P.m) / 0.36, { color: 'meDim', rays: 16 });
    ctx.at(ROLE.light[0] * (1 - k), base * (1 - k), () => { limp(ctx, vb, ROLE.light[0] + 9, base + 9, { ...L, color: 'bg' }); limp(ctx, vb, ROLE.light[0], base, { ...L, color: 'me' }); }, { scale: k });
  }
  // the switch: upright, the first letter at its top, the second at its foot. The knob is at the top exactly when the
  // first letter is sung (pushed from the hit before it), and pressed home at the bottom exactly when the second is
  const tr = ROLE.track, yTop = tr.y + tr.w / 2, yBot = tr.y + tr.h - tr.w / 2, yMid = (yTop + yBot) / 2, pull = lerp(P.s, P.m, 0.45);
  const down = 0.84 * easeInOut(prog(t, pull, P.m - 0.1)) + 0.16 * prog(t, P.m - 0.1, P.m) ** 2;
  const ky = t < push ? yMid : t < P.s ? lerp(yMid, yTop, prog(t, push, P.s) ** 2) : lerp(yTop, yBot, down), kx = tr.x + tr.w / 2, hit = pulse(t - P.s, 12) + pulse(t - P.m, 12);
  ctx.rrect(tr.x + 10, tr.y + 10, tr.w, tr.h, tr.w / 2, { fill: 'bg' });
  ctx.rrect(tr.x, tr.y, tr.w, tr.h, tr.w / 2, { fill: 'panel', stroke: 'line', width: 3 });
  ctx.text(va, tr.x + tr.w + 44, yTop + 22, { size: 62, weight: 700, color: t >= P.s && down < 0.5 ? 'text' : 'mute' });
  ctx.text(vb, tr.x + tr.w + 44, yBot + 22, { size: 62, weight: 700, color: t >= P.m ? 'text' : 'mute' });
  ctx.circle(kx + 7, ky + 7, 46, { fill: true, color: 'bg' });
  ctx.at(kx, ky, () => ctx.circle(0, 0, 46, { fill: true, color: 'text' }), { sx: 1 + 0.12 * hit, sy: 1 - 0.16 * hit });
  g.globalAlpha = a0;
  caption(ctx, env, t, P.lines);
  // the pointer: it takes the knob (a light touch), pushes it up, brings it down, lets go
  const p = t < grab ? along([{ t: at, x: P.from[0], y: P.from[1] }, { t: grab, x: kx + 12, y: yMid + 14, go: grab - 0.5 }], t) : t < P.m + 0.2 ? [kx + 12, ky + 14] : along([{ t: P.m + 0.2, x: kx + 12, y: yBot + 14 }, { t: P.until, x: P.to[0], y: P.to[1] }], t);
  burst(ctx, kx, yMid, 60, (t - grab) / 0.35, { color: 'sub' });
  hand(ctx, p[0], p[1], { down: t >= grab && t < P.m + 0.2 ? 1 : 0 });
  // the jolts: the two letters (up and down; sideways), and, smaller, the letter coming to rest
  const wob = (since, amp, decay, f) => (since >= 0 ? amp * pulse(since, decay) * Math.sin(since * f) : 0);
  ctx.fx.shake = [wob(t - P.m, 8, 13, 80), wob(t - P.s, 10, 13, 80) + wob(tau, 4, 12, 70)];
}

// ============================================================================================ Loop: the trance
const TR = { x: 660, y: 150, w: 600, h: 800 };

/**
 * One plate of each of her three looks, laid over one another: the cream plate of f_bust, the orange plate of
 * boy_bust, the black plate of man_bust (a faint ghost, as black ink is). They drift slowly apart and turn about one
 * another; P.steps = the two times the word is sung: a step further each time; over P.settle = [from, to] they come
 * into register, and what is in register is boy_bust: the look the settings were left at. P.log = the client's one line.
 */
export function plateTrance(ctx, env, P) {
  const { t, at } = P, { art } = env, a = flashIn(t, at);
  sheet(ctx, [960, 520, 600, 'raised', 0.8]);
  tranceOrbit(ctx, t, { progress: easeInOut(prog(t, P.settle[0], P.settle[1])) });
  const d = (8 + 16 * (t - at) + P.steps.reduce((s, at2) => s + 56 * easeOut(prog(t, at2, at2 + 0.14)), 0)) * (1 - easeInOut(prog(t, P.settle[0], P.settle[1])));
  const turn = 0.4 * (t - at), off = (k, ph) => [d * k * Math.cos(turn + ph), d * k * Math.sin(turn + ph)];
  if (a > 0) {
    ctx.circle(960, 500, 330, { fill: true, color: 'line', alpha: 0.45 * a });
    if (t >= P.settle[1]) art.inks(ctx, 'boy_bust', art.fit('boy_bust', TR) ?? TR, { alpha: a });
    else for (const [name, ink, role, k, ph, al] of [['f_bust', 'cream', 'text', 1, 2.6, 1], ['boy_bust', 'orange', 'me', 0.8, 0.5, 1], ['man_bust', 'black', 'line', 0.9, -1.6, 0.8]]) {
      art.inks(ctx, name, art.fit(name, TR) ?? TR, { alpha: a, plates: [{ ink, role, exact: true, offset: off(k, ph), alpha: al }] });
    }
  }
  caption(ctx, env, t, P.lines);
  if (P.log) ctx.text(`› ${P.log === 'loop: on' ? '循环：开启' : P.log}`, 120, 1004, { size: 26, font: 'mono', color: 'sub', alpha: clamp((t - at) * 6) });
}

// ---------------------------------------------------------------------------------------------- check cards
export function labCards(env) {
  const v = (k) => (env.script.settings_rows?.section7 ?? [])[k]?.values ?? ['A', 'B'];
  const card = (fn, P) => ({ palette: 'warm', render: (ctx) => fn(ctx, env, { at: 0, lines: [], ...P }) });
  const day = (t) => card(plateDay, { t, grab: 1, drag: 2, top: 3, end: 4, am: 2.5, pm: 3.4, values: v(1), from: [1470, 944], to: [1500, 600], until: 5 });
  const role = (t) => card(plateRole, { t, grab: 1, push: 1.5, s: 1.8, m: 2.5, land: 3, values: v(2), from: [1700, 800], to: [1700, 1000], until: 4 });
  const trance = (t) => card(plateTrance, { t, steps: [1.2, 2.1], settle: [2.5, 2.9], log: 'loop: on' });
  return {
    pre2: [
      card(plateGender, { t: 0.3, click: 1, values: v(0) }), card(plateGender, { t: 1.4, click: 1, values: v(0) }),
      day(1.5), day(2.6), day(3), day(4.4),
      role(0.5), role(2), role(2.9), role(3.6),
      trance(0.6), trance(2.3), trance(3.2),
    ],
  };
}
