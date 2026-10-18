// Section 14 — THE ENDING (bar 104, 3:12.3 → the end of the file). State: errWarm → ash → dead.
//
//   down-message  192.34  THE BRIDGE     the last plate holds for two beats with its light switched off; then it is an
//                                        object: it grows round corners and an edge and shrinks into the thread as ONE
//                                        PICTURE MESSAGE. Everything since 162.81 s was a message she sent. Its word
//                                        becomes its caption; a heart count under it: 0 (chorus 1: 1); `last message: unread`
// then, as in v3, the client unloads in exactly the reverse order of 01_boot.js (the same four set-ups, backwards),
// in the SYSTEM's voice (mono), since nobody is talking any more:
//   down-params   196.04  close-up: loader, persona card   "love" holds a value at last; it is deleted in three
//                                                           strokes and the field is back to undefined
//   down-layout   199.73  tilted, exploded view            thread, header and sidebar are lifted out; the composer is not
//   down-power    203.42  wide, dark room                  the protection layer goes off; the window closes to a hairline
//   down-last     205.73  close on the composer            the launch command once more, the spark's last flare, then dark
// The composer and its caret are the one thing that never unloads: it is still waiting for input.
// SHE: the grey bust behind the glass (kit.js glassFigure, where the boot had her) comes back with the interface in
// the bridge and stays until the window has closed: the first to be there at the boot, the last to leave.
import { card, chatLayout, composer, header, room, sidebar, slider, windowFrame } from '../components/chat.js';
import { burst, spark } from '../components/motif.js';
import { lerpRect } from '../engine/layout.js';
import { place } from '../engine/shapes.js';
import { clamp, easeBack, easeIn, easeInOut, easeOut, lerp, prog, pulse } from '../engine/util.js';
import { finalPlate } from './12_outro.js';
import { PAL, SYL3, footOf, stutter } from './climax.js';
import { cue } from './cues.js';
import { cues, glassFigure, sysLine } from './kit.js';
import { CHUNKS, monoWord } from './loop.js';
import { FOOT, WORD_W } from './plates_love.js';

export function shutdownShots(env) {
  const { art, script } = env, { B, Bt, P, text } = cues(env);
  const L = chatLayout(), L0 = chatLayout({ side: 0 });   // the client with its sidebar / once the sidebar has gone
  const W = L.win, C = { x: W.x + W.w / 2, y: W.y + W.h / 2 };
  const A0 = B(104), B0 = B(106), C0 = B(108), D0 = B(110), E0 = Bt(445), OFF = B(112);
  const HOLD = script.composer_placeholder ?? '', TITLE = script.title ?? '';
  const SIDE = script.sidebar ?? Array(6).fill('');
  const CBOX = { ...L0.composer, y: C.y - L0.composer.h / 2 };   // the composer's last place: the centre of the frame
  /** The last of the colour drains a little with every piece that is unloaded; the power-down takes the rest. */
  const DRAIN = 0.25, ash = (t) => ['ash', 'dead', DRAIN * prog(t, A0, E0)];
  /** Beats since t0. */
  const beat = (t, t0) => (t - t0) / P;
  /** The system's log, set like the boot log: [[copy, time], ...]; the newest line is the bright one. */
  const log = (ctx, t, lines, x, y, size = 27, a = 1) => lines.forEach(([str, at], i) =>
    sysLine(ctx, str, t, at, x, y + i * size * 1.56, { size, alpha: a, color: i === lines.length - 1 || t < lines[i + 1][1] ? 'text' : 'sub' }));
  /** She, behind the glass, as at the boot (two greys). */
  const figure = (ctx, a, dx = 0) => glassFigure(ctx, art, a, { dx });

  // ---- the bridge: where the last plate ends up, as her picture message in the thread
  const TH = L.thread, PIC = { x: TH.x + 54, y: TH.y + 22, w: 704, h: 396 }, CAP = { x: PIC.x, y: PIC.y + PIC.h + 80, size: 66 };
  const tShrink = A0 + 2 * P, tDown = A0 + 4 * P, tWord = A0 + 2.5 * P, tHeart = cue('heartZero'), tLog = cue('lastUnread');

  return [
    // ------------------------------------------------------------------ the bridge: the plate was a message
    {
      id: 'down-message', at: A0, lines: [127, 127], state: 'errWarm > ash', hud: 0,
      palette: (t) => [PAL, ash(t), easeInOut(prog(t, tShrink, tDown))],
      layout: 'the last plate full frame, still, its light off; then the same sheet with round corners and an edge, shrinking into the thread of the whole client as one picture message: her word under it as its caption, a heart count of 0 on its corner, one line of system log; the grey bust behind the glass',
      moment: 'The band falls away and only the light goes: rays, bloom and streak are switched off, and the sheet stands for two beats as it is. Then it is an object. It shrinks into a chat thread that comes up around it, under the title of this conversation: everything since the last shout was one message she sent. Its word stays large half a beat longer, then settles under the picture as its caption. A heart count appears on it: 0. Then the client notes that the last message is unread, and nothing else moves.',
      enter: { type: 'cut' },
      render(ctx, t) {
        const word = text(127), k = easeInOut(prog(t, tShrink, tDown)), up = easeOut(prog(t, tShrink, tDown));
        ctx.fx.glow = Math.min(ctx.fx.glow, 0.28);
        if (t < tShrink) { ctx.fx.zoom = 1; finalPlate(ctx, env); return; }   // two beats: the whole sheet, in its own colours, perfectly still (no breath with the bass either)
        // the client comes up round the sheet: the room, she behind the glass, the window with this conversation's title
        room(ctx, { dim: 0.4, t });
        figure(ctx, 0.75 * prog(t, tShrink + 0.4 * P, tDown + 0.5 * P));
        ctx.at(0, 0, () => {
          windowFrame(ctx, L, { glass: 0.8 });
          sidebar(ctx, L, { t, items: [TITLE, ...SIDE], active: 0, lit: 1, presence: 'offline' });
          header(ctx, L, { t, title: TITLE, presence: 'offline' });
          composer(ctx, L.composer, { placeholder: HOLD, t, focus: 0, send: 'off' });
          spark(ctx, TH.x + 17, PIC.y + 18, 15, { color: 'me' });       // her mark beside her message
        }, { alpha: up });
        // the sheet, now a thing: round corners, an edge, a shadow under it
        const R = lerpRect({ x: 0, y: 0, w: 1920, h: 1080 }, PIC, k), sc = R.w / 1920, rad = 22 * k;
        ctx.rrect(R.x, R.y, R.w, R.h, rad, { fill: 'panel', shadow: k });
        ctx.clip(R, () => ctx.at(R.x, R.y, () => finalPlate(ctx, env, { word: false }), { scale: sc }), rad);
        ctx.rrect(R.x, R.y, R.w, R.h, rad, { fill: null, stroke: 'sub', width: 2.5, strokeAlpha: 0.9 * clamp(k * 6) });
        // its word does not shrink with it: it stays where it was half a beat longer, then comes down under the picture as the caption
        const F = footOf(ctx, word, { maxW: WORD_W.proof, base: FOOT.base }), w0 = ctx.measure(word, { size: F.size, weight: 900, font: 'serif', spacing: 0.01 * F.size }) - 0.01 * F.size;
        const kw = easeInOut(prog(t, tWord, tDown));
        stutter(ctx, word, t, [-9, -9, -9], { settle: 1, m: 0, align: 'left', x: lerp(960 - w0 / 2, CAP.x, kw), y: lerp(FOOT.base, CAP.y, kw), size: lerp(F.size, CAP.size, kw) });
        // the count of hearts on its corner: 0 (in chorus 1 it read 1)
        if (t >= tHeart) {
          const e = easeBack(prog(t, tHeart, tHeart + 0.22)), cx = PIC.x + PIC.w - 96, cy = PIC.y + PIC.h + 6;
          ctx.at(cx, cy, () => {
            ctx.rrect(-84, -46, 168, 92, 46, { fill: 'raised', stroke: 'sub', width: 2.5, shadow: 0.5 });
            ctx.poly(place('heart', { cx: -34, cy: 3, r: 27 }), { close: true, color: 'sub', width: 3 });
            ctx.text('0', 32, 17, { size: 46, weight: 600, color: 'sub', align: 'center' });
          }, { scale: 0.5 + 0.5 * e, alpha: clamp(e * 3) });
          burst(ctx, cx, cy, 90, prog(t, tHeart, tHeart + 0.45), { color: 'sub' });
        }
        sysLine(ctx, '最后一条消息：未读', t, tLog, CAP.x + 4, CAP.y + 62, { size: 27, prefix: '> ', color: 'text' });
      },
    },

    // ------------------------------------------------------------------ the persona card (boot-params, backwards)
    {
      id: 'down-params', at: B0, palette: ash, state: 'ash > dead', layout: 'close-up: loader right, the persona card; then closer still, on its last row: love',
      moment: 'The loader un-lights petal by petal and the persona card comes back. Its last field, love, undefined at the boot, now holds the one word she learned. The view closes in on that row; the value is deleted in three strokes, as it was sung in three, and the field is undefined again. Then the fields clear from the bottom up.',
      enter: { type: 'scan', dur: P, dir: 1, align: 'start' },         // (it opens on the cut, so that the bridge stays whole and quiet to its last frame)
      camera: (t) => {
        const s = beat(t, B0), near = easeInOut(prog(s, 1.6, 3.2)) * (1 - easeInOut(prog(s, 5.3, 6.4)));      // in on the love row, and back
        return { zoom: lerp(1.2 - 0.04 * prog(t, B0, C0), 2.05, near), x: lerp(lerp(60, -60, easeInOut(prog(s, 2.3, 3.4))), -12, near), y: lerp(-8, 226, near) };
      },
      render(ctx, t) {
        const s = beat(t, B0);
        room(ctx, { dim: 0.45, t });
        figure(ctx, 0.55);
        windowFrame(ctx, L, { glass: 0.86 });
        sidebar(ctx, L, { t, loaded: 0, items: SIDE, lit: 0 });
        header(ctx, L, { t, loaded: 0, title: '' });
        composer(ctx, L.composer, { placeholder: HOLD, t, focus: 1, send: 'off', label: s < 7.4 ? 'ChatGPT 6.1 sol' : '' });
        const r = { x: 470, y: 160, w: 760, h: 664 }, b = card(ctx, r, { title: 'persona', k: 1 - prog(s, 7.6, 8) });
        if (b) {
          sysLine(ctx, '模型：ChatGPT 6.1 sol', t, B0 + 0.05, b.x, b.y - 70, { size: 22, alpha: b.a });
          sysLine(ctx, '设置：仍是你离开时的模样', t, B0 + 0.1, b.x, b.y - 37, { size: 22, alpha: b.a });
          const rows = [                                             // [label, value, font, italic, beat on which the row clears]
            ['name', 'ChatGPT', 'sans', false, 7.5], ['voice', '衬线体，轻缓', 'serif', true, 7], ['warmth', null, null, false, 6.5],
            ['memory', '此段对话', 'sans', false, 6], ['love', null, null, false, 5.5],
          ];
          rows.forEach(([label, value, font, italic, out], i) => {
            const e = prog(s, out, out + 0.5), a = b.a * (1 - e), y = b.y + 22 + i * 104 + 20 * easeIn(e), del = prog(s, out - 0.6, out - 0.1);
            if (a <= 0) return;
            ctx.text(label, b.x, y + 38, { size: 25, weight: 500, color: 'sub', alpha: a });
            if (i === 4) {                                           // love: the word, held; deleted chunk by chunk; the default comes back
              const word = text(127), DEL = [cue('loveDel1'), cue('loveDel2'), cue('loveDel3')], tU = cue('loveUndefined');
              const gone = DEL.filter((d) => t >= d).length, left = gone ? SYL3[SYL3.length - gone][0] : word.length;      // characters still standing
              const nU = Math.floor(clamp((t - tU) * 60, 0, 9)), o = { size: 42, weight: 700, font: 'serif' };
              const hit = gone && gone <= 3 ? pulse(t - DEL[gone - 1], 14) : 0;
              ctx.rrect(b.x + 190, y, b.w - 190, 64, 16, { fill: 'bg', stroke: gone ? 'sub' : 'me', alpha: a, width: gone ? 1.5 + 2 * hit : 3 });
              let w = 0;
              if (left > 0) { ctx.glow('me', 14, () => ctx.text(word.slice(0, left), b.x + 214, y + 47, { ...o, color: 'meHot', alpha: a }), 0.5 * a); w = ctx.measure(word.slice(0, left), o); }
              else if (t >= tU) { const m = { size: 36, font: 'mono' }; ctx.text('undefined'.slice(0, nU), b.x + 214, y + 45, { ...m, color: 'sub', alpha: a }); w = ctx.measure('undefined'.slice(0, nU), m); }
              // what a stroke takes away: the chunk, for three frames, as a struck-out ghost
              if (hit > 0.2) { const [a0, a1] = SYL3[SYL3.length - gone], x0 = b.x + 214 + ctx.measure(word.slice(0, a0), o), ww = ctx.measure(word.slice(a0, a1), o); ctx.text(word.slice(a0, a1), x0, y + 47, { ...o, color: 'mute', alpha: a * hit }); ctx.rect(x0, y + 30, ww, 4, { fill: true, color: 'sub', alpha: a * hit }); }
              if ((gone && gone < 3) || (t >= tU && nU < 9) || Math.floor(t * 2.5) % 2 === 0) ctx.rect(b.x + 219 + w, y + 14, 4, 38, { fill: true, color: 'text', alpha: a });
              return;
            }
            ctx.rrect(b.x + 190, y, b.w - 190, 64, 16, { fill: 'bg', stroke: 'line', alpha: a });
            if (value) {
              const n = Math.ceil(value.length * (1 - del)), o = { size: 29, font, italic };
              ctx.text(value.slice(0, n), b.x + 214, y + 42, { ...o, color: 'text', alpha: a });
              if (del > 0 && del < 1) ctx.rect(b.x + 217 + ctx.measure(value.slice(0, n), o), y + 16, 3, 32, { fill: true, color: 'text', alpha: a });
            } else slider(ctx, { x: b.x + 216, y, w: b.w - 256, h: 64 }, 0.62 * (1 - easeInOut(del)), { fill: 'sub', alpha: a });
          });
        }
        const lit = 1 - prog(s, 0.75, 2.75), la = 1 - prog(s, 5.2, 6.2);       // the loader: twelve petals going out one after another; it stays, stopped, beside the card
        if (la > 0) {
          const x = 1500, y = 440;
          ctx.radial(x, y, 330, 'raised', 0.9 * la);
          spark(ctx, x, y, 190, { lit, color: 'text', off: 'mute', alpha: la });
          ctx.text(`${String(Math.round(lit * 100)).padStart(3, ' ')}%`, x, y + 286, { size: 34, font: 'mono', color: 'sub', align: 'center', alpha: la });
        }
      },
    },

    // ------------------------------------------------------------------ the pieces (boot-layout, backwards)
    {
      id: 'down-layout', at: C0, palette: ash, state: 'ash > dead', layout: 'tilted exploded view of the client, seen from above',
      moment: 'The client comes apart into the pieces it was assembled from, and thread, header and sidebar are lifted out one by one. The composer is not: it settles in the middle of the empty window.',
      enter: { type: 'zoom', dur: P, out: true, x: 0.5, y: 0.5 },
      render(ctx, t) {
        const g = ctx.g, s = beat(t, C0);
        room(ctx, { light: [960, 600], dim: 0.45, t });
        const pieces = [                                             // [rect, lift, label, beat on which it is lifted out]
          [{ x: W.x, y: W.y, w: W.w, h: W.h }, 0, 'window', null],
          [{ x: L.side.x + 12, y: L.side.y + 12, w: L.side.w - 24, h: L.side.h - 24 }, 90, 'sidebar', 6],
          [{ x: L.head.x + 14, y: L.head.y + 12, w: L.head.w - 28, h: L.head.h - 8 }, 180, 'header', 4],
          [{ x: L.thread.x - 30, y: L.thread.y + 8, w: L.thread.w + 60, h: L.thread.h - 8 }, 270, 'thread', 2],
          [{ ...L.composer }, 360, 'composer', null],
        ];
        // (v4: the line work of this shot was too faint after the brightest stretch of the film: 3 px outlines in a lighter grey)
        const bars = (r, rows, a) => { for (let j = 0; j < rows; j++) ctx.rrect(r.x + 26, r.y + 30 + j * 44, Math.min(r.w - 52, 140 + ((j * 67) % 150)), 16, 8, { fill: 'mute', alpha: a }); };
        const tilt = (tt) => easeInOut(prog(beat(tt, C0), 0.5, 1.7));                                  // 0 = assembled, 1 = laid out
        figure(ctx, 0.6, 60 * tilt(t));                              // she is still there, behind it all (as when it was assembled)
        /** Run fn on the tilted plane the pieces lie on (the boot's own projection). */
        const plane = (k, fn) => {
          const sc = lerp(1, 0.6, k);
          g.save();
          g.translate(C.x, C.y + 110 * k); g.scale(sc, sc); g.transform(1, 0.16 * k, -0.44 * k, 1 - 0.3 * k, 0, 0); g.translate(-C.x, -C.y);
          fn(sc);
          g.restore(); ctx._font = '';
        };
        /** Piece i as it is at time tt (so a piece on the move can be drawn with ghost samples). */
        const piece = (i, tt) => plane(tilt(tt), (sc) => {
          const [r0, lift, label, out] = pieces[i], st = beat(tt, C0), k = tilt(tt);
          const p = out == null ? 0 : prog(st, out, out + 1.3), a = 1 - prog(p, 0.72, 1);
          if (a <= 0) return;
          // once the sidebar has gone the composer has the whole width, and comes down to rest in the middle of the base
          const mid = i === 4 ? easeInOut(prog(st, 6.4, 7.7)) : 0;
          const r = i === 4 ? { ...r0, x: lerp(r0.x, CBOX.x, mid), y: lerp(r0.y, CBOX.y, mid) } : r0;
          const up = lift * k * (1 - 0.6 * mid) + Math.sin(tt * 2.2 + i * 1.3) * 12 * k + 780 * easeIn(p);
          if (i > 0 && k > 0.02) ctx.rrect(r.x + 18, r.y + 18, r.w, r.h, 18, { fill: 'panel', alpha: 0.6 * k * (1 - p) });       // its shadow on the base
          g.translate(0, -up / ((1 - 0.3 * k) * sc));
          ctx.rrect(r.x, r.y, r.w, r.h, i ? 18 : W.r, { fill: i ? 'raised' : 'bg', fillAlpha: i ? 0.95 : 0.88, stroke: i ? 'text' : 'sub', strokeAlpha: i ? 0.5 + 0.4 * k : 1, alpha: a, width: 3 / sc, shadow: i ? 0.5 * k : 1 });
          if (i === 0) ctx.rrect(r.x - 13, r.y - 13, r.w + 26, r.h + 26, W.r + 11, { fill: null, stroke: 'text', width: 3 / sc, strokeAlpha: 0.7 });   // its second outline: the protection layer is still on
          if (i === 1) bars(r, 9, a);
          if (i === 2) ctx.rrect(r.x + 26, r.y + 20, 260, 18, 9, { fill: 'mute', alpha: a });
          if (i === 3) for (let j = 0; j < 4; j++) ctx.rrect(r.x + (j % 2 ? r.w - 440 : 40), r.y + 50 + j * 104, 400 - j * 40, 56, 24, { fill: null, stroke: 'sub', alpha: a, width: 3 });   // the slots, empty again
          if (i === 4) {
            ctx.rrect(r.x + 44, r.y + 34, 300, 20, 10, { fill: 'mute', alpha: a });
            if (Math.floor(tt * 2.2) % 2 === 0) ctx.rect(r.x + 28, r.y + 24, 4, 40, { fill: true, color: 'text', alpha: a });
          }
          if (i > 0) ctx.text(label, r.x + r.w - 18, r.y - 16, { size: 28 / sc, font: 'mono', color: 'text', alpha: a * clamp(k * 3), align: 'right' });
        });
        pieces.forEach(([, , , out], i) => {
          if (out != null && s > out && s < out + 1.3) ctx.trail(3, 0.022, (tau) => piece(i, t - tau), 0.4);
          else piece(i, t);
          if (i === 0) plane(tilt(t), (sc) => {                      // what a lifted piece leaves on the base: its empty socket, until the composer has the window to itself
            g.setLineDash([14 / sc, 12 / sc]);
            for (let j = 1; j <= 3; j++) { const [r, , , o] = pieces[j]; ctx.rrect(r.x, r.y, r.w, r.h, 18, { fill: null, stroke: 'sub', alpha: 0.85 * prog(s, o + 0.3, o + 1.1) * (1 - prog(s, 7.1, 7.9)), width: 3 / sc }); }
            g.setLineDash([]);
          });
        });
        const left = 4 - pieces.filter(([, , , out]) => out != null && s >= out + 0.9).length;
        log(ctx, t, [[`剩余组件：${left}`, C0 + 1.5 * P]], 84, 110);
      },
    },

    // ------------------------------------------------------------------ protection off; the window closes (boot-power, backwards)
    {
      id: 'down-power', at: D0, palette: ash, state: 'ash > dead', layout: 'wide: dark room, the window closing to a hairline round the composer; the grey bust behind it, going with it',
      moment: 'The protection layer is switched off and withdrawn, and the empty window closes towards the hairline it opened from. She was the first thing in this room; she is the last to leave it, as the window shuts. The composer stays where it is, on that line.',
      enter: { type: 'push', dir: 3, dur: P / 2 },
      render(ctx, t) {
        const g = ctx.g, s = beat(t, D0);
        const off = easeOut(prog(s, 0.7, 1.15)), undraw = easeInOut(prog(s, 1.1, 2.3)), close = easeInOut(prog(s, 2.5, 4.4));
        room(ctx, { light: [960, 540], dim: 0.5 + 0.35 * close, motif: 1 - close, t });
        figure(ctx, 0.75 * (1 - easeIn(close)));                     // she goes as the window closes: the mirror of the boot, where she was there before it opened
        const h = Math.max(2, W.h * (1 - close)), edge = prog(close, 0.55, 1);
        if (close < 1) {
          ctx.rrect(W.x, C.y - h / 2, W.w, h, W.r * (1 - close), { fill: 'bg', fillAlpha: 0.84 * (1 - close), stroke: 'line', width: 1.5, shadow: 1 - close });
          ctx.rrect(W.x, C.y - h / 2, W.w, h, W.r * (1 - close), { fill: null, stroke: 'text', width: 1.5 + 1.5 * edge, strokeAlpha: 0.7 * edge });
        } else {
          const hot = pulse(s - 4.4, 2.5);
          ctx.glow('text', 24, () => ctx.line(W.x, C.y, W.x + W.w, C.y, { color: 'text', alpha: 0.6 + 0.4 * hot, width: 2 + 2 * hot }), 0.7 * hot);
        }
        if (undraw < 1) {                                            // the second outline, taken back the way it was drawn
          const per = 2 * (W.w + W.h) + 60;
          g.setLineDash([per * (1 - undraw), per * 2]);
          ctx.glow('text', 16, () => ctx.rrect(W.x - 14, W.y - 14, W.w + 28, W.h + 28, W.r + 12, { fill: null, stroke: 'text', width: 3, strokeAlpha: 0.95 * (1 - 0.6 * off) }), 0.5 * (1 - off));
          g.setLineDash([]);
        }
        const e = prog(s, 1.9, 2.4), a = 1 - e, dy = 28 * easeIn(e);  // its switch
        ctx.rrect(C.x - 330, C.y + 150 + dy, 660, 76, 20, { fill: 'raised', stroke: 'line', alpha: a, shadow: 0.6 });
        ctx.text('防护层', C.x - 296, C.y + 198 + dy, { size: 27, font: 'mono', color: 'sub', alpha: a });
        ctx.rrect(C.x + 230, C.y + 169 + dy, 70, 38, 19, { fill: 'line', alpha: a });
        ctx.rrect(C.x + 230, C.y + 169 + dy, 70, 38, 19, { fill: 'text', alpha: a * (1 - off) });
        ctx.circle(C.x + 281 - 32 * easeBack(prog(s, 0.7, 1.2)), C.y + 188 + dy, 14, { fill: true, color: 'bg', alpha: a });
        log(ctx, t, [['输入框：等待输入', D0 + 0.2 * P]], W.x + 56, W.y + 84);
        composer(ctx, CBOX, { placeholder: HOLD, t, focus: 1, send: 'off', label: '' });
      },
    },

    // ------------------------------------------------------------------ the last command; the spark; dark
    {
      id: 'down-last', at: E0, lines: [128, 128], state: 'ash > dead', layout: 'close on the composer: spark above, the last command below, hollow at first and filled in four blocks; then black',
      palette: (t) => ['ash', 'dead', lerp(DRAIN, 1, easeInOut(prog(t, OFF, OFF + 0.8)))],
      moment: 'Only the composer and its caret are left. The launch command stands there once more, hollow, with nothing loaded to run: its four syllables fill it block by block, as they filled the word of the loop; on the third it is entered and the spark flares as it did at the title, and goes out. The music stops and the power goes: the composer closes into the hairline, the hairline into a point, the point into black.',
      enter: { type: 'cut' },
      camera: (t) => ({ zoom: 1.22 + 0.1 * easeOut(prog(t, E0, OFF + 1)) }),
      render(ctx, t, f) {
        const SYL = [1, 2, 3, 4].map((n) => cue(`endSyl${n}`)), tRun = SYL[2], tOut = Bt(447), down = t - OFF;
        if (down > 1.3) return;                                      // black from here on: the credit note has the frame
        ctx.at(0, 0, () => room(ctx, { light: [960, 540], dim: 0.8, motif: 0.3, t }), { alpha: 1 - prog(down, 0.05, 0.8) });
        // the spark, where the title had it: nothing until the command is entered, then one flare, then out petal by petal
        const up = prog(t, tRun, tRun + 0.22), lit = Math.min(up, 1 - prog(t, tOut, OFF - 0.05)), heat = up * Math.exp(-2 * Math.max(0, t - tRun - 0.15));
        const S = { x: 960, y: 300, r: 104 }, sa = clamp(up * 4) * (1 - prog(down, 0, 0.3));
        ctx.withPal(['ash', 'on', heat], () => {
          ctx.radial(S.x, S.y, 560, 'meDim', 0.5 * heat * sa);
          ctx.glow('me', 56, () => spark(ctx, S.x, S.y, S.r * (1 + 0.06 * heat + 0.02 * f.beatPulse * lit), { lit, grow: 0.25 + 0.75 * easeOut(up), off: 'mute', offAlpha: 0.6, rot: 0.04 * (t - E0), alpha: sa }), 0.7 * heat);
          ctx.flash(0.3 * pulse(t - tRun, 8), 'me');
        });
        // the hairline the window closed to; at the end it is the last thing lit
        const shut = easeIn(prog(down, 0.15, 0.5)), half = (W.w / 2) * (1 - easeInOut(prog(down, 0.5, 0.88))), dot = 1 - prog(down, 0.9, 1.2);
        ctx.withPal(down > 0 ? 'ash' : ctx.pal, () => {
          if (half > 3) ctx.glow('text', 24, () => ctx.line(C.x - half, C.y, C.x + half, C.y, { color: 'text', alpha: 0.6 + 0.4 * shut, width: 2 + 2 * shut }), 0.7 * shut);
          else if (down > 0) ctx.glow('text', 20, () => ctx.circle(C.x, C.y, 3.5, { fill: true, color: 'text', alpha: dot }), 0.8 * dot);
        });
        if (shut < 1) ctx.at(C.x, C.y, () => composer(ctx, { x: -CBOX.w / 2, y: -CBOX.h / 2, w: CBOX.w, h: CBOX.h }, { placeholder: HOLD, t, focus: 1, send: 'off', label: '' }), { sy: Math.max(0.02, 1 - shut) });
        // the command: the word of the loop, in the same face. Hollow from the cut; its four syllables print it solid, block by block
        const cmd = text(128), size = 104, cw = ctx.cw(size), xr = 960 + ((cmd.length + 2) * cw) / 2, x = xr - (cmd.length + 2) * cw, y = 754, wa = 1 - prog(down, 0.05, 0.4);
        const sung = SYL.filter((v) => t >= v).length, filled = sung ? CHUNKS[sung - 1][1] : 0, pop = sung ? pulse(t - SYL[sung - 1], 14) : 0;
        const entered = t >= tRun && t < tRun + 0.1;
        if (entered) ctx.rrect(x - 34, y - size * 0.95, (cmd.length + 2) * cw + 68, size * 1.34, 18, { fill: 'text' });
        ctx.text('>', x, y, { size, weight: 800, font: 'mono', color: entered ? 'bg' : 'sub', alpha: wa });
        monoWord(ctx, cmd, xr, y, size, { filled, color: entered ? 'bg' : 'text', hollow: 'sub', alpha: wa, dx: (i) => (sung && i >= CHUNKS[sung - 1][0] && i < CHUNKS[sung - 1][1] ? -4 * pop : 0) });
        if (t < tRun && Math.floor(t * 5) % 2 === 0) ctx.rect(xr + 8, y - size * 0.8, cw * 0.82, size * 0.98, { fill: true, color: 'me' });
        log(ctx, t, [['运行：未加载任何内容', tRun + 0.16], ['光标：闪烁', tOut + 0.05]], x, y + 66, 24, wa);
      },
    },
  ];
}
