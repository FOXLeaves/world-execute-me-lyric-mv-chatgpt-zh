// Section 6 — VERSE 2 (bar 40, 1:14.2 → bar 48, 1:29.0). State: warm.
// Four role-play requests, and the user never waits for an answer to finish. v4: the first three share one grammar
// (eight beats each), and on every noun the film leaves the interface for a plate (plates_verse2.js):
//
//   v2-ask1      74.19  interface   the user clicks Send: the request flies up out of the composer, her answer begins
//   v2-eggplant  74.65  PLATE       on the noun she IS the eggplant (code characters, its own purple); cut open on the
//                                   next downbeat; on the keyword its colour leaves it and what it holds is drawn
//                                   out of it, cream, as molecules (fibre, protein, sugar)
//   v2-ask2      77.65  interface   Send again (the request was typed at the foot of the plate while she answered)
//   v2-tomato    78.34  PLATE       the tomato: the same grammar (lycopene, vitamin C, vitamin E)
//   v2-ask3      81.34  interface   Send again
//   v2-cat       82.04  PLATE       herself in characters; on the noun the cat ears; developed into three solid inks,
//                                   her purr as tabby stripes; on the keyword the stripes are given
//   v2-ask4      85.04  interface   the fourth request; on the kick the lights go down round the user's bubble
//   v2-proof     85.50  PLATE       a proof without its cream plate; a sun behind the void of her face; the missing
//                                   plate slides over from the user's bubble and registers on the keyword
//
// A plate comes in on the noun (cues.js: where the noun begins, snapped to the half-beat grid) and is ended by the
// user's next click on Send. Where the plates' own events fall: plates_verse2.js.
import { chatLayout, composer, header, room, windowFrame } from '../components/chat.js';
import { drawCursor } from '../components/cursor.js';
import { burst } from '../components/motif.js';
import { frameRect } from '../engine/layout.js';
import { clamp, easeBack, prog } from '../engine/util.js';
import { meBubble, meIn, youBubble } from './bubbles.js';
import { cue } from './cues.js';
import { cues } from './kit.js';
import { plateCat, plateFruit, plateProof } from './plates_verse2.js';
import { localizeUI } from '../components/ui_zh.js';

/** The four requests: [noun cue, its lines (two sung lines and the keyword), what precedes it in the thread (the keyword before)]. */
const REQ = [['nounEggplant', 44, 43], ['nounTomato', 47, 46], ['nounTabby', 50, 49], [null, 53, 52]];

/** Where the pointer is when verse 2 ends: on the Settings button of the header, which the next section clicks (screen px, full view). */
export const PRE2_POINTER = (() => { const L = chatLayout({ side: 0 }); return [L.head.x + L.head.w - 176 + 3, L.head.y + 33 + 4]; })();

export function verse2Shots(env) {
  const { art, script, lyrics, features } = env, { T, B, Bt, text } = cues(env);
  const CARDS = script.cards_section6 ?? [], BEATS = (script.sections ?? []).find((s) => s.n === 6)?.beats ?? [];
  const req = (i) => localizeUI(CARDS[i]?.request ?? BEATS[i]?.you?.[0] ?? '');
  // cuts: Send, noun, Send, noun, Send, noun, Send, lights down. All on the grid: a noun's time is snapped to the half-beat.
  const SEND = [B(40), Bt(167.5), Bt(175.5), Bt(183.5)], NOUN = [0, 1, 2].map((k) => features.snapHalf(cue(REQ[k][0]))), DARK = Bt(184.5), END = B(48);

  // =============================================================================== the interface: the lower thread and the composer, close
  const W0 = chatLayout({ side: 0 }), TH = W0.thread, BTN = [W0.composer.x + W0.composer.w - 44, W0.composer.y + W0.composer.h - 40];
  /** Where things stand in the thread (world px): the last keyword, small; the request; her answer. The fourth request is set larger. */
  const ROW = (k) => (k < 3 ? { prev: 502, you: [594, 36], me: [716, 50] } : { prev: 392, you: [470, 40], me: [626, 50] });
  const G = [{ x: 430, y: 452, w: 1060, h: 596.25 }, { x: 444, y: 470, w: 1030, h: 579.375 }, { x: 400, y: 440, w: 1100, h: 618.75 }, { x: 180, y: 380, w: 1371.43, h: 771.43 }];
  const CAM = G.map((r) => frameRect(r)), TILT = [0, -0.02, 0.016, 0];
  /** World px -> screen px under the (still) camera of glimpse k. */
  const onScreen = (k, [x, y]) => [(x - 960 - CAM[k].x) * CAM[k].zoom + 960, (y - 540 - CAM[k].y) * CAM[k].zoom + 540];
  const REST = [1440, 590];                                           // where the pointer waits after the fourth Send (world px)

  /** The user's request, thrown up out of the composer (ghosted while it flies); it lands with a small overshoot. */
  function thrown(ctx, str, t, at, xr, y, size) {
    const fly = (tt) => { const k = prog(tt, at, at + 0.28); if (k > 0) youBubble(ctx, xr, y + (1 - easeBack(k)) * 300, str, { size, alpha: clamp(k * 4) }); };
    if (t < at + 0.28) ctx.trail(4, 0.018, (tau) => fly(t - tau), 0.4); else fly(t);
  }
  /** Glimpse k: the user has just clicked Send on request k. */
  function glimpse(ctx, t, k) {
    const cut = SEND[k], [, line, kw] = REQ[k], R = ROW(k), dark = k === 3 ? clamp((t - Bt(184)) * 30) : 0;
    room(ctx, { art, name: 'tea', alpha: 0.5, t, dim: 0.5 });
    windowFrame(ctx, W0, { glass: 0.95 });
    ctx.radial(960, 700, 640, 'meDim', 0.34);
    header(ctx, W0, { t, title: script.title ?? '', presence: 'online' });
    meBubble(ctx, TH.x, R.prev, text(kw), { size: 30, weight: 700, hot: true, alpha: 0.6 });        // the word before, still in the thread
    if (t >= T(line)) meIn(ctx, t, T(line), TH.x, R.me[0], text(line), { size: R.me[1], n: lyrics.typed(line, t).n, fly: 140 });
    composer(ctx, W0.composer, { placeholder: script.composer_placeholder ?? '', t, send: 'busy' });
    burst(ctx, BTN[0], BTN[1], 46, (t - cut) / 0.45, { color: 'text' });
    // the fourth time the lights go down on the kick: only the user's message stays lit, and it is cream paper already
    if (dark > 0) { const g = ctx.g; g.save(); g.setTransform(ctx.scale, 0, 0, ctx.scale, 0, 0); ctx.rect(0, 0, 1920, 1080, { fill: true, color: 'panel', alpha: 0.9 * dark }); g.restore(); ctx._font = ''; }
    thrown(ctx, req(k), t, cut - 0.06, TH.x + TH.w, R.you[0], R.you[1]);
    if (dark > 0) {
      meBubble(ctx, TH.x, R.me[0], text(line), { size: R.me[1], n: lyrics.typed(line, t).n, alpha: dark });          // (her line is being sung: it stays readable)
      const b = youBubble(ctx, TH.x + TH.w, R.you[0], req(k), { size: R.you[1], alpha: 0 });
      ctx.rrect(b.x, b.y, b.w, b.h, Math.min(b.h * 0.42, R.you[1] * 0.95), { fill: 'text', alpha: dark });
      b.lines.forEach((ln, i) => ctx.text(ln, b.x + b.padX, b.y + b.padY + (i + 0.76) * R.you[1] * 1.28, { size: R.you[1], weight: 500, color: 'bg', alpha: dark }));
    }
    drawCursor(ctx, k === 3 ? [{ t: cut, x: BTN[0] + 3, y: BTN[1] + 4 }, { t: DARK, x: REST[0], y: REST[1] }] : [{ t: cut, x: BTN[0] + 3, y: BTN[1] + 4 }, { t: cut + 0.6, x: BTN[0] + 46, y: BTN[1] + 40 }], t, { scale: 1.5 });
  }
  const ask = (k, until, moment, layout) => ({
    id: `v2-ask${k + 1}`, at: SEND[k], lines: [REQ[k][1], REQ[k][1]], palette: 'warm', hud: 0, moment, layout, enter: { type: 'cut' },
    camera: (t) => { const p = prog(t, SEND[k], until), c = CAM[k]; return k === 3 ? c : { x: c.x, y: c.y - 6 * p, zoom: c.zoom * (1 + 0.03 * p), rot: TILT[k] }; },
    render: (ctx, t) => glimpse(ctx, t, k),
  });

  // =============================================================================== the plates
  /** What the user types at the foot of plate k while she answers: the next request. */
  const next = (k, a, z) => ({ text: req(k + 1), from: Bt(a), to: Bt(z) });
  const B4 = { text: req(3), xr: onScreen(3, [TH.x + TH.w, 0])[0], y: onScreen(3, [0, ROW(3).you[0]])[1], size: ROW(3).you[1] * CAM[3].zoom };

  return [
    ask(0, NOUN[0], 'The user asks her to pretend to be an eggplant: the click on Send throws the request up out of the composer, and her answer begins under it.', 'interface: close on the lower thread and the composer: the request flying up at the right, her line starting at the left'),
    {
      id: 'v2-eggplant', at: NOUN[0], lines: [44, 46], palette: 'warm', hud: 0, enter: { type: 'cut' },
      layout: 'PLATE: the eggplant leaning across the sheet in code characters and its own purple, her spark as its calyx; cut in two; then a hollow outline, its colour leaving to the right as cream; the keyword on the foot of the sheet',
      moment: 'On the noun she IS the eggplant: its data set in characters, in its own colour. On the next downbeat it is cut open; on the keyword the colour leaves it and what it holds is drawn out of it in cream, as molecules: fibre, protein, sugar, each with its name, its formula and its weight. Only its outline is left. The user is already typing the next request; their click on Send ends the plate.',
      render: (ctx, t) => plateFruit(ctx, env, { t, kind: 'eggplant', at: NOUN[0], settle: cue('nounEggplantEnd'), open: Bt(164), hit: T(46), word: text(46), lines: [44, 45], next: next(0, 164.75, 166.75) }),
    },
    ask(1, NOUN[1], 'The next request is sent before her last word has died away: now a tomato.', 'interface: the same corner of the thread, a little closer and tilted'),
    {
      id: 'v2-tomato', at: NOUN[1], lines: [47, 49], palette: 'warm', hud: 0, enter: { type: 'cut' },
      layout: 'PLATE: the tomato in the middle of the sheet in characters and its own red, the spark as its calyx; its top lifted off, the cut face showing; then hollow, its colour leaving to the right as cream; the keyword on the foot',
      moment: 'On the noun she is the tomato. On the next downbeat its top is lifted off; on the keyword what it holds is drawn out of it in cream, as molecules: its own red (lycopene), vitamin C, vitamin E. The next request is typed at the foot of the sheet meanwhile.',
      render: (ctx, t) => plateFruit(ctx, env, { t, kind: 'tomato', at: NOUN[1], settle: cue('nounTomatoEnd'), open: Bt(172), hit: T(49), word: text(49), lines: [47, 48], next: next(1, 172.75, 174.9) }),
    },
    ask(2, NOUN[2], 'Third request, sent as fast as the others: a cat, a tabby.', 'interface: the same corner of the thread, from a little further left'),
    {
      id: 'v2-cat', at: NOUN[2], lines: [50, 52], palette: 'warm', hud: 0, enter: { type: 'cut' },
      layout: 'PLATE: her bust at the left, first in code characters, then with cat ears, then printed in three solid inks with her paws up; her purr as a row of tabby stripes from her to the right edge; the keyword on the foot',
      moment: 'She answers as herself, printed in characters; on the noun the cat ears pop up; on the next downbeat the characters develop into the solid print and her purr stands beside her as tabby stripes. On the keyword the stripes turn cream and leave towards the user; the cat stays.',
      render: (ctx, t) => plateCat(ctx, env, { t, at: NOUN[2], ears: cue('nounCat'), develop: Bt(180), hit: T(52), word: text(52), lines: [50, 51], next: next(2, 181, 183.1) }),
    },
    ask(3, DARK, 'Fourth request: be god. On the kick the lights of the interface go down, and only the user\'s message is left lit.', 'interface: the thread and the composer, wider; then dark but for the user\'s bubble at the upper right'),
    {
      id: 'v2-proof', at: DARK, lines: [53, 55], palette: 'warm', hud: 0, enter: { type: 'cut' },
      layout: 'PLATE: a proof sheet: her bust at the left printed in orange and black only, a sun of flat rays behind her; the user\'s request as cream paper at the upper right, the cream plate sliding in from under it; the keyword on the foot, in orange',
      moment: 'No object this time: a proof of herself with the cream plate missing, her face a void in her hair. On the noun a sun stands behind that void. The missing plate comes over from the user\'s message and registers on the keyword: cape, flower, the line of her chin. Cream is the user: they are the plate that makes her whole. Then the pointer leaves for the settings.',
      render: (ctx, t) => plateProof(ctx, env, { t, at: DARK, sun: cue('nounGod'), slide: Bt(188), hit: T(55), word: text(55), lines: [53, 54, 56], bubble: B4, rest: onScreen(3, REST), restScale: 1.5 * CAM[3].zoom, to: PRE2_POINTER, leave: Bt(191), until: END }),
    },
  ];
}
