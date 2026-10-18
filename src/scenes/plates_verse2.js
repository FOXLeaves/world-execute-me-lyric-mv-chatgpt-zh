// THE FOUR PLATES OF VERSE 2 (v4). Three requests, one grammar (06_verse2.js): on the noun the film leaves the
// interface and she IS the thing she was asked to be; on the next downbeat it is opened; on the keyword what she
// gives turns cream and leaves towards the user's side (the right); the user's next click on Send ends the plate.
//
//   plateFruit   the eggplant / the tomato (objects.js): whole -> cut open -> its own colour leaves it, and its
//                molecules are pulled out of it in cream (molecules.js): fibre, protein, sugar / the tomato's
//                own red (lycopene), vitamin C, vitamin E. Each is captioned from the script's data card
//   plateCat     herself in code characters -> the cat ears pop up -> printed solid (cat_paws), with her purr as
//                tabby stripes; the stripes turn cream and leave
//   plateProof   the fourth request (be god) is a PROOF: printed without its cream plate, a sun behind the void of
//                her face; the missing plate slides over from the user's bubble and registers on the keyword
//
// All are pure functions of (ctx, env, P). What every plate of the verse shares: the caption band (her lines, top
// left, one place and size), and the FOOT of the sheet: the place the composer has in the interface. The keyword
// lands there, and at its right the user is already typing the next request (small cream type, no bubble).
import { band, ground, keyword } from '../components/plate.js';
import { glyphPlate } from '../engine/ascii.js';
import { clamp, easeBack, easeInOut, easeOut, lerp, prog, pulse } from '../engine/util.js';
import { youBox } from './bubbles.js';
import { MOL, drawMolecule, formula } from './molecules.js';
import { dataText, eggplant, tomato } from './objects.js';
import { arrow } from './plates_chorus.js';
import { purrRoom, specimenFront, specimenStage } from './v7_atelier.js';

const TAU = Math.PI * 2;
/** Where the picture ends and the foot of the sheet begins. */
export const FOOT = 846;
/** The caption band of the verse. */
const CAP = { x: 120, y: 104, size: 56 };
/** A graphic arrives whole within two frames (no white field): 0 before `at`, 1 from the second frame on. */
const flashIn = (t, at) => (t < at ? 0 : clamp(0.6 + (t - at) * 30));

/** The paper, and the foot of the sheet: a strip one step lighter, where the keyword will stand. */
function sheet(ctx, light = [930, 450, 600, 'raised', 1]) {
  ctx.fx.glow = Math.min(ctx.fx.glow, 0.3);                           // large flat colour: the palette's warm bloom must not tint it
  ground(ctx, { light });
  ctx.rect(0, FOOT, 1920, 1080 - FOOT, { fill: true, color: 'raised', alpha: 0.32 });
  ctx.line(0, FOOT, 1920, FOOT, { color: 'line', width: 2 });
}
/** Her lines that are not keywords, on the band: each from the moment it is sung until the next line starts. */
function caption(ctx, env, t, lines) {
  const { lyrics } = env;
  band(ctx, lines.map((i) => ({ text: lyrics.lines[i].text, at: lyrics.start(i), until: lyrics.start(i + 1), n: lyrics.typed(i, t).n })), t, CAP);
}
/** What the user is typing while she answers: next = { text, from, to }. One line at the right of the foot, with its caret. */
function typing(ctx, t, next) {
  if (!next || t < next.from - 0.25) return;
  const o = { size: 34, weight: 500 }, full = next.text, n = Math.floor(prog(t, next.from, next.to) * full.length + 1e-6);
  const x = 1826 - ctx.measure(full, o), y = 1056, shown = full.slice(0, n);
  ctx.text(shown, x, y, { ...o, color: 'text' });
  if (n < full.length || Math.floor(t * 2.2) % 2 === 0) ctx.rect(x + ctx.measure(shown, o) + 4, y - 29, 3, 36, { fill: true, color: 'text' });
}
/** The keyword on the foot of the sheet: the whole word at once, pressed on. Cream = it has been given. */
const word = (ctx, P, color = 'text') => keyword(ctx, P.word, P.t, { y: 1000, maxW: 1740, maxSize: 214, at: P.hit, color, shade: 'bg', off: [9, 9] });

// ============================================================================================ the eggplant, the tomato
/**
 * What each object gives on its keyword: its own molecules (molecules.js), cut out of cream paper and pulled out of it
 * towards the user's edge of the sheet; the longest of them runs off that edge. Per molecule: where its first atom
 * stands (x, y) and its bond length L; t = [from, to] seconds after the keyword in which it is drawn out; row = its
 * row of the object's data card (name, formula, amount: the caption, at cap; a negative cap x is right-aligned).
 */
const GIFT = {
  eggplant: () => [                                                     // (its water, 92 g of every 100, is left out: three molecules read, more do not)
    { m: MOL.cellulose(6), x: 770, y: 712, L: 50, t: [0.03, 0.32], row: 2, cap: [-636, 690] },
    { m: MOL.peptide(6), x: 1262, y: 256, L: 50, t: [0.08, 0.3], row: 3, cap: [-1884, 372] },
    { m: MOL.glucose, x: 1480, y: 464, L: 40, t: [0.13, 0.3], row: 1, cap: [1628, 456] },
  ],
  tomato: () => [
    { m: MOL.lycopene, x: 640, y: 482, L: 48, t: [0.03, 0.32], row: 1, cap: [-1884, 380] },
    { m: MOL.ascorbic, x: 1556, y: 262, L: 60, t: [0.09, 0.28], row: 0, cap: [1236, 84] },
    { m: MOL.tocopherol, x: 1350, y: 690, L: 54, t: [0.13, 0.36], row: 2, cap: [1548, 590] },
  ],
};
function gift(ctx, env, kind, since) {
  if (since < 0) return;
  const rows = (env.script.cards_section6 ?? [])[kind === 'tomato' ? 1 : 0]?.rows ?? [], drift = 26 * Math.max(0, since - 0.3);
  for (const q of GIFT[kind]()) {
    const k = easeOut(prog(since, q.t[0], q.t[1])), row = rows[q.row];
    drawMolecule(ctx, q.m, { x: q.x + drift, y: q.y, L: q.L, k });
    if (!row || k <= 0) continue;
    // its caption: the name, and under it the formula and how much of it there is (the script's data card)
    const a = clamp((since - q.t[0]) * 12), o = { size: 24, weight: 600 }, f = row.formula ?? '', gap = 2 * ctx.cw(24);
    const w = Math.max(ctx.measure(row.label, o), formula(ctx, f, 0, 0, { size: 24, alpha: 0 }) + gap + ctx.cw(24) * row.value.length);
    const x = q.cap[0] < 0 ? -q.cap[0] - w : q.cap[0], y = q.cap[1];
    ctx.text(row.label, x, y, { ...o, color: 'text', alpha: a });
    ctx.text(row.value, x + formula(ctx, f, x, y + 32, { size: 24, alpha: a }) + gap, y + 32, { size: 24, font: 'mono', color: 'sub', alpha: a });
  }
}

/**
 * P.kind 'eggplant' | 'tomato';  P.at = the cut (the head of the noun), P.settle = the end of the noun: its characters
 * have settled;  P.open = the downbeat it is cut open on;  P.hit = the keyword: its colour leaves it, and what the
 * colour was is pulled out of it as cream molecules (GIFT);
 * P.lines = the lines on the band;  P.next = what the user types meanwhile.
 */
export function plateFruit(ctx, env, P) {
  const { t, at, kind, settle, open, hit } = P, a = flashIn(t, at), cut = t - open;
  sheet(ctx);
  const draw = kind === 'tomato' ? tomato : eggplant, at0 = kind === 'tomato' ? { cx: 930, cy: 478, s: 306 } : { cx: 950, cy: 452, s: 356, tilt: 0.8 };
  specimenStage(ctx, t, { kind, center: [at0.cx, at0.cy], hit, intro: at });
  const k = 1 + 0.045 * pulse(t - at, 16);                              // it lands a touch large
  if (a > 0) ctx.at(at0.cx * (1 - k), at0.cy * (1 - k), () => draw(ctx, env, { ...at0, alpha: a, t, decode: prog(t, at, settle), open: prog(t, open, open + 0.2), give: t >= hit ? t - hit : -1, stream: false }), { scale: k });
  specimenFront(ctx, t, { kind, center: [at0.cx, at0.cy], hit });
  gift(ctx, env, kind, t - hit);
  ctx.fx.shake = [6 * pulse(cut, 14) * Math.sin(cut * 90), 4 * pulse(cut, 14) * Math.cos(cut * 70)];        // the knife
  caption(ctx, env, t, P.lines);
  typing(ctx, t, P.next);
  word(ctx, P);
}

// ============================================================================================ the tabby cat
/** f_bust on the sheet; the cat-eared bust and the paws register onto it by the flower in her hair. */
const FIG = { x: 240, y: 180, w: 840, h: 1120 };
/** The line her purr stands on, from behind her shoulder to the user's edge of the sheet; lanes the stripes leave on. */
const PURR = { y: 470, x0: 1118, x1: 1858, h: 238, w: 36, amp: [0.5, 0.82, 0.62, 1, 0.7, 0.92, 0.56, 0.8, 1, 0.66, 0.88, 0.58, 0.44] };

/**
 * A silhouette printed in code characters: its three inks as three dim flat tones (the figure reads before any
 * character does), and on them the characters, each ink in its own colour, clipped to the figure's own outline.
 */
function glyphFigure(ctx, env, name, dst, { text, key, decode = null, size = 15 }) {
  const { art } = env, cw = ctx.cw(size);
  art.inks(ctx, name, dst, { roles: { cream: 'mute', orange: 'meDim', black: 'panel' } });
  const grid = { x: Math.floor(dst.x / cw) * cw, y: Math.floor(dst.y / size) * size, w: 0, h: 0 };          // on the frame's own character grid
  grid.w = Math.ceil((dst.x + dst.w - grid.x) / cw) * cw; grid.h = Math.ceil((dst.y + dst.h - grid.y) / size) * size;
  const field = (u, v) => art.inkAt(name, (grid.x + u * grid.w - dst.x) / dst.w, (grid.y + v * grid.h - dst.y) / dst.h);
  art.inkClip(ctx, name, dst, () => glyphPlate(ctx, field, grid, {
    size, key: `${key}|${name}|${dst.x.toFixed(1)},${dst.y.toFixed(1)}`, decode,
    inks: { 1: { role: 'text', weight: 800, text }, 2: { role: 'meHot', weight: 800, text }, 3: { role: 'line', weight: 400, text: text.replace(/[a-z_]/gi, '.') } },
    edge: { role: 'me', weight: 800 },
  }));
}

/** One tabby stripe: a bar cut by hand, pointed at both ends. flip mirrors it. */
const stripe = (h, flip) => [[0, -h], [0.5, -0.3 * h], [0.4, 0.5 * h], [0, h], [-0.5, 0.25 * h], [-0.42, -0.55 * h]].map(([x, y]) => [x * PURR.w * (flip ? -1 : 1), y]);

/**
 * Her purr, as tabby stripes: bars of a waveform standing on one line. They breathe where they stand (a stripe that
 * travelled sideways would sweep its edges across the sheet). P.hit: they turn cream from her outwards, and then every
 * stripe turns on its middle and leaves to the right along a lane of its own; its outline stays where it stood.
 */
function purr(ctx, P) {
  const { t, at, develop, hit } = P, n = PURR.amp.length, pitch = (PURR.x1 - PURR.x0) / (n - 1), since = t - hit, g = ctx.g;
  const drawn = easeOut(prog(t, at + 0.05, at + 0.4));
  ctx.line(PURR.x0 - 30, PURR.y, lerp(PURR.x0 - 30, PURR.x1 + 30, drawn), PURR.y, { color: 'line', width: 3 });      // silent until she is the cat
  for (let i = 0; i < n; i++) {
    const x = PURR.x0 + i * pitch, grow = easeBack(prog(t, develop + i * 0.014, develop + i * 0.014 + 0.18));
    if (t < develop + i * 0.014) {                                     // not yet a cat: only the place each stripe will take
      if (x < lerp(PURR.x0 - 30, PURR.x1 + 30, drawn)) ctx.poly(stripe(PURR.h * PURR.amp[i], i % 2).map(([px, py]) => [x + px, PURR.y + py]), { close: true, color: 'line', width: 2.5 });
      continue;
    }
    const breath = 1 + 0.09 * Math.sin((TAU * (t - develop)) / 1.846 - i * 0.45) * prog(t, develop + 0.3, develop + 0.6);
    const h = PURR.h * PURR.amp[i] * grow * breath, pts = stripe(h, i % 2), put = (dx, dy, o) => ctx.poly(pts.map(([px, py]) => [x + px + dx, PURR.y + py + dy]), { close: true, ...o });
    const t0 = 0.08 + 0.016 * ((i * 5) % n);                            // when this one lets go
    if (since < t0) { put(10, 10, { fill: true, color: 'bg' }); put(0, 0, { fill: true, color: since >= i * 0.006 ? 'text' : 'me' }); continue; }
    put(0, 0, { color: 'meDim', width: 2.5 });                          // where it stood
    const fly = 2300 * clamp((since - t0 - 0.05) / 0.36) ** 2.2, lane = 200 + (600 * ((i * 5) % n)) / (n - 1);
    if (fly - h > 1920 - x + 40) continue;
    ctx.at(x + fly, lerp(PURR.y, lane, easeOut(prog(since, t0, t0 + 0.2))), () => {
      g.translate(-x, -PURR.y);
      put(8, 8, { fill: true, color: 'bg' }); put(0, 0, { fill: true, color: 'text' });
    }, { rot: (Math.PI / 2) * easeInOut(prog(since, t0, t0 + 0.15)) });
  }
}

/**
 * P.at = the cut (the head of the noun phrase): herself, in characters;  P.ears = the noun: the same, with cat ears;
 * P.develop = the downbeat the characters develop on: cat_paws in three solid inks, and her purr as stripes;
 * P.hit = the keyword: the stripes are given.
 */
export function plateCat(ctx, env, P) {
  const { t, at, ears, develop, hit } = P, { art } = env, g = ctx.g, a = flashIn(t, at);
  sheet(ctx, [650, 520, 620, 'raised', 1]);
  purrRoom(ctx, t);
  const text = dataText((env.script.cards_section6 ?? [])[2], 'purr:25-150Hz·', ''), kf = FIG.w / 1086;
  const flower = (name) => { const r = art.region(name, 'flower'); return r ? [r.x + r.w / 2, r.y + r.h / 2] : [760, 217]; };
  const fb = flower('f_bust'), fp = flower('cat_paws'), PAWS = { x: FIG.x + (fb[0] - fp[0]) * kf, y: FIG.y + (fb[1] - fp[1]) * kf, w: FIG.w, h: FIG.h };
  const CAT = art.fit('cat_bust', FIG) ?? FIG, dev = prog(t, develop, develop + 0.14), k = 1 + 0.04 * pulse(t - at, 16) + 0.03 * pulse(t - develop, 14);
  purr(ctx, P);
  if (a > 0) ctx.clip({ x: 0, y: 0, w: 1920, h: FOOT }, () => ctx.at(650 * (1 - k), 540 * (1 - k), () => {
    const a0 = g.globalAlpha;
    g.globalAlpha = a0 * a;
    if (dev < 1) {                                                      // in characters (below the edge of the solid print, once that has started)
      g.save(); g.beginPath(); g.rect(-100, PAWS.y + PAWS.h * dev, 2200, 1400); g.clip();
      if (t < ears) glyphFigure(ctx, env, 'f_bust', FIG, { text, key: 'v2cat', decode: t < at + 0.3 ? { k: prog(t, at, at + 0.3), t, seed: 43 } : null });
      else {
        const raw = prog(t, ears, ears + 0.18), kc = CAT.w / 1086, cat = () => glyphFigure(ctx, env, 'cat_bust', CAT, { text, key: 'v2cat' });
        const boxes = raw < 1 ? [0, 1].map((i) => art.region('cat_bust', `ears.${i}`)).filter(Boolean).map((r) => ({ x: CAT.x + r.x * kc, y: CAT.y + r.y * kc, w: r.w * kc, h: r.h * kc })) : [];
        if (!boxes.length) cat();
        else {                                                          // the ears pop up: everything but them, then each ear rising from its root
          g.save(); g.beginPath(); g.rect(-100, -100, 2200, 1400); for (const b of boxes) g.rect(b.x, b.y, b.w, b.h); g.clip('evenodd');
          cat(); g.restore();
          for (const b of boxes) ctx.at(b.x + b.w / 2, b.y + b.h, () => ctx.clip({ x: -b.w / 2, y: -b.h, w: b.w, h: b.h }, () => { g.translate(-(b.x + b.w / 2), -(b.y + b.h)); cat(); }), { sy: Math.max(0.03, easeBack(raw)) });
        }
      }
      g.restore(); ctx._font = '';
    }
    if (dev > 0) {                                                      // developed: three solid inks, wiped down the sheet in a few frames
      art.inks(ctx, 'cat_paws', PAWS, { reveal: dev });
      if (dev < 1) ctx.rect(PAWS.x, PAWS.y + PAWS.h * dev - 5, PAWS.w, 10, { fill: true, color: 'meHot' });
    }
    g.globalAlpha = a0;
  }, { scale: k }));
  caption(ctx, env, t, P.lines);
  typing(ctx, t, P.next);
  word(ctx, P);
}

// ============================================================================================ the proof (be god)
/** The cream plate starts this far to the right of its place, under the user's bubble. */
const SLIDE = 640;

/** The sun behind her: a disc and two lengths of rays, flat orange, centred on (cx, cy). k = 0..1 the rays shooting out. */
function sun(ctx, cx, cy, k) {
  const g = ctx.g, r0 = 190, N = 28;
  for (const [role, pick, len, w] of [['meDim', 0, 800, 0.066], ['me', 1, 520, 0.03]]) {
    g.beginPath();
    for (let i = pick; i < N; i += 2) {
      const an = (i / N) * TAU + 0.11, r1 = lerp(r0, len, k);
      g.moveTo(cx + Math.cos(an - w) * r0, cy + Math.sin(an - w) * r0);
      g.lineTo(cx + Math.cos(an) * r1, cy + Math.sin(an) * r1);
      g.lineTo(cx + Math.cos(an + w) * r0, cy + Math.sin(an + w) * r0);
      g.closePath();
    }
    g.fillStyle = ctx.col(role, 1); g.fill();
  }
  ctx.circle(cx, cy, r0 * 1.04, { fill: true, color: 'meDim' });
}
/** A registration target (a proof sheet carries one per plate: in register they coincide). */
function target(ctx, x, y, color) {
  ctx.circle(x, y, 13, { color, width: 3 });
  ctx.line(x - 24, y, x + 24, y, { color, width: 3 }); ctx.line(x, y - 24, x, y + 24, { color, width: 3 });
}

/**
 * P.sun = the noun: the sun behind her;  P.slide = the kick on which the missing cream plate leaves the user's bubble;
 * P.hit = the keyword: it is in register, she is whole;  P.bubble = { text, xr, y, size } the user's request, as cut
 * paper, where the interface had it;  P.rest / P.to / P.leave / P.until = the pointer: where it waits (restScale: at what
 * size), where it goes, from when until when.
 */
export function plateProof(ctx, env, P) {
  const { t, at, hit, bubble } = P, { art } = env, g = ctx.g, a = flashIn(t, at), kf = FIG.w / 1086;
  const lit = clamp((t - P.sun) * 30);                                  // the light goes up once, with the sun, and stays
  sheet(ctx, [650, 520, 620, 'raised', 0.5 + 0.5 * lit]);
  const face = art.region('f_bust', 'face') ?? { x: 367, y: 259, w: 313, h: 369 }, C = [FIG.x + (face.x + face.w / 2) * kf, FIG.y + (face.y + face.h / 2) * kf];
  const whole = t >= hit, dx = SLIDE * (1 - easeInOut(prog(t, P.slide, hit))), k = 1 + 0.03 * pulse(t - hit, 18);
  if (a > 0) ctx.clip({ x: 0, y: 0, w: 1920, h: FOOT }, () => {
    const a0 = g.globalAlpha;
    g.globalAlpha = a0 * a;
    if (t >= P.sun) sun(ctx, C[0], C[1], easeOut(prog(t, P.sun, P.sun + 0.12)));
    target(ctx, FIG.x - 96, 760, 'mute');
    ctx.at(C[0] * (1 - k), C[1] * (1 - k), () => {
      if (whole) art.inks(ctx, 'f_bust', FIG);                          // in register: the three plates
      else {
        art.inks(ctx, 'f_bust', FIG, { roles: { cream: null } });       // the proof: orange and black only; her face is a void in her hair
        if (t >= P.slide) {                                             // the plate that was missing, on its way over from the user
          const ap = flashIn(t, P.slide);
          for (const [role, o] of [['bg', [dx + 10, 10]], ['text', [dx, 0]]]) art.inks(ctx, 'f_bust', FIG, { alpha: ap, plates: [{ ink: 'cream', role, exact: true, offset: o }] });      // (its shadow plate, then itself)
        }
      }
    }, { scale: k });
    if (t >= P.slide) target(ctx, FIG.x - 96 + dx, 760, 'text');
    g.globalAlpha = a0;
  });
  // the user's request, cut out of cream paper, where the interface had the bubble
  const b = youBox(ctx, bubble.text, bubble.size), bx = bubble.xr - b.w, rad = Math.min(b.h * 0.42, bubble.size * 0.95);
  ctx.rrect(bx + 10, bubble.y + 10, b.w, b.h, rad, { fill: 'bg' });
  ctx.rrect(bx, bubble.y, b.w, b.h, rad, { fill: 'text' });
  b.lines.forEach((ln, i) => ctx.text(ln, bx + b.padX, bubble.y + b.padY + (i + 0.76) * bubble.size * 1.28, { size: bubble.size, weight: 500, color: 'bg' }));
  caption(ctx, env, t, P.lines);
  if (whole) ctx.glow('me', 30, () => word(ctx, P, 'meHot'), 0.5);      // the keyword is hers, and lit
  // the pointer: it waits by its message, then leaves for the settings
  const go = easeInOut(prog(t, P.leave, P.until ?? P.leave + 0.5)), px = lerp(P.rest[0], P.to[0], go), py = lerp(P.rest[1], P.to[1], go), ps = lerp(P.restScale ?? 3.2, 1.5, go);
  arrow(ctx, px + 4 * ps, py + 4 * ps, ps, { color: 'bg', edge: null });
  arrow(ctx, px, py, ps, { color: 'text', edge: 'bg' });
}

// ---------------------------------------------------------------------------------------------- check cards
export function labCards(env) {
  const line = (i) => env.lyrics.lines[i].text, far = { from: 1e9, to: 1e9 + 1, text: '' };
  const fruit = (kind, t, P) => ({ palette: 'warm', render: (ctx) => plateFruit(ctx, env, { t, at: 0, settle: 0.3, open: 20, hit: 40, kind, word: '', lines: [], next: far, ...P }) });
  const cat = (t) => ({ palette: 'warm', render: (ctx) => plateCat(ctx, env, { t, at: 0, ears: 10, develop: 20, hit: 30, word: line(52), lines: [], next: far }) });
  const proof = (t) => ({ palette: 'warm', render: (ctx) => plateProof(ctx, env, { t, at: 0, sun: 10, slide: 20, hit: 21, word: line(55), lines: [], bubble: { text: (env.script.cards_section6 ?? [])[3]?.request ?? '', xr: 1739, y: 126, size: 56 }, rest: [1690, 300], to: [1637, 103], leave: 40 }) });
  return {
    verse2: [
      fruit('eggplant', 5), fruit('eggplant', 25), fruit('tomato', 5), fruit('tomato', 25),
      fruit('eggplant', 40.2), fruit('eggplant', 40.6), fruit('tomato', 40.2), fruit('tomato', 40.6),
      cat(5), cat(15), cat(25), cat(30.3),
      proof(5), proof(15), proof(20.5), proof(25),
    ],
  };
}
