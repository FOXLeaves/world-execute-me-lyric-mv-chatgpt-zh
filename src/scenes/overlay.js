// What the film says about itself, outside the conversation:
//   - the photosensitivity warning: (v4) a full page BEFORE the song, at negative song time (prerollShot), and, as in
//     v3, a small system toast during the calm opening seconds
//   - the credit note on black after the power-down
// The toast and the credits live on the overlay layer, above every transition; v3 has no debug HUD (no frame
// counter, BPM, line counter, meters) and neither has v4.
import { room, toast } from '../components/chat.js';
import { clamp, easeOut, prog } from '../engine/util.js';

/** m:ss of a film time (song time + pre-roll), for what viewers are told. */
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
/** The stretch the warning names, in FILM time, as text: computed from config, never typed in. */
export const flashRangeText = (cfg) => { const pre = cfg.safety.preroll ?? 0, [a, b] = cfg.safety.flashRange ?? [148.04, 192.34]; return `${mmss(a + pre)} – ${mmss(b + pre)}`; };

/**
 * The warning page (song time -preroll … 0, silent). The client is not switched on yet, so this is not a piece of
 * chat interface: it is a compiler's warning, mono, in the greys of the `off` state. No orange: the first colour of
 * the film is still the spark at 15.11 s. The page must not flash itself: it fades in over 0.4 s, its lines arrive
 * one by one, the countdown changes one digit a second, and it is gone 0.4 s before the song, leaving exactly
 * the dark room the boot shot opens on.
 */
export function prerollShot(env) {
  const { cfg, lyrics } = env, PRE = cfg.safety.preroll ?? 0;
  if (!(PRE > 0)) return null;
  const T0 = -PRE, LH = 70, X = 300, SIZE = 44;
  const ZH = cfg.safety.warningLine ?? '';
  return {
    id: 'preroll', at: T0, lines: null, palette: 'off', hud: 0,
    layout: 'a compiler warning, mono, left-aligned on the dark room; a three-second countdown under it',
    moment: 'Before the song and before the client is switched on: a compiler-style warning that the film contains flashing images and strong light, with the time range, then a countdown from three. It clears to the dark room the boot begins in.',
    render(ctx, t) {
      room(ctx, { light: [960, 540], dim: 0.85, motif: 0 });          // exactly the first frame of boot-power: no step at 0
      const page = clamp((t - T0) / 0.4) * (1 - prog(t, -0.8, -0.4));
      if (page <= 0.003) return;
      const cw = ctx.cw(SIZE), o = { size: SIZE, font: 'mono' };
      const line = (i) => { const a = easeOut(prog(t, T0 + 0.4 + i * 0.25, T0 + 0.58 + i * 0.25)); return { a: a * page, y: 300 + i * LH + (1 - a) * 10 }; };
      // $ check "<title>"
      let l = line(0);
      ctx.text('$ ', X, l.y, { ...o, color: 'mute', alpha: l.a });
      ctx.text(`check "${lyrics.lines[11].text}"`, X + 2 * cw, l.y, { ...o, color: 'sub', alpha: l.a });
      // Localised warning: compact inverse badge, original song text above unchanged.
      l = line(2);
      ctx.rect(X - 10, l.y - SIZE * 0.86, 2.5 * SIZE + 20, SIZE * 1.16, { fill: true, color: 'text', alpha: l.a });
      ctx.text('警告', X, l.y, { ...o, weight: 800, color: 'panel', alpha: l.a });
      ctx.text('：本片含有强烈闪烁画面', X + 2.5 * SIZE + 10, l.y, { ...o, weight: 700, color: 'text', alpha: l.a });
      // the gutter lines
      l = line(3);
      ctx.text('  -->', X, l.y, { ...o, color: 'mute', alpha: l.a });
      ctx.text(flashRangeText(cfg), X + 6 * cw, l.y, { ...o, weight: 700, color: 'text', alpha: l.a });
      l = line(4);
      ctx.text('   |', X, l.y, { ...o, color: 'mute', alpha: l.a });
      ctx.text('高对比快速剪辑与强光', X + 6 * cw, l.y, { ...o, color: 'sub', alpha: l.a });
      l = line(5);
      ctx.text('   =', X, l.y, { ...o, color: 'mute', alpha: l.a });
      ctx.text('注意：可能影响光敏感观众', X + 6 * cw, l.y, { ...o, color: 'sub', alpha: l.a });
      l = line(6);
      ctx.text('   =', X, l.y, { ...o, color: 'mute', alpha: l.a });
      ctx.text(ZH, X + 6 * cw, l.y - 1, { size: SIZE * 0.95, font: 'scSans', weight: 500, color: 'sub', alpha: l.a });
      // starting in 3 … 2 … 1: only the digit changes
      if (t >= -3) {
        const a = easeOut(prog(t, -3, -2.82)) * page, y = 300 + 8 * LH;
        ctx.text('即将开始', X, y, { ...o, color: 'mute', alpha: a });
        ctx.text(String(clamp(Math.ceil(-t), 1, 3)), X + 7.5 * cw, y, { ...o, weight: 700, color: 'text', alpha: a });
      }
      // a hairline down the gutter ties the block together (drawn once the warning line is there)
      const g = line(2).a;
      ctx.line(X - 34, 300 + 2 * LH - SIZE * 0.86, X - 34, 300 + 6 * LH + SIZE * 0.3, { color: 'line', width: 3, alpha: g });
    },
  };
}

export function overlayScene({ cfg, features }) {
  const T_OFF = features.barTime(112);          // the music stops here
  const NOTE = [
    // literal greys: by now the palette is `dead`, and this note must stay readable
    ['非官方粉丝自制视频，未经 OpenAI 或 Mili 授权、赞助或认可。', '#b8b6ae'],
    ['ChatGPT 为 OpenAI 的商标。音乐：Mili《world.execute(me);》。', '#7d7b73'],
    ['人物基于用户提供的参考形象，由 AI 图像生成辅助改编。', '#7d7b73'],
  ];
  return {
    id: 'overlay', overlay: true, z: 100, start: -1e9, end: 1e9,
    render(ctx, t) {
      const wEnd = cfg.safety.warningSeconds;
      if (t > 0.9 && t < wEnd) {
        toast(ctx, { x: 960 - 300, y: 24, w: 600, h: 58 }, {
          title: 'This video contains flashing images', tone: 'info', icon: '!',
          k: prog(t, 0.9, 1.3), out: easeOut(prog(t, wEnd - 0.5, wEnd)),
        });
      }
      const a = prog(t, T_OFF + 1.6, T_OFF + 2.4) * (1 - prog(t, features.duration - 0.6, features.duration - 0.1));
      if (a > 0) NOTE.forEach(([s, col], i) => ctx.text(s, 960, 502 + i * 46, { size: 26, color: col, alpha: a, align: 'center', weight: i ? 400 : 500 }));
    },
  };
}
