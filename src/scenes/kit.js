// Scene kit: the few things almost every v3 shot does, so section files stay about the MOMENT.
//   cues(env)        time helpers (bars, beats, lyric lines)
//   lyricMsgs()      lyric lines as the AI's chat messages (the film's default way to show a lyric)
//   client()         room + window + sidebar + header in one call
//   sysLine()        a line in the system's voice (mono)
//   keywordSys()     a keyword in the system's voice, decoding from scrambled glyphs
//   aiLine()         a lyric line in the AI's voice (serif), typed, at a free position
//   fallbackShot()   a plain, correct shot for any stretch that has no bespoke storyboard yet
//   sungChars()      (v4) a line that appears word by word, at the times its words are sung (cues.js)
import { chatLayout, composer, drawThread, header, room, sidebar, windowFrame } from '../components/chat.js';
import { rand } from '../engine/prng.js';
import { clamp, easeOut, prog, pulse } from '../engine/util.js';

export { cues } from './shared.js';

/**
 * Lyric lines [first..last] as AI messages for drawThread(): typed with the lyric timing,
 * ALL-CAPS keyword lines flagged `hot`. extra(i) may return overrides per line.
 */
export function lyricMsgs({ lyrics }, first, last, t, extra = null) {
  const out = [];
  for (let i = first; i <= last; i++) {
    const ln = lyrics.lines[i];
    out.push({ who: 'me', text: ln.text, at: lyrics.start(i), n: lyrics.typed(i, t).n, hot: ln.emphasis, line: i, ...(extra ? extra(i) : null) });
  }
  return out;
}

/**
 * The client in one call. Options mirror chat.js; pass `false` to leave a part out.
 *   room: { art, name, alpha, ... }   side: { k, loaded, active, lit, items }   head: { title, presence }
 * Returns the layout so the caller can place the thread, composer, cursor.
 */
export function client(ctx, env, t, { layout = {}, roomOpts = {}, frame = {}, side = {}, head = {} } = {}) {
  const L = chatLayout(layout);
  if (roomOpts !== false) room(ctx, { art: env.art, ...roomOpts });
  if (frame !== false) windowFrame(ctx, L, frame);
  if (side !== false) sidebar(ctx, L, { t, items: env.script.sidebar ?? [], ...side });
  if (head !== false) header(ctx, L, { t, title: env.script.title ?? '', ...head });
  return L;
}

/** One line in the SYSTEM's voice: mono, small, typed. `at` = start time, returns chars shown. */
export function sysLine(ctx, str, t, at, x, y, { size = 22, color = 'sub', alpha = 1, cps = 60, prefix = '› ', weight = 400 } = {}) {
  if (t < at) return 0;
  const n = Math.min(str.length, Math.floor((t - at) * cps));
  ctx.text(prefix + str.slice(0, n), x, y, { size, font: 'mono', color, alpha, weight });
  return n;
}

const GLYPHS = 'ABCDEFGHIKLMNOPRSTUVXYZ0123456789#/<>[]';
/**
 * A keyword in the system's voice (mono, caps): each character decodes from noise and the word
 * lands with a small punch. Used while the AI is not speaking yet (boot) and for error codes.
 */
export function keywordSys(ctx, str, t, at, cx, cy, { maxW = 1200, maxSize = 96, color = 'text', dimColor = 'mute', alpha = 1, key = 0, weight = 800, underline = true } = {}) {
  const age = t - at;
  if (age < 0 || alpha <= 0.003) return;
  const chars = [...str], n = chars.length, hasHan = /[\u3400-\u9fff]/u.test(str);
  // The old 0.6em monospace cell worked for ASCII, but a Chinese glyph occupies
  // about a full em: advancing it by 0.72em made the glyphs collide. Fit and
  // advance each translated glyph by its real measured width instead.
  const measured = hasHan ? chars.map((ch) => ctx.measure(ch, { size: 100, weight, font: 'scSans' }) / 100) : null;
  const advanceEm = hasHan ? measured.reduce((sum, width) => sum + width, 0) + Math.max(0, n - 1) * 0.12 : n * 0.72;
  const base = Math.min(maxSize, maxW / Math.max(advanceEm, 0.001)), size = base * (1 + 0.06 * pulse(age, 9));
  const cw = ctx.cw(size), sp = size * 0.12;
  const widths = hasHan ? measured.map((w) => w * size) : chars.map(() => cw);
  const total = widths.reduce((sum, w) => sum + w, 0) + Math.max(0, n - 1) * sp;
  let x = cx - total / 2;
  for (let i = 0; i < n; i++, x += widths[i] + sp) {
    const appear = i * 0.018, settle = appear + 0.11;
    if (age < appear || chars[i] === ' ') continue;
    const ch = age < settle ? GLYPHS[Math.floor(rand(11, key, i, Math.floor(t * 40)) * GLYPHS.length)] : chars[i];
    ctx.text(ch, hasHan ? x + widths[i] / 2 : x, cy, { size, weight, font: hasHan ? 'scSans' : 'mono', align: hasHan ? 'center' : 'left', color: age < settle ? dimColor : color, alpha });
  }
  if (underline) { const w = total * easeOut(prog(age, 0, 0.3)) * 0.5; ctx.line(cx - w, cy + size * 0.3, cx + w, cy + size * 0.3, { color: dimColor, alpha: alpha * 0.9, width: 2 }); }
}

/**
 * A lyric line in the AI's voice (serif), typed with the lyric's own timing, at a free position.
 * align 'left' | 'center' | 'right'. Returns the full width of the line.
 */
export function aiLine(ctx, { lyrics }, i, t, x, y, { size = 44, weight = 400, color = 'me', alpha = 1, align = 'left', italic = false, caret = true, hold = Infinity } = {}) {
  if (t < lyrics.start(i)) return 0;
  const full = lyrics.lines[i].text, n = lyrics.typed(i, t).n, o = { size, weight, font: 'serif', italic };
  const w = ctx.measure(full, o), x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  const a = alpha * (1 - prog(t, lyrics.end(i) + hold, lyrics.end(i) + hold + 0.3));
  ctx.text(full.slice(0, n), x0, y, { ...o, color, alpha: a });
  if (caret && n < full.length) ctx.circle(x0 + ctx.measure(full.slice(0, n), o) + size * 0.3, y - size * 0.28, size * 0.16, { fill: true, color, alpha: a });
  return w;
}

/**
 * Plain but correct shot for a stretch with no bespoke storyboard: the client, with the lyric
 * lines arriving as the AI's messages. Sections replace it shot by shot.
 */
export function fallbackShot(env, { id, at, lines, palette = 'on', presence = 'online', moment = '(not storyboarded yet)' }) {
  return {
    id, at, lines, palette, moment, layout: 'client, thread',
    render(ctx, t) {
      const L = client(ctx, env, t, { side: { active: 0 }, head: { presence } });
      drawThread(ctx, L.thread, lyricMsgs(env, lines[0], lines[1], t), t);
      composer(ctx, L.composer, { placeholder: env.script.composer_placeholder ?? '', t });
    },
  };
}

/**
 * v4: leave a UI shot for a full-frame PLATE on a beat and come back to the same shot, in the state it would have
 * had by then. Nothing is stored between frames, so "the same state" only needs the shot's own clock: every part
 * of the split shot gets the u of the WHOLE shot ({ at, until, since, k } from def.at to `until`), not of its part.
 *
 *   withInserts(def, until, [{ at, until, shot: { id, lines, moment, layout, palette, enter, render, ... }, back }])
 *
 *   def      an ordinary shot definition (its render / camera / palette / hud are reused unchanged)
 *   until    when the shot AFTER def starts (the end of the whole split shot)
 *   inserts  each: at / until on the half-beat grid; shot = the plate's own definition (its `at` is filled in);
 *            back = `enter` of the UI part that follows it (default: a hard cut); lines = lyric lines that part
 *            answers for (default: def.lines)
 * Returns the list of definitions: def's first part (id unchanged), each insert, each further part (id + '-b', '-c' …).
 * A part of no length (an insert that starts on def.at, or ends on `until`) is left out.
 */
export function withInserts(def, until, inserts) {
  const whole = (t) => ({ at: def.at, until, dur: until - def.at, since: t - def.at, k: clamp((t - def.at) / (until - def.at)) });
  const out = [], list = [...inserts].sort((a, b) => a.at - b.at);
  let from = def.at, n = 0, enter = def.enter, lines = def.lines;
  const part = (to) => {
    if (to - from < 1e-6) return;
    out.push({
      ...def, id: n ? `${def.id}-${'bcdefghij'[n - 1]}` : def.id, at: from, enter, lines,
      camera: def.camera ? (t, f) => def.camera(t, f, whole(t)) : undefined,
      palette: typeof def.palette === 'function' ? (t, f) => def.palette(t, f, whole(t)) : def.palette,
      hud: typeof def.hud === 'function' ? (t) => def.hud(t, whole(t)) : def.hud,
      render: (ctx, t, f) => def.render(ctx, t, f, whole(t)),
    });
    n++;
  };
  for (const ins of list) {
    part(ins.at);
    out.push({ ...ins.shot, at: ins.at });
    from = ins.until; enter = ins.back ?? { type: 'cut' }; lines = ins.lines ?? def.lines;
  }
  part(until);
  return out;
}

/**
 * v4: THE FIGURE BEHIND THE GLASS. She is the first thing in the room at boot and the last to leave at shutdown:
 * the faceless front bust (f_bust) as a flat shape in two steps of one colour, standing in the room behind the
 * window's page. Head and shoulders are where v3's standing figure had them; the bust runs off the bottom of the frame.
 *   color   the lighter step: 'mute' while nothing is lit (two greys); 'meDim' once the spark has lit her (two dark oranges)
 *   shade   how much darker the second step is (her black ink: the face, the jabot)
 */
export const GLASS_FIG = { x: 1060, y: -30, w: 960, h: 1280 };
export function glassFigure(ctx, art, alpha, { color = 'mute', dx = 0, dy = 0, shade = 0.55 } = {}) {
  if (!(alpha > 0.003)) return;
  art.inks(ctx, 'f_bust', { x: GLASS_FIG.x + dx, y: GLASS_FIG.y + dy, w: GLASS_FIG.w, h: GLASS_FIG.h }, { alpha, plates: [{ ink: 'all', role: color }, { ink: 'black', role: 'panel', alpha: shade }] });
}

/**
 * v4: ONE tear (ctx.fx.glitch) whose pattern holds for its whole length. The post pass re-rolls the torn rows every
 * 6 frames (0.1 s) of its own frame counter; this switches the tear on for exactly the first such 6-frame bucket
 * that starts at or after `at`, so the picture is torn once, holds, and is whole again: never a flicker of patterns.
 */
export function tearAt(ctx, t, at, amount = 0.5) {
  const u = ((Math.round(t * 60) % 4096) + 4096) % 4096, u0 = ((Math.round(at * 60) % 4096) + 4096) % 4096;
  if (Math.floor(u / 6) === Math.ceil(u0 / 6)) ctx.fx.glitch = Math.max(ctx.fx.glitch, amount);
}

/**
 * v4 TIME EFFECTS. Pure functions of t: nothing is stored between frames, so a frame still depends on t alone.
 *
 *   dropFrames(t, fps, from)   DROPPED FRAMES: the instant a film running at only `fps` frames a second would be
 *                              showing at time t, counted from `from` (give the shot's cut, so that the first frame
 *                              after the cut is a fresh one). Feed it to whatever should move in steps: a push, a fall.
 *                              One-way moves only: something that goes back and forth in steps is a flicker.
 *   replay(t, starts, len)     A STRETCH PLAYED AGAIN FROM ITS START at each of the times in `starts`: returns the
 *                              seconds into the stretch (0..len), or -1 before the first start. A stuck gesture is
 *                              `gesture(replay(t, [a, b, c], 0.2))`: it runs at a, again at b, again at c.
 *   passOf(t, starts)          how many of those starts have passed (0 = none yet)
 */
export const dropFrames = (t, fps, from = 0) => from + Math.floor((t - from) * fps + 1e-6) / fps;
export const passOf = (t, starts) => starts.reduce((n, s) => n + (t >= s ? 1 : 0), 0);
export function replay(t, starts, len = Infinity) {
  let last = -Infinity;
  for (const s of starts) if (t >= s && s > last) last = s;
  return last === -Infinity ? -1 : Math.min(len, t - last);
}

/**
 * v4: A LINE THAT APPEARS WORD BY WORD, as it is sung. The lyrics carry line times only, so the times of single words
 * come from cues.js: marks = { wordIndex: seconds } for the words whose time is known; the first word stands at `at`
 * (unless marked); the words between two known times are spread evenly between them, and words after the last known
 * time follow it at a syllable's pace. Returns how many characters of `str` to show at time t: feed it to whatever
 * draws the line (band() in components/plate.js takes it as `n`, so does a message of the thread).
 */
export function sungChars(str, t, at, marks = {}) {
  const words = str.split(' '), n = words.length, time = new Array(n).fill(null);
  time[0] = at;
  for (const [i, v] of Object.entries(marks)) if (+i >= 0 && +i < n) time[+i] = v;
  for (let i = 1, last = 0; i <= n; i++) {
    if (i < n && time[i] == null) continue;
    for (let j = last + 1; j < i; j++) time[j] = i === n ? time[last] + (j - last) * 0.16 : time[last] + ((time[i] - time[last]) * (j - last)) / (i - last);
    last = i;
  }
  let chars = 0, shown = 0;
  for (let i = 0; i < n; i++) { chars += words[i].length + (i ? 1 : 0); if (t >= time[i]) shown = chars; }
  return shown;
}
/** The index of a word of `str` (punctuation aside): its first occurrence, or with `last` its last. -1 if it is not there. */
export function wordIndex(str, word, last = false) {
  const w = str.split(' ').map((x) => x.replace(/[^\p{L}\p{N}]/gu, ''));
  return last ? w.lastIndexOf(word) : w.indexOf(word);
}

/** 0..1 "is the beat hitting now" helper for secondary motion that should not strobe. */
export const softBeat = (f) => clamp(f.beatPulse * 0.6 + f.barPulse * 0.4);
