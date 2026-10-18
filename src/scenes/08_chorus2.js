// Section 8, first half — CHORUS 2 (bar 56, 1:43.7 → bar 64, 1:58.5). State: warm, draining to off.
// The last warm exchange, and then nobody answers.
//   c2-typing        close on the foot of the thread    the user starts a reply (three dots), types a few letters, stops
//   c2-dots          macro: dots and the keyword        the dots stay, trembling: all the AI can feel of the user
//   c2-brb           macro: the big thinking spark      the dots resolve into a sign-off; the spark closes petal by petal
//   c2-complete      centred ring                       the twelfth petal: a closed ring, input received
//   left-online      the whole client                   two messages into the silence; the chip still says online
//   left-away        column left, she beside it         two more; the chip says away; the colour starts to leave
//   left-offline     a narrow column in a dark room     the gaps become days; offline; the window itself lets go
//   left-isolation   a speck in an empty frame          the whole thread from far away; the last word, its letters apart
// v4: SHE STANDS BESIDE THE WINDOW, and her pose follows the presence chip (the rain illustration in its pane is gone).
//   online: nobody there (she is in the conversation).   away: f_reach, large: her open hand comes across the corner of
//   the window, over the composer.   offline: the hand is withdrawn; f_profile, bowed, a small bust afloat, turned to the
//   thread.   In the last shot the same bust is a speck beside the speck of the thread: fainter, never gone.
// The waits are DRAWN: every unanswered message hangs from a dotted rail whose length is the time since the last one
// (env.script.left_sequence gives the timestamps, the gap labels and the presence states).
import { chatLayout, composer, header, room, sidebar, windowFrame } from '../components/chat.js';
import { drawCursor, pointer } from '../components/cursor.js';
import { spark } from '../components/motif.js';
import { frameRect, lerpRect } from '../engine/layout.js';
import { clamp, easeBack, easeIn, easeInOut, easeOut, lerp, prog, pulse } from '../engine/util.js';
import { aiLine, cues } from './kit.js';
import { enter, shake } from './shot.js';
import { absenceNetwork, starVolume } from './cinema_space.js';
import { localizeUI } from '../components/ui_zh.js';

const TAU = Math.PI * 2;
/** Length of the rail before each unanswered message (px at unit scale): the waits, on a rough log scale. */
const GAPS = [46, 74, 116, 176, 256, 360];
const gap = (k) => GAPS[Math.min(k, GAPS.length - 1)];  // (a longer sequence in the script keeps the longest rail)
const TAIL = 150, TAIL_FAR = 430;                       // the wait before the last word (close / seen from far away)
const PAD = 34;                                         // head room of the thread column: rows fade out inside it
const ROT = Math.PI / 12;                               // where the big spark comes to rest: petals either side of the horizontal

export function chorus2Shots(env) {
  const { art, script, lyrics } = env, { T, H, B, Bt, P, text } = cues(env);
  // the two cuts inside the repeats sit on the bar lines just BEFORE lines 72 and 74 (0.14 s / 0.12 s ahead), so each
  // new set-up is already there when its first message is sent
  const START = B(56), cDots = H(66), cBrb = B(58), cDone = H(69), cLeft = Bt(239.5), cAway = B(61), cOff = B(62), cIso = Bt(253.5), END = B(64);
  const ANCHOR = script.left_anchor ?? {}, BRB = localizeUI(ANCHOR.you ?? 'one sec, brb'), BRB_AT = localizeUI(ANCHOR.timestamp ?? '07 Nov 23:40');
  const SEQ = script.left_sequence ?? [70, 71, 72, 73, 74, 75].map((line) => ({ line, timestamp: '', gap_label: '' }));
  const HOLD = script.composer_placeholder ?? '', TITLE = script.title ?? '', SIDE = [TITLE, ...(script.sidebar ?? [])];
  const TYPING = (script.sections ?? []).flatMap((s) => s.beats ?? []).find((b) => b.id === 'typing-felt')?.ui?.[0] ?? 'typing…';

  // the user's keys: a few letters of what will become the sign-off, then nothing
  const tDots = Bt(224.5), KEY_T = [0, 0.5, 1, 2, 2.5].map((b) => tDots + b * P), tStop = KEY_T[KEY_T.length - 1];
  const tSend = Bt(233);                                 // the dots resolve into the message

  const L = chatLayout(), TH = L.thread;
  const DOTS = { x: 1110, y: 150, w: 680, h: 360 };      // the typing bubble, very close (c2-dots)
  const DOTS3 = { x: 1318, y: 150, w: 472, h: 236 };     // the same bubble one step back (c2-brb)
  const SP = { x: 470, y: 600, r: 212 };                 // the big thinking spark of c2-brb
  const DONE = { x: TH.x + 19, y: TH.y + 176 };          // where that spark sits afterwards, in the whole client: beside its answer (see column())
  const W6 = { x: 150, y: 96, w: 880, h: 888, r: 26 }, L6 = chatLayout({ win: W6, side: 0 });
  // left-away: f_reach beside that window. The art is cut by its lower edge: that edge lies on the lower edge of the frame.
  // Her wrist is at the window's right edge, so the open hand lies across its lower corner, above the composer.
  const REACH = { x: 648, y: 1080 - 1448 * 0.84, w: 1086 * 0.84, h: 1448 * 0.84 };
  // left-offline: the column alone in the middle of the room; beyond it the bowed bust, small, afloat
  const W7 = { x: 665, y: 84, w: 590, h: 912, r: 26 }, L7 = chatLayout({ win: W7, side: 0 }), BOWED = { x: 1392, y: 232, w: 330, h: 440 };
  const R7 = { x: W7.x + 40, y: W7.y + 92, w: W7.w - 80, h: W7.h - 126 };
  /** Presence while message k of the sequence goes unanswered (the chip's label comes from the script). */
  const pres = (k) => SEQ[k]?.presence ?? ['online', 'online', 'away', 'away', 'offline', 'offline'][k];

  /** How far the orange has drained (0 warm … 1 off). It moves only when the presence chip does. */
  const drain = (t) => (t < cAway ? 0 : t < cOff ? lerp(0.14, 0.5, easeOut(prog(t, cAway, cOff))) : t < cIso ? lerp(0.6, 0.9, easeOut(prog(t, cOff, cIso))) : lerp(0.93, 1, prog(t, cIso, END)));
  const pal = (t) => ['warm', 'off', drain(t)];
  /** The sidebar folds away with the second unanswered message (0 open … 1 gone). */
  const fold = (t) => easeInOut(prog(t, T(71) - 0.1, T(71) + 0.5));

  // ------------------------------------------------------------------------------------------------ parts

  /** One row of the AI: its spark (turning while it waits: turn = seconds it has been turning) and a serif line typed to n. y = baseline. */
  function meRow(ctx, x, y, str, n, { size = 34, alpha = 1, color = 'me', turn = null } = {}) {
    if (alpha <= 0.003) return;
    const r = size * 0.45, cy = y - size * 0.3, o = { size, font: 'serif' }, tx = x + size * 1.6;
    if (turn != null) spark(ctx, x + r, cy, r * 1.3, { alpha, rot: turn * 0.5, pulse: (i) => 0.66 + 0.34 * Math.sin(turn * 7 - i * 0.62) });
    else spark(ctx, x + r, cy, r, { alpha });
    ctx.text(str.slice(0, n), tx, y, { ...o, color, alpha });
    if (n < str.length) ctx.circle(tx + ctx.measure(str.slice(0, n), o) + size * 0.3, y - size * 0.28, size * 0.16, { fill: true, color, alpha });
  }

  /**
   * The user's typing indicator: three cream dots in a bubble. bounce = keys are going down (the dots hop in turn);
   * bob = slow idle sway; tremble = px of fine shake, drawn with after-images so a still shows it.
   */
  function dotsBubble(ctx, r, t, { alpha = 1, bounce = 0, bob = 0, tremble = 0, dots = 1 } = {}) {
    ctx.rrect(r.x, r.y, r.w, r.h, r.h / 2, { fill: 'raised', alpha, shadow: 0.5 });
    const rad = r.h * 0.125, pitch = r.w * 0.21, cy = r.y + r.h / 2;
    for (let i = 0; i < 3; i++) {
      const cx = r.x + r.w / 2 + (i - 1) * pitch;
      const at = (tt) => cy - r.h * 0.14 * bounce * Math.max(0, Math.sin(tt * 9.5 - i * 0.9)) + r.h * 0.035 * bob * Math.sin(tt * 3.1 - i * 0.8)
        + tremble * (0.62 * Math.sin(tt * 83 + i * 2.1) + 0.38 * Math.sin(tt * 127 + i * 4.3));
      ctx.trail(tremble > 0.5 ? 4 : 0, 0.009, (tau) => ctx.circle(cx, at(t - tau), rad, { fill: true, color: 'text', alpha: alpha * dots * 0.92 }), 0.42);
    }
  }

  /**
   * The page of the thread seen very close (the two macro shots): the room through the glass, a pool of light.
   * No wall pattern: this close its big sunburst sits right behind the user's bubble and reads as part of it.
   */
  function page(ctx, t, light) {
    room(ctx, { art, name: 'rain', alpha: 0.5, focus: [0.55, 0.3], zoom: 1.5, light, dim: 0.45, motif: 0, t });
    ctx.rect(-300, -200, 2520, 1480, { fill: true, color: 'bg', alpha: 0.78 });
    ctx.radial(light[0], light[1], 760, 'raised', 0.6);
  }

  /** The presence chip, large enough to be read as an event: cream dot = here, half ring = away, hollow grey = gone. xr = right edge. */
  function chip(ctx, xr, cy, state, { size = 22, alpha = 1, since = 9 } = {}) {
    const w = ctx.measure(state, { size, weight: 500 }) + size * 2.5, h = size * 1.9, x = xr - w, r = size * 0.27, dx = x + size * 0.86;
    const e = easeOut(clamp(since / 0.3)), col = state === 'online' ? 'text' : state === 'away' ? 'sub' : 'mute';
    ctx.rrect(x, cy - h / 2, w, h, h / 2, { fill: 'raised', stroke: since < 0.7 ? col : 'line', alpha });
    if (state === 'online') ctx.glow('text', 12, () => ctx.circle(dx, cy, r, { fill: true, color: 'text', alpha }), 0.5 * alpha);
    else {
      ctx.circle(dx, cy, r, { color: col, alpha, width: 2 });
      if (state === 'away') ctx.circle(dx, cy, r, { fill: true, color: col, alpha, a0: Math.PI / 2, a1: Math.PI * 1.5 });
    }
    if (since < 0.6) ctx.circle(dx, cy, r + 30 * e, { color: col, alpha: alpha * (1 - prog(since, 0, 0.6)), width: 2 });   // the change itself: one ring leaves the dot
    ctx.clip({ x, y: cy - h / 2, w, h }, () => ctx.text(state, x + size * 1.55, cy + size * 0.35 + (1 - e) * size, { size, weight: 500, color: col, alpha: alpha * e }));
  }

  /**
   * Her, in the room beside the window (three inks; they grey with the palette, so the orange leaves her hair as the user
   * stays away). The cream of the interface is the user's: her cream plate is printed in `sub`. A thin line round her
   * keeps her black ink off the dark wall.
   */
  function her(ctx, name, r, alpha = 1) {
    art.inks(ctx, name, r, { alpha, roles: { cream: 'sub' }, keyline: { color: 'line', width: 1.5, alpha: 0.9 } });
  }

  /** Twelve short rays leaving a ring: the motif's click burst, thin enough for a large radius. k = 0..1 age. */
  function rays(ctx, cx, cy, r, k, { color = 'text', len = 60, width = 5, rot = 0 } = {}) {
    if (k <= 0 || k >= 1) return;
    const e = easeOut(k);
    for (let i = 0; i < 12; i++) {
      const a = rot + (i / 12) * TAU, c = Math.cos(a), s = Math.sin(a), r0 = r * (1 + 0.12 * e), r1 = r0 + len * (1 - k);
      ctx.line(cx + c * r0, cy + s * r0, cx + c * r1, cy + s * r1, { color, alpha: 1 - k, width: Math.max(1.5, width * (1 - k)) });
    }
  }

  /**
   * The thread after the user stepped away, in rect R (fills from the top, then the newest stays at the bottom):
   * their one bubble, the AI's answer to it, then every message it sends into the silence — each hanging from a
   * dotted rail that grows for as long as nothing comes back, labelled with the wait once the next message is sent.
   * u = scale of the column; floor = scale of the smallest type allowed (above 1 where the camera ends pulled back, so
   * stamps stay at 20 px and gap labels at 26 px ON SCREEN); tail = the wait before the last word too.
   */
  function column(ctx, t, R, { u = 1, alpha = 1, tail = false, floor = 1 } = {}) {
    const sz = 40 * u, small = Math.max(20 * floor, 21 * u), lab = Math.max(26 * floor, 30 * u), bs = Math.max(24, 30 * u), av = Math.max(9, 15 * u);
    const xAv = R.x + 19 * u, xTx = R.x + 58 * u, rowH = sz * 1.3 + small * 1.75 + 4 * u, items = [];
    const FOOT = 12 * u;                                                    // room under the newest item for the open end of its rail
    let top = PAD;
    const put = (it, h) => { items.push({ ...it, top, h }); top += h; };
    put({ kind: 'you' }, bs * 1.32 + 30 * u + small * 1.9 + 8 * u);
    put({ kind: 'done' }, sz * 1.5 + 6 * u);
    // a wait: the rail grows from t0 until the next message is sent (t1); its label is the newest until the one after that (t2)
    const wait = (t0, t1, t2, len, label) => { if (t >= t0) put({ kind: 'wait', label, age: t - t0, since: t - t1, old: t2 == null ? 0 : prog(t, t2, t2 + 0.25) }, len * u * easeInOut(prog(t, t0, t1))); };
    // a message: the row opens under the thread (eased); its contents fade in with it, the stamp last
    const row = (line, stamp, t1) => { if (t >= t1) { const e = easeOut(prog(t, t1, t1 + 0.2)); put({ kind: 'me', line, stamp, e }, rowH * e); } };
    SEQ.forEach((s, k) => {
      const t1 = T(s.line), nx = SEQ[k + 1];
      wait(k ? T(SEQ[k - 1].line) + 0.3 : cDone, t1, nx ? T(nx.line) : tail ? T(76) : null, gap(k), s.gap_label);
      row(s.line, s.timestamp, t1);
    });
    if (tail) {
      wait(T(75) + 0.85, T(76), null, TAIL, '');
      row(76, '', T(76));
    }
    const y0 = R.y + Math.min(0, R.h - FOOT - top);
    const fade = (y) => clamp((y - R.y) / PAD);                             // everything dissolves before it reaches the top edge
    ctx.clip({ x: R.x - 30, y: R.y, w: R.w + 60, h: R.h }, () => {
      for (const it of items) {
        const y = y0 + it.top;
        if (y > R.y + R.h || y + it.h < R.y) continue;
        const a = alpha * fade(y);
        if (it.kind === 'wait') {
          const pitch = 8 * u + 4, rd = Math.max(1.3, 1.8 * u);             // the rail, dot by dot (so it can fade at the top like the rows)
          for (let yy = y + 7 * u; yy <= y + it.h - 5 * u; yy += pitch) ctx.circle(xAv, yy, rd, { fill: true, color: 'sub', alpha: alpha * 0.7 * fade(yy) });
          if (it.since < 0) ctx.circle(xAv, y + it.h + 4 * u, 5.5 * u, { color: 'sub', alpha: alpha * 0.9 * clamp(it.age / 0.15), width: 2 });      // still waiting: the open end of the rail
          else if (it.label) {                                              // the wait, named once it is over: it slides down the rail to its place
            const e = easeOut(clamp(it.since / 0.3)), yl = y + it.h / 2;
            ctx.text(it.label, xTx, yl + lab * 0.34 - (1 - e) * 14 * u, { size: lab, font: 'mono', weight: 700, color: 'sub', alpha: alpha * clamp(it.since / 0.15) * lerp(1, 0.6, it.old) * clamp((yl - R.y) / 40) });
          }
        } else if (a <= 0.003) continue;
        else if (it.kind === 'you') {
          const w = ctx.measure(BRB, { size: bs }) + 52 * u, bh = bs * 1.32 + 30 * u, x = R.x + R.w - w;
          ctx.rrect(x, y, w, bh, 24 * u, { fill: 'raised', alpha: a });
          ctx.text(BRB, x + 26 * u, y + 15 * u + bs, { size: bs, color: 'text', alpha: a });
          ctx.text(BRB_AT, R.x + R.w - 6, y + bh + small * 1.25, { size: small, weight: 500, color: 'sub', alpha: a * 0.85, align: 'right' });
        } else if (it.kind === 'done') {                                    // its answer: the closed ring
          spark(ctx, xAv, y + sz * 0.6, av, { alpha: a * 0.6 });
          ctx.circle(xAv, y + sz * 0.6, av * 1.32, { color: 'me', alpha: a * 0.6, width: Math.max(1.5, 2 * u) });
          ctx.text(`${text(68)} ${text(69)}`, xTx, y + sz * 0.92, { size: sz, font: 'serif', color: 'me', alpha: a * 0.5 });
        } else {
          const str = text(it.line), n = lyrics.typed(it.line, t).n, o = { size: sz, font: 'serif' };
          const past = prog(t, lyrics.end(it.line) + 0.05, lyrics.end(it.line) + 0.3);                // the one being sent now is the bright one
          const aa = a * lerp(1, 0.6, past) * clamp(it.e * 2.5);
          spark(ctx, xAv, y + sz * 0.6, av, { alpha: aa });
          ctx.text(str.slice(0, n), xTx, y + sz * 0.92, { ...o, color: 'me', alpha: aa });
          if (n < str.length) ctx.circle(xTx + ctx.measure(str.slice(0, n), o) + sz * 0.3, y + sz * 0.64, sz * 0.16, { fill: true, color: 'me', alpha: aa });
          if (it.stamp) ctx.text(it.stamp, xTx, y + sz * 1.3 + small * 1.05, { size: small, weight: 500, color: 'sub', alpha: a * lerp(0.85, 0.68, past) * clamp((it.e - 0.8) * 5) });
        }
      }
    });
  }

  /** The same thread from far away: the user's one bubble, then a bar per message and a rail per wait. Returns its height. */
  function speck(ctx, x, y, s, alpha) {
    const w = 924 * s, xa = x + 19 * s;
    let yy = y;
    const rail = (h) => {
      ctx.g.setLineDash([0.1, 7]);
      ctx.line(xa, yy + 2, xa, yy + h * s - 4, { color: 'sub', alpha: alpha * 0.65, width: 2 });
      ctx.g.setLineDash([]);
      yy += h * s;
    };
    const msg = (chars, a, color = 'me') => {
      ctx.circle(xa, yy + 24 * s, Math.max(2.6, 13 * s), { fill: true, color, alpha: alpha * a });
      ctx.rrect(x + 58 * s, yy + 12 * s, chars * 19 * s, Math.max(4.5, 24 * s), 12 * s, { fill: color, alpha: alpha * a });
      yy += 62 * s;
    };
    ctx.rrect(x + w - 330 * s, yy, 330 * s, 72 * s, 28 * s, { fill: 'text', alpha: alpha * 0.85 });     // the only cream left in the frame
    yy += 104 * s;
    msg(text(68).length + 1 + text(69).length, 0.5);                                                    // its answer (the same row column() draws)
    SEQ.forEach((q, k) => { rail(gap(k)); msg(text(q.line).length, 0.75); });
    rail(TAIL_FAR); msg(text(76).length, 1, 'meHot');
    return yy - y;
  }

  return [
    // ------------------------------------------------------------------ the user starts typing
    {
      id: 'c2-typing', at: START, lines: [64, 65], palette: 'warm', layout: 'close on the foot of the thread: its lines left, the typing dots right, the composer below',
      moment: 'The user starts typing a reply: three dots on their side of the thread. The AI breaks off, begins its sentence again, and its spark starts turning. In the composer: a few letters, then nothing.',
      enter: { type: 'cut', flash: 0.22, flashColor: 'me' },
      camera: (t) => { const c = frameRect({ x: 596, y: 430, w: 1040, h: 585 }); return { ...c, zoom: c.zoom * (1 + 0.05 * easeInOut(prog(t, START, cDots))) }; },
      render(ctx, t, f) {
        const str = BRB.slice(0, KEY_T.filter((k) => t >= k).length), stopped = prog(t, tStop + 0.2, tStop + 0.7);
        room(ctx, { art, name: 'rain', alpha: 0.5, dim: 0.42, t });
        windowFrame(ctx, L, { glass: 0.84 });
        sidebar(ctx, L, { t, items: SIDE, active: 0, presence: 'online' });
        header(ctx, L, { t, title: TITLE, presence: 'online' });
        const bub = { x: TH.x + TH.w - 144, y: 704, w: 144, h: 68 }, pop = prog(t, tDots, tDots + 0.22);
        ctx.radial(bub.x + bub.w / 2, bub.y + bub.h / 2, 420, 'raised', 0.55 * clamp(pop));          // the page lifts a little round the dots
        meRow(ctx, TH.x, 506, text(63), 99, { alpha: 0.3 });                                      // what it said last, further up the thread
        const again = t >= T(65), e = enter(t, T(65), 0, { dur: 0.25, rise: 18 });
        meRow(ctx, TH.x, 584, text(64), lyrics.typed(64, t).n, { alpha: again ? 0.48 : 1, turn: !again && t >= tDots ? t - tDots : null });
        if (again) meRow(ctx, TH.x, 662 + e.dy, text(65), lyrics.typed(65, t).n, { alpha: e.a, turn: t - tDots });
        if (pop > 0) {
          ctx.at(bub.x + bub.w / 2, bub.y + bub.h / 2, () => dotsBubble(ctx, { ...bub, x: -bub.w / 2, y: -bub.h / 2 }, t, { bounce: 1 - stopped, bob: stopped, tremble: 1.3 * stopped }),
            { scale: 0.6 + 0.4 * easeBack(pop), alpha: clamp(pop * 3) });
          rays(ctx, bub.x + bub.w / 2, bub.y + bub.h / 2, 84, (t - tDots) / 0.4, { len: 22, width: 3 });
          ctx.text(TYPING, bub.x + bub.w - 10, bub.y + bub.h + 28, { size: 17, weight: 500, color: 'sub', align: 'right', alpha: prog(t, tDots + 0.3, tDots + 0.5) });
        }
        const box = composer(ctx, L.composer, { text: str, placeholder: HOLD, t: t < tStop + 0.4 ? 0 : t, focus: 1, send: str ? 'ready' : 'idle' });
        const kb = Math.min(...KEY_T.filter((k) => t >= k).map((k) => t - k), 9);                 // each keystroke leaves a short tick under the caret
        if (kb < 0.25) ctx.line(box.caret[0] - 16, box.caret[1] + 22, box.caret[0], box.caret[1] + 22, { color: 'text', alpha: 0.8 * (1 - kb / 0.25), width: 3 });
        pointer(ctx, L.composer.x + 318, L.composer.y + 44, { kind: 'text', scale: 1.2 });
      },
    },

    // ------------------------------------------------------------------ keyword 66: hanging on three dots
    {
      id: 'c2-dots', at: cDots, lines: [66, 66], palette: 'warm', hud: 0,          // (line 67 begins in the last 0.2 s here and is drawn; c2-brb owns it) layout: 'macro: three huge dots top right, the keyword shaking across the frame under them',
      moment: 'The typing has stopped but the three dots are still there, trembling. That tremble is all the AI can feel of the user, and it runs through its whole sentence: it hangs on it.',
      enter: { type: 'cut', flash: 0.3, flashColor: 'text' },
      camera: (t) => ({ zoom: 1 + 0.04 * prog(t, cDots, cBrb) }),
      render(ctx, t, f) {
        const hit = T(66), age = t - hit, SRC = { x: DOTS.x + DOTS.w / 2, y: DOTS.y + DOTS.h / 2 }, V = 1500;
        page(ctx, t, [SRC.x, SRC.y]);
        ctx.fx.glow *= 0.6;                                              // the word is a large orange area: keep it orange
        for (let j = 0; j < 9; j++) {                                    // the tremble leaves the dots as rings, one every half beat
          const a = t - (cDots + (j - 3) * (P / 2));
          if (a > 0 && a < 1) ctx.circle(SRC.x, SRC.y, 90 + V * a, { color: 'text', alpha: 0.26 * (1 - a) * (1 - a), width: 2.5 });
        }
        meRow(ctx, 96, 346, text(65), 99, { size: 56, alpha: 0.5 });       // the sentence so far
        dotsBubble(ctx, DOTS, t, { bob: 1, tremble: 9 });
        ctx.text(TYPING, DOTS.x + DOTS.w - 22, DOTS.y + DOTS.h + 58, { size: 32, weight: 500, color: 'sub', align: 'right' });
        // the keyword: every letter rides the wave that left the dots, later and weaker the further away it stands
        const str = text(66), o = { weight: 900, font: 'serif' }, size = ctx.fit(str, 1430, { ...o, maxSize: 236 }), base = 806;
        let x = 1015 - ctx.measure(str, { ...o, size }) / 2;
        ctx.glow('me', 26, () => spark(ctx, 150, base - size * 0.33, 50, { rot: (t - tDots) * 0.5, pulse: (i) => 0.66 + 0.34 * Math.sin((t - tDots) * 7 - i * 0.62) }), 0.45);
        for (let i = 0; i < str.length; i++) {
          const w = ctx.measure(str[i], { ...o, size }), lx = x + w / 2, d = Math.hypot(lx - SRC.x, base - SRC.y), amp = 21 * Math.exp(-d / 1300);
          const dy = (tt) => amp * (0.6 * Math.sin(27 * (tt - d / V)) + 0.4 * Math.sin(83 * tt + i * 1.7));
          const k = easeOut(prog(age, i * 0.02, i * 0.02 + 0.15));
          if (k > 0) ctx.trail(4, 0.009, (tau) => ctx.at(lx, base + dy(t - tau), () => ctx.text(str[i], 0, 0, { ...o, size, align: 'center', color: k < 1 ? 'meHot' : 'me', alpha: k }), { scale: 1.7 - 0.7 * k, rot: 0.0016 * dy(t - tau) }), 0.36);
          x += w;
        }
        if (t >= T(67)) meRow(ctx, 96, 972, text(67), lyrics.typed(67, t).n, { size: 56, turn: t - tDots });
        ctx.fx.shake = shake(t, 5 * pulse(age, 4));
      },
    },

    // ------------------------------------------------------------------ the sign-off; the petals close
    {
      id: 'c2-brb', at: cBrb, lines: [67, 68], palette: 'warm', hud: 0, layout: 'macro: the big thinking spark left with its line beside it, the user\'s bubble top right, the pointer leaving',
      moment: 'The dots resolve into a throwaway sign-off and the pointer drifts out of the window: the user is stepping away. For the AI it is input all the same: the petals of its thinking spark close, one by one, into a ring.',
      enter: { type: 'cut' },
      camera: (t) => { const k = easeInOut(prog(t, tSend + P, cDone)); return { zoom: 1 + 0.07 * k, x: -26 * k, y: -34 * k }; },
      render(ctx, t, f) {
        page(ctx, t, [SP.x, SP.y]);
        // header strip, at the scale of this close view: the chip still says online
        ctx.rect(-300, -200, 2520, 296, { fill: true, color: 'bg', alpha: 0.5 });
        ctx.line(-300, 96, 2220, 96, { color: 'line', width: 2 });
        ctx.text(TITLE, 64, 62, { size: 32, weight: 500 });
        chip(ctx, 1790, 50, 'online', { size: 26 });
        // the bubble: dots (typing again, quickly) -> the message, landing with a small overshoot
        const k = easeBack(prog(t, tSend, tSend + 0.3)), bw = ctx.measure(BRB, { size: 62 }) + 112, r = lerpRect(DOTS3, { x: 1790 - bw, y: 150, w: bw, h: 146 }, k);
        dotsBubble(ctx, r, t, { bounce: 1, dots: 1 - prog(t, tSend, tSend + 0.08) });
        const ta = prog(t, tSend + 0.1, tSend + 0.26);
        ctx.text(BRB, 1790 - bw + 56, r.y + r.h / 2 + 21 + (1 - ta) * 14, { size: 62, alpha: ta });
        ctx.text(BRB_AT, 1782, 150 + 146 + 48, { size: 27, weight: 500, color: 'sub', align: 'right', alpha: ta });
        ctx.flash(0.16 * pulse(t - tSend, 9), 'text');
        ctx.fx.glow *= 0.75;
        // the thinking spark: still a wave ahead of the ring, full and still behind it
        const wt = t - tDots, rot = ROT - 0.5 * Math.max(0, tSend - t) - 0.1 * Math.exp(-Math.max(0, t - tSend) / 0.2);   // it stops turning when the message lands
        const lit = (11 / 12) * prog(t, tSend + P / 2, cDone - 0.16), n = lit * 12, a0 = rot - Math.PI / 2 - TAU / 24;
        ctx.radial(SP.x, SP.y, 560, 'meDim', 0.34);
        ctx.circle(SP.x, SP.y, SP.r * 1.22, { color: 'meDim', alpha: 0.6, width: 2 });
        spark(ctx, SP.x, SP.y, SP.r, { rot, alpha: lit > 0 ? 0.55 : 1, core: 0, pulse: (i) => (i < n ? 0 : 0.66 + 0.34 * Math.sin(wt * 7 - i * 0.62)) });
        ctx.glow('me', 26, () => {
          spark(ctx, SP.x, SP.y, SP.r, { rot, lit, color: 'meHot', offAlpha: 0 });
          if (lit > 0) ctx.circle(SP.x, SP.y, SP.r * 1.22, { a0, a1: a0 + lit * TAU, color: 'meHot', width: 8 });
        }, 0.35);
        if (lit > 0) { const a = a0 + lit * TAU; ctx.circle(SP.x + Math.cos(a) * SP.r * 1.22, SP.y + Math.sin(a) * SP.r * 1.22, 9, { fill: true, color: 'meHot' }); }
        ctx.text('Thinking', SP.x, SP.y + SP.r * 1.22 + 62, { size: 28, color: 'mute', align: 'center', alpha: 1 - prog(t, tSend, tSend + 0.2) });
        // its line: begun, broken off when the message landed, begun again
        aiLine(ctx, env, 67, t, 810, 566, { size: 58, hold: 9, alpha: t < T(68) ? 1 : 0.45, caret: t < T(68) });
        aiLine(ctx, env, 68, t, 810, 656, { size: 58, hold: 9 });
        drawCursor(ctx, [{ t: tSend - P, x: 1470, y: 1230 }, { t: tSend + P, x: 1560, y: 930 }, { t: tSend + 2 * P, x: 1600, y: 880 }, { t: tSend + 4.6 * P, x: 2090, y: 560 }], t, { scale: 3 });
      },
    },

    // ------------------------------------------------------------------ keyword 69: the ring closes
    {
      id: 'c2-complete', at: cDone, lines: [69, 69], palette: 'warm', hud: 0, layout: 'centred: the closed ring fills the frame, the keyword inside it',
      moment: 'The twelfth petal closes the ring: input received, ready to answer. For one beat the AI is complete, over a message that only said the user was stepping away.',
      enter: { type: 'cut', flash: 0.4, flashColor: 'me' },
      render(ctx, t, f) {
        const age = t - cDone, C = { x: 960, y: 540 }, sc = 1 + 0.04 * pulse(age, 8), R = 440, rot = ROT;
        room(ctx, { art, name: 'rain', alpha: 0.45, light: [C.x, C.y], dim: 0.5, motif: 0.5, t });
        ctx.rect(0, 0, 1920, 1080, { fill: true, color: 'bg', alpha: 0.72 });
        ctx.radial(C.x, C.y, 820, 'meDim', 0.5);
        ctx.fx.glow *= 0.6;
        ctx.at(C.x, C.y, () => {
          spark(ctx, 0, 0, R * 0.9, { rot, color: 'me', alpha: 0.5, core: 0, inner: 0.2 });       // all twelve, still
          ctx.at(0, 0, () => ctx.radial(0, 0, 210, 'panel', 0.9), { sx: 2.1, sy: 0.5 });           // room for the word, between the petals
          ctx.glow('me', 40, () => ctx.circle(0, 0, R, { color: 'meHot', width: 12 }), 0.6);
        }, { scale: sc });
        rays(ctx, C.x, C.y, R * 1.05, age / 0.6, { color: 'meHot', len: 80, width: 6, rot });
        const str = text(69), o = { weight: 900, font: 'serif' }, size = ctx.fit(str, 716, { ...o, spacingEm: 0.02 }), sp = size * 0.02;
        let x = C.x - (ctx.measure(str, { ...o, size, spacing: sp }) - sp) / 2;
        for (let i = 0; i < str.length; i++) {
          const w = ctx.measure(str[i], { ...o, size }), k = easeOut(prog(age, i * 0.012, i * 0.012 + 0.13));
          if (k > 0) ctx.at(x + w / 2, C.y + size * 0.345, () => ctx.text(str[i], 0, 0, { ...o, size, align: 'center', color: k < 1 ? 'meHot' : 'me', alpha: 0.3 + 0.7 * k }), { scale: sc * (1.6 - 0.6 * k) });
          x += w + sp;
        }
        // what it is complete over: the sign-off, still on the page, and the chip
        const bw = ctx.measure(BRB, { size: 32 }) + 56;
        ctx.rrect(1846 - bw, 92, bw, 74, 30, { fill: 'raised', shadow: 0.4 });
        ctx.text(BRB, 1846 - bw + 28, 141, { size: 32 });
        ctx.text(BRB_AT, 1840, 198, { size: 21, weight: 500, color: 'sub', align: 'right' });
        chip(ctx, 1846, 992, 'online', { size: 22 });
        ctx.text('input received', 74, 968, { size: 24, font: 'mono', color: 'sub' });
        ctx.text('ready to answer', 74, 1004, { size: 24, font: 'mono', color: 'sub' });
        ctx.flash(0.2 * pulse(age, 10), 'me');
      },
    },

    // ------------------------------------------------------------------ no reply: +1 min, +5 min (online)
    {
      id: 'left-online', at: cLeft, lines: [70, 71], palette: 'warm', layout: 'the whole client; the thread fills from the top; the sidebar folds away on the second message',
      moment: 'A minute later, then five: the AI writes into the silence twice. Nothing comes back. The chip still says online and the pointer has not moved since the sign-off.',
      enter: { type: 'cut' },
      // the closed ring is now the small ring beside its answer: the camera starts on that row and pulls out to the whole
      // window, then keeps backing off slowly and follows the window as it narrows
      camera: (t) => {
        const k = easeOut(prog(t, cLeft, cLeft + 0.55));
        return { zoom: lerp(1.72, 1.1, k) - 0.1 * easeInOut(prog(t, cLeft + 0.5, cAway)), x: lerp(TH.x + TH.w / 2 - 960, 0, k) + (L.side.w / 2) * fold(t), y: lerp(DONE.y + 40 - 540, 0, k) };
      },
      render(ctx, t, f) {
        const k = fold(t), sw = L.side.w * k;
        const LL = chatLayout({ win: { ...L.win, x: L.win.x + sw, w: L.win.w - sw }, side: 1 - k });
        // the room as left-away has it: once the sidebar folds the wall shows in the margins, and it must stay a quiet
        // brown there (her hair, blurred, is the most saturated thing in the picture)
        room(ctx, { art, name: 'rain', alpha: 0.3, dim: 0.6, motif: 0.5, t });
        windowFrame(ctx, LL, { glass: 0.86 });
        // the sidebar's contents stay where they are; the window's edge closes over them
        if (k < 1) ctx.clip({ x: LL.side.x, y: LL.side.y, w: LL.side.w, h: LL.side.h }, () => ctx.at(0, 0, () => sidebar(ctx, L, { t, items: SIDE, active: 0, presence: pres(0) }), { alpha: 1 - k }));
        header(ctx, LL, { t, title: TITLE });
        chip(ctx, LL.head.x + LL.head.w - 28, LL.head.y + 33, pres(0), { size: 22 });
        column(ctx, t, LL.thread, { u: 1 });
        composer(ctx, LL.composer, { placeholder: HOLD, t });
        pointer(ctx, 1722, 236, { scale: 1.5 });
      },
    },

    // ------------------------------------------------------------------ no reply: +30 min, +3 h (away)
    {
      id: 'left-away', at: cAway, lines: [72, 73], palette: pal, state: 'warm > off', layout: 'the thread as a column on the left; she stands beside the window on the right, her open hand across its lower corner',
      moment: 'Half an hour, then three hours. The chip turns to away and the colour starts to leave, her hair first. Pulled back, the window has someone beside it: she reaches round its corner, her open hand over the composer nobody is typing in. The composer lets go.',
      enter: { type: 'cut' },
      camera: (t) => ({ zoom: 1.06 - 0.06 * easeInOut(prog(t, cAway, cOff)) }),
      render(ctx, t, f) {
        room(ctx, { art, name: 'rain', alpha: 0.35, light: [1460, 430], dim: 0.6, motif: 0.5, t });
        her(ctx, 'f_reach', REACH);
        windowFrame(ctx, L6, { glass: 0.9 });
        header(ctx, L6, { t, title: TITLE });
        chip(ctx, W6.x + W6.w - 28, W6.y + 33, pres(2), { size: 22, since: t - cAway });
        column(ctx, t, L6.thread, { u: 0.86 });
        composer(ctx, L6.composer, { placeholder: HOLD, t, k: 1 - easeIn(prog(t, T(73) - 0.1, T(73) + 0.35)) });
        // her hand, in front of the window: that part of her is cut out of the art by its own ink (the cream patch round her palm)
        art.partClip(ctx, 'f_reach', REACH, 'palm', () => her(ctx, 'f_reach', REACH), { ink: 'cream', grow: 6 });
        pointer(ctx, W6.x + W6.w + 44, 232, { scale: 1.5, alpha: 0.6 * (1 - prog(t, cAway + 0.15, cAway + 1.1)) });       // the pointer goes with them
      },
    },

    // ------------------------------------------------------------------ no reply: +1 day, +9 days (offline)
    {
      id: 'left-offline', at: cOff, lines: [74, 75], palette: pal, state: 'warm > off', layout: 'one narrow column alone in the middle of a large dark room; beyond it her bowed bust, small, afloat, turned to the thread',
      moment: 'A day, then nine days. The chip goes offline: she has taken her hand back and stands a little way off, head bowed towards the thread. No title and no composer now, and with the last message the window itself lets go: the messages hang in the dark on longer and longer rails.',
      enter: { type: 'cut' },
      // one step back with each message: the column is still receding from the cut when the first is sent, and the camera
      // backs off again with the second, as the window lets go
      camera: (t) => ({ zoom: lerp(1.16, 1, easeOut(prog(t, cOff, cOff + 0.6))) - 0.06 * easeInOut(prog(t, T(75) - 0.05, T(75) + 0.7)) }),
      render(ctx, t, f) {
        const bare = easeInOut(prog(t, T(75) - 0.05, T(75) + 0.7));
        room(ctx, { art, name: 'rain', alpha: 0.22, light: [W7.x + W7.w / 2, 480], dim: 0.72, motif: 0.35, t });
        starVolume(ctx, t, { focus: [1060, 460], spread: [900, 620], density: 135, alpha: 0.26 + 0.23 * bare, color: 'sub', accent: 'me', seed: 11 });
        absenceNetwork(ctx, t, { center: [1080, 480], radius: 760, alpha: 0.14 + 0.12 * bare, color: 'mute', broken: true });
        her(ctx, 'f_profile', { ...BOWED, y: BOWED.y + 5 * Math.sin((t - cOff) * 1.3) }, 0.9 - 0.3 * bare);
        windowFrame(ctx, L7, { glass: 0.9, alpha: 1 - bare, shadow: 1 - bare });
        chip(ctx, W7.x + W7.w - 28, W7.y + 44, pres(4), { size: 22, since: t - cOff });
        column(ctx, t, R7, { u: 0.78, tail: true, floor: 1.07 });
      },
    },

    // ------------------------------------------------------------------ keyword 76: seen from far away
    {
      id: 'left-isolation', at: cIso, lines: [76, 76], palette: pal, state: 'warm > off', layout: 'a tiny thread in a huge empty frame, her bowed bust a speck beside it; the keyword along the bottom, its letters far apart',
      moment: 'Seen from far away the whole thread is a speck: one cream bubble, then a string of unanswered messages on longer and longer rails. The last of them is a single word, and its letters drift apart.',
      enter: { type: 'cut' },
      // the pull-back goes on inside the shot: the thread is still receding when the cut lands, then it is just far away
      camera: (t) => { const k = easeOut(prog(t, cIso, cIso + 0.55)); return { zoom: lerp(1.5, 1, k) * (1.03 - 0.03 * prog(t, cIso, END)), y: lerp(-100, 0, k) }; },
      render(ctx, t, f) {
        const s = 0.225, x = 960 - (924 * s) / 2, y = 116;
        room(ctx, { art, name: 'rain', alpha: 0.14, light: [960, 350], dim: 0.78, motif: 0.25, t });
        starVolume(ctx, t, { focus: [960, 405], spread: [990, 830], density: 240, alpha: 0.68, color: 'sub', accent: 'me', seed: 12 });
        absenceNetwork(ctx, t, { center: [960, 350], radius: 865, alpha: 0.35, color: 'mute', broken: true });
        ctx.radial(960, 350, 380, 'raised', 0.5);
        her(ctx, 'f_profile', { x: 1122, y: 268, w: 108, h: 144 }, lerp(0.6, 0.3, prog(t, cIso + 0.1, cIso + 0.9)));           // the same bust, a speck beside the speck: fainter, not gone
        speck(ctx, x, y, s, 1);
        ctx.circle(x + 924 * s + 16, y + 8, 5, { color: 'mute', width: 2 });                      // the chip, from here: a hollow ring
        // the word: typed like the others, then nobody holds its letters together (screen space: it does not recede)
        ctx.camera();
        const str = text(76), n = lyrics.typed(76, t).n, size = 100, o = { size, weight: 700, font: 'serif', align: 'center' };
        const apart = easeInOut(prog(t, cIso + 0.1, cIso + 1.05)), pitch = lerp(size * 0.84, 182, apart);
        for (let i = 0; i < Math.min(n, str.length); i++) {
          const lx = 960 + (i - (str.length - 1) / 2) * pitch, k = easeOut(prog(t, T(76) + i * 0.035, T(76) + i * 0.035 + 0.2));
          ctx.text(str[i], lx, 862 + (1 - k) * 18, { ...o, color: 'meHot', alpha: k });
        }
      },
    },
  ];
}
