// Engine: owns the layer canvases, the post passes and the scene list.
// renderFrame(t) is the single entry point for BOTH preview and export. It is a pure
// function of t: no frame-to-frame state, no wall clock.
//
// Layers: two content layers (A = outgoing shot, B = incoming shot while their time
// ranges overlap) and one transparent overlay layer drawn on top of the transition.
import { rand, setSeed } from './prng.js';
import { Features } from './features.js';
import { Lyrics } from './lyrics.js';
import { Ctx } from './draw.js';
import { Post } from './post.js';
import { loadArt, ART_NAMES } from './art.js';
import { buildPalettes, mixPal } from './palette.js';
import { resolveTransition } from './transitions.js';
import { clamp } from './util.js';
import { buildScenes } from '../scenes/index.js';
import { UI_ZH_GLYPHS } from '../components/ui_zh.js';

/** Load every font before the first frame, so text never renders in a fallback face. `step` is told of each one. */
async function loadFonts(cfg, step, lyricsZhData) {
  const zhFace = (cfg.fonts.cjk ?? []).find((c) => c.role === 'scSans');
  if (zhFace) zhFace.text = [...new Set((zhFace.text ?? '') + UI_ZH_GLYPHS + (lyricsZhData?.lines ?? []).join(''))].join('');
  const jobs = [];
  for (const key of ['mono', 'serif', 'sans']) {
    const { family, pkg, weights, italic = [] } = cfg.fonts[key];
    const add = (w, style) => {
      const face = new FontFace(family, `url("/node_modules/@fontsource/${pkg}/files/${pkg}-latin-${w}-${style}.woff2")`, { weight: String(w), style });
      jobs.push(face.load().then((f) => { document.fonts.add(f); step(`font  ${family} ${w}${style === 'italic' ? ' italic' : ''}`); }));
    };
    weights.forEach((w) => add(w, 'normal'));
    italic.forEach((w) => add(w, 'italic'));
  }
  await Promise.all(jobs);
  // CJK faces ship as ~100 unicode-range slices each; link the package CSS and let the browser
  // fetch only the slices that contain the glyphs we use, then wait for exactly those.
  for (const c of cfg.fonts.cjk || []) {
    await new Promise((res, rej) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet'; link.href = `/node_modules/@fontsource/${c.pkg}/${c.weight}.css`;
      link.onload = res; link.onerror = () => rej(new Error('font css failed: ' + c.pkg));
      document.head.appendChild(link);
    });
    // resolves with the faces it loaded: none means that no slice of the family holds these glyphs (or the
    // CSS did not declare the family), and the card would be set in a system font without any sign of it
    const faces = await document.fonts.load(`${c.weight} 64px "${c.family}"`, c.text);
    if (!faces.length) throw new Error(`no font face for ${c.role}: ${c.family} ${c.weight} does not cover its configured text`);
    step(`font  ${c.family} ${c.weight}`);
  }
}

/** How many things createEngine reports to `onStep` while it loads: every font, every silhouette, the scenes. */
export function loadSteps(cfg) {
  let n = (cfg.fonts.cjk || []).length + ART_NAMES.length + 1;
  for (const key of ['mono', 'serif', 'sans']) n += cfg.fonts[key].weights.length + (cfg.fonts[key].italic || []).length;
  return n;
}

const getJson = async (p) => { try { return await (await fetch('/' + p.split('/').map(encodeURIComponent).join('/'))).json(); } catch { return null; } };

/** onStep(label), preview only: called as each thing is loaded (the page's progress bar); it never touches a frame. */
export async function createEngine({ canvas, width, height, cfg, featuresData, lyricsData, lyricsZhData, flipY = false, lab = null, onStep = null }) {
  setSeed(cfg.seed);
  const step = onStep ?? (() => {});
  const [, art, script, errors] = await Promise.all([loadFonts(cfg, step, lyricsZhData), loadArt(cfg, step), getJson(cfg.paths.script), getJson(cfg.paths.errors)]);

  const palettes = buildPalettes(cfg.palettes);
  const mk = (alpha) => new Ctx(document.createElement('canvas'), cfg, palettes, { alpha });
  const layerA = mk(false), layerB = mk(false), over = mk(true);
  const post = new Post(canvas, cfg);

  const features = new Features(featuresData, cfg);
  const lyrics = new Lyrics(lyricsData, cfg, features, lyricsZhData);
  // env: what every section file receives. art = character illustrations, script / errors = the written conversation.
  const all = await buildScenes({ cfg, features, lyrics, art, script: script ?? {}, errors: errors ?? {} }, { lab });
  await step('scenes');
  // in cut order (not by `start`: a lead-in may begin before the cut of the shot it follows), so of two live
  // shots the later one is always the incoming one
  const content = all.filter((s) => !s.overlay).sort((a, b) => (a.at ?? a.start) - (b.at ?? b.start));
  const overlays = all.filter((s) => s.overlay).sort((a, b) => (a.z || 0) - (b.z || 0));

  function resize(w, h) {
    for (const l of [layerA, layerB, over]) { l.canvas.width = w; l.canvas.height = h; }
    post.resize(w, h);
  }
  resize(width, height);

  /** Per-frame post parameters; shots raise / override them (see README -> fx). */
  function defaultFx(f, t) {
    const c = cfg, started = f.t >= features.t0 ? 1 : 0;
    return {
      flash: 0, flashColor: null,                           // full-screen flash (capped by safety.maxFlash)
      glow: c.glow.base + c.glow.lowGain * f.lowEnv,        // bloom strength; only saturated colour blooms
      bloomAll: 0, bloomThreshold: 0.35,                    // v4 light: bright things bloom too (0..1), above this luminance
      rays: 0, raysAt: [960, 540],                          //   rays of whatever blooms, outwards from a point (virtual px)
      streak: 0,                                            //   a horizontal streak through whatever blooms
      zoomBlur: 0, zoomAt: [960, 540],                      //   the picture smeared towards a point, 0..1 (a push)
      zoom: 1 + c.post.zoomOnLow * f.lowEnv * started,      // low band breathes the whole frame, very slightly
      rot: 0, shake: [0, 0],                                // whole-frame camera
      aberration: c.post.aberration, rgbSplit: 0,           // radial / horizontal colour separation (px)
      glitch: 0, mosh: 0,                                   // torn rows / datamosh blocks
      mosaic: 0, mosaicRect: null,                          // cell size in px (0 = off), optional [x, y, w, h]
      invert: 0, desat: 0,                                  // 0..1
      scan: 1, vignette: 1,                                 // multipliers on the finish
      bright: 1 + c.post.flicker * f.high * (rand(7, Math.round(t * 60)) - 0.5) * 2,
      hud: 1,                                               // opacity of the overlay layer (warning toast, credits)
    };
  }

  const broken = new Set();
  function drawScene(layer, sc, tv, f) {
    layer.g.save();
    try {
      sc.render(layer, tv, f);
      layer.g.restore();
    } catch (e) {
      // one broken shot must not take the film (or a neighbour's contact sheet) down: report once, show a note
      if (!broken.has(sc.id)) { broken.add(sc.id); console.error(`[shot ${sc.id}] ${e.message}`); }
      layer.g.reset();
      layer.begin(tv, f, layer.videoTime, layer.fx);
      layer.clear();
      layer.text(`shot "${sc.id}" failed: ${e.message}`, 80, 540, { size: 28, font: 'mono', color: 'err' });
    }
  }

  /**
   * fx of a frame in which two shots overlap. Each shot wrote its own set (`a` = what the outgoing shot left,
   * `fx` = what the incoming one wrote, starting again from the defaults), and the frame gets their blend by
   * the progress k of the overlap: what the incoming shot asks for must not hit the whole frame while the
   * picture is still almost entirely the outgoing one. The flash is not blended: it stays the maximum over
   * both shots, as ctx.flash() left it.
   */
  function blendFx(fx, a, k) {
    // the mosaic rectangle cannot be blended: it is the one of the shot that has a mosaic (of the nearer one if both do);
    // likewise the points the rays and the zoom blur are centred on
    const of = (amt, at) => (!(fx[amt] > 0) ? a[at] : !(a[amt] > 0) || k >= 0.5 ? fx[at] : a[at]);
    const rect = of('mosaic', 'mosaicRect'), raysAt = of('rays', 'raysAt'), zoomAt = of('zoomBlur', 'zoomAt');
    for (const key in fx) {
      if (key !== 'flash' && typeof fx[key] === 'number' && typeof a[key] === 'number') fx[key] = a[key] + (fx[key] - a[key]) * k;
    }
    fx.shake = [0, 1].map((i) => { const va = a.shake?.[i] ?? 0; return va + ((fx.shake?.[i] ?? 0) - va) * k; });
    fx.mosaicRect = rect; fx.raysAt = raysAt; fx.zoomAt = zoomAt;
  }

  /** Render the frame for video time t (seconds). */
  function renderFrame(t) {
    const tv = t - cfg.timing.offset;            // global sync offset (see config.json)
    const f = features.sample(tv);
    const fx = defaultFx(f, t);
    for (const l of [layerA, layerB, over]) { l.begin(tv, f, t, fx); l.statePal = null; }

    // at most two content shots are live: A (outgoing) and B (incoming)
    const live = content.filter((s) => tv >= s.start && tv < s.end);
    const A = live.length > 1 ? live[live.length - 2] : live[0], B = live.length > 1 ? live[live.length - 1] : null;
    if (A) drawScene(layerA, A, tv, f); else { layerA.setPal('dead'); layerA.clear(); }
    // the palette a shot is IN (statePal, set by sequence()), not whatever a ctx.setPal() inside it left behind
    const palA = layerA.statePal ?? layerA.pal;
    let k = 0, pal = palA, palB = null, glowA = fx.glow, glowB = fx.glow;
    if (B) {
      const fxA = { ...fx };
      Object.assign(fx, defaultFx(f, t), { flash: fxA.flash, flashColor: fxA.flashColor });   // same object: the layers hold it
      drawScene(layerB, B, tv, f);
      k = clamp((tv - B.start) / Math.max(1e-6, A.end - B.start));
      palB = layerB.statePal ?? layerB.pal;
      pal = mixPal(palA, palB, k);
      glowA = fxA.glow; glowB = fx.glow;
      blendFx(fx, fxA, k);                       // (the overlay opacity `hud` follows the transition with the rest)
    }
    const tr = resolveTransition(B ? B.enter : null, k, pal);

    over.pal = pal; over.clear();
    for (const sc of overlays) if (tv >= sc.start && tv < sc.end) drawScene(over, sc, tv, f);

    const n = (c) => c.map((v) => v / 255);
    // What the bloom has to know about each shot, because during an overlap every pixel still belongs to one of
    // them: its background (only what is brighter than it glows), its bloom tint, and how strongly it glows
    // (the palette's multiplier and the shot's own fx.glow).
    const feed = (p, fxGlow) => ({ bg: n(p.bg).map((v) => v * 1.03), tint: n(p.bloom), glow: p.glow, fxGlow });
    const look = {
      tint: n(pal.bloom), flashCol: n(fx.flashColor ?? pal.bloom), moshCol: n(pal.err), bg: n(pal.bg).map((v) => v * 1.03), glow: pal.glow,
      a: feed(palA, glowA), b: B ? feed(palB, glowB) : null,
    };
    post.render({ a: layerA.canvas, b: B ? layerB.canvas : null, hud: over.canvas }, tr, fx, look, Math.round(t * 60), flipY);
  }

  return {
    renderFrame, resize, features, lyrics, scenes: all, palettes, post, art,
    duration: features.duration,
    /** The film starts this many seconds BEFORE the song (the warning page); t in renderFrame(t) is song time. */
    preroll: lab ? 0 : cfg.safety.preroll ?? 0,
    readPixels: (buf) => post.readPixels(buf),
    rendererInfo: () => post.rendererInfo(),
    activeScenes: (t) => content.filter((s) => t >= s.start && t < s.end).map((s) => s.id),
    shotAt: (t) => content.filter((s) => t >= s.start && t < s.end).pop() ?? null,
  };
}
