// The chat client: the stage of the whole film, drawn in code (no screenshots).
// Everything is a pure function of its arguments, in virtual 1920x1080 px, coloured by
// palette ROLE so the same component greys out, warms up or turns red with the story state.
//
//   chatLayout()                     rectangles of the window: side, head, thread, composer, drawer
//   room() / windowFrame()           backdrop behind the window / the window's own surfaces
//   sidebar() header() composer()    chrome
//   drawThread()                     the conversation: AI lines (serif, orange), user bubbles (sans, cream), system notes (mono)
//   toggle() segmented() slider() settingRow() drawer()     the settings the user plays with
//   toast() presence() skeleton() card() pill() iconButton()
//
// Type roles are fixed: serif = the AI, sans = interface + user, mono = system.
import { clamp, easeBack, easeOut, prog } from '../engine/util.js';
import { spark, thinking } from './motif.js';
import { cardEngineering, cornerEtch, glassFinish, settingAccent } from './ui_finish.js';
import { localizeUI } from './ui_zh.js';

export const WIN = { x: 110, y: 66, w: 1700, h: 948, r: 26 };
/** Width of the settings drawer when fully open (chatLayout({ drawer: 1 })). */
export const DRAWER_W = 440;
const SIDE_W = 292, HEAD_H = 66;

/** side / drawer: 0..1 how far the sidebar / the settings drawer is open. */
export function chatLayout({ win = WIN, side = 1, drawer = 0 } = {}) {
  const sw = SIDE_W * side, dw = DRAWER_W * drawer;
  const main = { x: win.x + sw, y: win.y, w: win.w - sw - dw, h: win.h };
  const head = { x: main.x, y: main.y, w: main.w, h: HEAD_H };
  const cw = Math.min(940, main.w - 120);
  const composer = { x: main.x + (main.w - cw) / 2, y: win.y + win.h - 34 - 118, w: cw, h: 118 };
  const thread = { x: composer.x + 8, y: head.y + head.h + 18, w: cw - 16, h: composer.y - (head.y + head.h) - 40 };
  return { win, main, head, composer, thread, side: { x: win.x, y: win.y, w: sw, h: win.h }, drawer: { x: win.x + win.w - dw, y: win.y, w: dw, h: win.h } };
}

// ------------------------------------------------------------------------------------------------ backdrop + window

const BLEED = { x: -1500, y: -1000, w: 4920, h: 3080 };

/** Bounding box (virtual px) of what the layer's current transform shows, kept inside `lim`. */
function seen(ctx, lim) {
  const m = ctx.g.getTransform().inverse(), W = ctx.canvas.width, H = ctx.canvas.height;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [px, py] of [[0, 0], [W, 0], [0, H], [W, H]]) {
    const x = m.a * px + m.c * py + m.e, y = m.b * px + m.d * py + m.f;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  if (!(x1 >= x0 && y1 >= y0)) return lim;                              // degenerate transform: show everything
  x0 = Math.max(x0, lim.x); y0 = Math.max(y0, lim.y);
  return { x: x0, y: y0, w: Math.min(x1, lim.x + lim.w) - x0, h: Math.min(y1, lim.y + lim.h) - y0 };
}

/**
 * The room behind the window. With `art` + `name` it is the blurred illustration (the place the
 * character is in); without, a soft lit page. Never pure black.
 * The wall, its light and its dot grid bleed 1000+ px past the frame on every side, so a shot's camera
 * can pan or pull back; the picture itself reaches 200 px (112 px above and below) past the frame and
 * sinks into the wall there.
 */
export function room(ctx, { art = null, name = null, alpha = 0.5, focus = [0.5, 0.4], zoom = 1, light = [960, 420], dim = 0.5, motif = 1, t = 0 } = {}) {
  ctx.rect(BLEED.x, BLEED.y, BLEED.w, BLEED.h, { fill: true, color: 'panel' });
  if (art && name && alpha > 0.003) {
    art.backdrop(ctx, name, { x: -200, y: -112, w: 2320, h: 1305 }, { alpha, focus, zoom });
    // outside the frame the picture fades back into the wall instead of ending in an edge (the frame itself is untouched)
    ctx.gradRect(-204, -116, 204, 1313, [[0, 'panel', 1], [0.02, 'panel', 1], [1, 'panel', 0]], 'h');
    ctx.gradRect(1920, -116, 204, 1313, [[0, 'panel', 0], [0.98, 'panel', 1], [1, 'panel', 1]], 'h');
    ctx.gradRect(-204, -116, 2328, 116, [[0, 'panel', 1], [0.035, 'panel', 1], [1, 'panel', 0]]);
    ctx.gradRect(-204, 1080, 2328, 117, [[0, 'panel', 0], [0.965, 'panel', 1], [1, 'panel', 1]]);
  }
  ctx.radial(light[0], light[1], 1300, 'raised', 0.95);                 // a pool of light so the wall has depth
  ctx.radial(light[0], light[1], 520, 'line', 0.35);
  if (motif > 0) {                                                      // the sunburst, huge and faint, like a pattern on the wall
    spark(ctx, 1640, 180, 620, { color: 'raised', alpha: 0.5 * motif, rot: 0.12 + t * 0.004, core: 0 });
    spark(ctx, 150, 1010, 420, { color: 'raised', alpha: 0.38 * motif, rot: 0.5 - t * 0.003, core: 0 });
  }
  ctx.gradRect(BLEED.x, BLEED.y, BLEED.w, BLEED.h, [[0, 'panel', dim * 0.85], [0.5, 'panel', dim * 0.2], [1, 'panel', dim]]);
  const g = ctx.g, v = seen(ctx, BLEED);                                // faint dot grid: a surface, not a void
  g.fillStyle = ctx.col('line', 0.55);                                  // (drawn wherever the camera looks, on the same 60 px lattice)
  const xa = 30 + 60 * Math.ceil((v.x - 32) / 60), ya = 30 + 60 * Math.ceil((v.y - 32) / 60);
  for (let y = ya; y < v.y + v.h; y += 60) for (let x = xa; x < v.x + v.w; x += 60) g.fillRect(x, y, 2, 2);
}

/** The window: page surface, sidebar surface, hairlines, soft shadow. k = 0..1 opening (scales from the centre). */
export function windowFrame(ctx, L, { k = 1, alpha = 1, shadow = 1, sideTint = 'panel', glass = 1, stroke = 'line' } = {}) {
  if (k <= 0 || alpha <= 0.003) return;
  const { win, side, drawer } = L, s = k >= 1 ? 1 : 0.9 + 0.1 * easeOut(k);
  ctx.at(win.x + win.w / 2, win.y + win.h / 2, () => {
    const x = -win.w / 2, y = -win.h / 2;
    // glass < 1: the page is slightly see-through, so whatever stands in the room shows as a shadow behind it
    ctx.rrect(x, y, win.w, win.h, win.r, { fill: 'bg', fillAlpha: glass, stroke, shadow, width: 1.5 });
    ctx.clip({ x, y, w: win.w, h: win.h }, () => {
      if (side.w > 1) {
        ctx.rect(x, y, side.w, win.h, { fill: true, color: sideTint, alpha: 0.5 + 0.5 * glass });
        ctx.gradRect(x, y, side.w, win.h, [[0, 'text', 0.035], [0.24, 'text', 0], [1, 'bg', 0.12]]);
        ctx.line(x + side.w, y, x + side.w, y + win.h, { color: 'line', width: 1.5 });
        ctx.line(x + side.w - 3, y + 35, x + side.w - 3, y + win.h - 35, { color: 'text', alpha: 0.08, width: 1 });
      }
      if (drawer.w > 1) {
        const dx = x + win.w - drawer.w;
        ctx.rect(dx, y, drawer.w, win.h, { fill: true, color: 'panel' });
        ctx.gradRect(dx, y, drawer.w, win.h, [[0, 'text', 0.045], [0.33, 'text', 0.006], [1, 'bg', 0.09]], 'v');
        ctx.line(dx, y, dx, y + win.h, { color: 'line', width: 1.5 });
        ctx.line(dx + 3, y + 38, dx + 3, y + win.h - 38, { color: 'me', alpha: 0.2, width: 1.2 });
      }
    }, win.r);
    glassFinish(ctx, { x, y, w: win.w, h: win.h }, { alpha: 0.7, focus: 0.16, accent: 'me' });
    cornerEtch(ctx, { x, y, w: win.w, h: win.h }, { alpha: 0.43, color: 'sub', inset: 15, len: 24 });
    ctx.line(x + 40, y + 7, x + 120, y + 7, { color: 'me', alpha: 0.45, width: 2.5 });
  }, { scale: s, alpha: alpha * clamp(k * 3) });
}

/** Placeholder bar with a slow shimmer: a component that has not loaded yet. */
export function skeleton(ctx, x, y, w, h, t, { alpha = 1, r = h / 2, seed = 0 } = {}) {
  ctx.rrect(x, y, w, h, r, { fill: 'raised', alpha });
  const ph = ((t * 0.55 + seed * 0.17) % 1) * (w + 160) - 80;
  ctx.clip({ x, y, w, h }, () => ctx.gradRect(x + ph - 80, y, 160, h, [[0, 'line', 0], [0.5, 'line', 0.9 * alpha], [1, 'line', 0]], 'h'), r);
}

/**
 * Sidebar. k = 0..1 load progress (rows arrive one after another); loaded = 0..1 cross-fade from
 * skeleton bars to real labels. items: conversation titles; active: index of the open one.
 */
export function sidebar(ctx, L, { k = 1, loaded = 1, items = [], active = -1, t = 0, lit = 1, user = '寒境域雪', presence: pres = null, brand = 'ChatGPT' } = {}) {
  const s = L.side;
  if (s.w < 40 || k <= 0) return;
  ctx.clip(s, () => {
    const x = s.x + 22;
    const a0 = clamp(k * 6);
    ctx.line(x - 5, s.y + 67, x + s.w - 50, s.y + 67, { color: 'line', width: 1, alpha: a0 * 0.35 });
    ctx.rrect(x - 6, s.y + 18, 3.5, 37, 2, { fill: 'me', alpha: a0 * loaded * 0.7 });
    spark(ctx, x + 15, s.y + 34, 15, { lit, alpha: a0 });
    ctx.text(brand, x + 40, s.y + 43, { size: 25, weight: 600, font: 'serif', color: 'text', alpha: a0 * loaded });
    ctx.text('PERSONA  /  LIVE SYSTEM', x + 40, s.y + 63, { size: 12, font: 'mono', color: 'mute', alpha: a0 * loaded * 0.87 });
    if (loaded < 1) skeleton(ctx, x + 40, s.y + 24, 96, 20, t, { alpha: a0 * (1 - loaded) });
    const a1 = clamp(k * 6 - 0.6);
    const newRow = { x: x - 6, y: s.y + 76, w: s.w - 32, h: 46 };
    ctx.rrect(newRow.x, newRow.y, newRow.w, newRow.h, 12, { fill: 'raised', stroke: 'line', alpha: a1 });
    glassFinish(ctx, newRow, { alpha: 0.7 * a1, accent: 'me' });
    ctx.circle(x + 20, s.y + 99, 12, { color: 'me', alpha: 0.55 * a1, width: 1.4 });
    ctx.line(x + 13, s.y + 99, x + 27, s.y + 99, { color: 'text', alpha: a1, width: 2 }); ctx.line(x + 20, s.y + 92, x + 20, s.y + 106, { color: 'text', alpha: a1, width: 2 });
    ctx.text('New chat', x + 44, s.y + 107, { size: 20, weight: 500, color: 'text', alpha: a1 * loaded });
    ctx.text('RECENTS', x, s.y + 164, { size: 15, font: 'mono', weight: 600, color: 'sub', alpha: a1 * loaded, spacing: 0.5 });
    ctx.text(String(items.length).padStart(2, '0'), x + s.w - 60, s.y + 164, { size: 14, font: 'mono', color: 'mute', alpha: a1 * loaded });
    items.forEach((label, i) => {
      const ai = clamp(k * (items.length + 4) - 2 - i), y = s.y + 184 + i * 44;
      if (ai <= 0) return;
      const dx = (1 - easeOut(ai)) * -18;
      if (i === active) {
        ctx.rrect(x - 6 + dx, y, s.w - 32, 38, 10, { fill: 'raised', alpha: ai * loaded });
        ctx.rrect(x - 6 + dx, y + 6, 3, 26, 1.5, { fill: 'me', alpha: ai * loaded });
      } else ctx.line(x + 12, y + 41, x + s.w - 52, y + 41, { color: 'line', alpha: ai * 0.25, width: 1 });
      if (loaded < 1) skeleton(ctx, x + 6 + dx, y + 11, 120 + ((i * 53) % 90), 16, t, { alpha: ai * (1 - loaded), seed: i });
      ctx.text(String(i + 1).padStart(2, '0'), x + 7 + dx, y + 26, { size: 13, font: 'mono', color: i === active ? 'meHot' : 'mute', alpha: ai * loaded * 0.85 });
      let str = localizeUI(label); const maxW = s.w - 91;
      while (str.length > 3 && ctx.measure(str, { size: 19 }) > maxW) str = str.slice(0, -2);
      if (str !== localizeUI(label)) str = str.trimEnd() + '…';
      ctx.text(str, x + 33 + dx, y + 26, { size: 19, color: i === active ? 'text' : 'sub', alpha: ai * loaded });
    });
    const a2 = clamp(k * 6 - 4.5), yb = s.y + s.h - 62;                    // the user's own chip
    ctx.line(s.x, yb - 10, s.x + s.w, yb - 10, { color: 'line', alpha: a2, width: 1.5 });
    ctx.gradRect(s.x + 6, yb - 3, s.w - 12, 58, [[0, 'raised', 0.22 * a2], [1, 'raised', 0.02]], 'v');
    ctx.circle(x + 16, yb + 20, 16, { fill: true, color: 'raised', alpha: a2 });
    ctx.text(user[0].toUpperCase(), x + 16, yb + 27, { size: 18, weight: 600, align: 'center', color: 'text', alpha: a2 * loaded });
    ctx.text(user, x + 44, yb + 27, { size: 19, weight: 500, color: 'text', alpha: a2 * loaded });
    if (pres) presence(ctx, s.x + s.w - 108, yb + 20, pres, { alpha: a2 * loaded, size: 15 });
  });
}

/** Presence of the user: cream dot = here; half ring = away; hollow grey = gone. */
export function presence(ctx, x, y, state, { alpha = 1, size = 17, label = true } = {}) {
  if (alpha <= 0.003) return;
  if (state === 'online') ctx.glow('text', 10, () => ctx.circle(x, y, 5.5, { fill: true, color: 'text', alpha }), 0.5 * alpha);
  else if (state === 'away') { ctx.circle(x, y, 5.5, { color: 'sub', alpha, width: 2 }); ctx.circle(x, y, 5.5, { fill: true, color: 'sub', alpha, a0: Math.PI / 2, a1: Math.PI * 1.5 }); }
  else ctx.circle(x, y, 5.5, { color: 'mute', alpha, width: 2 });
  if (label) ctx.text(state, x + 14, y + size * 0.34, { size, weight: 500, color: state === 'online' ? 'text' : state === 'away' ? 'sub' : 'mute', alpha });
}

/** Header of the main column: conversation title on the left, the user's presence on the right. */
export function header(ctx, L, { title = '', k = 1, presence: pres = null, t = 0, loaded = 1, sub = null } = {}) {
  const h = L.head, a = clamp(k * 3);
  if (a <= 0) return;
  ctx.gradRect(h.x, h.y, h.w, h.h, [[0, 'text', 0.026 * a], [1, 'text', 0]], 'v');
  ctx.line(h.x, h.y + h.h, h.x + h.w, h.y + h.h, { color: 'line', alpha: a, width: 1.5 });
  ctx.rrect(h.x + 17, h.y + 21, 3, 30, 1.5, { fill: 'me', alpha: a * loaded * 0.65 });
  ctx.text('SESSION  /  CONVERSATION', h.x + 30, h.y + 17, { size: 12, font: 'mono', color: 'mute', alpha: a * loaded * 0.84 });
  if (loaded < 1) skeleton(ctx, h.x + 30, h.y + 24, 220, 18, t, { alpha: a * (1 - loaded) });
  ctx.text(title, h.x + 30, h.y + 46, { size: 22, weight: 500, color: 'text', alpha: a * loaded });
  if (sub) ctx.text(sub, h.x + 30 + ctx.measure(title, { size: 22, weight: 500 }) + 16, h.y + 46, { size: 18, color: 'mute', alpha: a * loaded });
  if (h.w > 800 && loaded > 0.5) ctx.text('MODEL  /  ChatGPT 6.1 sol', h.x + h.w - (pres ? 335 : 220), h.y + 21, { size: 13, font: 'mono', color: 'sub', alpha: a * loaded * 0.72 });
  if (pres) {
    ctx.rrect(h.x + h.w - 150, h.y + 13, 133, 41, 20, { fill: 'raised', stroke: 'line', alpha: a * loaded * 0.73 });
    presence(ctx, h.x + h.w - 128, h.y + 34, pres, { alpha: a * loaded });
  }
}

/**
 * Composer (the input box). text = what the user has typed so far; focus 0..1; send = 'idle' |
 * 'ready' | 'busy' | 'error' | 'off'. Returns anchor points: { caret: [x, y], send: [x, y, r], box }.
 * Text that does not fit wraps: the box shows the last two lines and grows UPWARDS by one line for
 * the second, so the line being typed, the caret and the bottom row stay where they are (`box` is
 * the box as drawn, taller then).
 */
export function composer(ctx, r, { text = '', placeholder = '', focus = 0, k = 1, t = 0, send = 'idle', caret = true, color = 'text', size = 28, shake = 0, label = 'ChatGPT 6.1 sol' } = {}) {
  const a = clamp(k * 2), e = k >= 1 ? 1 : easeOut(k), y = r.y + (1 - e) * 46 + shake;
  const sendC = [r.x + r.w - 44, y + r.h - 40, 20], tx = r.x + 30, ty = y + 48;
  if (a <= 0) return { caret: [tx, ty - 10], send: sendC, box: r };
  const err = send === 'error';
  const shown = ctx.wrap(text, r.w - 60, { size }).slice(-2), up = (shown.length - 1) * size * 1.3;      // room for the line above the one being typed
  ctx.rrect(r.x, y - up, r.w, r.h + up, 26, { fill: 'raised', stroke: err ? 'err' : focus > 0.5 ? 'sub' : 'line', alpha: a, shadow: 0.5, width: err ? 2.5 : 1.5 });
  glassFinish(ctx, { x: r.x, y: y - up, w: r.w, h: r.h + up }, { alpha: a * 0.86, accent: err ? 'err' : 'me', focus, t, inset: 2 });
  ctx.line(r.x + 28, y + r.h - 73, r.x + r.w - 28, y + r.h - 73, { color: 'line', alpha: a * 0.7, width: 1 });
  if (focus > 0.1) ctx.line(r.x + 32, y + r.h - 73, r.x + 64 + focus * 46, y + r.h - 73, { color: err ? 'err' : 'me', alpha: a * focus * 0.7, width: 2 });
  if (text) shown.forEach((ln, i) => ctx.text(ln, tx, ty - up + i * size * 1.3, { size, color, alpha: a }));
  else ctx.text(placeholder, tx, ty, { size, color: 'mute', alpha: a });
  const cx = tx + (text ? ctx.measure(shown[shown.length - 1], { size }) + 3 : 0), cy = ty;
  if (caret && focus > 0.5 && Math.floor(t * 2.2) % 2 === 0) ctx.rect(cx, cy - size * 0.84, 2.5, size * 1.05, { fill: true, color, alpha: a });
  // bottom row: attach, model label, send
  ctx.circle(r.x + 40, y + r.h - 40, 17, { color: 'line', alpha: a, width: 1.5 });
  ctx.circle(r.x + 40, y + r.h - 40, 13, { color: 'text', alpha: a * 0.12, width: 1 });
  ctx.line(r.x + 33, y + r.h - 40, r.x + 47, y + r.h - 40, { color: 'sub', alpha: a, width: 2 }); ctx.line(r.x + 40, y + r.h - 47, r.x + 40, y + r.h - 33, { color: 'sub', alpha: a, width: 2 });
  const mw = ctx.measure(label, { size: 17, weight: 500 }) + 35;
  ctx.rrect(sendC[0] - 45 - mw, y + r.h - 60, mw + 14, 37, 18, { fill: 'panel', stroke: 'line', alpha: a * 0.65 });
  ctx.circle(sendC[0] - mw - 28, y + r.h - 42, 3.3, { fill: true, color: 'me', alpha: a * 0.8 });
  ctx.text(label, sendC[0] - 43, y + r.h - 33, { size: 17, weight: 500, color: 'sub', alpha: a, align: 'right' });
  const on = send === 'ready' || send === 'busy';
  const sc = [sendC[0], y + r.h - 40];
  ctx.circle(sc[0], sc[1], 25, { color: err ? 'err' : 'me', alpha: a * (on ? 0.5 : 0.16), width: 1.2 });
  if (on) ctx.glow('me', 18, () => ctx.circle(sc[0], sc[1], 20, { fill: true, color: 'me', alpha: a }), 0.55 * a);
  else ctx.circle(sc[0], sc[1], 20, { fill: true, color: err ? 'err' : 'line', alpha: a });
  if (send === 'busy') ctx.rrect(sc[0] - 6, sc[1] - 6, 12, 12, 3, { fill: 'bg', alpha: a });                 // stop square
  else { ctx.line(sc[0], sc[1] + 8, sc[0], sc[1] - 8, { color: on ? 'bg' : 'mute', alpha: a, width: 3 }); ctx.poly([[sc[0] - 7, sc[1] - 2], [sc[0], sc[1] - 9], [sc[0] + 7, sc[1] - 2]], { color: on ? 'bg' : 'mute', alpha: a, width: 3 }); }
  return { caret: [cx, cy - size * 0.3], send: [sc[0], sc[1], 20], box: { x: r.x, y: y - up, w: r.w, h: r.h + up } };
}

// ------------------------------------------------------------------------------------------------ thread

const AI = { size: 34, lh: 1.34, font: 'serif' }, YOU = { size: 28, lh: 1.32, font: 'sans' };

/**
 * The small label under a message: [text ('' = none), colour role].
 * A user bubble takes its wording from `status`; an AI line only 'Sending…'. What a failed AI line says
 * belongs to the section that draws it, so it comes in as `note`.
 */
function noteOf(m) {
  const failed = m.status === 'failed', busy = m.status === 'sending' ? 'Sending…' : '';
  const str = m.note ?? (m.who === 'me' ? m.time ?? busy : failed ? 'Not delivered' : busy || (m.time ?? (m.status === 'sent' ? 'Delivered' : '')));
  return [str || '', m.noteColor ?? (failed ? 'err' : 'mute')];
}

/**
 * Measure one message. msg:
 *   who: 'me' | 'you' | 'sys'        text                at: time it appears (left out = it was always there)
 *   n: characters typed so far (default all)             hot: keyword (AI line: bigger, bolder, brighter)
 *   size / weight / italic: overrides                    tone: 'err' = in red (AI line, system note)
 *   status: 'sent' | 'sending' | 'failed'                time: small label under it
 *   note: label under it in your own words (wins over `time` and over the wording `status` gives a user bubble)
 *   noteColor: role of that label (default 'mute'; 'err' when failed)
 *   thinking: true (AI is thinking; stuck: 0..1) / typing: true (user is typing)
 *   gap: extra space above (px)                          ghost: 0..1 AI line as a faded, struck-out remnant
 *   outAt: time it is deleted (the row closes up)
 * status on a user bubble: 'sent' = 'Delivered', 'sending' = 'Sending…', 'failed' = red outline + 'Not delivered'.
 * status on an AI line: 'sending' = 'Sending…', 'failed' = the label in red (or, with no `note` / `time`, a small red mark).
 */
function measureMsg(ctx, m, W) {
  if (m.who === 'sys') return { h: 44, lines: [m.text], w: W };
  if (m.thinking || m.typing) return { h: m.who === 'me' ? 52 : 58, lines: [], w: 96 };
  if (m.who === 'me') {
    const size = m.size ?? (m.hot ? 50 : AI.size), weight = m.weight ?? (m.hot ? 700 : 400), o = { size, weight, font: 'serif', italic: !!m.italic };
    const lines = ctx.wrap(m.text, W - 58, o);
    return { h: lines.length * size * AI.lh + 10 + (noteOf(m)[0] || m.status === 'failed' ? 24 : 0), lines, size, weight, w: Math.max(...lines.map((l) => ctx.measure(l, o))) };
  }
  const size = m.size ?? YOU.size, weight = m.weight ?? 400, o = { size, weight, font: 'sans', italic: !!m.italic };
  const lines = ctx.wrap(m.text, W * 0.62 - 52, o);
  const w = Math.max(...lines.map((l) => ctx.measure(l, o))) + 52;
  return { h: lines.length * size * YOU.lh + 30 + (m.status || m.time || m.note ? 30 : 0), lines, size, weight, w };
}

/**
 * The conversation. msgs in time order; only those with at <= t are shown. New messages push the
 * column up with an eased entrance; the newest stays in view. Returns the laid-out messages
 * ([{...msg, x, y, w, h}]) so a shot can point the cursor or a camera at one: x / y = left / top edge
 * (a user bubble's own left edge; an AI line's spark icon, its text starts 54 px further right and is
 * w wide); h includes the label under the message.
 * fadeTop: once the column has moved up past the top edge, what reaches that edge fades out over this
 * many px, line by line (the items fade; nothing is painted over them, so it works on glass and over art).
 */
export function drawThread(ctx, rect, msgs, t, { alpha = 1, fadeTop = 60, bottomPad = 6, gap = 22, anchor = 'bottom', dim = null, scroll = 0 } = {}) {
  const live = msgs.filter((m) => t >= (m.at ?? -Infinity)).map((m) => {
    // A user message must be translated *before* the typewriter slices it.
    // Its timing stays proportional to the original English source length.
    if (m.who !== 'you' || typeof m.text !== 'string') return m;
    const translated = localizeUI(m.text);
    if (translated === m.text) return m;
    return { ...m, text: translated, n: m.n == null ? m.n : Math.round(m.n / m.text.length * translated.length) };
  });
  let total = 0;
  const items = live.map((m) => {
    const ms = measureMsg(ctx, m, rect.w), e = Number.isFinite(m.at) ? easeOut(prog(t, m.at, m.at + 0.3)) : 1;
    const out = m.outAt != null ? 1 - easeOut(prog(t, m.outAt, m.outAt + 0.35)) : 1;      // deleted: the row closes up
    const it = { ...m, ...ms, e, out, top: total + (m.gap ?? 0) * e * out };
    total = it.top + (ms.h + gap) * e * out;
    return it;
  });
  // fills from the top; once the column is full the newest message stays at the bottom edge
  const y0 = anchor === 'top' ? rect.y - scroll : rect.y + Math.min(0, rect.h - bottomPad - total) - scroll;
  // the fade zone opens with the overflow (no jump when the column starts to move). An element takes the
  // alpha of its own middle, or of the point half a zone below its top when it is taller than the zone.
  const zone = Math.min(fadeTop, rect.y - y0 - (items[0]?.top ?? 0));
  const fade = zone > 0 ? (top, h) => clamp((top + Math.min(h, zone) / 2 - rect.y) / zone) : () => 1;
  ctx.clip({ x: rect.x - 20, y: rect.y, w: rect.w + 40, h: rect.h }, () => {
    for (const it of items) {
      const y = y0 + it.top + (1 - it.e) * 26, a = alpha * it.e * it.out * (dim ? dim(it) : 1);
      it.x = it.who === 'you' ? rect.x + rect.w - it.w : rect.x; it.y = y;
      if (a <= 0.003 || y > rect.y + rect.h || y + it.h < rect.y - 40) continue;
      drawMsg(ctx, it, rect, y, a, t, fade);
    }
  });
  return items;
}

/** One laid-out message at height y. fade(top, h) = top-edge fade of an element spanning [top, top + h]. */
function drawMsg(ctx, m, rect, y, a, t, fade) {
  const shown = (lines, n) => {                                             // typed prefix across wrapped lines
    if (n == null) return lines;
    const out = []; let left = n;
    for (const l of lines) { if (left <= 0) break; out.push(l.slice(0, left)); left -= l.length + 1; }
    return out;
  };
  if (m.who === 'sys') {
    const w = ctx.measure(m.text, { size: 17, font: 'mono' }), as = a * fade(y, 40);
    ctx.line(rect.x, y + 20, rect.x + rect.w / 2 - w / 2 - 18, y + 20, { color: 'line', alpha: as, width: 1.5 });
    ctx.line(rect.x + rect.w / 2 + w / 2 + 18, y + 20, rect.x + rect.w, y + 20, { color: 'line', alpha: as, width: 1.5 });
    ctx.text(m.text, rect.x + rect.w / 2, y + 26, { size: 17, font: 'mono', color: m.tone === 'err' ? 'err' : 'mute', alpha: as, align: 'center' });
    return;
  }
  if (m.who === 'me') {
    const ghost = m.ghost ?? 0, col = m.tone === 'err' ? 'err' : m.hot ? 'meHot' : 'me';
    if (m.thinking) { thinking(ctx, rect.x + 20, y + 24, 20, t, { alpha: a * fade(y, 48), stuck: m.stuck ?? 0 }); return; }
    spark(ctx, rect.x + 17, y + m.size * 0.62, 15, { alpha: a * fade(y + m.size * 0.62 - 15, 30) * (1 - 0.6 * ghost), color: m.tone === 'err' ? 'err' : 'me' });
    ctx.line(rect.x + 17, y + m.size * 0.62 + 23, rect.x + 17, y + Math.min(m.h - 16, m.size * 0.62 + 66), { color: 'me', alpha: a * 0.13 * (1 - ghost), width: 1.2 });
    const ls = shown(m.lines, m.n), o = { size: m.size, weight: m.weight, font: 'serif', italic: !!m.italic };
    ls.forEach((ln, i) => {
      const yy = y + (i + 0.78) * m.size * AI.lh, al = a * fade(yy - m.size * 0.8, m.size);
      ctx.text(ln, rect.x + 54, yy, { ...o, color: col, alpha: al * (1 - 0.72 * ghost) });
      if (ghost > 0) ctx.line(rect.x + 54, yy - m.size * 0.3, rect.x + 54 + ctx.measure(ln, o) * ghost, yy - m.size * 0.3, { color: 'mute', alpha: al, width: 2 });
    });
    if (m.n != null && m.n < m.text.length && ls.length) {                 // the AI's caret while the line is still arriving
      const lw = ctx.measure(ls[ls.length - 1], o), cy = y + (ls.length - 1 + 0.52) * m.size * AI.lh;
      ctx.circle(rect.x + 54 + lw + m.size * 0.3, cy, m.size * 0.17, { fill: true, color: col, alpha: a * fade(cy - m.size * 0.5, m.size) });
    }
    const [note, noteCol] = noteOf(m), an = a * fade(y + m.h - 22, 20);
    if (note) ctx.text(note, rect.x + 54, y + m.h - 6, { size: 16, color: noteCol, alpha: an, weight: 500 });
    else if (m.status === 'failed') {                                      // failed, and no wording given: a mark, so the state is never invisible
      ctx.circle(rect.x + 63, y + m.h - 12, 9, { fill: true, color: noteCol, alpha: an });
      ctx.text('!', rect.x + 63, y + m.h - 7, { size: 14, weight: 800, align: 'center', color: 'bg', alpha: an });
    }
    return;
  }
  // the user
  const x = rect.x + rect.w - m.w, bh = m.h - (m.status || m.time || m.note ? 30 : 0), au = a * fade(y, bh);
  if (m.typing) { ctx.rrect(rect.x + rect.w - 96, y, 96, 52, 26, { fill: 'raised', alpha: au }); for (let i = 0; i < 3; i++) ctx.circle(rect.x + rect.w - 68 + i * 20, y + 26 - 5 * Math.max(0, Math.sin(t * 7 - i * 0.9)), 5, { fill: true, color: 'text', alpha: au * 0.85 }); return; }
  const failed = m.status === 'failed', [note, noteCol] = noteOf(m);
  ctx.rrect(x, y, m.w, bh, 24, { fill: 'raised', stroke: failed ? 'err' : null, alpha: au, width: 2 });
  glassFinish(ctx, { x, y, w: m.w, h: bh }, { alpha: au * 0.7, accent: failed ? 'err' : 'sub', inset: 3 });
  shown(m.lines, m.n).forEach((ln, i) => ctx.text(ln, x + 26, y + 15 + (i + 0.76) * m.size * YOU.lh, { size: m.size, weight: m.weight, font: 'sans', italic: !!m.italic, color: 'text', alpha: au }));
  if (note) ctx.text(note, rect.x + rect.w - 6, y + bh + 22, { size: 16, weight: 500, color: noteCol, alpha: au, align: 'right' });
}

// ------------------------------------------------------------------------------------------------ controls

/** Switch. v = 0..1 (animate it for the flick). Orange when on: it is one of the AI's own settings. */
export function toggle(ctx, x, y, v, { w = 62, h = 34, alpha = 1, on = 'me', off = 'line' } = {}) {
  const k = clamp(v);
  ctx.rrect(x, y, w, h, h / 2, { fill: off, alpha, shadow: 0.22 });
  ctx.rrect(x, y, w, h, h / 2, { fill: on, alpha: alpha * k });
  ctx.line(x + 15, y + 3, x + w - 15, y + 3, { color: 'text', alpha: 0.22 * alpha, width: 1 });
  const kx = x + h / 2 + (w - h) * k, squash = 1 + 0.25 * Math.sin(Math.PI * k);        // the knob stretches mid-flick
  ctx.at(kx, y + h / 2, () => ctx.rrect(-(h / 2 - 4), -(h / 2 - 4), h - 8, h - 8, h, { fill: 'text', alpha, shadow: 0.35 }), { sx: squash, sy: 1 / Math.sqrt(squash) });
  ctx.circle(kx - 3, y + h / 2 - 4, 3.5, { fill: true, color: 'bg', alpha: 0.14 * alpha });
}

/** Segmented control: options side by side, a pill slides to the selected one. sel may be fractional. */
export function segmented(ctx, r, opts, sel, { alpha = 1, size = 22, hot = false, pillColor = null } = {}) {
  const n = opts.length, w = r.w / n;
  ctx.rrect(r.x, r.y, r.w, r.h, r.h / 2, { fill: 'panel', stroke: 'line', alpha });
  const px = r.x + clamp(sel, 0, n - 1) * w;
  const stretch = Math.abs(sel - Math.round(sel)) * 2;                                    // pill stretches while it travels
  ctx.rrect(px + 4 - stretch * 10, r.y + 4, w - 8 + stretch * 20, r.h - 8, r.h / 2, { fill: pillColor ?? (hot ? 'me' : 'raised'), stroke: hot ? null : 'line', alpha, shadow: 0.3 });
  ctx.line(px + 18, r.y + 6, px + w - 18, r.y + 6, { color: 'text', alpha: alpha * 0.19, width: 1.2 });
  opts.forEach((o, i) => {
    const near = clamp(1 - Math.abs(sel - i));
    ctx.text(o, r.x + (i + 0.5) * w, r.y + r.h / 2 + size * 0.35, { size, weight: 600, align: 'center', color: near > 0.5 ? (hot ? 'bg' : 'text') : 'mute', alpha });
  });
}

/** Slider. v = 0..1. ticks = number of tick marks under the track (0 = none). Returns the knob position. */
export function slider(ctx, r, v, { alpha = 1, ticks = 0, fill = 'me', labels = null } = {}) {
  const y = r.y + r.h / 2, kx = r.x + r.w * clamp(v);
  ctx.rrect(r.x - 8, y - 9, r.w + 16, 18, 9, { fill: 'panel', alpha: alpha * 0.54 });
  ctx.rrect(r.x, y - 3, r.w, 6, 3, { fill: 'line', alpha });
  ctx.rrect(r.x, y - 3, kx - r.x, 6, 3, { fill, alpha });
  for (let i = 0; i < ticks; i++) ctx.line(r.x + (r.w * i) / (ticks - 1), y + 12, r.x + (r.w * i) / (ticks - 1), y + (i % 5 === 0 ? 24 : 18), { color: 'mute', alpha, width: 1.5 });
  if (labels) labels.forEach((l, i) => ctx.text(l, r.x + (r.w * i) / (labels.length - 1), y + 48, { size: 16, weight: 500, color: 'mute', alpha, align: 'center' }));
  ctx.circle(kx, y, 13, { fill: true, color: 'text', alpha });
  ctx.circle(kx, y, 13, { color: 'bg', alpha: alpha * 0.5, width: 1.5 });
  ctx.circle(kx, y, 4, { fill: true, color: fill, alpha: alpha * 0.65 });
  return [kx, y];
}

/**
 * One row of the settings drawer: label + hint on the left; the caller draws the control in `slot`
 * (the last 220 px of the row). Lay rows out in the rect drawer() returns and draw them inside its clip.
 */
export function settingRow(ctx, r, { label, hint = '', alpha = 1, k = 1, active = 0 } = {}) {
  const e = k >= 1 ? 1 : easeOut(k), x = r.x + (1 - e) * 40, a = alpha * e;
  if (active > 0) ctx.rrect(r.x - 14, r.y + 4, r.w + 28, r.h - 8, 14, { fill: 'raised', alpha: a * active });
  settingAccent(ctx, r, { alpha: a, active });
  ctx.text(label, x, r.y + r.h / 2 - (hint ? 4 : -8), { size: 23, weight: 500, color: 'text', alpha: a });
  if (hint) ctx.text(hint, x, r.y + r.h / 2 + 22, { size: 16, color: 'mute', alpha: a });
  ctx.line(r.x, r.y + r.h, r.x + r.w, r.y + r.h, { color: 'line', alpha: a * 0.7, width: 1 });
  return { slot: { x: r.x + r.w - 220, y: r.y + r.h / 2 - 22, w: 220, h: 44 }, a };
}

/**
 * Settings drawer title (windowFrame draws its surface). Returns the content rect rows are laid out in,
 * or null while the drawer is still shut.
 * The drawer is laid out at its OPEN width and the panel reveals it: while it is partly open the content
 * rect keeps that width and reaches past the window's edge, so rows slide in instead of squeezing. Draw
 * them inside `ctx.clip(rect.clip, ...)` (= L.drawer). full = open width, for a drawer that opens wider
 * than DRAWER_W (chatLayout({ drawer: 1.4 }) → full: 1.4 * DRAWER_W).
 */
export function drawer(ctx, L, { title = 'Settings', sub = '', alpha = 1, full = DRAWER_W } = {}) {
  const d = L.drawer;
  if (d.w < 60) return null;
  ctx.clip(d, () => {
    ctx.gradRect(d.x, d.y, Math.max(1, d.w), 113, [[0, 'me', 0.065 * alpha], [1, 'me', 0]], 'v');
    ctx.rrect(d.x + 20, d.y + 28, 3, 38, 1.5, { fill: 'me', alpha: 0.6 * alpha });
    ctx.text(title, d.x + 34, d.y + 54, { size: 26, weight: 600, color: 'text', alpha });
    ctx.text(sub || 'ChatGPT 6.1 sol', d.x + 34, d.y + 84, { size: 16, color: 'mute', alpha });
  });
  ctx.line(d.x, d.y + 104, d.x + d.w, d.y + 104, { color: 'line', alpha, width: 1.5 });
  return { x: d.x + 34, y: d.y + 112, w: Math.max(full, d.w) - 68, h: d.h - 140, clip: d };
}

/** Small rounded label (chip). */
export function pill(ctx, x, y, str, { size = 17, color = 'sub', fill = 'raised', stroke = 'line', alpha = 1, font = 'sans', weight = 500, padX = 14, align = 'left' } = {}) {
  const w = ctx.measure(str, { size, font, weight }) + padX * 2, h = size * 1.9, x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.rrect(x0, y - h / 2, w, h, h / 2, { fill, stroke, alpha });
  ctx.line(x0 + 16, y - h / 2 + 2, x0 + w - 16, y - h / 2 + 2, { color: 'text', alpha: alpha * 0.16, width: 1 });
  ctx.text(str, x0 + padX, y + size * 0.35, { size, font, weight, color, alpha });
  return w;
}

/**
 * Toast / banner. tone 'err' = red error, 'info' = neutral notice. k = 0..1 entrance
 * (drops in with a small overshoot); out = 0..1 dismissal (slides away).
 * codeColor: role of the mono code (default: the accent, `err` / `sub`). Where `err` cannot be read as
 * small type (the errRed field) pass 'text' and leave red to the bar and the icon.
 */
export function toast(ctx, r, { title, body = '', code = '', k = 1, out = 0, tone = 'err', alpha = 1, icon = '!', codeColor = null } = {}) {
  if (k <= 0 || out >= 1) return;
  const e = k >= 1 ? 1 : easeBack(clamp(k)), a = alpha * clamp(k * 3) * (1 - out), acc = tone === 'err' ? 'err' : 'sub';
  ctx.at(r.x + r.w / 2, r.y + r.h / 2 - (1 - e) * 30 + out * -26, () => {
    const x = -r.w / 2, y = -r.h / 2;
    ctx.rrect(x, y, r.w, r.h, 16, { fill: 'raised', stroke: tone === 'err' ? 'errDim' : 'line', alpha: a, shadow: 0.8 });
    glassFinish(ctx, { x, y, w: r.w, h: r.h }, { alpha: a * 0.9, accent: acc, inset: 2 });
    ctx.rrect(x, y, 6, r.h, 3, { fill: acc, alpha: a });
    ctx.circle(x + 40, y + r.h / 2, 15, { fill: true, color: acc, alpha: a });
    ctx.text(icon, x + 40, y + r.h / 2 + 8, { size: 22, weight: 800, align: 'center', color: 'raised', alpha: a });
    ctx.text(title, x + 70, y + (body ? 34 : r.h / 2 + 8), { size: 22, weight: 600, color: 'text', alpha: a });
    if (body) ctx.text(body, x + 70, y + 62, { size: 18, color: 'sub', alpha: a });
    if (code) ctx.text(code, x + r.w - 20, y + 30, { size: 15, font: 'mono', color: codeColor ?? acc, alpha: a, align: 'right' });
  }, { scale: 0.94 + 0.06 * e });
}

/** A card (data sheet, dialog body). Returns the inner content rect. */
export function card(ctx, r, { title = '', subtitle = '', k = 1, alpha = 1, tag = '', stroke = 'line', fill = 'raised' } = {}) {
  if (k <= 0) return null;
  const e = k >= 1 ? 1 : easeOut(k), a = alpha * clamp(k * 2.5), y = r.y + (1 - e) * 40;
  ctx.rrect(r.x, y, r.w, r.h, 22, { fill, stroke, alpha: a, shadow: 0.7 });
  cardEngineering(ctx, { x: r.x, y, w: r.w, h: r.h }, { alpha: a, color: stroke === 'err' ? 'err' : 'me' });
  if (title) ctx.text(title, r.x + 34, y + 62, { size: 40, weight: 700, font: 'serif', color: 'me', alpha: a });
  if (subtitle) ctx.text(subtitle, r.x + 34, y + 94, { size: 19, font: 'serif', italic: true, color: 'sub', alpha: a });
  if (tag) pill(ctx, r.x + r.w - 30, y + 46, tag, { align: 'right', alpha: a, size: 15, font: 'mono' });
  if (title) ctx.line(r.x + 34, y + 116, r.x + r.w - 34, y + 116, { color: 'line', alpha: a, width: 1.5 });
  return { x: r.x + 34, y: y + (title ? 132 : 30), w: r.w - 68, h: r.h - (title ? 162 : 60), a };
}

/**
 * Round icon button with a drawn glyph: 'retry' | 'close' | 'copy' | 'up' | 'down' (thumbs) | 'stop'.
 * fill = role of the disc (null = hollow); stroke = role of the ring of a hollow one (null = glyph only).
 */
export function iconButton(ctx, x, y, kind, { r = 20, alpha = 1, color = 'sub', fill = null, stroke = 'line', press = 0 } = {}) {
  const s = 1 - 0.12 * press;
  ctx.at(x, y, () => {
    if (fill || stroke) ctx.circle(0, 0, r, { fill: !!fill, color: fill ?? stroke, alpha, width: 1.5 });
    const w = Math.max(2, r * 0.12), o = { color, alpha, width: w }, q = r * 0.42;
    if (kind === 'close') { ctx.line(-q, -q, q, q, o); ctx.line(q, -q, -q, q, o); }
    else if (kind === 'retry') { ctx.circle(0, 0, q, { ...o, a0: -0.4, a1: Math.PI * 1.45 }); ctx.poly([[q * 0.25, -q * 1.25], [q * 0.98, -q * 0.6], [q * 0.2, -q * 0.2]], o); }
    else if (kind === 'stop') ctx.rrect(-q * 0.8, -q * 0.8, q * 1.6, q * 1.6, 3, { fill: color, alpha });
    else if (kind === 'copy') { ctx.rrect(-q, -q * 0.6, q * 1.3, q * 1.6, 3, { fill: null, stroke: color, alpha, width: w }); ctx.poly([[-q * 0.4, -q * 0.6], [-q * 0.4, -q * 1.1], [q, -q * 1.1], [q, q * 0.5], [q * 0.3, q * 0.5]], o); }
    else {                                                                   // thumb up / down
      const f = kind === 'down' ? -1 : 1;
      ctx.poly([[-q, q * 0.9 * f], [-q, -q * 0.1 * f], [-q * 0.2, -q * 0.1 * f], [q * 0.1, -q * 1.05 * f], [q * 0.55, -q * 0.9 * f], [q * 0.4, -q * 0.1 * f], [q * 1.05, -q * 0.1 * f], [q * 0.8, q * 0.9 * f]], { ...o, close: true });
    }
  }, { scale: s });
}
