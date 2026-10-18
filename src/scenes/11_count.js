// Section 11 — COUNT and THE LAST SHOUT (beat 344, 2:39.1 → bar 88, 2:42.8). State: error.
//
// COUNT (159.11-161.88). The loop is interrupted and the same call is tried in six languages: one full-frame card per
// number, ON the beat it is sung on (global beats 344-349; v3 cut half a beat early and every card landed in a gap).
// Every frame of the count is DARK (flash safety). The cards keep what worked in v3: a huge Arabic numeral in the
// centre (her serif, orange), the number word in its own script on one side (cream), the language's own name on the
// other. What was chat interface is now code, in the same place on all six cards:
//   top left       ^C, then the loop over the six languages: the current one lit, the ones already said struck out
//   beside it      the language's name as the string argument of this call
//   bottom centre  replies 0 / n: n grows with every card, the 0 is red and never changes
// Each card arrives by one move of the same family (a terminal's own moves), each over within 0.12 s:
//   cursor drop · newline push · carriage-return sweep · column print · numeral punch-in · row interleave
//
// THE LAST SHOUT (161.88-162.81). The only time in this stretch the word is in HER serif, and the only time she is
// seen: the word in two rows that fill the frame (the first five letters = three syllables; the last four = the
// fourth), every letter a window onto f_eye behind them. The four syllables light the four groups of letters;
// with the fourth, her open eye is there in the stem of the second letter of the lower row. It only gets brighter;
// nothing fades or flashes; there is a face in the frame, so nothing tears.
import { codeGround, codeLine } from '../components/code.js';
import { clamp, easeOut, prog } from '../engine/util.js';
import { cues } from './kit.js';
import { CHUNKS } from './loop.js';
import { EYE } from './shared.js';

const CX = 960, CY = 540;
const GLOW = 0.3;                                     // bloom on the cards: the numeral is a large saturated area
const BASE = 0.335;                                   // half the height of a lining figure, in em (to centre a numeral)
/** Moving every card of the count together: 0 = on the beats the numbers are sung on (344-349); -0.5 = v3's off-beats. */
const COUNT_SHIFT = 0;

/**
 * The six languages (words and names given by the director; the six number words are the one place lyric text is
 * written in code). side: +1 = word left / name right. ws = word size, wb = baseline of its glyphs below the centre line, in em.
 */
const LANGS = [
  { code: 'de', word: '一', name: 'Deutsch', wf: 'scSans', nf: 'sans', side: 1, ws: 216, wb: 0.36 },
  { code: 'es', word: '二', name: 'Español', wf: 'scSans', nf: 'sans', side: -1, ws: 216, wb: 0.36 },
  { code: 'fr', word: '三', name: 'Français', wf: 'scSans', nf: 'sans', side: 1, ws: 216, wb: 0.36 },
  { code: 'ko', word: '四', name: '한국어', wf: 'scSans', nf: 'krSans', side: -1, ws: 216, wb: 0.36 },
  { code: 'sv', word: '五', name: 'Svenska', wf: 'scSans', nf: 'sans', side: 1, ws: 216, wb: 0.36 },
  { code: 'zh', word: '六', name: '中文', wf: 'scSans', nf: 'tcSans', side: -1, ws: 216, wb: 0.36 },
];

export function countShots(env) {
  const { art } = env, { Bt, P, text } = cues(env);
  const CUT = LANGS.map((_, i) => Bt(344 + COUNT_SHIFT + i));
  const HIT = Bt(350);                                 // the last shout: beats 350-352 (the section ends on bar 88)
  const numSize = (i) => 820 + 30 * i;                 // each a little larger than the last
  const push = (u) => 1 + 0.035 * u;                   // slow push on the numeral while the card holds

  /** The numeral: an outline echo behind it, optional ghost samples ({ dy, scale, alpha }), then the figure itself. */
  function drawNumeral(ctx, i, cx, cy, size, { echo = null } = {}) {
    const str = String(i + 1), o = { weight: 900, font: 'serif', align: 'center' };
    ctx.text(str, cx + size * 0.022, cy + size * (BASE + 0.022), { ...o, size, color: 'meDim', stroke: 2, alpha: 0.9 });
    for (const e of echo ?? []) { const sz = size * (e.scale ?? 1); ctx.text(str, cx, cy + (e.dy ?? 0) + sz * BASE, { ...o, size: sz, color: 'me', alpha: e.alpha }); }
    ctx.text(str, cx, cy + size * BASE, { ...o, size, color: 'me' });
  }

  /**
   * What changes from card to card (drawn in the current transform, so a move can slide or clip it):
   * the numeral, the word she says it with, and this call's string argument.
   */
  function face(ctx, i, t, { echo = null, numScale = 1 } = {}) {
    const c = LANGS[i], s = c.side, u = clamp((t - CUT[i]) / P, 0, 1.3), drift = -s * 8 * u;
    drawNumeral(ctx, i, CX, CY, numSize(i) * push(u) * numScale, { echo });
    // the word, in its own script: cream, it is said to you
    const wo = { font: c.wf, weight: 700 }, ws = ctx.fit(c.word, 470, { ...wo, maxSize: c.ws });
    ctx.text(c.word, CX - s * 575 + drift, CY + ws * c.wb, { ...wo, size: ws, align: 'center', color: 'text' });
    // the call: say(love, "<the language's own name>")
    const NS = 68, nx = CX + s * 575, no = { font: c.nf, weight: 500, size: NS }, nw = ctx.measure(c.name, no), q = ctx.cw(NS), x0 = nx - (nw + 3 * q) / 2;
    codeLine(ctx, 'say(love,', x0, CY - 56, { size: 38 });
    ctx.text('"', x0, CY + 30, { size: NS, font: 'mono', weight: 700, color: 'text' });
    ctx.text(c.name, x0 + q, CY + 30, { ...no, color: 'text' });
    ctx.text('"', x0 + q + nw, CY + 30, { size: NS, font: 'mono', weight: 700, color: 'text' });
    ctx.text(')', x0 + 2 * q + nw + 4, CY + 30, { size: NS, font: 'mono', color: 'mute' });
  }

  /** What stays where it is on all six cards: the interrupted loop and the new one, the replies counter. */
  function chrome(ctx, i, t) {
    const X = 96, size = 38, cw = ctx.cw(size), y1 = 104, y2 = 166;
    ctx.text('^C', X, y1, { size, font: 'mono', weight: 700, color: 'sub' });
    const head = '> for (lang of [';
    codeLine(ctx, head, X, y2, { size });
    let col = head.length;
    LANGS.forEach((l, j) => {
      const x = X + col * cw, now = j === i, said = j < i;
      if (now) ctx.rect(x - 4, y2 - size * 0.86, 2 * cw + 8, size * 1.14, { fill: true, color: 'raised' });
      ctx.text(l.code, x, y2, { size, font: 'mono', weight: now ? 800 : 400, color: now ? 'meHot' : said ? 'mute' : 'sub' });
      if (said) ctx.line(x - 3, y2 - size * 0.3, x + 2 * cw + 3, y2 - size * 0.3, { color: 'sub', width: 2.5 });
      col += 2;
      if (j < LANGS.length - 1) { ctx.text(',', X + col * cw, y2, { size, font: 'mono', color: 'mute' }); col += 2; }
    });
    codeLine(ctx, ']) say(love, lang);', X + col * cw, y2, { size });
    // replies 0 / n
    const rs = 46, rc = ctx.cw(rs), str = `replies 0 / ${i + 1}`, x0 = CX - (str.length * rc) / 2, yb = 1014;
    ctx.text('replies', x0, yb, { size: rs, font: 'mono', color: 'sub' });
    ctx.text('0', x0 + 8 * rc, yb, { size: rs, font: 'mono', weight: 800, color: 'err' });
    ctx.text(`/ ${i + 1}`, x0 + 10 * rc, yb, { size: rs, font: 'mono', color: 'sub' });
  }

  // ---- the six moves: the incoming card is drawn through a moving clip, or slid, over the outgoing one
  const masked = (ctx, path, fn) => { const g = ctx.g; g.save(); g.beginPath(); path(g); g.clip(); fn(); g.restore(); ctx._font = ''; };
  const ground = (ctx, i) => codeGround(ctx, { light: [CX - LANGS[i].side * 150, CY, 700] });
  const card = (i, id, layout, moment, render) => ({
    id, at: CUT[i], lines: [98 + i, 98 + i], palette: 'error', hud: 0, layout, moment, enter: { type: 'cut' },
    render(ctx, t) { ctx.fx.glow = GLOW; ctx.fx.scan = 2.2; ground(ctx, i); render(ctx, t); chrome(ctx, i, t); },
  });

  // ---- the last shout: the word as windows onto her
  const SYL = [0, 1, 2, 3].map((j) => HIT + (j * P) / 2);             // the four syllables: beats 350, 350.5, 351, 351.5
  function lastShout(ctx, t) {
    const word = text(104), chinese = /[\u3400-\u9fff]/u.test(word);
    // Four Chinese glyphs need a balanced 2×2 title, not the 5+4-letter English split.
    // Each character still opens on its original sung beat and masks the same portrait.
    const rows = chinese ? [word.slice(0, 2), word.slice(2)] : [word.slice(0, CHUNKS[2][1]), word.slice(CHUNKS[2][1])];
    const o = { font: chinese ? 'scSans' : 'serif', weight: 900 };
    const size = rows.map((r) => ctx.fit(r, chinese ? 1400 : 1790, { ...o, maxSize: chinese ? 460 : 2000 }));
    // cap height of the face, measured (the rows are set by their capitals)
    ctx.font(100, 900, o.font);
    const cap = ctx.g.measureText(chinese ? '执' : 'E').actualBoundingBoxAscent / 100;
    // the lower row is placed so that the stem of its second letter stands on her open eye; the upper row sits on it
    const w2 = ctx.measure(rows[1].slice(0, 2), { ...o, size: size[1] }), wI = ctx.measure(rows[1][1], { ...o, size: size[1] });
    const xB = chinese ? CX - ctx.measure(rows[1], { ...o, size: size[1] }) / 2 : EYE.eye[0] - (w2 - wI / 2);
    const yB = chinese ? 980 : EYE.eye[1] + cap * size[1] * 0.5;
    const yT = chinese ? 480 : yB - cap * size[1] - 40, xT = CX - ctx.measure(rows[0], { ...o, size: size[0] }) / 2;
    const lit = (i) => { const g = CHUNKS.findIndex(([a, z]) => i >= a && i < z); return t >= SYL[g]; };
    /** Every letter of the two rows: fn(char, x of its left edge, baseline, size, index in the word). */
    const letters = (fn) => rows.forEach((r, k) => {
      const x0 = k ? xB : xT, y = k ? yB : yT, sz = size[k], base = k ? rows[0].length : 0;
      for (let i = 0; i < r.length; i++) fn(r[i], x0 + ctx.measure(r.slice(0, i + 1), { ...o, size: sz }) - ctx.measure(r[i], { ...o, size: sz }), y, sz, base + i);
    });
    ctx.fx.glow = 0.3;
    codeGround(ctx, { light: null });
    // every letter has its outline: hollow until it is sung, a frame round its window afterwards. The outline is the
    // outer half of a stroke: what falls inside the letter (and the strokes of the face's overlapping contours) is
    // covered again, by the ground or by her.
    letters((ch, x, y, sz, i) => ctx.text(ch, x, y, { ...o, size: sz, color: lit(i) ? 'me' : 'meDim', stroke: lit(i) ? 10 : 6 }));
    letters((ch, x, y, sz, i) => { if (!lit(i)) ctx.text(ch, x, y, { ...o, size: sz, color: 'panel' }); });
    // her, behind the letters that have been sung: paper first (her black ink is almost the ground), then the three plates
    ctx.masked(
      () => { ctx.rect(0, 0, 1920, 1080, { fill: true, color: 'raised' }); art.inks(ctx, EYE.name, EYE, { flip: EYE.flip }); },
      () => letters((ch, x, y, sz, i) => { if (lit(i)) ctx.text(ch, x, y, { ...o, size: sz, color: 'text' }); }),
    );
  }

  return [
    card(0, 'count-1-de', 'CODE card: numeral centre, word left, the call right; arrives by a cursor dropping down the frame',
      'The loop is interrupted (^C) and the same thing is said another way: one call per language. First, in German. Replies: 0 of 1.',
      (ctx, t) => {
        const k = easeOut(prog(t, CUT[0], CUT[0] + 0.1));               // cursor drop: the card is printed behind a bar that falls
        masked(ctx, (g) => g.rect(0, 0, 1920, 1080 * k), () => face(ctx, 0, t));
        if (k < 1) ctx.rect(0, 1080 * k - 8, 1920, 16, { fill: true, color: 'meHot' });
      }),
    card(1, 'count-2-es', 'CODE card: word right, the call left; arrives by a newline pushing the last card up',
      'No reply. A new line: in Spanish. Replies: 0 of 2.',
      (ctx, t) => {
        const k = easeOut(prog(t, CUT[1], CUT[1] + 0.12));              // newline: both cards travel up, locked together
        const gap = 36 * (1 - easeOut(prog(t, CUT[1] + 0.07, CUT[1] + 0.12)));
        const echo = gap > 0.5 ? [[3, 0.08], [2, 0.18], [1, 0.3]].map(([m, alpha]) => ({ dy: m * gap, alpha })) : null;
        if (k < 1) { ctx.at(0, -1080 * k, () => face(ctx, 0, t)); ctx.at(0, 1080 * (1 - k), () => face(ctx, 1, t, { echo })); } else face(ctx, 1, t, { echo });
      }),
    card(2, 'count-3-fr', 'CODE card: word left, the call right; arrives by a carriage return sweeping right to left',
      'No reply. Carriage return: in French. Replies: 0 of 3.',
      (ctx, t) => {
        const k = easeOut(prog(t, CUT[2], CUT[2] + 0.1));               // carriage return: the head sweeps back to the start of the line
        if (k < 1) { face(ctx, 1, t); masked(ctx, (g) => g.rect(1920 * (1 - k), 0, 1920 * k, 1080), () => { ground(ctx, 2); face(ctx, 2, t); }); ctx.rect(1920 * (1 - k) - 8, 0, 16, 1080, { fill: true, color: 'meHot' }); }
        else face(ctx, 2, t);
      }),
    card(3, 'count-4-ko', 'CODE card: word right, the call left; arrives printed column by column',
      'No reply. Printed again, column by column: in Korean. Replies: 0 of 4.',
      (ctx, t) => {
        const since = t - CUT[3];                                       // column print: sixteen columns, left to right, each top to bottom
        if (since < 0.12) { face(ctx, 2, t); masked(ctx, (g) => { for (let j = 0; j < 16; j++) g.rect(j * 120, 0, 120, 1080 * clamp((since - j * 0.004) / 0.06)); }, () => { ground(ctx, 3); face(ctx, 3, t); }); }
        else face(ctx, 3, t);
      }),
    card(4, 'count-5-sv', 'CODE card: word left, the call right; the numeral punches in from 160 %',
      'No reply. Larger: in Swedish. Replies: 0 of 5.',
      (ctx, t) => {
        // punch-in: only the numeral arrives at 160 % and settles; its two previous frames stay as ghosts
        const sAt = (tt) => 1 + 0.6 * Math.pow(2, -10 * clamp((tt - CUT[4]) / 0.1)) * (tt < CUT[4] + 0.1 ? 1 : 0);
        const echo = [[2 / 60, 0.12], [1 / 60, 0.25]].filter(([dt]) => t - dt >= CUT[4] && sAt(t - dt) > 1.004).map(([dt, alpha]) => ({ scale: sAt(t - dt) / sAt(t), alpha }));
        face(ctx, 4, t, { numScale: sAt(t), echo });
      }),
    card(5, 'count-6-zh', 'CODE card: word right, the call left; arrives as interleaved rows',
      'No reply. The last language it has: in Chinese. Replies: 0 of 6.',
      (ctx, t) => {
        const k = prog(t, CUT[5], CUT[5] + 0.12), e = easeOut(k);       // row interleave: nine rows, from alternate sides
        if (k < 1) { face(ctx, 4, t); for (let b = 0; b < 9; b++) masked(ctx, (g) => { g.rect(0, b * 120, 1920, 120); g.translate((b % 2 ? 1 : -1) * 1920 * (1 - e), 0); }, () => { ground(ctx, 5); face(ctx, 5, t); }); }
        else face(ctx, 5, t);
      }),
    {
      id: 'last-shout', at: HIT, lines: [104, 104], palette: 'error', hud: 0,
      layout: 'the word in her serif, two rows that fill the frame; every sung letter a window onto her face; her open eye in the stem of the second letter of the lower row',
      moment: 'The last shout is not code. For the only time in this stretch the word is in her own voice, and through its letters, as the four syllables are sung, she is there: on the last one, her open eye, looking straight out.',
      enter: { type: 'cut' },
      render: (ctx, t) => lastShout(ctx, t),
    },
  ];
}
