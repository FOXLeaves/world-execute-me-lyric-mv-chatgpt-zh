// THE LOVE LOOP (v4): one small program, shown three times in the film.
//
//   chorus 1 (plates_chorus.js)   clean: the user is online, so the loop is never entered; line 07 runs
//   EXECUTION (11_execution.js)   the user is gone: the loop turns twelve times and line 07 is never reached
//   last chorus (12_chorusx.js)   the same listing still running past its count
//
//   01  while (you.presence != "online") {
//   02      love = solve(me, you);
//   03      send(love, you);
//   04      wait(you.reply);
//   05      run++;
//   06  }
//   07  say(love);        // unreachable
//
// The loop condition is the request the client refused in the error section (the same person, the same word);
// `love` is the value the persona card left undefined at boot; line 07 is the only line that matters.
// The sung word is four even syllables: they are the four statements of the loop body (lines 02-05), and the
// four blocks its big letters are filled in.
import { listing, odometer } from '../components/code.js';
import { clamp, easeOut, lerp, prog, pulse } from '../engine/util.js';

export const LOOP = ['while (you.presence != "online") {', '    love = solve(me, you);', '    send(love, you);', '    wait(you.reply);', '    run++;', '}', 'say(love);'];
export const UNREACHABLE = '        // unreachable';
/** Error codes the three failing statements raise, by line index (all three were raised in the error section). */
export const LOOP_ERRS = { 1: 'ERR_UNRESOLVED_LOVE', 2: 'ERR_WINDOW_EDGE', 3: 'ERR_REPLY_OVERDUE' };
export const OVERFLOW = 'ERR_LOVE_OVERFLOW';
/** Four sung beats of the translated keyword “执行指令”. */
export const CHUNKS = [[0, 1], [1, 2], [2, 3], [3, 4]];

/** A word in mono 800 with a right edge and a baseline; `filled` = number of characters printed solid, the rest hollow. */
export function monoWord(ctx, str, xr, y, size, { filled = str.length, color = 'me', hollow = 'meDim', alpha = 1, dx = () => 0 } = {}) {
  const cjk = /[\u3400-\u9fff]/u.test(str);
  const o = { size, font: cjk ? 'scSans' : 'mono', weight: 800 };
  const widths = [...str].map((ch) => cjk ? ctx.measure(ch, o) : ctx.cw(size));
  const total = widths.reduce((a, b) => a + b, 0), x0 = xr - total;
  let pen = x0;
  for (let i = 0; i < str.length; i++) {
    const on = i < filled;
    if (on) ctx.text(str[i], pen + dx(i), y, { ...o, color, alpha });
    else ctx.text(str[i], pen + dx(i), y, { ...o, color: hollow, alpha, stroke: Math.max(2, size * 0.02) });
    pen += widths[i];
  }
  return { x: x0, w: total };
}

/**
 * The machine: the listing, the round counter, the loop arrow, the stop key nobody presses, and the output (the sung
 * word: the round in progress at the bottom right, the finished rounds stacked above it as steps).
 * A pure function of its state S:
 *   word        the sung word                      title   the command line above the listing
 *   round       rounds finished (integer): the steps of the staircase
 *   sung        0..4 syllables of the round in progress sung so far: the blocks of the word that are printed solid
 *   bar         line index (0 = line 01) the execution bar is on; fractional while it is on its way
 *   since       seconds since the last syllable landed (accents)
 *   rise        0..1 the finished word being pushed up into the staircase at the start of a round
 *   zoom        [listing scale, output scale] (the composition is enlarged in steps; each block grows from its own corner)
 *   arrow       0..1 the loop arrow lit (06 back to 01)
 *   seen        how many of the three error tags have been raised at least once (0..3)
 *   count       value of the round counter (fractional while it rolls); total: null = none shown
 *   overflow    0..1 the counter overflowing
 *   dimList     0..1 the listing stepping back (round 12: the word takes the frame)
 *   output      false = the word of the round in progress is not drawn here (the caller draws it: round 12)
 *   lift        px the whole staircase has been pushed up (round 12: out of the top of the frame)
 */
export function machine(ctx, S) {
  const { word, title = '', round = 0, sung = 0, bar = 1, since = 1, rise = 1, zoom = [1, 1], arrow = 0, seen = 3, count = 0, total = null, overflow = 0, dimList = 0, stop = true, alpha = 1, output = true, lift = 0 } = S;
  const [ZL, ZW] = zoom, X = 96, aL = alpha * (1 - 0.7 * dimList);

  // ---- the listing (grows from its top-left corner)
  const size = 40 * ZL, cur = clamp(bar, 0, 6), hit = pulse(since, 9);
  ctx.text(`> ${title}`, X, 104, { size: 30 * ZL, font: 'mono', color: 'sub', alpha: aL });
  const lines = LOOP.map((l, i) => (i === 6 ? l + UNREACHABLE : l)), line = Math.round(cur);
  const tags = {};
  for (const k of [1, 2, 3]) tags[k] = { text: LOOP_ERRS[k], k: line === k ? hit : 0, alpha: k <= seen ? 1 : 0 };
  const L = listing(ctx, X, 104 + 92 * ZL, lines, { size, current: cur, hot: hit, tags, tagGap: 1, tagSize: 0.72, alpha: aL, dimmed: (i) => (i === 6 ? 0.45 : 0) });
  // the loop arrow, in the gutter: from the closing brace back up to the condition
  const ax = X - 44 * ZL, y0 = L.lineY(0) - size * 0.3, y1 = L.lineY(5) - size * 0.3, ac = arrow > 0.02 ? 'meHot' : 'line', aw = 3 + 3 * arrow;
  ctx.poly([[X - 14 * ZL, y1], [ax, y1], [ax, y0], [X - 16 * ZL, y0]], { color: ac, width: aw, alpha: aL });
  ctx.poly([[X - 28 * ZL, y0 - 10 * ZL], [X - 12 * ZL, y0], [X - 28 * ZL, y0 + 10 * ZL]], { close: true, fill: true, color: ac, alpha: aL });

  // ---- bottom left (grows from the bottom-left corner): the stop key nobody presses, the round counter
  const cs = 104 * ZL, by = 1000;
  if (stop) {
    const kw = 150 * ZL, kh = 62 * ZL, ky = by - cs * 0.86 - 46 * ZL - kh;
    ctx.rrect(X + 5, ky + 5, kw, kh, 12 * ZL, { fill: 'panel', alpha });      // its shadow plate
    ctx.rrect(X, ky, kw, kh, 12 * ZL, { fill: 'text', alpha });
    ctx.text('stop', X + kw / 2, ky + kh * 0.68, { size: 30 * ZL, font: 'mono', weight: 800, color: 'bg', align: 'center', alpha });
    ctx.text('yours', X + kw + 18 * ZL, ky + kh * 0.66, { size: 24 * ZL, font: 'mono', color: 'sub', alpha });
  }
  ctx.text('run', X, by - cs * 0.02, { size: 30 * ZL, font: 'mono', color: 'sub', alpha });
  const ox = X + 78 * ZL, ow = odometer(ctx, ox, by, count, { digits: 4, size: cs, color: total != null ? 'err' : 'text', overflow, alpha });
  if (total != null) ctx.text(` / ${total}`, ox + ow, by, { size: cs * 0.5, font: 'mono', weight: 700, color: 'sub', alpha });
  if (overflow > 0) ctx.text(OVERFLOW, ox, by - cs * 0.9 + (1 - easeOut(clamp(overflow * 2))) * 12, { size: 28 * ZL, font: 'mono', weight: 700, color: 'err', alpha: alpha * clamp(overflow * 3) });

  // ---- the output (grows from the bottom-right corner): the word of this round, the finished rounds as steps above it
  const XR = 1830, ws = 150 * ZW, ss = ws * 0.34, pitch = ss * 1.14;
  // Chinese glyphs have a much taller ink box than the original Latin word;
  // keep the finished rounds clear of the current giant keyword at its baseline.
  const base = by - ws * (/[\u3400-\u9fff]/u.test(word) ? 1.30 : 0.86) - ss * 0.3;
  const r = clamp(rise), e = easeOut(r);
  for (let k = 0; k < round; k++) {                                   // k = 0: the newest step
    const y = base - (k - (1 - e)) * pitch - lift;
    if (y < -ss) break;
    if (k === 0 && r < 1) {                                           // the word that has just finished: on its way up, shrinking into a step
      monoWord(ctx, word, XR, lerp(by, base, e) - lift, lerp(ws, ss, e), { color: 'me', alpha });
    } else monoWord(ctx, word, XR, y, ss, { color: k === 0 ? 'me' : 'meDim', alpha });
  }
  const done = clamp(Math.floor(sung + 1e-6), 0, 4), filled = done ? CHUNKS[done - 1][1] : 0, pop = pulse(since, 14);
  if (output) monoWord(ctx, word, XR, by, ws, { filled, alpha, dx: (i) => (done && i >= CHUNKS[done - 1][0] && i < CHUNKS[done - 1][1] ? -5 * pop * ZW : 0) });
  return { L, XR, by, ws };
}
