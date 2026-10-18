// Section 2 — TITLE and the first question (bar 8, 0:15.1 → beat 63, 0:29.4). State: off → on.
// The spark lights up: the first orange in the film. Then, over the instrumental, the user arrives.
//   title       centred, dark                 the spark ignites petal by petal; the launch command is typed and entered
//   chat-open   the whole client              a blank conversation; a cream cursor crosses the window: presence turns online
//   chat-type   close on the composer         the user starts one question, deletes it, types the real one
//   chat-think  wide → into the spark         the question is sent; the AI starts thinking; we fall into the spark
import { chatLayout, composer, drawThread, header, room, sidebar, windowFrame } from '../components/chat.js';
import { drawCursor } from '../components/cursor.js';
import { burst, spark } from '../components/motif.js';
import { frameRect } from '../engine/layout.js';
import { clamp, easeIn, easeInOut, easeOut, lerp, prog, pulse } from '../engine/util.js';
import { cues, glassFigure } from './kit.js';
import { enter } from './shot.js';
import { starVolume } from './cinema_space.js';
import { localizeUI } from '../components/ui_zh.js';

/** Where the thinking spark ends up, full frame: verse 1 starts from exactly this burst. */
export const HANDOFF = { cx: 960, cy: 486, r: 300, rot: 0.26 };

export function titleShots(env) {
  const { art, script, features } = env, { T, B, Bt, P, text } = cues(env);
  const L = chatLayout();
  const DROP = B(8), tType = features.snapToBeat(T(11)), tEnter = B(9), END = Bt(63);
  const QUESTION = localizeUI(script.question ?? 'how would you love me');
  const FALSE = '为什么';
  /** The figure behind the glass, lit by the spark: the same bust as at boot, now in two dark oranges. */
  const figure = (ctx, a, color = 'meDim') => glassFigure(ctx, art, a, { color });

  /** What is in the composer at time t: a false start, a pause, backspace, then the real question. */
  function typing(t) {
    const b = (t - B(12)) / P;
    if (b < 1.6) return FALSE.slice(0, Math.floor(clamp(b / 1.5) * FALSE.length + 1e-6));
    if (b < 2.7) return FALSE;
    if (b < 3.4) return FALSE.slice(0, Math.ceil((1 - (b - 2.7) / 0.7) * FALSE.length));
    if (b < 4) return '';
    return QUESTION.slice(0, Math.floor(clamp((b - 4) / 2.8) * QUESTION.length + 1e-6));
  }
  const tSend = B(14);
  const msgs = () => [{ who: 'you', text: QUESTION, at: tSend, status: 'sent' }, { who: 'me', thinking: true, at: tSend + P }];

  return [
    // ------------------------------------------------------------------ the spark lights up
    {
      id: 'title', at: DROP, lines: [11, 11], layout: 'centred: the spark over the launch command', state: 'off > on',
      palette: (t) => ['off', 'on', easeOut(prog(t, DROP, DROP + 0.5))],
      moment: 'The spark lights up — the first colour in the film — and the launch command is typed and entered: the session starts.',
      enter: { type: 'cut', flash: 0.9, flashDecay: 5 },
      render(ctx, t, f) {
        // The title is a film poster coming to life, not a command sitting in a dialog box.
        // Her face is the subject; the knot is the light source. They only share the frame
        // until the conversation window replaces them on the next cut.
        const lit = easeOut(prog(t, DROP, DROP + 2 * P)), C = { x: 528, y: 397 };
        room(ctx, { light: [640, 420], dim: 0.78, t, motif: 0 });
        starVolume(ctx, t - DROP, { focus: [650, 385], spread: [1030, 780], density: 220, alpha: 0.67 * lit, color: 'text', accent: 'me', seed: 7 });
        ctx.radial(C.x, C.y, 680, 'meDim', 0.48 * lit);
        // Print registration circles, one incomplete orbit at a time.
        for (let i = 0; i < 4; i++) {
          const r = 205 + 81 * i, a = lit * (0.2 - 0.035 * i);
          ctx.circle(C.x, C.y, r, { color: i & 1 ? 'me' : 'sub', width: i ? 1.5 : 3, alpha: a });
          const theta = -0.8 + 0.14 * (t - DROP) + i * 1.72;
          ctx.circle(C.x + Math.cos(theta) * r, C.y + Math.sin(theta) * r, 5 + 2 * (i & 1), { fill: true, color: 'text', alpha: lit * (0.6 - i * 0.1) });
        }
        for (let i = 0; i < 12; i++) {
          const a = i * Math.PI / 6 + 0.035 * (t - DROP), r = 230 + (i % 3) * 36;
          const x = C.x + Math.cos(a) * r, y = C.y + Math.sin(a) * r;
          ctx.line(x, y, x + Math.cos(a) * (40 + 12 * f.lowEnv), y + Math.sin(a) * (40 + 12 * f.lowEnv), { color: 'me', width: 2.5, alpha: 0.26 * lit });
        }
        ctx.glow('me', 42, () => spark(ctx, C.x, C.y, 165 * (1 + 0.025 * f.beatPulse), { lit, grow: 0.25 + 0.75 * lit, rot: 0.04 * (t - DROP) }), 0.38 * lit);
        // Oversized, full-bleed portrait. The paper cut silhouette deliberately crosses
        // the frame edge; no avatar circle or UI card contains her.
        art.inks(ctx, 'f_profile', { x: 1010 + 28 * (1 - lit), y: -180, w: 1010, h: 1350 }, {
          alpha: 0.82 * lit, roles: { cream: 'text', orange: 'me', black: 'panel' },
          offset: { orange: [-6 * (1 - lit), 0], black: [5 * (1 - lit), 0] },
        });
        ctx.gradRect(0, 685, 1920, 395, [[0, 'bg', 0], [0.6, 'bg', 0.88], [1, 'bg', 1]]);
        ctx.text('CHATGPT   /   A STUDY IN EXECUTION', 140, 130, { size: 25, font: 'mono', color: 'sub', alpha: lit * 0.9 });
        ctx.line(140, 157, 920, 157, { color: 'me', alpha: 0.8 * lit, width: 3 });
        ctx.text('01', 140, 308, { size: 158, weight: 900, font: 'serif', color: 'meDim', alpha: 0.34 * lit });
        ctx.text('BEGIN', 140, 560, { size: 40, weight: 700, font: 'sans', color: 'sub', alpha: lit * 0.75, spacing: 12 });
        // The command is the main editorial headline, directly on the film surface.
        const cmd = text(11), n = Math.floor(prog(t, tType, tType + 0.72) * cmd.length + 1e-6);
        const size = 89, cw = ctx.cw(size), str = '> ' + cmd.slice(0, n), x = 142, y = 870, a = prog(t, DROP + 0.3, DROP + 0.55);
        const entered = t >= tEnter && t < tEnter + 0.1;
        // The unprinted headline leaves a blind impression in the paper first.
        if (n < cmd.length) ctx.text(`> ${cmd}`, x, y, { size, weight: 800, font: 'mono', color: 'sub', alpha: a * 0.17 * (1 - prog(t, tType, tEnter)) });
        if (entered) ctx.rect(122, 778, (cmd.length + 2) * cw + 42, 125, { fill: true, color: 'text' });
        ctx.text(str, x, y, { size, weight: 800, font: 'mono', color: entered ? 'bg' : 'text', alpha: a });
        ctx.line(140, 913, 1780 * easeOut(prog(t, tType, tEnter)), 913, { color: 'me', width: 4, alpha: lit });
        if (t < tEnter && (n < cmd.length && t >= tType || Math.floor(t * 5) % 2 === 0)) ctx.rect(x + str.length * cw + 8, y - size * 0.8, cw * 0.82, size * 0.98, { fill: true, color: 'me', alpha: a });
        ctx.text('THE WORLD RESPONDS', 144, 974, { size: 23, weight: 500, font: 'mono', color: 'sub', alpha: lit * 0.8, spacing: 4 });
        ctx.flash(0.3 * pulse(t - tEnter, 7), 'me');
      },
    },

    // ------------------------------------------------------------------ a blank conversation; the user arrives
    {
      id: 'chat-open', at: tEnter, layout: 'the whole client, cursor crossing', palette: 'on',
      moment: 'A blank conversation opens. A cream cursor crosses the window — the user is here — and the presence chip turns online for the first time.',
      enter: { type: 'zoom', dur: 2 * P, align: 'start', y: 0.37 },
      camera: (t) => ({ zoom: 1 + 0.05 * easeInOut(prog(t, tEnter, B(12))), y: 14 * prog(t, tEnter, B(12)) }),
      render(ctx, t, f) {
        const tIn = B(10), here = prog(t, tIn, tIn + 0.25), tFocus = B(11) + 2 * P;
        room(ctx, { dim: 0.42, t });
        figure(ctx, 0.75);
        windowFrame(ctx, L, { glass: 0.82 });
        sidebar(ctx, L, { t, items: script.sidebar ?? [], presence: here > 0 ? 'online' : 'offline' });
        header(ctx, L, { t, title: 'New conversation', presence: here > 0 ? 'online' : null });
        if (here > 0 && here < 1) burst(ctx, L.head.x + L.head.w - 128, L.head.y + 34, 40, here, { color: 'text' });
        const cx = L.main.x + L.main.w / 2;
        ctx.radial(cx, 400, 300, 'meDim', 0.4);
        ctx.glow('me', 30, () => spark(ctx, cx, 400, 84 * (1 + 0.04 * f.beatPulse), { rot: 0.08 * (t - B(6)) }), 0.5);
        const box = composer(ctx, { ...L.composer, y: 610 }, { placeholder: script.composer_placeholder ?? '', t, focus: t >= tFocus ? 1 : 0, send: 'idle' });
        drawCursor(ctx, [
          { t: tIn - 0.15, x: 2010, y: 250 }, { t: tIn + 1.5 * P, x: 1470, y: 380 }, { t: B(11), x: 1240, y: 560 },
          { t: tFocus, x: box.caret[0] + 40, y: box.caret[1] + 6, click: true }, { t: B(12), x: box.caret[0] + 300, y: box.caret[1] + 120 },
        ], t, { kind: t > tFocus - 0.3 && t < tFocus + 0.5 ? 'text' : 'arrow' });
      },
    },

    // ------------------------------------------------------------------ the question
    {
      id: 'chat-type', at: B(12), layout: 'close-up on the composer', palette: 'on',
      moment: 'The user starts one question, deletes it, and types the real one: the question the whole film tries to answer.',
      enter: { type: 'push', dir: 2, dur: P / 2 },
      camera: (t) => {
        const c = frameRect({ x: L.composer.x - 70, y: 610 - 190, w: L.composer.w + 140, h: L.composer.h + 300 });
        return { ...c, zoom: c.zoom * (1 + 0.04 * prog(t, B(12), tSend)) };
      },
      render(ctx, t, f) {
        const str = typing(t), del = (t - B(12)) / P > 2.7 && (t - B(12)) / P < 3.4;
        room(ctx, { dim: 0.42, t });
        figure(ctx, 0.75);
        windowFrame(ctx, L, { glass: 0.82 });
        sidebar(ctx, L, { t, items: script.sidebar ?? [], presence: 'online' });
        header(ctx, L, { t, title: 'New conversation', presence: 'online' });
        const cx = L.main.x + L.main.w / 2;
        ctx.glow('me', 30, () => spark(ctx, cx, 400, 84, { rot: 0.08 * (t - B(6)) }), 0.5);
        const ready = str === QUESTION;
        const box = composer(ctx, { ...L.composer, y: 610 }, { text: str, placeholder: script.composer_placeholder ?? '', t: del ? 0 : t, focus: 1, send: ready ? 'ready' : 'idle', size: 34 });
        // each keystroke leaves a short cream tick under the caret, so the typing has weight
        const kb = ((t - B(12)) * 14) % 1;
        if (str.length && !ready && !del) ctx.line(box.caret[0] - 2, box.caret[1] + 22, box.caret[0] + 14, box.caret[1] + 22, { color: 'text', alpha: 0.7 * (1 - kb), width: 3 });
        const tGo = tSend - 1.1 * P;
        drawCursor(ctx, [{ t: B(12), x: box.caret[0] + 300, y: box.caret[1] + 120 }, { t: tGo, x: L.composer.x + 560, y: 610 + 150 }, { t: tSend - 0.04, x: box.send[0] + 3, y: box.send[1] + 4, click: true }], t, { scale: 1.2 });
      },
    },

    // ------------------------------------------------------------------ sent; thinking
    {
      id: 'chat-think', at: tSend, layout: 'wide, then into the thinking spark', palette: 'on', hud: 0,
      moment: 'The question is sent. The AI starts to think — and we fall into the spark, where its answer will take shape.',
      enter: { type: 'cut', flash: 0.35, flashColor: 'text' },
      camera: (t) => { const k = easeIn(prog(t, B(15), END)); return { zoom: 1 + 2.4 * k, x: lerp(0, -540, k), y: lerp(0, -230, k) }; },
      render(ctx, t, f) {
        const k = easeIn(prog(t, B(15), END)), a = 1 - prog(t, B(15) + P, END - 0.25);
        room(ctx, { dim: 0.42, t });
        figure(ctx, 0.75 * a);
        windowFrame(ctx, L, { glass: 0.82, alpha: 0.35 + 0.65 * a });
        sidebar(ctx, L, { t, items: script.sidebar ?? [], presence: 'online' });
        header(ctx, L, { t, title: 'New conversation', presence: 'online' });
        const th = { ...L.thread, h: L.thread.h };
        const items = drawThread(ctx, th, msgs().slice(0, 1), t, { alpha: a });
        composer(ctx, L.composer, { placeholder: script.composer_placeholder ?? '', t, send: 'busy' });
        // the thinking spark leaves its place in the thread and grows to fill the frame (drawn in screen space)
        const from = { x: L.thread.x + 20, y: (items[0]?.y ?? L.thread.y) + (items[0]?.h ?? 80) + 46 }, tOn = tSend + P;
        ctx.camera();
        if (t >= tOn) {
          const e = enter(t, tOn, 0, { dur: 0.3 });
          const x = lerp(from.x, HANDOFF.cx, k), y = lerp(from.y, HANDOFF.cy, k), r = lerp(22, HANDOFF.r, k);
          // the thinking wave calms down as it grows, so the cut lands on a still, even burst (HANDOFF)
          const settle = easeInOut(prog(t, END - 1.5 * P, END - 0.08));
          ctx.radial(x, y, r * 3.2, 'meDim', 0.5 * k);
          ctx.glow('me', 20 + 50 * k, () => spark(ctx, x, y, r * (0.7 + 0.3 * e.k), {
            alpha: e.a, rot: HANDOFF.rot + 0.5 * (t - END) * (1 - settle),
            pulse: (i) => lerp(0.66 + 0.34 * Math.sin(t * 7 - i * 0.62), 1, settle),
          }), 0.5);
          ctx.text('Thinking', x + 34, y + 8, { size: 22, color: 'mute', alpha: e.a * (1 - prog(t, B(15), B(15) + P)) });
        }
      },
    },
  ];
}
