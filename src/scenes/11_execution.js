// Section 10 — EXECUTION, the twelve shouts (bar 80, 2:28.0 → beat 344, 2:39.1). State: error. A CODE picture.
//
// The music here is twelve identical two-beat cells, so the picture is ONE machine in ONE composition: the love
// loop (loop.js) turning twelve times. No chat interface, no figure, and the ground stays the dark of the error
// state throughout (v3 jumped between dark, red and cream fields and re-placed the word in every shot).
//
//   the word is four even syllables (beats N, N+0.5, N+1, N+1.5 of every round):
//     they are the four statements of the loop body: the execution bar moves down lines 02-05
//     and the four blocks its big letters are printed solid in, bottom right, always in the same place
//   lines 02, 03, 04 raise the same three errors every round (all three were raised in the error section)
//   line 05 counts the round (a counter with no total); the arrow from line 06 back to 01 lights at every turn
//   every finished round is pushed up into a staircase of the word; a cream `stop` key (`yours`) is never pressed
//
// Only three things ever change the picture, and each is the same composition enlarged: round 5 (151.73) and
// round 9 (155.42) one step each; in round 12 (158.19) the word takes the whole frame, torn along one horizontal
// cut into two halves out of register, the staircase is pushed out of the top and the counter overflows.
// From round 9 on there is one tear per round; its pattern holds for its full six frames.
//
// Every time here comes from the beat grid (Bt): the LRC runs about 0.4 s early through this passage.
import { codeGround } from '../components/code.js';
import { clamp, easeOut, lerp, prog } from '../engine/util.js';
import { cues, tearAt } from './kit.js';
import { CHUNKS, machine, monoWord } from './loop.js';
import { absenceNetwork, perspectiveChamber, starVolume } from './cinema_space.js';

export function executionShots(env) {
  const { Bt, P, text } = cues(env);
  const N = 12, R0 = 320, FIRST = 86, H2 = P / 2;
  const tR = (i) => Bt(R0 + 2 * i);                                   // round i (0..11) starts; the section ends at tR(12) = beat 344
  /** [listing, output] scale of the composition: rounds 1-4, 5-8, 9-11. Each block grows from its own corner. */
  const LEVEL = [[1, 1], [1.07, 1.2], [1.14, 1.44]];
  const WORD = text(FIRST), TITLE = text(11);

  /** Everything the machine shows at time t. */
  function state(t) {
    const i = clamp(Math.floor((t - tR(0)) / (2 * P) + 1e-6), 0, N - 1), s = (t - tR(i)) / H2, j = clamp(Math.floor(s + 1e-6), 0, 3);
    const since = t - (tR(i) + j * H2);
    // the bar: lines 02..05 on the four syllables; at the end of the round on to the brace; at the turn, round through the condition
    let bar = lerp(j === 0 ? (i === 0 ? 1 : 0) : j, j + 1, easeOut(prog(since, 0, 0.07)));
    const out = prog(t, tR(i + 1) - 0.1, tR(i + 1) - 0.03);
    if (j === 3 && out > 0 && i < N - 1) bar = lerp(4, 5, easeOut(out));
    let arrow = 0;                                                     // the loop arrow: lit across each turn
    for (let k = 1; k < N; k++) arrow = Math.max(arrow, 1 - Math.abs(t - tR(k) + 0.02) / 0.13);
    const lv = i < 4 ? 0 : i < 8 ? 1 : 2, prev = LEVEL[Math.max(0, lv - 1)], zk = lv ? easeOut(prog(t, tR(lv * 4), tR(lv * 4) + 0.08)) : 1;
    const tInc = tR(i) + 3 * H2;                                       // run++ is the fourth statement
    return {
      i, j, since, sung: j + 1, bar, arrow: clamp(arrow), rise: i ? prog(t, tR(i), tR(i) + 0.1) : 1, seen: i ? 3 : Math.min(3, j + 1),
      zoom: [lerp(prev[0], LEVEL[lv][0], zk), lerp(prev[1], LEVEL[lv][1], zk)], count: i + prog(t, tInc, tInc + 0.16),
    };
  }

  function draw(ctx, t) {
    const S = state(t), last = S.i === N - 1, t12 = tR(N - 1);
    ctx.fx.glow = Math.min(ctx.fx.glow, last ? 0.24 : 0.36);          // large flat orange type: little bloom
    ctx.fx.scan = 2.2;
    codeGround(ctx);
    // An execution loop has become a physical room. The camera travels through
    // successive depth planes while the exact code timing remains unchanged.
    ctx.radial(1370, 500, 950, 'meDim', 0.16);
    starVolume(ctx, t, { focus: [1290, 520], spread: [770, 850], density: 130, alpha: 0.28, color: 'text', accent: 'err', seed: 9 });
    perspectiveChamber(ctx, t, {
      center: [1360 - S.i * 10, 520], aperture: [2090, 1270],
      alpha: 0.46 + S.i * 0.015, color: 'err', minor: 'line', speed: 0.5 + S.i * 0.035,
    });
    if (S.i >= 4) absenceNetwork(ctx, t, { center: [1250, 430], radius: 920, alpha: 0.2 + 0.012 * S.i, color: 'sub', spark: 'err', broken: true });
    if (!last) {
      machine(ctx, { word: WORD, title: TITLE, round: S.i, sung: S.sung, bar: S.bar, since: S.since, rise: S.rise, zoom: S.zoom, arrow: S.arrow, seen: S.seen, count: S.count });
      if (S.i >= 8) tearAt(ctx, t, tR(S.i) + P, 0.5);                  // from round 9: one tear a round, on its second beat
      return;
    }
    // round 12: the word takes the frame; the staircase is pushed out of the top; the counter overflows
    const k = easeOut(prog(t, t12, t12 + 0.07));
    machine(ctx, {
      word: WORD, title: TITLE, round: S.i, sung: S.sung, bar: S.bar, since: S.since, rise: 1, zoom: LEVEL[2], arrow: 0, seen: 3,
      count: N - 1, overflow: prog(t, t12 + 0.04, t12 + 0.36), dimList: 0.55 * k, output: false, lift: 1400 * easeOut(prog(t, t12, t12 + 0.16)),
    });
    const size = lerp(150 * LEVEL[2][1], 338, k), cw = ctx.cw(size), XR = lerp(1830, 960 + 4.5 * cw, k), y = lerp(1000, 664, k), mid = y - size * 0.365, off = 30 * k;
    const filled = CHUNKS[S.sung - 1][1];
    // two halves along one horizontal cut, out of register; the cut itself is a red hairline (held: it does not move again)
    ctx.clip({ x: -200, y: -200, w: 2400, h: mid + 200 }, () => monoWord(ctx, WORD, XR - off, y, size, { filled }));
    ctx.clip({ x: -200, y: mid, w: 2400, h: 1400 }, () => monoWord(ctx, WORD, XR + off, y, size, { filled }));
    ctx.rect(0, mid - 2, 1920, 4, { fill: true, color: 'err', alpha: k });
    tearAt(ctx, t, t12 + P, 0.5);
  }

  const shot = (i, lines, layout, moment) => ({ id: `exec-${String(i + 1).padStart(2, '0')}`, at: tR(i), lines, palette: 'error', hud: 0, layout, moment, enter: { type: 'cut' }, render: (ctx, t) => draw(ctx, t) });
  return [
    shot(0, [FIRST, FIRST + 3], 'CODE: the listing of the love loop top left, the round counter and the unpressed stop key bottom left, the sung word bottom right with its staircase above it',
      'The user is gone, so the loop condition holds and the loop runs. Each shout is one turn: four syllables, four statements; three of them fail the same way every time, the fourth counts the round. What it prints is the word.'),
    shot(4, [FIRST + 4, FIRST + 7], 'CODE: the same composition, one step larger',
      'Round five. Nothing has changed but the size of it: the same four statements, the same three errors, the staircase of the word four steps high.'),
    shot(8, [FIRST + 8, FIRST + 10], 'CODE: the same composition, a second step larger; the staircase reaching the top of the frame; one tear a round',
      'Round nine. The staircase of everything it has said climbs out of the top of the frame, and the picture begins to tear, once a round.'),
    shot(11, [FIRST + 11, FIRST + 11], 'CODE: the word across the whole frame, cut into two halves out of register; the counter overflowing bottom left',
      'Round twelve. The word no longer fits what it was declared in: it takes the whole frame and tears in two, and the round counter overflows. Line 07 has still not been reached.'),
  ];
}
