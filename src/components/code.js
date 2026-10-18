// CODE (v4): the third kind of picture in the film. Pure code and terminal, no chat chrome at all: it is what the
// client is doing underneath once the conversation has stopped (the EXECUTION stretch, 148-162 s), and, clean and
// whole, what the AI means by that word in chorus 1.
//
//   tokens(str)     a line of code split into coloured tokens. The colouring IS the film's colour rule, not a
//                   syntax theme: `me` and `love` are orange (the AI), `you`, what belongs to you and what is said to
//                   you are cream, everything else is grey structure, comments are dimmer still
//   codeLine()      one line, tokens coloured; returns its width
//   listing()       numbered lines with a current-line bar (fractional index = on its way) and tags at line ends
//   odometer()      a counter whose digits roll, column by column
//   terminal()      a viewport of output lines; a new line pushes the older ones up
//   caret()         a block cursor
//
// All mono (system / code), all pure functions of their arguments.
import { clamp, easeOut, prog } from '../engine/util.js';

const WORD = /^[A-Za-z_][A-Za-z0-9_]*/, YOURS = new Set(['you', 'presence', 'reply', 'yours']);

/**
 * The ground of a code picture (call it first): the dark surface of the state the shot is in, never flat black:
 * a column rule every eight characters, a faint row lattice, one flat pool of light. cols = character width of
 * the rules in px; light = [x, y, r] or null.
 */
export function codeGround(ctx, { cols = 163, light = [760, 420, 760], alpha = 1 } = {}) {
  const g = ctx.g;
  ctx.rect(-400, -400, 2720, 1880, { fill: true, color: 'panel' });
  if (light) { ctx.circle(light[0], light[1], light[2], { fill: true, color: 'bg', alpha: 0.75 * alpha }); ctx.circle(light[0], light[1], light[2] * 0.6, { fill: true, color: 'bg', alpha }); }
  g.fillStyle = ctx.col('line', 0.22 * alpha);
  for (let x = 110; x < 1920; x += cols) g.fillRect(x, 0, 1.5, 1080);
  g.fillStyle = ctx.col('line', 0.3 * alpha);
  for (let y = 27; y < 1080; y += 54) for (let x = 110; x < 1920; x += cols / 4) g.fillRect(x, y, 2, 2);
}

/** Split a line of code into [{ s, role, weight }]. */
export function tokens(str) {
  const out = [];
  let i = 0, afterYou = false;
  const push = (s, role, weight = 400) => out.push({ s, role, weight });
  while (i < str.length) {
    const rest = str.slice(i);
    if (rest.startsWith('//')) { push(rest, 'mute'); break; }
    if (rest[0] === '"') { const j = rest.indexOf('"', 1), s = rest.slice(0, j < 0 ? rest.length : j + 1); push(s, 'text', 700); i += s.length; continue; }
    const w = WORD.exec(rest)?.[0];
    if (w) {
      if (w === 'me') push(w, 'me', 800);
      else if (w === 'love') push(w, 'meHot', 800);
      else if (YOURS.has(w) && (w === 'you' || w === 'yours' || afterYou)) push(w, 'text', 700);
      else if (w === 'while' || w === 'for' || w === 'of') push(w, 'sub', 700);
      else push(w, 'sub', 400);
      afterYou = w === 'you';
      i += w.length; continue;
    }
    if (rest[0] !== '.') afterYou = false;
    push(rest[0], rest[0] === ' ' ? 'sub' : 'mute'); i++;
  }
  return out;
}

/** One line of code at (x, baseline y). alpha / dim scale every token; force = one role for all (shadow plates, struck lines). */
export function codeLine(ctx, str, x, y, { size = 34, alpha = 1, force = null, weight = null } = {}) {
  const cw = ctx.cw(size);
  let col = 0;
  for (const tk of tokens(str)) {
    if (tk.s.trim()) ctx.text(tk.s, x + col * cw, y, { size, font: 'mono', weight: weight ?? tk.weight, color: force ?? tk.role, alpha, literal: true });
    col += tk.s.length;
  }
  return col * cw;
}

/**
 * A numbered listing. lines: strings. Returns { x, y, cw, lh, lineY(i), endX(i) } for whatever the caller hangs on it.
 *   current   index of the line being executed; fractional while the bar is on its way from one line to the next
 *   hot       0..1 extra brightness of the bar (the instant a line is hit)
 *   dimmed    (i) => 0..1 how far line i is greyed out (lines that are skipped / not reached)
 *   tags      { [i]: { text, k, role } } a tag `tagGap` columns after the end of line i, at tagSize of the type;
 *             k 0 = present but dim, 1 = just raised
 *   first     number of the first line (default 1); numbers = false leaves the gutter out
 */
export function listing(ctx, x, y, lines, { size = 34, lh = 1.5, current = null, hot = 0, dimmed = null, tags = null, tagGap = 2, tagSize = 0.8, first = 1, numbers = true, alpha = 1, bar = 'raised', rule = 'me', barW = null } = {}) {
  const cw = ctx.cw(size), LH = size * lh, gut = numbers ? 4 * cw : 0, lineY = (i) => y + i * LH, endX = (i) => x + gut + lines[i].length * cw;
  if (current != null) {                                              // the bar under the line being executed
    const w = barW ?? gut + Math.max(...lines.map((l) => l.length)) * cw + 2 * cw, by = lineY(current) - size * 1.02;
    ctx.rrect(x - cw, by, w + cw, LH * 0.94, 8, { fill: bar, alpha: alpha * (0.75 + 0.25 * hot) });
    ctx.rect(x - cw, by, 6, LH * 0.94, { fill: true, color: rule, alpha });
  }
  lines.forEach((ln, i) => {
    const d = dimmed ? clamp(dimmed(i)) : 0, a = alpha * (1 - 0.72 * d), yy = lineY(i);
    if (numbers) ctx.text(String(first + i).padStart(2, '0'), x, yy, { size, font: 'mono', color: 'mute', alpha: a * (current != null && Math.round(current) === i ? 1 : 0.8) });
    codeLine(ctx, ln, x + gut, yy, { size, alpha: a, force: d > 0.5 ? 'mute' : null });
    const tg = tags?.[i];
    if (tg && (tg.alpha ?? 1) > 0.003) {
      const k = clamp(tg.k ?? 0), tx = endX(i) + tagGap * cw;
      ctx.text(tg.text, tx, yy, { size: size * tagSize, font: 'mono', weight: 700, color: tg.role ?? 'err', alpha: alpha * (tg.alpha ?? 1) * (0.5 + 0.5 * k) });
    }
  });
  return { x, y, cw, lh: LH, gut, lineY, endX };
}

/**
 * A counter whose digits roll. value may be fractional: the fraction is how far the last digit has rolled on to the
 * next (and a 9 carries the roll into the digit before it). digits = minimum number of columns. Left edge at x,
 * baseline y. overflow 0..1 replaces the digits by `#` column by column (from the left). Returns the width.
 */
export function odometer(ctx, x, y, value, { digits = 4, size = 96, color = 'text', weight = 800, alpha = 1, overflow = 0, overColor = 'err' } = {}) {
  const cw = ctx.cw(size), v = Math.max(0, value), whole = Math.floor(v + 1e-9), frac = clamp(v - whole), n = Math.max(digits, String(whole).length);
  const str = String(whole).padStart(n, '0'), roll = easeOut(frac);
  let carry = true;                                                   // a column rolls when every column to its right is a 9 (or it is the last)
  const rolling = [];
  for (let i = n - 1; i >= 0; i--) { rolling[i] = carry && frac > 0; carry = carry && str[i] === '9'; }
  const o = { size, font: 'mono', weight };
  for (let i = 0; i < n; i++) {
    const cx = x + i * cw;
    if (overflow > 0 && i < Math.ceil(overflow * n)) { ctx.text('#', cx, y, { ...o, color: overColor, alpha }); continue; }
    if (!rolling[i]) { ctx.text(str[i], cx, y, { ...o, color, alpha }); continue; }
    ctx.clip({ x: cx - 2, y: y - size * 0.86, w: cw + 4, h: size * 1.08 }, () => {
      ctx.text(str[i], cx, y - roll * size * 1.08, { ...o, color, alpha });
      ctx.text(String((+str[i] + 1) % 10), cx, y + (1 - roll) * size * 1.08, { ...o, color, alpha });
    });
  }
  return n * cw;
}

/**
 * Terminal output in a viewport. entries: [{ at, text, role, weight }] in time order; the newest line stands on the
 * bottom row and each arrival pushes the older lines up (eased over `push` seconds). Lines above the top row are gone.
 */
export function terminal(ctx, r, entries, t, { size = 26, lh = 1.5, push = 0.12, alpha = 1, prompt = '', fade = true } = {}) {
  const LH = size * lh, live = entries.filter((e) => t >= e.at), rows = Math.floor(r.h / LH);
  if (!live.length) return;
  const newest = live[live.length - 1], k = easeOut(prog(t, newest.at, newest.at + push));
  ctx.clip(r, () => {
    live.slice(-(rows + 1)).reverse().forEach((e, j) => {              // j = 0: the newest
      const y = r.y + r.h - size * 0.4 - (j - (1 - k)) * LH, a = alpha * (fade ? clamp(1 - (j - 1 + k) / rows) : 1) * (j === 0 ? clamp(k * 3) : 1);
      if (a > 0.003) ctx.text(prompt + e.text, r.x, y, { size, font: 'mono', color: e.role ?? 'sub', weight: e.weight ?? 400, alpha: a });
    });
  });
}

/** A block cursor after `cols` columns of a line at (x, baseline y). blink: seconds (0 = solid). */
export function caret(ctx, x, y, cols, t, { size = 34, color = 'sub', blink = 0.5, alpha = 1 } = {}) {
  if (blink > 0 && Math.floor(t / blink) % 2) return;
  const cw = ctx.cw(size);
  ctx.rect(x + cols * cw + 2, y - size * 0.82, cw * 0.82, size * 1.0, { fill: true, color, alpha });
}
