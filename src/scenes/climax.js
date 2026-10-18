// THE CLIMAX (v4), 162.81-192.34 s: what the last chorus (12_chorusx.js) and the four LOVE lines (12_outro.js,
// plates_love.js) share. From 162.81 s the film is plates only: no composer, no header, no pointer at work.
//
// Two things escalate, and they never peak in the same frame:
//   CORRUPTION (the first half)  the three ink plates are out of register (a thin red plate shows at one edge), and
//                                on every kick ONE fault: the plates spring apart, the sheet tears, the colours part,
//                                a few blocks of mosaic; six frames, then the sheet is clean again. Never a low
//                                frame rate: every move in this stretch runs at the full rate (fix round)
//   LIGHT (the second half)      a RATCHET: its level is set by a cut, the start of a keyword or a syllable; inside a
//                                shot it only goes up and it comes down on cuts. On top of it (fix round): one flash
//                                that falls back on the strong beat of each chorus keyword, a bloom that breathes
//                                with the bass, and the white-out at 177.57 s. Never more than one falling flash a beat
//
//   PAL          the state of the whole stretch (config.json: the dark ground of `error`, orange and cream of `warm`)
//   expose()     the light of a frame from ONE number, its level
//   figureStage() the three figure shots of the last chorus: the silhouette as a base plate that stands, and the
//                layers that move behind it and on it (world(), sunburst(), livePlates(), inkScreen(), sungLines(),
//                tearSheet(), mosaicBlocks())
//   figure()     her, printed from her three plates m px out of register, the red plate under the orange one
//   caption()    the caption band: one place and one size for the whole stretch; the band itself may tear
//   strip()      the band of black ink across the foot of a plate that a keyword stands on
//   stutter()    THE STUCK WORD: printed in three passes on its three syllables
//   HEART …      the algebraic curve (x² + y² − 1)³ − x²y³ = 0 itself, as points; where a tangent leaves it
import { spark } from '../components/motif.js';
import { band, marks } from '../components/plate.js';
import { asciiBursts, asciiSphere } from '../engine/ascii.js';
import { MESH, drawSegs } from '../engine/geom.js';
import { rand } from '../engine/prng.js';
import { sliced } from '../engine/type.js';
import { clamp, easeInOut, easeOut, lerp, prog, pulse } from '../engine/util.js';
import { LOOP } from './loop.js';
import { OFF } from './plates_chorus.js';

export { OFF };
export const PAL = 'errWarm';
/**
 * The window of paper white the fall of the last chorus ends in (12_chorusx.js): the innermost box, grown to this
 * rectangle by 177.57 s. The lesson (12_outro.js) opens with it still on the sheet and lets it sink.
 */
export const WHITEOUT = { x: 542, y: 226, w: 836, h: 594, r: 37 };
const TAU = Math.PI * 2;

// ---------------------------------------------------------------------------------------------- light
/**
 * The light of a frame, from its LEVEL (below 0 = an under-exposed proof … 10 = the brightest frame of the film).
 * Call it once per frame with a level that never falls inside a shot. at = where the rays come from (virtual px).
 *   up to 2    exposure only                         from 2    whatever is bright blooms (cream, hot orange)
 *   from 3     rays from `at`                        from 5    a horizontal streak through the light
 * breath = 0..1 (the bass, f.lowEnv): the bloom breathes with it.
 * (Fix round: one step stronger throughout than v4 was. The warning page before the song covers it.)
 */
export function expose(ctx, level, { at = [960, 540], glow = null, breath = 0 } = {}) {
  const fx = ctx.fx, L = clamp(level, -5, 10);
  // (the plates are large flat areas of orange, and light ADDED to orange turns it yellow. So the ratchet is first of
  // all exposure; only cream feeds the extra bloom, and rays and streak light the dark ground, not the inks.)
  fx.bright = 0.86 + EXPOSURE_STEP * L;
  fx.glow = (glow ?? 0.22) + 0.16 * breath;
  fx.bloomAll = 0.66 * clamp((L - 2) / 8);
  fx.bloomThreshold = 0.76;
  fx.rays = RAYS_TOP * clamp((L - 3) / 7);
  fx.raysAt = at;
  fx.streak = STREAK_TOP * clamp((L - 5) / 5);
}
/** Exposure per level, and the strength of rays and streak at level 10 (the last frame of 12_outro.js: the brightest picture of the film). */
const EXPOSURE_STEP = 0.041, RAYS_TOP = 1, STREAK_TOP = 0.62;
/**
 * A level that rises in steps and holds. steps = [[time, level], ...] in time order (levels rising); base = the level
 * before the first. A step takes `rise` seconds (six frames): a chunk of letters that slams in settles in that time,
 * and the light must not be at its new height while there is still more ink on the sheet than there will be.
 */
export function ratchet(t, base, steps, rise = 0.1) {
  let l = base;
  for (const [at, v] of steps) if (t >= at && v > l) l = lerp(l, v, prog(t, at, at + rise));
  return l;
}

// ---------------------------------------------------------------------------------------------- corruption
/**
 * Her figure, printed from its three plates m px out of register: the orange and the black plate each lie off the
 * cream one, and a red plate printed under the orange shows as a thin edge. m = 0 is a registered print.
 * roles / the other options are those of art.inks(); proof 1 = the darkened proof: all three plates in dark tones
 * (a dark figure, readable against a field of flat orange); ink = { black, orange, cream } 0 / 1, which plates are printed.
 */
export function figure(ctx, art, name, dst, m = 0, { roles = {}, proof = 0, ink = null, ...o } = {}) {
  const off = OFF(m), dim = proof > 0.5;
  const on = (k) => (dim ? 1 : ink ? ink[k] ?? 1 : 1);
  art.inks(ctx, name, dst, {
    ...o,
    plates: [
      { ink: 'cream', role: dim ? 'mute' : roles.cream ?? 'text', alpha: on('cream') },
      ...(m > 0 && !dim ? [{ ink: 'orange', role: 'err', offset: off.red, alpha: on('orange') }] : []),
      { ink: 'orange', role: dim ? 'line' : roles.orange ?? 'me', offset: off.orange, alpha: on('orange') },
      { ink: 'black', role: roles.black ?? 'panel', offset: off.black, alpha: on('black') },
    ],
  });
}

/** The 0.1 s (six frames at 60) a held tear lasts: true while t is inside the one that starts at `at`. */
export const tornNow = (t, at) => t >= at && t < at + 0.1 - 1e-6;

// ---------------------------------------------------------------------------------------------- the figure stage (fix round)
// The figure shots of the last chorus (12_chorusx.js). The silhouette STANDS: it is a base plate, never pushed in on.
// What moves is what lies behind it and on it, all of it at the full frame rate. A fault is ONE event on a kick.

/** Which of `times` (in order) was the last to pass, and how long ago: { i, since } (i = -1, since = Infinity before the first). */
export function lastOf(t, times) {
  let i = -1;
  for (let k = 0; k < times.length; k++) if (t >= times[k]) i = k;
  return { i, since: i < 0 ? Infinity : t - times[i] };
}
/** Something that springs away on a hit and slides home: 1 two frames after the hit, eased back to 0 by `len` seconds after it. */
export const spring = (s, len = 0.25) => (s < 0 || s >= len ? 0 : s < 0.034 ? s / 0.034 : 1 - easeInOut((s - 0.034) / (len - 0.034)));
/** How long a fault lasts: six frames at 60. Its pattern is fixed by the kick it belongs to, so it holds for all six. */
export const FAULT = 0.1 - 1e-6;

/**
 * THE WORLD, as the earliest version of this film showed it: a sphere set in characters, turning, inside a turning
 * wireframe cage. Here it is what she is shut in: printed a step darker than her orange, and as bright as the music
 * is loud.   W = { cx, cy, r, t, energy 0..1 (loudness), size (glyph px), cage (its size, x r; 0 = no cage),
 *                  dissolve 0..1 (its cells fly apart), alpha, hot (true = in her full orange: the one in her iris) }
 */
export function world(ctx, W) {
  const { cx, cy, r, t, energy = 0.5, size = 20, cage = 1.3, dissolve = 0, alpha = 1, hot = false } = W, P = ctx.pal;
  const roles = hot ? { fg: P.text, mid: P.meHot, dim: P.me } : { fg: P.me, mid: P.meDim, dim: P.meDim.map((v) => v * 0.6) };
  ctx.withPal({ ...P, ...roles }, () => {
    asciiSphere(ctx, { cx, cy, r, size, rotY: 0.6 * t, tilt: 0.38, energy: 0.25 + 0.75 * energy, high: energy, alpha, dissolve, t, seed: 5 });
    if (cage > 0) drawSegs(ctx, MESH.icosa.segs, { cx, cy, scale: r * cage, dist: 4 }, { rot: [0.31 * t, -0.43 * t, 0.12 * t], color: 'mid', alpha: alpha * (0.4 + 0.6 * energy) * (1 - clamp(dissolve * 1.6)), width: Math.max(1.2, r / 130) });
  });
}

/**
 * Behind her: her spark as a sunburst as large as the sheet, printed a step lighter than the paper. It turns without
 * a stop, and its rays are as long as the bass is strong (low = f.lowEnv).
 */
export function sunburst(ctx, x, y, r, t, low, { color = 'meDim', alpha = 0.66 } = {}) {
  spark(ctx, x, y, r, { rot: 0.1 * t, color, alpha, fat: 0.085, inner: 0.2, core: 0.17, pulse: (i) => 0.7 + 0.3 * low * (0.65 + 0.35 * Math.sin(i * 2.4 + t * 1.7)) });
}

/**
 * HER THREE PLATES, ALIVE. They lie m px out of register, as everywhere in this stretch; between kicks each drifts a
 * few px on its own; on every kick they spring apart and slide home (a quarter of a second), and the red plate under
 * the orange one follows late and goes further. Returns where each plate lies now ({ cream, orange, black }: offsets
 * in px), for whatever is printed ON a plate (inkScreen). The other options are those of art.inks().
 */
export function livePlates(ctx, art, name, dst, t, { m = 12, kicks = [], pop = 16, drift = 3, roles = {}, ...o } = {}) {
  const base = OFF(m), s = lastOf(t, kicks).since, way = { cream: [-0.5, -0.4], orange: [1, 0.35], black: [-0.6, 0.85], red: [1.6, 0.9] };
  const lie = (key, i, k) => [base[key][0] + drift * Math.sin(t * (0.9 + 0.23 * i) + 2.1 * i) + way[key][0] * pop * k, base[key][1] + drift * Math.cos(t * (0.7 + 0.19 * i) + 1.3 * i) + way[key][1] * pop * k];
  const k = spring(s), at = { cream: lie('cream', 0, k), orange: lie('orange', 1, k), black: lie('black', 2, k), red: lie('red', 3, spring(s - 0.06, 0.32)) };
  art.inks(ctx, name, dst, {
    ...o,
    plates: [
      { ink: 'cream', role: roles.cream ?? 'text', offset: at.cream },
      { ink: 'orange', role: 'err', offset: at.red },
      { ink: 'orange', role: roles.orange ?? 'me', offset: at.orange },
      { ink: 'black', role: roles.black ?? 'panel', offset: at.black },
    ],
  });
  return at;
}

/** What the loop writes, without end: the listing of loop.js with its line numbers, and after each pass the round it has reached. */
const TRACE = [...LOOP.map((l, i) => ({ str: `${String(i + 1).padStart(2, '0')}  ${l}`, role: i === 6 ? 'meDim' : 'me' })), { str: 'round 12 / 12   replies 0', role: 'meHot' }, { str: '', role: 'me' }];
export const traceRow = (j) => TRACE[((j % TRACE.length) + TRACE.length) % TRACE.length];
/**
 * HER BLACK INK IS A SCREEN. Rows of mono type run up it without a break, cut to the black plate of the figure where
 * it lies now (offset: from livePlates). rect = the part of the sheet the rows are set in; colW = the rows are set
 * again every colW px across it (0 = one column, at rect.x); row(j) = { str, role }; speed in px a second.
 */
export function inkScreen(ctx, art, name, dst, t, { rect, size = 14, lh = 1.36, speed = 52, colW = 0, row = traceRow, offset = [0, 0], crop = null, flip = false, alpha = 1 } = {}) {
  const LH = size * lh, scroll = t * speed, j0 = Math.floor(scroll / LH), n = Math.ceil(rect.h / LH) + 1;
  art.inkClip(ctx, name, { x: dst.x + offset[0], y: dst.y + offset[1], w: dst.w, h: dst.h }, () => ctx.clip(rect, () => {
    for (let c = 0, x = rect.x; x < rect.x + rect.w; x += colW || Infinity, c++) {
      for (let r = 0; r <= n; r++) {
        const q = row(j0 + r + c * 4);
        if (q.str) ctx.text(q.str, x, rect.y + r * LH - (scroll - j0 * LH) + size, { size, font: 'mono', color: q.role, alpha });
      }
    }
  }), { ink: 'black', crop, flip });
}

/**
 * A SUNG LINE AS BIG TYPE in front of the figure (the figure shots have no caption band): her serif, every word on
 * its own strip of black paper, printed when it is sung; the row slides sideways, slowly, for as long as the line
 * lasts, and stands until the next line starts. The lyrics carry line times only: a word is taken to be sung when the
 * line has run as far as its first letter. Lines first..last; keyword lines are never set here.
 *   y = baseline;  size = the largest size (a long line is fitted to maxW);  dir = which way it slides;  slide = px a second
 */
export function sungLines(ctx, env, t, first, last, { y = 960, size = 150, maxW = 1680, dir = -1, slide = 44, cx = 960, weight = 700 } = {}) {
  const { lyrics } = env;
  for (let i = first; i <= last; i++) {
    const at = lyrics.start(i), until = i + 1 < lyrics.lines.length ? lyrics.start(i + 1) : lyrics.end(i);
    if (lyrics.lines[i].emphasis || t < at || t >= until) continue;
    const str = lyrics.lines[i].text, sung = Math.min(lyrics.end(i), until) - at;
    const s = Math.min(size, ctx.fit(str, maxW, { font: 'serif', weight, maxSize: size })), o = { size: s, weight, font: 'serif' };
    const x0 = cx - ctx.measure(str, o) / 2 + dir * slide * (t - (at + until) / 2), pad = s * 0.15;
    let c = 0;
    for (const word of str.split(' ')) {
      const tw = at + (c / str.length) * sung * 0.86, x = x0 + ctx.measure(str.slice(0, c), o), w = ctx.measure(word, o);
      c += word.length + 1;
      if (t < tw) continue;
      ctx.at(x + w / 2, y - s * 0.3, () => {
        ctx.rect(-w / 2 - pad, -s * 0.62, w + 2 * pad, s * 1.2, { fill: true, color: 'panel', alpha: 0.92 });
        ctx.text(word, -w / 2, s * 0.3, { ...o, color: 'me' });
      }, { scale: 1 + 0.1 * (1 - easeOut(prog(t, tw, tw + 0.09))) });
    }
    return;
  }
}

/**
 * A TEAR across the whole sheet, made in the layer itself (not in the post pass, whose tears re-roll on its own
 * six-frame clock and so start late): a few bands of rows moved sideways. The pattern is a function of `seed` alone:
 * give it the kick's own number and it holds for as long as the fault lasts. Call it LAST, over everything drawn.
 */
export function tearSheet(ctx, seed, amount = 1) {
  const g = ctx.g, c = ctx.canvas, W = c.width, H = c.height, n = 3 + Math.floor(rand(71, seed) * 3);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < n; i++) {
    const y = Math.floor(rand(72, seed, i) * H * 0.95), h = Math.ceil(H * (0.018 + 0.037 * rand(73, seed, i)));     // (three to five bands, about a seventh of the sheet in all: more, on every kick, and the flash check counts it)
    const dx = Math.round((0.25 + 0.75 * rand(74, seed, i)) * (rand(75, seed, i) < 0.5 ? -1 : 1) * W * 0.06 * amount);
    g.drawImage(c, 0, y, W, h, dx, y, W, h);
  }
  g.restore();
}
let mosaicScratch = null;
/** A FEW BLOCKS OF MOSAIC, in the layer itself: each rect [x, y, w, h] (virtual px) is reduced to cells of `cell` px. Call it last, as tearSheet(). */
export function mosaicBlocks(ctx, rects, cell = 36) {
  const g = ctx.g, c = ctx.canvas, s = ctx.scale;
  mosaicScratch ??= document.createElement('canvas');
  if (mosaicScratch.width < 64) { mosaicScratch.width = 64; mosaicScratch.height = 64; }
  const sg = mosaicScratch.getContext('2d');
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  for (const [x, y, w, h] of rects) {
    const nx = clamp(Math.round(w / cell), 1, 64), ny = clamp(Math.round(h / cell), 1, 64), R = [x, y, w, h].map((v) => Math.round(v * s));
    sg.globalCompositeOperation = 'copy'; sg.imageSmoothingEnabled = true;
    sg.drawImage(c, R[0], R[1], R[2], R[3], 0, 0, nx, ny);
    g.imageSmoothingEnabled = false;
    g.drawImage(mosaicScratch, 0, 0, nx, ny, R[0], R[1], R[2], R[3]);
  }
  g.restore();
}
/**
 * A PUSH: the layer smeared along the lines through (x, y) (virtual px), by `amount` of the distance to that point.
 * Made in the layer itself, so that what is drawn after it (a lyric band) stays sharp; the post pass's fx.zoomBlur
 * smears the whole frame.
 */
export function pushBlur(ctx, x, y, amount, n = 6) {
  if (!(amount > 0.004)) return;
  const g = ctx.g, c = ctx.canvas, X = x * ctx.scale, Y = y * ctx.scale;
  g.save();
  for (let j = 1; j <= n; j++) {
    const z = 1 + (amount * j) / n;
    g.setTransform(z, 0, 0, z, X * (1 - z), Y * (1 - z));
    g.globalAlpha = 1 / (j + 1);
    g.drawImage(c, 0, 0);
  }
  g.restore();
}
/**
 * THE WHITE-OUT at 177.57 s (a transition, not a picture): w = 0..1 takes the finish off the frame (vignette, scan
 * lines, rays) and opens the exposure, so that a sheet of paper white is white into the corners. Call it after expose().
 */
export function whiteOut(ctx, w) {
  if (!(w > 0)) return;
  const fx = ctx.fx, k = clamp(w);
  fx.vignette *= 1 - k; fx.scan *= 1 - k; fx.rays *= 1 - k; fx.streak *= 1 - k;
  fx.bright = lerp(fx.bright, 1.3, k);
}
/** The fault of kick number `n` (seed: one per shot): for six frames the sheet is torn, a few blocks are mosaic, and the colours lie up to 8 px apart. */
export function fault(ctx, since, n, seed = 0) {
  if (!(since >= 0 && since < FAULT)) return;
  const key = seed * 97 + n, q = (j, lo, hi) => lerp(lo, hi, rand(76, key, j));
  mosaicBlocks(ctx, [0, 1, 2].map((j) => [q(j * 4, 60, 1500), q(j * 4 + 1, 60, 860), q(j * 4 + 2, 150, 360), q(j * 4 + 3, 70, 150)]));
  tearSheet(ctx, key, 1);
  ctx.fx.rgbSplit = Math.max(ctx.fx.rgbSplit, 8 * (1 - since / 0.1));
}

/**
 * DISTORTION, in the layer itself: the sheet in thin bands, each moved sideways by a wave (amp px). Call it last.
 */
export function waveSheet(ctx, seed, amp = 14) {
  const g = ctx.g, c = ctx.canvas, W = c.width, H = c.height, n = 54, h = Math.ceil(H / n), a = amp * ctx.scale, ph = rand(77, seed) * 6.28, f = 0.35 + 0.5 * rand(78, seed);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < n; i++) {
    const dx = Math.round(a * Math.sin(i * f + ph) * (0.4 + 0.6 * rand(79, seed, i >> 2)));
    if (dx) g.drawImage(c, 0, i * h, W, h, dx, i * h, W, h);
  }
  g.restore();
}
/** INTERFERENCE: thin lines of noise across the whole sheet, a few in the error's red, and two darker bars. Call it last. */
export function interference(ctx, seed) {
  const n = 10 + Math.floor(rand(85, seed) * 8);
  for (let i = 0; i < n; i++) ctx.rect(0, rand(86, seed, i) * 1080, 1920, 1 + Math.floor(rand(87, seed, i) * (i % 4 ? 3 : 9)), { fill: true, color: rand(88, seed, i) < 0.55 ? 'err' : 'text', alpha: 0.35 + 0.45 * rand(89, seed, i) });
  for (let i = 0; i < 2; i++) ctx.rect(0, rand(90, seed, i) * 1040, 1920, 14 + 18 * rand(91, seed, i), { fill: true, color: 'bg', alpha: 0.5 });
}
/**
 * THE FAULT OF A SUNG SYLLABLE (the stuck word of the LOVE lines, 12_outro.js): for the six frames after the syllable
 * the sheet is distorted (waveSheet), torn and in blocks with its colours apart (fault), and crossed by interference.
 * since = seconds since the syllable; key = its own number (the pattern holds for the six frames).
 */
export function wordFault(ctx, since, key) {
  if (!(since >= 0 && since < FAULT)) return;
  waveSheet(ctx, key, 16 * (1 - since / 0.14));
  fault(ctx, since, key, 7);
  interference(ctx, key);
}

/**
 * THE FIGURE SHOTS OF THE LAST CHORUS: one stack of layers for all three (12_chorusx.js gives each its own base plate
 * and its own things through S).
 *   1  paper (S.pool = [x, y, r]: a flat pool of light on it); behind her the sunburst,   S.sun = [x, y, r]
 *      turning, its rays breathing with the bass
 *   2  the world she is shut in: the sphere of characters in its cage                     S.world = { cx, cy, r, ... }
 *      S.behind(ctx) = more behind her
 *   3  her three plates, alive (livePlates)                                               S.fig = { name, dst, crop, flip, m, pop }
 *   4  her black ink as a screen (inkScreen)                                              S.screens = [{ rect, size, colW, ... }]
 *      S.on(ctx, lie) = whatever else is printed on her (lie = where her plates lie now)
 *   5  in front: bursts of characters on strong onsets; the sung line as big type         S.bursts = { cx, cy, r0 }; S.lines = [first, last], S.type
 *      S.over(ctx) = more in front
 *   6  once per kick, for six frames: the fault (tear, mosaic, colours apart)             S.kicks = [times], S.seed
 *   7  the camera: a slow drift (well under 3 %), a light push on the kick
 */
export function figureStage(ctx, env, t, f, S) {
  const { art, features } = env, { fig, kicks = [] } = S, K = lastOf(t, kicks);
  ctx.rect(-10, -10, 1940, 1100, { fill: true, color: 'raised' });       // paper under her: her black ink is almost the ground
  if (S.pool) for (const k of [1, 0.62]) ctx.circle(S.pool[0], S.pool[1], S.pool[2] * k, { fill: true, color: 'line', alpha: 0.42 });      // two flat steps: a print, not a glow
  if (S.sun) sunburst(ctx, S.sun[0], S.sun[1], S.sun[2], t, f.lowEnv);
  if (S.world) world(ctx, { ...S.world, t, energy: f.rmsEnv });
  S.behind?.(ctx);
  const lie = livePlates(ctx, art, fig.name, fig.dst, t, { m: fig.m, kicks, pop: fig.pop, crop: fig.crop, flip: fig.flip });
  for (const sc of S.screens ?? []) inkScreen(ctx, art, fig.name, fig.dst, t, { ...sc, offset: lie.black, crop: fig.crop, flip: fig.flip });
  S.on?.(ctx, lie);
  marks(ctx, { color: 'mute' });
  if (S.bursts) ctx.withPal({ ...ctx.pal, fg: ctx.pal.text, mid: ctx.pal.meHot }, () => asciiBursts(ctx, features, t, { size: 24, minS: 0.3, life: 0.6, count: 34, ...S.bursts }));
  if (S.lines) sungLines(ctx, env, t, S.lines[0], S.lines[1], S.type);
  S.over?.(ctx);
  fault(ctx, K.since, K.i, S.seed ?? 0);
  ctx.fx.zoom = 1.016 + 0.005 * Math.sin(t * 0.8) + 0.007 * pulse(K.since, 9);
  ctx.fx.shake = [9 * Math.sin(t * 0.53 + 1), 5 * Math.cos(t * 0.41)];
}

// ---------------------------------------------------------------------------------------------- lyric bands
/** The caption band of the stretch: top left, her serif, one size (docs/v4/PLAN.md §3.7). */
export const CAP = { x: 96, y: 104, size: 56 };
/**
 * The line being sung, on the caption band: lyric lines first..last, each from the moment it is sung until the next
 * line starts (keyword lines are never set here: they are big type in the picture). tears = times at which the band
 * is torn: its strip is cut into slices that sit out of line for six frames, then it is whole again.
 */
export function caption(ctx, env, t, first, last, { tears = [], x = CAP.x, y = CAP.y, size = CAP.size, maxW = 1700 } = {}) {
  const { lyrics } = env;
  for (let i = first; i <= last; i++) {
    const at = lyrics.start(i), until = i + 1 < lyrics.lines.length ? lyrics.start(i + 1) : lyrics.end(i);
    if (lyrics.lines[i].emphasis || t < at || t >= until) continue;
    const draw = () => band(ctx, [{ text: lyrics.lines[i].text, at, until, n: lyrics.typed(i, t).n }], t, { x, y, size, maxW });
    const tear = tears.find((a) => tornNow(t, a));
    if (tear == null) draw();
    else sliced(ctx, { x: 0, y: y - size * 1.06, w: 1920, h: size * 1.5 }, 5, (k) => (rand(31, i, k, Math.round(tear * 60)) - 0.5) * 110, draw);
    return;
  }
}

/** The band of black ink a keyword stands on, across the foot of the plate (the cut lower edge of a figure lies behind it). */
export function strip(ctx, y, { alpha = 1, rule = 'line' } = {}) {
  if (!(alpha > 0.003)) return;
  ctx.rect(-400, y, 2720, 1480 - y, { fill: true, color: 'panel', alpha });
  if (rule) ctx.rect(-400, y, 2720, 3, { fill: true, color: rule, alpha });
}

let capEm = 0;
/** Cap height of the keyword face (serif 900) in em, measured once. */
export function capHeight(ctx) {
  if (!capEm) { ctx.font(100, 900, 'serif'); capEm = ctx.g.measureText('E').actualBoundingBoxAscent / 100; }
  return capEm;
}
/**
 * Where a keyword stands at the foot of a plate: fitted to maxW on the baseline `base`; the band of black ink under it
 * starts `pad` px above its capitals. Returns { size, y (top of the band), base }.
 */
export function footOf(ctx, str, { maxW = 1800, maxSize = 440, base = 1050, pad = 36 } = {}) {
  const size = ctx.fit(str, maxW, { font: 'serif', weight: 900, spacingEm: 0.01, maxSize });
  return { size, base, y: Math.round(base - capHeight(ctx) * size - pad) };
}

/** The three sung syllables of “爱—爱—爱”. */
export const SYL3 = [[0, 1], [1, 3], [3, 5]];
/**
 * THE STUCK WORD. It is printed in three passes, on the three syllables it is sung in (at = [t1, t2, t3]). A pass
 * changes two things only: one more chunk of letters slams in, and every chunk that was there already is pressed
 * again where it stands, leaving the outline of its last impression beside it. After the third pass the word is solid,
 * but it trails those outlines and a thin edge of the other ink: out of register by m px.
 * THE WORD IS RED (fix round, the user's call): it is the loop's own error, printed in the error's ink (`color`), and
 * her orange is the thin plate that shows beside it (`edge`). Settled, it is her orange (`calm`).
 *   settle 0..1   brings every impression into register: the outlines close up and the red goes (the last word only)
 *   x, y, align   where it is set (y = baseline);  size, or maxW / maxSize to fit
 * Returns { x, y, w, size, pass } (x = left edge; pass = impressions made so far).
 */
export function stutter(ctx, str, t, at, { x = 960, y = 1040, size = null, maxW = 1800, maxSize = 440, align = 'center', chunks = SYL3, m = 12, settle = 0, color = 'err', edge = 'me', calm = 'me', shade = 'bg', spacingEm = 0.01, alpha = 1 } = {}) {
  const f = { size: size ?? ctx.fit(str, maxW, { font: 'serif', weight: 900, spacingEm, maxSize }), weight: 900, font: 'serif' }, s = f.size, sp = spacingEm * s;
  const w = ctx.measure(str, { ...f, spacing: sp }) - sp, x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  const pass = at.filter((a) => t >= a).length, out = { x: x0, y, w, size: s, pass };
  if (!pass || !(alpha > 0.003)) return out;
  const loose = 1 - clamp(settle), last = at[pass - 1];
  const mid = (i) => x0 + ctx.measure(str.slice(0, i + 1), f) + i * sp - ctx.measure(str[i], f) / 2;
  const press = 1.05 - 0.05 * easeOut(prog(t, last, last + 0.05));                 // every pass presses the whole word: three frames from 105 %
  /** fn(char, x of its middle, how many times its chunk has been printed, is it the chunk that has just arrived) */
  const each = (fn) => chunks.forEach(([a, z], ci) => { for (let i = a; i < z && pass > ci; i++) fn(str[i], mid(i), pass - ci, ci === pass - 1); });
  const put = (ch, px, py, sc, o) => ctx.at(px, py, () => ctx.text(ch, 0, 0, { ...f, align: 'center', ...o }), { scale: sc });
  // where each earlier impression stood: an outline, further off and fainter the older it is
  each((ch, px, n) => { for (let age = 1; age < n; age++) put(ch, px - m * 0.95 * age * loose, y - m * 0.6 * age * loose, 1, { color, stroke: Math.max(2, s * 0.009), alpha: (alpha * 0.55 * loose) / age }); });
  // the shadow plate, the thin plate of the other ink, the impression itself (in the settled ink under the red one, as far as it has settled)
  const slam = (isNew) => (isNew ? 1 + 0.17 * (1 - easeOut(prog(t, last, last + 0.09))) : press);   // (a larger overshoot would be more ink than the settled word: a fall in brightness)
  each((ch, px, n, isNew) => put(ch, px + s * 0.03, y + s * 0.03, slam(isNew), { color: shade, alpha }));
  if (m > 0 && loose > 0) each((ch, px, n, isNew) => put(ch, px + m * 0.75 * loose, y + m * 0.42 * loose, slam(isNew), { color: edge, alpha }));
  if (loose < 1) each((ch, px, n, isNew) => put(ch, px, y, slam(isNew), { color: calm, alpha }));
  if (loose > 0) each((ch, px, n, isNew) => put(ch, px, y, slam(isNew), { color, alpha: alpha * loose }));
  return out;
}

// ---------------------------------------------------------------------------------------------- the curve
/**
 * The curve (x² + y² − 1)³ − x²y³ = 0 itself, not a look-alike: n points evenly spaced along the outline, starting in
 * the notch at the top and running clockwise on screen, in the curve's own units (y up). Along every ray from the
 * origin the left-hand side changes sign exactly once, so bisection finds the point.
 */
/** How far the curve is from its origin in the direction th (radians, in the curve's own frame: y up). */
export function heartRadius(th) {
  const c = Math.cos(th), s = Math.sin(th), q = c * c * s * s * s;
  let lo = 0, hi = 2;
  for (let k = 0; k < 44; k++) { const r = (lo + hi) / 2; if ((r * r - 1) ** 3 - r ** 5 * q < 0) lo = r; else hi = r; }
  return lo;
}
function algebraicHeart(n) {
  const M = 1440, dense = [];
  for (let i = 0; i < M; i++) {
    const th = Math.PI / 2 - (i / M) * TAU, r = heartRadius(th);
    dense.push([Math.cos(th) * r, Math.sin(th) * r]);
  }
  const seg = dense.map((p, i) => { const q = dense[(i + 1) % M]; return Math.hypot(q[0] - p[0], q[1] - p[1]); });
  const total = seg.reduce((a, b) => a + b, 0), out = [];
  let i = 0, acc = 0;
  for (let k = 0; k < n; k++) {
    const d = (k / n) * total;
    while (acc + seg[i] < d) { acc += seg[i]; i++; }
    const u = (d - acc) / seg[i], a = dense[i], b = dense[(i + 1) % M];
    out.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u)]);
  }
  return out;
}
export const HEART_N = 240, HEART = algebraicHeart(HEART_N);
/** The curve on the sheet: origin O = { x, y }, unit R px. */
export const heartPts = (O, R) => HEART.map(([x, y]) => [O.x + x * R, O.y - y * R]);
/**
 * Where a tangent leaves the curve: the first point past the top of the right-hand lobe at which the outline runs
 * `deg` degrees below the horizontal. Returns { i, p: [x, y] in curve units, d: [dx, dy] unit direction on screen }.
 */
export function heartTangent(deg = 8) {
  const want = (deg * Math.PI) / 180;
  for (let i = 4; i < HEART_N / 3; i++) {
    const a = HEART[i], b = HEART[i + 1], dx = b[0] - a[0], dy = -(b[1] - a[1]);
    if (dx > 0 && Math.atan2(dy, dx) >= want) { const l = Math.hypot(dx, dy); return { i, p: a, d: [dx / l, dy / l] }; }
  }
  return { i: 30, p: HEART[30], d: [1, 0] };
}
