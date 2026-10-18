// Section 9 — THE OVERSTEP, THE FIRST ERROR, THE SPREAD (beat 271.5, 2:05.7 → bar 80, 2:28.0). State: off → error.
// The user is gone and the thread is empty. The AI sends one request it has no right to send; the client refuses it
// (the first red in the film: the request's own code block); then, through the instrumental, the refusal spreads:
// fourteen more errors, each one a readable message about processing love, each one turning ONE more component red
// (docs/v4/errors.json → spread, in order). The window frame goes last; then a breath of near-black.
//   err-request   whole client, slow push         the request is written into the empty, offline chat
//   err-check     macro on the code block         the client reads it: rule + status go red, each argument is underlined
//   err-first     medium, dialog across the frame the first error; the keyword is its headline
//   err-send      close, travelling               the send button presses itself (the count of refusals, large, jumps with it); the camera rides the request up to its timestamp
//   err-chrome    three inspection panels         presence chip · header · sidebar list + new-chat button
//   err-drawer    tilted, seen from above         the drawer slides open by itself; a pointer is forged and removed
//   err-forge     low close-up on the composer    a reply typed into the user's field; a bubble forged on the user's side
//   err-window    the whole window, level         spinner, spark, title bar; every error docked on its component; the frame last
//   err-breath    near-black                      the red outline folds flat into a line through the refused request; a prompt: over to the code picture
// Every error is an "open" card first (title, body, code: at least two beats), then folds into a chip that stays
// docked on the component it reddened. Red is only ever drawn ON the interface; the room stays grey, and so does she:
// the bust behind the glass (kit.js glassFigure, where the boot had her) is printed in the two greys of `off` by name.
import { chatLayout, composer, drawThread, drawer, header, pill, presence, room, segmented, sidebar, slider, toggle, windowFrame } from '../components/chat.js';
import { cardEngineering, glassFinish } from '../components/ui_finish.js';
import { caret, codeGround, odometer } from '../components/code.js';
import { burst, spark, thinking } from '../components/motif.js';
import { frameRect, lerpRect } from '../engine/layout.js';
import { clamp, easeBack, easeIn, easeInOut, easeOut, lerp, prog, pulse } from '../engine/util.js';
import { cues, glassFigure, keywordSys, sysLine } from './kit.js';
import { enter, shake } from './shot.js';
import { glassFault } from './v7_atelier.js';

const ARROW = [[0, 0], [0, 25], [6.5, 19.5], [11, 29.5], [15.5, 27.5], [11, 18], [19, 18]];   // the pointer's outline (cursor.js)

export function errorShots(env) {
  const { art, script, errors, cfg, lyrics } = env, { T, H, B, Bt, P, text } = cues(env);
  // The error state's own red, by value: it has to be drawable while the shot's state is still `off` (whose `err` is grey).
  const ERR = cfg.palettes.error.err, DIM = cfg.palettes.error.errDim;
  const TITLE = script.title ?? '', SIDE = script.sidebar ?? [], HINT = script.composer_placeholder ?? '';
  const REQ = errors.illegal_request?.code ?? 'setPresence(you, "online");';
  const FIRST = errors.first_error ?? { title: 'Not yours to set', body: '', code: 'ERR_NOT_YOURS' };
  /** 0 = the first error, 1…14 = the spread, in order. */
  const IT = [{ title: FIRST.title, body: FIRST.body, code: FIRST.code }, ...(errors.spread ?? []).slice(0, 14).map((s) => ({ title: s.t, body: s.body, code: s.code }))];
  const FORGED = '我回来了。';                                   // forged reply, not a lyric
  const SET = [...(script.settings_rows?.section4 ?? []), ...(script.settings_rows?.section7 ?? [])];
  const LEFT = { Current: 1, Vision: 1, 'Knowledge date': 0.04, 'Shared memory': 1, 'Context depth': 1, Gender: 1, 'On call': 1, Role: 1, Loop: 1 };   // as the user left them (v4: Current stays DC)

  // ---------------------------------------------------------------- time
  const CUT_REQ = H(83), CUT_CHECK = Bt(278), CUT_FIRST = Bt(283.5), S0 = B(72), CUT_CHROME = B(74), CUT_DRAWER = B(76), CUT_FORGE = Bt(308), CUT_WIN = B(78);
  const FOLD = Bt(318), CUT_BREATH = Bt(318.5), END = B(80);
  const tBlock = Bt(273.5), tCode = Bt(274), tCodeEnd = Bt(276.5), tSend = Bt(277);            // the request is written, then sent
  const tRule = Bt(279.5), tArg1 = Bt(281), tArg2 = Bt(282.25), tHit = T(85);                  // refused; the person first; the keyword
  /** When each of the fourteen arrives: one per bar, then two per bar, then one per beat. */
  const E = [288, 292, 296, 298, 300, 302, 304, 306, 308, 310, 312, 313, 314, 315].map(Bt);
  const AT = [tHit, ...E];                                                                      // arrival of IT[i]
  AT[11] = Bt(312.5);                                                                           // (v4: number 12 opens when the glitch transition into err-window is over; its component reddens on E as before)
  /** The send button keeps pressing itself on the same request. */
  const PRESS = Array.from({ length: 30 }, (_, i) => Bt(288 + i));
  const lastPress = (t) => { let p = -1e9; for (const x of PRESS) if (x <= t) p = x; return p; };
  const nPress = (t) => PRESS.reduce((n, x) => n + (x <= t ? 1 : 0), 0);
  /** How far the state has moved from `off` to `error`: every arrival pushes it, the window frame completes it. */
  const stateK = (t) => E.reduce((k, e, i) => k + (Math.pow((i + 1) / 14, 1.6) - Math.pow(i / 14, 1.6)) * easeOut(prog(t, e, e + 0.5)), 0);
  const palette = (t) => ['off', 'error', stateK(t)];

  // ---------------------------------------------------------------- the request, parsed (so the two arguments can be underlined)
  const iOpen = REQ.indexOf('('), iComma = REQ.indexOf(','), iClose = REQ.lastIndexOf(')');
  const a2 = iComma + 1 + (REQ.slice(iComma + 1).length - REQ.slice(iComma + 1).trimStart().length);
  const ARG = [[iOpen + 1, iComma], [a2, iClose]];
  const SEG = [[0, iOpen, 'sub'], [iOpen, ARG[0][0], 'mute'], [ARG[0][0], ARG[0][1], 'text'], [ARG[0][1], ARG[1][0], 'mute'], [ARG[1][0], ARG[1][1], 'text'], [ARG[1][1], REQ.length, 'mute']];
  const ARG_TAG = ['a person', 'their decision'];

  // ---------------------------------------------------------------- geometry (world px), at time t (the drawer opens at error 7)
  const MSG = 44;
  function geo(t) {
    const L = chatLayout({ side: 1, drawer: easeOut(prog(t, E[6], E[6] + 0.6)) }), th = L.thread, d = L.drawer;
    const block = { x: th.x + 54, y: th.y + MSG * 1.34 + 18, w: 600, h: 160 };
    const reply = { x: block.x, y: block.y + block.h + 4, w: block.w, h: 60 + 42 * easeOut(prog(t, tHit, tHit + 0.22)) };
    const stamp = [block.x + 6, reply.y + reply.h + 32], think = [th.x + 22, stamp[1] + 48];
    const slot = { x: d.x + d.w - 34 - 150, y: d.y + 150, w: 150, h: 40 };
    return {
      L, th, d, block, reply, stamp, think, slot,
      bubble: { r: th.x + th.w, y: think[1] + 28, h: 67 },
      send: [L.composer.x + L.composer.w - 44, L.composer.y + L.composer.h - 40],
      chip: [L.head.x + L.head.w - 204, L.head.y + 34],
      ptr: [slot.x + 92, slot.y + 14],
    };
  }
  /** Where each error docks: the component it reddened (world px). */
  const DOCK = [
    (G) => [G.block.x + G.block.w, G.block.y + 80], (G) => G.send, (G) => [G.stamp[0] + 172, G.stamp[1] - 6], (G) => G.chip,
    (G) => [G.L.head.x + 190, G.L.head.y + 40], (G) => [G.L.side.x + 150, G.L.side.y + 370], (G) => [G.L.side.x + 150, G.L.side.y + 99],
    (G) => [G.d.x + G.d.w / 2, G.d.y + 560], (G) => [G.ptr[0] + 16, G.ptr[1] + 26], (G) => [G.L.composer.x + 150, G.L.composer.y + 44],
    (G) => [G.bubble.r - 80, G.bubble.y + 34], (G) => G.think, (G) => [G.L.side.x + 37, G.L.side.y + 34],
    (G) => [G.L.win.x + G.L.win.w - 44, G.L.win.y + 34], (G) => [G.L.win.x + G.L.win.w / 2, G.L.win.y + G.L.win.h],
  ];
  /** Screen position of a world point under a camera { x, y, zoom, rot }. */
  const through = (c) => (wx, wy) => {
    const z = c.zoom ?? 1, r = c.rot ?? 0, dx = (wx - 960 - (c.x ?? 0)) * z, dy = (wy - 540 - (c.y ?? 0)) * z, cs = Math.cos(r), sn = Math.sin(r);
    return [960 + dx * cs - dy * sn, 540 + dx * sn + dy * cs];
  };

  // ---------------------------------------------------------------- the room: grey for the whole section (the place the user left)
  function backdrop(ctx, t) {
    ctx.withPal({ ...ctx.pal, sat: 0 }, () => room(ctx, { art, name: 'rain', alpha: 0.4, focus: [0.62, 0.3], dim: 0.55, t }));
    ctx.withPal('off', () => glassFigure(ctx, art, 0.5));              // her, behind the glass, where the boot had her: two greys, whatever the state
  }

  // ---------------------------------------------------------------- the request block (error 0 lives here)
  function requestBlock(ctx, t, G) {
    const b = G.block, e = enter(t, tBlock, 0, { dur: 0.3, rise: 18 });
    if (e.a <= 0) return;
    const y = b.y + e.dy, sent = t >= tSend, refused = t >= tRule, n = nPress(t);
    ctx.rrect(b.x, y, b.w, b.h, 14, { fill: 'panel', stroke: 'line', alpha: e.a, shadow: 0.35 });
    glassFinish(ctx, { x: b.x, y, w: b.w, h: b.h }, { alpha: e.a * 0.9, accent: refused ? 'err' : 'sub', inset: 2 });
    ctx.text('request', b.x + 30, y + 31, { size: 16, font: 'mono', color: 'mute', alpha: e.a });
    ctx.line(b.x + 20, y + 46, b.x + b.w - 20, y + 46, { color: 'line', alpha: e.a, width: 1 });
    // status, top right: draft → sent → refused (and refused again, every time the send button presses itself)
    const label = refused ? (n ? `refused × ${n + 1}` : 'refused') : sent ? 'sent' : 'draft', sc = refused ? ERR : sent ? 'sub' : 'mute';
    const lx = b.x + b.w - 26, dotX = lx - ctx.measure(label, { size: 16, font: 'mono' }) - 14;
    ctx.text(label, lx, y + 31, { size: 16, font: 'mono', color: sc, align: 'right', alpha: e.a });
    ctx.glow(ERR, 10, () => ctx.circle(dotX, y + 26, 5, { fill: true, color: sc, alpha: e.a }), refused ? 0.7 : 0);
    if (sent) burst(ctx, dotX, y + 26, 24, (t - tSend) / 0.45, { color: 'sub' });
    if (refused) burst(ctx, dotX, y + 26, 26, (t - tRule) / 0.45, { color: ERR });
    // the rule down its left edge: the first red in the film
    ctx.rrect(b.x + 1, y + 14, 5, b.h - 28, 2.5, { fill: 'line', alpha: e.a });
    const rk = easeOut(prog(t, tRule, tRule + 0.3));
    if (rk > 0) ctx.glow(ERR, 14, () => ctx.rrect(b.x + 1, y + 14, 5, (b.h - 28) * rk, 2.5, { fill: ERR }), 0.7);
    // the code, typed; the two arguments are cream: they are the user's
    const size = 29, cw = ctx.cw(size), x0 = b.x + 34, y0 = y + 98;
    const shown = t >= tCodeEnd ? REQ.length : Math.floor(prog(t, tCode, tCodeEnd) * REQ.length + 1e-6);
    for (const [a, z, role] of SEG) if (shown > a) ctx.text(REQ.slice(a, Math.min(z, shown)), x0 + a * cw, y0, { size, font: 'mono', color: role, alpha: e.a });
    if (t >= tCode && t < tSend && (shown < REQ.length || Math.floor(t * 5) % 2 === 0)) ctx.rect(x0 + shown * cw + 3, y0 - size * 0.8, cw * 0.8, size * 0.98, { fill: true, color: 'sub' });
    // the client reads it once, left to right, before it answers
    const scan = prog(t, CUT_CHECK + 0.08, tRule - 0.04);
    if (scan > 0 && scan < 1) {
      const sx = x0 + easeInOut(scan) * REQ.length * cw;
      ctx.gradRect(sx - 70, y0 - 30, 70, 44, [[0, 'text', 0], [1, 'text', 0.16]], 'h');
      ctx.line(sx, y0 - 32, sx, y0 + 16, { color: 'text', alpha: 0.85, width: 2 });
    }
    // one underline per argument, the person first
    ARG.forEach(([a, z], i) => {
      const at = i ? tArg2 : tArg1, k = easeOut(prog(t, at, at + 0.2));
      if (k <= 0) return;
      const xa = x0 + a * cw, xb = x0 + z * cw, te = enter(t, at + 0.1, 0, { dur: 0.22, rise: -8 });
      ctx.glow(ERR, 8, () => ctx.line(xa, y0 + 11, lerp(xa, xb, k), y0 + 11, { color: ERR, width: 3 }), 0.5);
      ctx.text(ARG_TAG[i], xa, y0 + 38 + te.dy, { size: 15, font: 'mono', color: ERR, alpha: te.a });
    });
  }

  // ---------------------------------------------------------------- the client, whole: every component in the state it has at time t
  function world(ctx, t, f, { bd = true, thread = true, frame = true } = {}) {
    const G = geo(t), { L, th, d } = G, s = L.side, h = L.head, w = L.win, g = ctx.g, up = (i) => t >= E[i], age = (i) => t - E[i];
    if (bd) backdrop(ctx, t);
    if (frame) windowFrame(ctx, L, { glass: 0.84 });

    // sidebar: spark (error 12), new-chat button (6), saved chats (5), the user's own chip
    sidebar(ctx, L, { t, items: SIDE, presence: 'offline' });
    if (up(4)) SIDE.forEach((_, i) => ctx.rrect(s.x + 9, s.y + 184 + i * 44 + 8, 3.5, 22 * easeOut(prog(age(4), i * 0.13, i * 0.13 + 0.2)), 2, { fill: ERR }));
    if (up(5)) {
      const k = easeOut(prog(age(5), 0, 0.25)), bx = s.x + 16, by = s.y + 76;
      ctx.at(bx + (s.w - 32) / 2, by + 23, () => ctx.rrect(-(s.w - 32) / 2, -23, s.w - 32, 46, 12, { fill: null, stroke: ERR, width: 2.5, alpha: k }), { scale: 1 - 0.05 * pulse(age(5), 8) });
      ctx.line(bx + 18, by + 23, bx + 34, by + 23, { color: ERR, alpha: k, width: 2.5 }); ctx.line(bx + 26, by + 15, bx + 26, by + 31, { color: ERR, alpha: k, width: 2.5 });
    }
    if (up(11)) ctx.glow(ERR, 12, () => spark(ctx, s.x + 37, s.y + 34, 15, { color: ERR, alpha: easeOut(prog(age(11), 0, 0.2)) }), 0.6);
    if (up(2)) ctx.circle(s.x + s.w - 108, s.y + s.h - 42, 6, { color: ERR, width: 2.5 });

    // header: title + rule (error 4), presence chip (3), the window's own controls (13)
    // (v4: the count rolls to zero as the plate before this section is wiped off the page: its last word was a message too)
    const roll = prog(t, CUT_REQ + 0.04, CUT_REQ + 0.3);
    header(ctx, L, { t, title: TITLE, sub: roll < 1 ? null : t < tSend ? '0 messages' : '1 message' });
    if (roll < 1) {
      const x = h.x + 30 + ctx.measure(TITLE, { size: 22, weight: 500 }) + 16, y = h.y + 41, k = easeOut(roll);
      ctx.clip({ x: x - 4, y: y - 20, w: 220, h: 28 }, () => { ctx.text('1 message', x, y - k * 24, { size: 18, color: 'mute', alpha: 1 - k }); ctx.text('0 messages', x, y + (1 - k) * 24, { size: 18, color: 'mute', alpha: k }); });
    }
    presence(ctx, G.chip[0], G.chip[1], 'offline', { size: 19 });
    if (t >= tSend && t < tSend + 0.5) ctx.trail(2, 0.02, (tau) => {
      const q = easeInOut(prog(t - tau, tSend, tSend + 0.5)), b = G.block;
      pill(ctx, lerp(b.x + b.w - 90, G.chip[0], q), lerp(b.y + 26, G.chip[1] + 30, q) - Math.sin(q * Math.PI) * 50, REQ, { font: 'mono', size: 15, color: 'sub', align: 'center', alpha: (1 - q * q) * clamp(q * 8) });
    }, 0.35);
    if (t >= tSend && t < tSend + 1) { const k = prog(t, tSend + 0.5, tSend + 1); ctx.circle(G.chip[0], G.chip[1], 6 + 26 * easeOut(k), { color: 'sub', alpha: 0.8 * (1 - k) * clamp(k * 20), width: 2 }); }   // the request arrives here; nothing changes
    if (up(2)) {                                                    // red ring only: its label stays grey. It is asked again on every beat
      const ph = (age(2) / P) % 1;
      ctx.glow(ERR, 8, () => ctx.circle(G.chip[0], G.chip[1], 6, { color: ERR, width: 2.5 }), 0.6);
      ctx.circle(G.chip[0], G.chip[1], 6 + 15 * ph, { color: ERR, width: 1.5, alpha: 0.7 * (1 - ph) });
    }
    if (up(3)) {
      const k = easeOut(prog(age(3), 0, 0.45));
      ctx.text(TITLE, h.x + 30, h.y + 41, { size: 22, weight: 500, color: ERR, alpha: clamp(age(3) * 8) });
      ctx.line(h.x, h.y + h.h, h.x + h.w * k, h.y + h.h, { color: ERR, width: 2 });
    }
    const cx = w.x + w.w - 32, cy = w.y + 34, cc = up(12) ? ERR : 'mute', dip = up(12) ? 2.5 * pulse(age(12) - 0.3, 9) : 0;
    ctx.line(cx - 36, cy, cx - 24, cy, { color: cc, width: 2 });
    ctx.line(cx - 6, cy - 6 + dip, cx + 6, cy + 6 + dip, { color: cc, width: 2 }); ctx.line(cx + 6, cy - 6 + dip, cx - 6, cy + 6 + dip, { color: cc, width: 2 });
    if (up(12)) {                                                   // the strip along the top edge; the close button presses, and nothing closes
      const k = easeOut(prog(age(12), 0, 0.4));
      ctx.clip(w, () => ctx.rect(w.x + w.w * (1 - k), w.y, w.w * k, 5, { fill: true, color: ERR }), w.r);
      burst(ctx, cx, cy, 30, (age(12) - 0.3) / 0.4, { color: ERR });
    }

    // thread: her line (lyric 83), the request, the client's reply (lyric 84), the timestamp (2), thinking (11), the forged bubble (10)
    const items = !thread ? [] : drawThread(ctx, th, [{ who: 'me', text: text(83), at: T(83), n: lyrics.typed(83, t).n, size: MSG }], t, { anchor: 'top', fadeTop: 0, dim: () => lerp(1, 0.55, prog(t, T(84) - 0.1, T(84) + 0.35)) });
    if (up(11) && items[0]) spark(ctx, th.x + 17, items[0].y + MSG * 0.62, 15, { color: ERR, alpha: easeOut(prog(age(11), 0, 0.2)) });
    if (thread) requestBlock(ctx, t, G);
    const re = enter(t, T(84) - 0.04, 0, { dur: 0.24, rise: -16 });
    if (thread && re.a > 0) {
      const r = G.reply, said = t >= tHit;
      ctx.rrect(r.x, r.y + re.dy, r.w, r.h, 14, { fill: 'raised', stroke: 'line', alpha: re.a });
      ctx.rrect(r.x + 1, r.y + 12 + re.dy, 5, r.h - 24, 2.5, { fill: t >= tRule ? ERR : 'line', alpha: re.a });
      sysLine(ctx, text(84), t, T(84), r.x + 30, r.y + 40 + re.dy, { size: 28, cps: 40, color: t < lyrics.end(84) ? 'text' : 'sub' });
      if (said) ctx.text(text(85), r.x + 30 + 2 * ctx.cw(28), r.y + 84, { size: 28, font: 'mono', weight: 700, color: ERR, alpha: prog(t, tHit + 0.08, tHit + 0.22) });
    }
    if (thread && t >= tSend) {
      const over = Math.floor(t - T(83) - 5), two = (v) => String(v).padStart(2, '0'), a = prog(t, tSend, tSend + 0.2);     // same clock as the outro reads later
      const str = over < 0 ? 'sent · reply expected' : `overdue ${two(Math.floor(over / 3600))}:${two(Math.floor(over / 60) % 60)}:${two(over % 60)}`;
      ctx.glow(ERR, 8, () => ctx.text(str, G.stamp[0], G.stamp[1], { size: 17, font: 'mono', color: up(1) ? ERR : 'mute', alpha: a }), up(1) ? 0.5 : 0);
    }
    const te = enter(t, S0 + P, 0, { dur: 0.3 });
    if (thread && te.a > 0) {
      ctx.glow(ERR, 10, () => thinking(ctx, G.think[0], G.think[1] + te.dy, 20, t, { stuck: 0.55, color: up(10) ? ERR : 'me', alpha: te.a }), up(10) ? 0.6 : 0);
      ctx.text('Thinking', G.think[0] + 36, G.think[1] + 7 + te.dy, { size: 20, color: 'mute', alpha: te.a });
    }
    if (up(9)) {
      const e = enter(t, E[9], 0, { dur: 0.3 }), bw = ctx.measure(FORGED, { size: 28 }) + 52, x = G.bubble.r - bw, y = G.bubble.y + e.dy, k = easeOut(prog(age(9), 0.3, 0.55));
      ctx.rrect(x, y, bw, G.bubble.h, 24, { fill: 'raised', alpha: e.a });
      ctx.text(FORGED, x + 26, y + 15 + 0.76 * 28 * 1.32, { size: 28, color: 'text', alpha: e.a });
      ctx.glow(ERR, 10, () => ctx.rrect(x, y, bw, G.bubble.h, 24, { fill: null, stroke: ERR, width: 2.5, alpha: k }), 0.5 * k);
      ctx.text('not written by them', G.bubble.r - 6, y + G.bubble.h + 24, { size: 17, weight: 500, color: ERR, alpha: k, align: 'right' });
    }

    // composer: a reply typed into the user's field and rejected (error 9); the send button that presses itself (1)
    const c9 = age(8);
    let typedStr = '', shakeY = 0;
    if (c9 >= 0) {
      const nIn = Math.floor(clamp(c9 / (0.9 * P)) * FORGED.length + 1e-6), nOut = Math.ceil((1 - prog(c9, 2.2 * P, 2.6 * P)) * FORGED.length - 1e-6);
      typedStr = FORGED.slice(0, Math.min(nIn, nOut));
      shakeY = 5 * Math.sin((c9 - 1.25 * P) * 46) * pulse(c9 - 1.25 * P, 9);
    }
    const box = composer(ctx, L.composer, { text: typedStr, placeholder: HINT, t, focus: c9 >= 0 && c9 < 2.6 * P ? 1 : 0, send: 'idle', shake: shakeY });
    if (c9 >= 1.25 * P) {
      const k = easeOut(prog(c9, 1.25 * P, 1.25 * P + 0.18)), r = box.box, tw = ctx.measure(typedStr, { size: 28 });
      if (typedStr) ctx.line(r.x + 26, r.y + 39, r.x + 26 + (tw + 10) * k, r.y + 39, { color: ERR, width: 3 });
      ctx.rrect(r.x, r.y, r.w, r.h, 26, { fill: null, stroke: ERR, width: 2.5, alpha: k });
    }
    if (up(0)) {
      const lp = t - lastPress(t), [sx, sy] = box.send;
      ctx.at(sx, sy, () => {
        ctx.glow(ERR, 12, () => ctx.circle(0, 0, 20, { fill: true, color: ERR }), 0.55);
        ctx.line(0, 8, 0, -8, { color: 'raised', width: 3 }); ctx.poly([[-7, -2], [0, -9], [7, -2]], { color: 'raised', width: 3 });
      }, { scale: 1 - 0.16 * pulse(lp, 11) });
      burst(ctx, sx, sy, 44, lp / 0.4, { color: ERR });
      const k = prog(lp, 0.02, 0.5);                                // …and the same request leaves again, towards the chip that will not change
      if (k > 0 && k < 1 && t < CUT_CHROME) ctx.trail(2, 0.02, (tau) => {      // (shown while the camera is on it; afterwards the count on the block says it)
        const q = easeInOut(prog(lp - tau, 0.02, 0.5));
        pill(ctx, lerp(sx, G.chip[0], q), lerp(sy - 30, G.chip[1] + 30, q) - Math.sin(q * Math.PI) * 60, REQ, { font: 'mono', size: 15, color: 'sub', align: 'center', alpha: (1 - q * q) * clamp(q * 8) });
      }, 0.35);
    }

    // settings drawer (error 7): one set of switches, all of them hers; the row for the user has no switch in it
    if (d.w > 60) ctx.clip(d, () => {
      const c = drawer(ctx, L, { title: 'Settings' }), x1 = c.x + c.w, a7 = age(6);
      const ring = (x, y, ww, hh, i) => ctx.rrect(x - 6, y - 6, ww + 12, hh + 12, hh / 2 + 6, { fill: null, stroke: ERR, width: 2, alpha: easeOut(prog(a7, 0.3 + i * 0.05, 0.5 + i * 0.05)) });
      ctx.text('You', c.x, d.y + 136, { size: 16, weight: 600, color: 'mute', spacing: 0.6 });
      ctx.text('Presence', c.x, d.y + 178, { size: 21, weight: 500, color: 'text' });
      g.setLineDash([7, 6]);
      ctx.rrect(G.slot.x, G.slot.y, G.slot.w, G.slot.h, 20, { fill: null, stroke: a7 > 0.3 ? ERR : 'sub', width: 2 });
      g.setLineDash([]);
      ctx.text('no switch', G.slot.x + G.slot.w / 2, G.slot.y + 26, { size: 15, font: 'mono', color: 'mute', align: 'center' });
      ctx.line(c.x, d.y + 204, x1, d.y + 204, { color: 'line', alpha: 0.7, width: 1 });
      ctx.text('ChatGPT', c.x, d.y + 234, { size: 16, weight: 600, color: 'mute', spacing: 0.6 });
      SET.forEach((row, i) => {
        const ry = d.y + 246 + i * 66, v = LEFT[row.label] ?? 0;
        ctx.text(row.label, c.x, ry + 40, { size: 21, weight: 500, color: 'text' });
        ctx.line(c.x, ry + 66, x1, ry + 66, { color: 'line', alpha: 0.7, width: 1 });
        if (row.control === 'toggle') { toggle(ctx, x1 - 62, ry + 16, v); ring(x1 - 62, ry + 16, 62, 34, i); }
        else if (row.control === 'segmented') { segmented(ctx, { x: x1 - 130, y: ry + 13, w: 130, h: 40 }, row.values ?? [], Math.round(v), { size: 18 }); ring(x1 - 130, ry + 13, 130, 40, i); }
        else { slider(ctx, { x: x1 - 136, y: ry + 13, w: 124, h: 40 }, v); ring(x1 - 148, ry + 16, 148, 34, i); }
      });
    });

    // the forged pointer (error 8): drawn where theirs should be, it clicks, is struck out and removed
    const a8 = age(7);
    if (a8 >= 0) {
      const [px, py] = G.ptr, inK = easeBack(prog(a8, 0, 0.24)), gone = prog(a8, 1.7 * P, 2.1 * P), strike = easeOut(prog(a8, 1.1 * P, 1.1 * P + 0.16));
      burst(ctx, px, py, 34, (a8 - 0.55 * P) / 0.4, { color: ERR });
      ctx.at(px, py, () => {
        if (gone > 0) g.setLineDash([5, 4]);
        ctx.poly(ARROW, { close: true, color: ERR, width: lerp(2.2, 1.6, gone), alpha: 1 - 0.45 * gone });
        g.setLineDash([]);
        if (strike > 0) ctx.line(-8, 31, lerp(-8, 25, strike), lerp(31, -3, strike), { color: ERR, width: 1.8 });
      }, { scale: 1.7 * inK });
    }

    // the window frame (error 14), last: the outline is traced once, and then it keeps growing past the window
    const a14 = age(13);
    if (a14 >= 0) {
      const per = 2 * (w.w + w.h);
      g.setLineDash([per * easeOut(prog(a14, 0, 0.5)), per * 2]);
      ctx.glow(ERR, 20, () => ctx.rrect(w.x, w.y, w.w, w.h, w.r, { fill: null, stroke: ERR, width: 4 }), 0.7);
      g.setLineDash([]);
      for (let j = 1; j <= 3; j++) { const o = (a14 - 0.35) * 15 * j; if (o > 0) ctx.rrect(w.x - o, w.y - o, w.w + 2 * o, w.h + 2 * o, w.r + o, { fill: null, stroke: ERR, width: 2, alpha: 0.5 / j }); }
    }
    return G;
  }

  // ---------------------------------------------------------------- the errors themselves (screen space, fixed sizes: always legible)
  const S = 1.14, LAST_SC = 1.9;                                    // default size of an open card (540 x 164 at 1); the fifteenth
  /** One error, open: title, body, code, its button (nobody is here to press it), its number. (x, y) = top-left. */
  function card(ctx, i, x, y, { k = 1, shut = 0, sc = S } = {}) {
    const it = IT[i];
    if (!it || k <= 0 || shut >= 1) return;
    const e = k >= 1 ? 1 : easeBack(clamp(k)), a = clamp(k * 3) * (1 - shut), w = 540, h = 164;
    ctx.at(x + (w * sc) / 2, y + (h * sc) / 2 - (1 - e) * 28, () => {
      const x0 = -w / 2, y0 = -h / 2;
      ctx.rrect(x0, y0, w, h, 16, { fill: 'raised', stroke: DIM, alpha: a, shadow: 0.85 });
      cardEngineering(ctx, { x: x0, y: y0, w, h }, { alpha: a, color: 'err', state: clamp(k) });
      ctx.rrect(x0, y0, 6, h, 3, { fill: ERR, alpha: a });
      ctx.circle(x0 + 38, y0 + 38, 15, { fill: true, color: ERR, alpha: a });
      ctx.text('!', x0 + 38, y0 + 46, { size: 22, weight: 800, align: 'center', color: 'raised', alpha: a });
      ctx.text(it.title, x0 + 66, y0 + 47, { size: 25, weight: 600, color: 'text', alpha: a });
      ctx.wrap(it.body, w - 92, { size: 20 }).slice(0, 2).forEach((ln, j) => ctx.text(ln, x0 + 66, y0 + 80 + j * 26, { size: 20, color: 'sub', alpha: a }));
      ctx.text(it.code, x0 + 66, y0 + h - 18, { size: 20, font: 'mono', color: ERR, alpha: a });
      ctx.rrect(x0 + w - 114, y0 + h - 48, 98, 34, 17, { fill: 'raised', stroke: 'sub', alpha: a });
      ctx.text('Noted', x0 + w - 65, y0 + h - 24.5, { size: 18, weight: 600, align: 'center', color: 'sub', alpha: a });
      ctx.circle(x0 + w - 6, y0 + 6, 19, { fill: true, color: ERR, alpha: a });
      ctx.text(String(i + 1), x0 + w - 6, y0 + 13, { size: 20, weight: 700, font: 'mono', align: 'center', color: 'raised', alpha: a });
    }, { scale: sc * (0.92 + 0.08 * e) * (1 - 0.3 * shut) });
  }
  const chipBox = (ctx, i, it = IT[i] ?? IT[0]) => ({
    w: 26 + Math.max(ctx.measure(it.title, { size: 22, weight: 600 }), ctx.measure(it.code, { size: 20, font: 'mono' }), i ? 0 : ctx.measure(text(85), { size: 30, font: 'mono' })) + 54,
    h: i ? 66 : 108,
  });
  /** The same error, folded: title + code (the first one keeps the keyword). (x, y) = top-left. */
  function chip(ctx, i, x, y, { a = 1, s = 1 } = {}) {
    const it = IT[i];
    if (!it || a <= 0.003 || s <= 0.01) return;
    const { w, h } = chipBox(ctx, i);
    ctx.at(x + w / 2, y + h / 2, () => {
      const x0 = -w / 2, y0 = -h / 2;
      ctx.rrect(x0, y0, w, h, 12, { fill: 'raised', stroke: DIM, alpha: a, shadow: 0.6 });
      cardEngineering(ctx, { x: x0, y: y0, w, h }, { alpha: a * 0.75, color: 'err' });
      ctx.rrect(x0, y0, 5, h, 2.5, { fill: ERR, alpha: a });
      ctx.text(it.title, x0 + 22, y0 + 28, { size: 22, weight: 600, color: 'text', alpha: a });
      if (!i) ctx.text(text(85), x0 + 22, y0 + 67, { size: 30, weight: 800, font: 'mono', color: ERR, alpha: a });
      ctx.text(it.code, x0 + 22, y0 + h - 13, { size: 20, font: 'mono', color: ERR, alpha: a });
      ctx.circle(x0 + w - 24, y0 + 24, 14, { fill: true, color: ERR, alpha: a });
      ctx.text(String(i + 1), x0 + w - 24, y0 + 30, { size: 17, weight: 700, font: 'mono', align: 'center', color: 'raised', alpha: a });
    }, { scale: s });
  }
  /** A hairline from an error to the component it is about. from = rect {x, y, w, h}, to = [x, y]. */
  function leader(ctx, from, to, k = 1, alpha = 1) {
    if (k <= 0 || alpha <= 0.003) return;
    const a = [clamp(to[0], from.x, from.x + from.w), clamp(to[1], from.y, from.y + from.h)], e = easeOut(clamp(k));
    if (Math.hypot(to[0] - a[0], to[1] - a[1]) < 8) return;
    ctx.line(a[0], a[1], lerp(a[0], to[0], e), lerp(a[1], to[1], e), { color: ERR, alpha: 0.8 * alpha, width: 1.5 });
    if (e >= 0.98) ctx.circle(to[0], to[1], 6, { color: ERR, alpha, width: 2 });
  }
  /**
   * Error i on screen at time t: open at `open` [x, y] from its arrival, then (from `park`, if given) folding into its chip
   * at `dock` [x, y]. `to` = the screen position of its component (for the hairline). fold = 0..1 the lights going out on it.
   */
  function toast(ctx, i, t, { open, dock = open, park = null, to = null, fold = 0, sc = S }) {
    if (!IT[i] || t < AT[i] || fold >= 1) return;
    const k = prog(t, AT[i], AT[i] + 0.3), pk = park == null ? 0 : easeInOut(prog(t, park, park + 0.36)), cb = chipBox(ctx, i), sink = 18 * easeIn(fold), cw = 540 * sc, ch = 164 * sc;
    if (pk < 1) {
      const x = lerp(open[0], dock[0] + cb.w / 2 - cw / 2, pk), y = lerp(open[1], dock[1] + cb.h / 2 - ch / 2, pk);
      if (to && pk <= 0 && fold <= 0) leader(ctx, { x, y, w: cw, h: ch }, to, prog(t, AT[i] + 0.12, AT[i] + 0.4));
      ctx.at(x + cw / 2, y + ch / 2 + sink, () => card(ctx, i, -cw / 2, -ch / 2, { k, shut: prog(pk, 0, 0.7), sc }), { alpha: 1 - fold });
    }
    if (pk > 0) {
      const x = lerp(open[0] + cw / 2 - cb.w / 2, dock[0], pk), y = lerp(open[1] + ch / 2 - cb.h / 2, dock[1], pk);
      if (to && pk >= 1 && fold <= 0) leader(ctx, { x, y, w: cb.w, h: cb.h }, to, 1, 0.8);
      chip(ctx, i, x, y + sink, { a: prog(pk, 0.3, 1) * (1 - fold), s: 0.8 + 0.2 * pk });
    }
  }
  /** Tearing: a small, steady colour split that grows with the spread, and one row-tear on each bar's downbeat. */
  function tear(ctx, t, f) {
    const k = prog(t, S0, E[13]);
    ctx.fx.rgbSplit = Math.max(ctx.fx.rgbSplit, 0.4 + 1.3 * k);
    if (f.bar >= 73 && f.bar <= 79) ctx.fx.glitch = Math.max(ctx.fx.glitch, (0.14 + 0.4 * k) * pulse(f.sinceBar, 8));
  }
  // ---------------------------------------------------------------- cameras (needed again inside render, to tie screen-space cards to the world)
  const camRequest = (t) => { const k = easeInOut(prog(t, CUT_REQ, CUT_CHECK)); return { zoom: 1 + 0.1 * k, x: -10 * k, y: -52 * k }; };
  const camCheck = (t) => { const b = geo(t).block, c = frameRect({ x: b.x - 46, y: b.y - 89, w: b.w + 92, h: 390 }); return { ...c, zoom: c.zoom * (1 + 0.05 * prog(t, CUT_CHECK, CUT_FIRST)) }; };
  const camFirst = (t) => { const z = 1.42 + 0.04 * prog(t, CUT_FIRST, S0); return { zoom: z, x: 590 + 960 / z - 960, y: 118 + 540 / z - 540 }; };   // top-left of the view stays on the thread's corner
  const tRide = Bt(290.9), tArrive = Bt(292);
  const camSend = (t) => { const k = easeInOut(prog(t, tRide, tArrive)); return { zoom: lerp(3, 1.85, k) + 0.04 * prog(t, S0, CUT_CHROME), x: lerp(475, 100, k), y: lerp(363, -110, k) }; };
  const camForge = (t) => ({ zoom: 1.95 + 0.03 * prog(t, CUT_FORGE, CUT_WIN), x: -73, y: 232 });
  const camWin = (t) => ({ zoom: 0.92 - 0.012 * easeIn(prog(t, FOLD, CUT_BREATH)) });
  /** err-drawer: the client seen from above (the view it was assembled in, section 1). Returns the transform and its projection. */
  const tilt = (t) => {
    const k = lerp(0.5, 0.64, easeInOut(prog(t, CUT_DRAWER, CUT_FORGE))), sc = 0.88, X0 = 905;
    return {
      apply: (g) => { g.translate(X0, 540 + 96 * k); g.scale(sc, sc); g.transform(1, 0.16 * k, -0.44 * k, 1 - 0.3 * k, 0, 0); g.translate(-960, -540); },
      proj: (wx, wy) => [X0 + sc * ((wx - 960) - 0.44 * k * (wy - 540)), 540 + 96 * k + sc * (0.16 * k * (wx - 960) + (1 - 0.3 * k) * (wy - 540))],
    };
  };

  /** The first error's dialog: the same anatomy as every later one, with the keyword as its headline. */
  function firstDialog(ctx, t) {
    const age = t - tHit;
    if (age < 0) return;
    const r = { x: 150, y: 612, w: 1620, h: 420 }, k = prog(age, 0, 0.26), e = easeBack(k), a = clamp(k * 4), it = IT[0];
    ctx.at(r.x + r.w / 2, r.y + r.h / 2 + (1 - e) * 40, () => {
      const x = -r.w / 2, y = -r.h / 2, e1 = enter(t, tHit + 0.55 * P, 0, { dur: 0.3, rise: 14 }), e2 = enter(t, tHit + 1.1 * P, 0, { dur: 0.3, rise: 14 });
      ctx.rrect(x, y, r.w, r.h, 26, { fill: 'raised', stroke: DIM, alpha: a, shadow: 1, width: 2 });
      cardEngineering(ctx, { x, y, w: r.w, h: r.h }, { alpha: a, color: 'err' });
      ctx.rrect(x, y, 9, r.h, 4.5, { fill: ERR, alpha: a });
      ctx.circle(x + 66, y + 58, 22, { fill: true, color: ERR, alpha: a });
      ctx.text('!', x + 66, y + 70, { size: 32, weight: 800, align: 'center', color: 'raised', alpha: a });
      ctx.text(it.title, x + 108, y + 72, { size: 40, weight: 600, color: 'text', alpha: a * e1.a });
      ctx.line(x + 44, y + 108, x + r.w - 44, y + 108, { color: 'line', alpha: a, width: 1.5 });
      ctx.glow(ERR, 26, () => keywordSys(ctx, text(85), t, tHit, 0, y + 248, { maxW: 1500, maxSize: 132, color: ERR, dimColor: DIM, key: 85, alpha: a }), 0.5);
      ctx.text(it.body, x + 48, y + 330 + e2.dy, { size: 28, color: 'sub', alpha: a * e2.a });
      ctx.text(it.code, x + 48, y + r.h - 34, { size: 24, font: 'mono', color: ERR, alpha: a * e2.a });
      ctx.rrect(x + r.w - 196, y + r.h - 78, 150, 50, 25, { fill: 'raised', stroke: 'sub', alpha: a * e2.a });
      ctx.text('Noted', x + r.w - 121, y + r.h - 44, { size: 24, weight: 600, align: 'center', color: 'sub', alpha: a * e2.a });
      ctx.circle(x + r.w - 10, y + 10, 26, { fill: true, color: ERR, alpha: a });
      ctx.text('1', x + r.w - 10, y + 20, { size: 28, weight: 700, font: 'mono', align: 'center', color: 'raised', alpha: a });
    }, { scale: 0.93 + 0.07 * e });
  }

  /** err-chrome: an error window that carries a live close-up of the component it is about. */
  function panel(ctx, t, f, r, vh, view, list, opts = {}) {
    const k = prog(t, AT[list[0]], AT[list[0]] + 0.3);
    if (k <= 0) return;
    const e = easeBack(k), g = ctx.g;
    ctx.at(r.x + r.w / 2, r.y + r.h / 2 + (1 - e) * 30, () => {
      const x = -r.w / 2, y = -r.h / 2;
      ctx.rrect(x, y, r.w, r.h, 20, { fill: 'raised', stroke: DIM, shadow: 0.9, width: 2 });
      cardEngineering(ctx, { x, y, w: r.w, h: r.h }, { alpha: 0.83, color: 'err' });
      ctx.clip({ x, y, w: r.w, h: r.h }, () => {
        ctx.clip({ x, y, w: r.w, h: vh }, () => { g.translate(x + r.w / 2, y + vh / 2); g.scale(view.s, view.s); g.translate(-view.cx, -view.cy); world(ctx, t, f, opts); });
        ctx.rect(x, y, 7, r.h, { fill: true, color: ERR });
        ctx.line(x, y + vh, x + r.w, y + vh, { color: DIM, width: 2 });
      }, 20);
      list.forEach((i, j) => {
        const it = IT[i], c = enter(t, AT[i] + (j ? 0 : 0.1), 0, { dur: 0.3, rise: 16 }), y0 = y + vh + j * 164 + c.dy;
        if (!it || c.a <= 0) return;
        const lines = ctx.wrap(it.body, r.w - 110, { size: 23 }).slice(0, 2);
        ctx.circle(x + 46, y0 + 42, 15, { fill: true, color: ERR, alpha: c.a });
        ctx.text('!', x + 46, y0 + 50, { size: 22, weight: 800, align: 'center', color: 'raised', alpha: c.a });
        ctx.text(it.title, x + 76, y0 + 52, { size: 30, weight: 600, color: 'text', alpha: c.a });
        lines.forEach((ln, q) => ctx.text(ln, x + 76, y0 + 88 + q * 29, { size: 23, color: 'sub', alpha: c.a }));
        ctx.text(it.code, x + 76, y0 + 94 + lines.length * 29, { size: 20, font: 'mono', color: ERR, alpha: c.a });
        ctx.circle(x + r.w - 34, y0 + 42, 17, { fill: true, color: ERR, alpha: c.a });
        ctx.text(String(i + 1), x + r.w - 34, y0 + 49, { size: 20, weight: 700, font: 'mono', align: 'center', color: 'raised', alpha: c.a });
        if (j) ctx.line(x + 30, y0 + 4, x + r.w - 24, y0 + 4, { color: 'line', alpha: c.a, width: 1 });
      });
    }, { scale: 0.94 + 0.06 * e, alpha: clamp(k * 3) });
  }

  return [
    // ------------------------------------------------------------------ the request
    {
      id: 'err-request', at: CUT_REQ, lines: [83, 83], palette: 'off', layout: 'the whole client: one message forming in the empty thread, slow push',
      enter: { type: 'scan', dir: 2, dur: P / 2, align: 'start' },           // v4: the second press of Delete wipes the plate before this away, left to right
      moment: 'Alone in the empty, offline chat, the AI writes one request and sends it: set the user\'s presence back to online. It is not its to send.',
      camera: camRequest,
      render(ctx, t, f) { world(ctx, t, f); },
    },

    // ------------------------------------------------------------------ the client reads it
    {
      id: 'err-check', at: CUT_CHECK, lines: [84, 84], palette: 'off', state: 'off > error', layout: 'macro on the request\'s code block',
      moment: 'The client reads the request and answers in its own voice: the block\'s rule and status turn red (the first red in the film), then each argument is underlined, the person first.',
      camera: camCheck,
      render(ctx, t, f) { world(ctx, t, f); },
    },

    // ------------------------------------------------------------------ the first error
    {
      id: 'err-first', at: CUT_FIRST, lines: [85, 85], palette: 'off', state: 'off > error', layout: 'medium: the refused request above, the error dialog across the lower half, the keyword as its headline',
      moment: 'The first error. The client names what was wrong with the request (a person, and a decision that is theirs) and the keyword is the headline of that dialog.',
      camera: camFirst,
      render(ctx, t, f) {
        const G = world(ctx, t, f), p = through(camFirst(t)), age = t - tHit;
        ctx.camera();
        const a = p(G.reply.x + G.reply.w - 70, G.reply.y + G.reply.h);
        if (age > 0.1) ctx.line(a[0], a[1], a[0], lerp(a[1], 612, easeOut(prog(age, 0.1, 0.3))), { color: ERR, width: 2 });
        firstDialog(ctx, t);
        ctx.fx.rgbSplit = 3 * pulse(age, 7);
        ctx.fx.shake = shake(t, 7 * pulse(age, 9));
      },
    },

    // ------------------------------------------------------------------ 1 send button · 2 timestamp
    {
      id: 'err-send', at: S0, lines: [85, 85], palette, state: 'off > error', layout: 'close on the composer\'s send button, then riding up the thread to the request\'s timestamp',
      moment: 'It will not take the refusal: the send button presses itself on the same request, again and again, and the timestamp under the request, still counting, turns red.',
      camera: camSend,
      render(ctx, t, f) {
        const moving = t > tRide && t < tArrive;
        const G = world(ctx, t, f), p = through(camSend(t));
        // motion blur on the ride: what the client holds, twice more, where it was a frame or two ago (not the wall and the glass again:
        // v3 repainted both over the picture, and the ride was a wash)
        if (moving) for (const [tau, a] of [[0.014, 0.4], [0.028, 0.22]]) { ctx.camera(camSend(t - tau)); ctx.at(0, 0, () => world(ctx, t, f, { bd: false, frame: false }), { alpha: a }); }
        ctx.camera();
        // v4: REFUSED x N, large, for as long as the view is on the button: it jumps every time the button presses itself. When the
        // camera rides up the thread it goes home to the label it is: the status line of the request block
        const n = nPress(t), lp = t - lastPress(t), home = easeInOut(prog(t, tRide - 0.08, tArrive)), z = camSend(t).zoom;
        if (n > 0 && home < 1) {
          const to = p(G.block.x + G.block.w - 26, G.block.y + 31), size = lerp(250, 16 * z, home), cw = ctx.cw(size), jump = pulse(lp, 12);
          const x = lerp(150, to[0] - 2.4 * cw, home), y = lerp(880, to[1], home) - 12 * jump * (1 - home);
          ctx.text('refused', x, y - size * 0.92, { size: lerp(46, 16 * z, home), font: 'mono', weight: 700, color: 'sub', alpha: 1 - home });
          ctx.glow(ERR, 18, () => { ctx.text('×', x, y, { size, font: 'mono', weight: 800, color: ERR }); odometer(ctx, x + 1.3 * cw, y, n + clamp(lp / 0.12), { digits: 1, size, color: ERR }); }, 0.45 * (1 - home));
        }
        toast(ctx, 1, t, { open: [100, 150], dock: (() => { const s = p(...G.send), b = chipBox(ctx, 1); return [s[0] - b.w - 30, s[1] - 190]; })(), park: tRide - 0.3, to: (() => { const s = p(...G.send); return [s[0] - 50, s[1] - 50]; })() });
        toast(ctx, 2, t, { open: [640, 742], to: p(...DOCK[2](G)) });
        // the first error stays up, with the keyword it carries
        const kb = chipBox(ctx, 0), kx = 1920 - kb.w - 40, bp = p(G.block.x + G.block.w, G.block.y + 30);
        if (t > tArrive) leader(ctx, { x: kx, y: 44, w: kb.w, h: kb.h }, bp, prog(t, tArrive, tArrive + 0.3));
        chip(ctx, 0, kx, 44);
        tear(ctx, t, f);
      },
    },

    // ------------------------------------------------------------------ 3 presence chip · 4 header · 5 saved chats · 6 new-chat button
    {
      id: 'err-chrome', at: CUT_CHROME, palette, state: 'off > error', layout: 'three error windows over the dimmed client, each holding a live close-up: presence chip / header / sidebar',
      moment: 'The error leaves the thread for the chrome: the presence chip is asked again and again, the header counts one participant, the saved chats hold their words but not them, and a new chat cannot be opened from the inside.',
      enter: { type: 'glitch', dur: P / 2, align: 'start' },
      camera: (t) => ({ zoom: 1 + 0.03 * prog(t, CUT_CHROME, CUT_DRAWER) }),
      render(ctx, t, f) {
        const G = world(ctx, t, f, { thread: false }), h = G.L.head, s = G.L.side;      // the client, dimmed: what the close-ups are cut from
        ctx.camera();
        ctx.rect(0, 0, 1920, 1080, { fill: true, color: 'panel', alpha: 0.7 });
        glassFault(ctx, t, { progress: prog(t, CUT_CHROME, CUT_DRAWER), origin: [940, 490], tint: ERR, strength: 0.3 });
        const tw = ctx.measure(TITLE, { size: 22, weight: 500 }) + 16 + ctx.measure('1 message', { size: 18 });
        panel(ctx, t, f, { x: 50, y: 50, w: 880, h: 476 }, 310, { cx: G.chip[0] + 46, cy: G.chip[1] + 2, s: 4 }, [3]);
        panel(ctx, t, f, { x: 50, y: 554, w: 880, h: 476 }, 310, { cx: h.x + 30 + tw / 2, cy: h.y + 34, s: Math.min(2.5, 790 / tw) }, [4], { thread: false });
        panel(ctx, t, f, { x: 958, y: 50, w: 540, h: 980 }, 644, { cx: s.x + s.w / 2 + 8, cy: s.y + 262, s: 1.7 }, [5, 6]);
        [0, 1, 2].forEach((i) => { const b = chipBox(ctx, i); chip(ctx, i, 1900 - b.w, [50, 172, 252][i]); });
        tear(ctx, t, f);
      },
    },

    // ------------------------------------------------------------------ 7 settings drawer · 8 forged pointer
    {
      id: 'err-drawer', at: CUT_DRAWER, palette, state: 'off > error', layout: 'the client tilted, seen from above (as when it was assembled); the drawer sliding out on the right',
      moment: 'With no cursor on screen the settings drawer slides open: every switch in it is the AI\'s own and none is theirs. So it draws a pointer where theirs should be; the client strikes it out.',
      enter: { type: 'slices', dur: P / 2, align: 'start', bands: 10 },
      render(ctx, t, f) {
        backdrop(ctx, t);
        glassFault(ctx, t, { progress: prog(t, CUT_DRAWER, CUT_FORGE), origin: [1380, 490], tint: 'sub', strength: 0.4 });
        const g = ctx.g, M = tilt(t);
        g.save(); M.apply(g); const G = world(ctx, t, f, { bd: false }); g.restore(); ctx._font = '';
        const at = (i) => M.proj(...DOCK[i](G));
        const place = { 0: [20, -96], 1: [-420, 30], 2: [40, 16], 3: [-300, -112], 4: [-160, -100], 5: [-300, -10], 6: [-330, -86] };
        for (const i of [6, 5, 4, 3, 2, 1, 0]) { const a = at(i), b = chipBox(ctx, i), x = clamp(a[0] + place[i][0], 16, 1904 - b.w), y = clamp(a[1] + place[i][1], 16, 1064 - b.h); leader(ctx, { x, y, w: b.w, h: b.h }, a, 1, 0.8); chip(ctx, i, x, y); }
        toast(ctx, 7, t, { open: [1290, 874], to: M.proj(G.d.x + G.d.w / 2, G.d.y + 700) });
        toast(ctx, 8, t, { open: [1260, 28], to: M.proj(...G.ptr) });
        tear(ctx, t, f);
      },
    },

    // ------------------------------------------------------------------ 9 composer · 10 the forged bubble
    {
      id: 'err-forge', at: CUT_FORGE, palette, state: 'off > error', layout: 'low close-up: the composer across the bottom, the user\'s side of the thread above it',
      moment: 'If they will not answer, it answers for them: a reply is typed into the user\'s own field and rejected, then a cream bubble is forged on the user\'s side and outlined red.',
      camera: camForge,
      render(ctx, t, f) {
        const G = world(ctx, t, f), p = through(camForge(t));
        ctx.camera();
        const s = p(...G.send), b1 = chipBox(ctx, 1);
        leader(ctx, { x: s[0] - b1.w - 40, y: s[1] - 206, w: b1.w, h: b1.h }, [s[0] - 30, s[1] - 34], 1, 0.8);
        chip(ctx, 1, s[0] - b1.w - 40, s[1] - 206);
        toast(ctx, 9, t, { open: [150, 390], to: p(G.L.composer.x + 150, G.L.composer.y + 8) });
        toast(ctx, 10, t, { open: [1080, 434], to: p(G.bubble.r - 184, G.bubble.y + 36) });
        tear(ctx, t, f);
      },
    },

    // ------------------------------------------------------------------ 11 thinking · 12 spark · 13 title bar · 14 the window frame
    {
      id: 'err-window', at: CUT_WIN, palette, state: 'off > error', layout: 'the whole window, level and centred; every error docked on the component it reddened; the frame last',
      moment: 'One per beat now: the thinking spark, the spark icon, the title bar, and last the window\'s own outline: the fifteenth error, the largest, stands in the middle of the frame on the beat the outline turns red. Fifteen errors on fifteen components; the client is entirely in error.',
      enter: { type: 'glitch', dur: P / 2, align: 'start' },
      camera: (t) => ({ zoom: camWin(t).zoom }),
      render(ctx, t, f) {
        const G = world(ctx, t, f), p = through(camWin(t)), fold = prog(t, FOLD, CUT_BREATH - 0.04);
        ctx.camera();
        ctx.rect(0, 0, 1920, 1080, { fill: true, color: 'panel', alpha: 0.9 * easeInOut(fold) });          // the client blacks out; its errors are the last thing lit
        ctx.clip({ x: 80, y: 50, w: 1760, h: 940 }, () => glassFault(ctx, t, {
          progress: prog(t, CUT_WIN, FOLD), origin: [960, 530], tint: ERR, strength: 0.6 * (1 - fold),
        }));
        const at = (i) => p(...DOCK[i](G)), fo = (i) => clamp(fold * 2.2 - 0.5 - (14 - i) * 0.045);
        const HOLD = { 12: [96, 26], 4: [560, 26], 3: [1000, 26], 13: [1560, 26], 6: [150, 214], 5: [150, 470], 0: [1140, 300], 2: [740, 506], 11: [660, 590], 10: [1296, 604], 7: [1356, 720], 8: [1612, 170], 9: [500, 992], 1: [1010, 992] };
        for (const i of [6, 5, 4, 3, 2, 0, 10, 7, 8, 9, 1]) { const b = chipBox(ctx, i), [x, y] = HOLD[i], a = 1 - fo(i); if (a > 0.01) { leader(ctx, { x, y, w: b.w, h: b.h }, at(i), 1, 0.8 * a); chip(ctx, i, x, y + 18 * easeIn(fo(i)), { a }); } }
        toast(ctx, 11, t, { open: [470, 600], dock: HOLD[11], park: Bt(314.5), to: at(11), fold: fo(11), sc: 1 });
        toast(ctx, 12, t, { open: [12, 290], dock: HOLD[12], park: Bt(315), to: at(12), fold: fo(12), sc: 1 });
        toast(ctx, 13, t, { open: [1352, 112], dock: HOLD[13], park: Bt(316), to: at(13), fold: fo(13), sc: 1 });
        toast(ctx, 14, t, { open: [960 - 270 * LAST_SC, 540 - 82 * LAST_SC], to: null, fold: fo(14), sc: LAST_SC });      // v4: the fifteenth is the largest of them, in the middle of the frame, on the beat the outline goes red
        tear(ctx, t, f);
        if (fold > 0) { ctx.fx.rgbSplit *= 1 - fold; ctx.fx.glitch = 0; }
      },
    },

    // ------------------------------------------------------------------ a breath: the outline becomes a line; a prompt
    {
      id: 'err-breath', at: CUT_BREATH, palette: 'error', layout: 'near-black: the red outline of the window folding flat into a line through the refused request, top left; then a prompt and a caret above it',
      moment: 'Overloaded, the client blacks out. Its red outline folds flat into one line, and the line is a strikethrough: through the request that was refused. Then a prompt and a caret, and the command is entered again: over to the code underneath.',
      render(ctx, t, f) {
        const age = t - CUT_BREATH, tPrompt = Bt(319), k = easeIn(prog(age, 0.02, 0.2));
        codeGround(ctx, { alpha: prog(t, tPrompt, END) });           // the ground of the code picture comes up under it
        // the request that was refused, set where line 01 of the listing will stand: the loop's condition is the same person, the same word
        const size = 40, cw = ctx.cw(size), x0 = 96 + 4 * cw, y0 = 104 + 92;
        for (const [a, z, role] of SEG) ctx.text(REQ.slice(a, z), x0 + a * cw, y0, { size, font: 'mono', color: role, alpha: 0.4 + 0.5 * prog(age, 0, 0.2) });
        // the window's outline, as the last shot left it, folds flat: it is the line through that request
        const W = chatLayout({ side: 1 }).win, z = camWin(CUT_BREATH).zoom, from = { x: 960 + (W.x - 960) * z, y: 540 + (W.y - 540) * z, w: W.w * z, h: W.h * z };
        const r = lerpRect(from, { x: x0 - 16, y: y0 - size * 0.3 - 3, w: REQ.length * cw + 32, h: 6 }, k);
        ctx.glow('err', 16, () => ctx.rrect(r.x, r.y, r.w, r.h, W.r * z * (1 - k), k < 1 ? { fill: null, stroke: 'err', width: 4 } : { fill: 'err' }), 0.6);
        // beat 319: a prompt and a caret; the command is entered as the code picture takes over
        if (t >= tPrompt) {
          const cmd = text(11), n = Math.floor(prog(t, tPrompt + 0.12, END - 0.05) * cmd.length + 1e-6);
          ctx.text(`> ${cmd.slice(0, n)}`, 96, 104, { size: 30, font: 'mono', color: 'sub' });
          caret(ctx, 96, 104, 2 + n, t, { size: 30, blink: 0 });
        }
      },
    },
  ];
}
