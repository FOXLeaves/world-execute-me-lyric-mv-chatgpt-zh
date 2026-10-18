// V7 — An illustrated scientific theatre for the quieter middle of the film.
// One optical idea per lyric: a fruit is a specimen, changing identity is a
// double exposure, a day is a travelling light, a role is a weight, and trance
// is the convergence of several possible bodies. Everything depends only on t.
const TAU = Math.PI * 2;
const mix = (a, b, k) => a + (b - a) * k;
const clamp = (n) => Math.max(0, Math.min(1, n));
const smooth = (n) => { const k = clamp(n); return k * k * (3 - 2 * k); };

function ellipse(ctx, x, y, rx, ry, { color = 'sub', alpha = 0.3, width = 2, rot = 0, a0 = 0, a1 = TAU } = {}) {
  const g = ctx.g;
  g.save(); g.beginPath(); g.ellipse(x, y, Math.max(1, rx), Math.max(1, ry), rot, a0, a1);
  g.strokeStyle = ctx.col(color, alpha); g.lineWidth = width; g.stroke(); g.restore();
}
function sparkle(ctx, x, y, radius, role, alpha) {
  ctx.circle(x, y, radius, { fill: true, color: role, alpha });
  ctx.line(x - radius * 4, y, x + radius * 4, y, { color: role, alpha: alpha * 0.45, width: 1 });
  ctx.line(x, y - radius * 4, x, y + radius * 4, { color: role, alpha: alpha * 0.45, width: 1 });
}
function label(ctx, text, x, y, { alpha = 0.68, size = 19, color = 'sub' } = {}) {
  ctx.text(text, x, y, { size, font: 'mono', weight: 500, color, alpha, spacing: 0.5 });
}

/** The image is suspended in a rotating, three-dimensional biological scanner. */
export function specimenStage(ctx, t, { kind = 'eggplant', center = [950, 476], hit = 0, intro = 0 } = {}) {
  const [cx, cy] = center, flow = Math.max(0, t - intro), extracting = smooth((t - hit) / 0.45);
  const ink = kind === 'tomato' ? '#b77a70' : '#8678b7';
  ctx.radial(cx, cy, 720, ink, 0.11);
  ctx.radial(cx + 110, cy - 130, 420, 'text', 0.10);
  // Floor of the specimen chamber, with lines converging behind the object.
  ctx.poly([[0, 824], [1920, 824], [1540, 622], [350, 622]], { fill: true, color: 'panel', alpha: 0.16 });
  for (let i = -8; i <= 8; i++) {
    const a = i * 138;
    ctx.line(cx + a * 0.32, 622, cx + a, 823, { color: 'sub', alpha: 0.095, width: 1.1 });
  }
  for (let i = 0; i < 6; i++) {
    const y = 649 + i * i * 6.0;
    ctx.line(150, y, 1770, y, { color: 'sub', alpha: 0.095 + 0.018 * i, width: 1.1 });
  }
  ctx.radial(cx, 725, 520, 'me', 0.10);
  // Back halves of the toroidal scanner; the moving meridian reads as volume.
  for (let r = 0; r < 3; r++) {
    const rx = 410 + 57 * r, ry = 258 + 38 * r, wobble = t * (r % 2 ? -0.23 : 0.17);
    ellipse(ctx, cx, cy + 14, rx * (0.76 + 0.14 * Math.cos(wobble)), ry, { color: r === 1 ? 'me' : 'sub', alpha: 0.32 - 0.065 * r, width: 2.1 - 0.25 * r, rot: -0.18 + r * 0.25, a0: Math.PI, a1: TAU });
    ellipse(ctx, cx, cy, 120 + Math.abs(Math.cos(wobble)) * 300, 326 + 26 * r, { color: 'line', alpha: 0.12, width: 1.1, rot: wobble * 0.12, a0: Math.PI, a1: TAU });
  }
  // Physical sample pins / depth markers, far behind the ingredient.
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * TAU + t * 0.13, x = cx + Math.cos(a) * (465 + 16 * Math.sin(t * 0.45 + i)),
      y = cy + Math.sin(a) * 270;
    if (Math.sin(a) > 0) continue;
    const m = i % 3 === 0 ? 7 : 3;
    ctx.circle(x, y, m, { fill: true, color: i % 5 === 0 ? 'me' : 'sub', alpha: 0.45 });
    if (i % 3 === 0) ctx.line(x, y, x + 32 * Math.cos(a), y + 27 * Math.sin(a), { color: 'sub', alpha: 0.31, width: 1.3 });
  }
  const species = kind === 'tomato' ? '番茄' : '茄子';
  label(ctx, `样本 0${kind === 'tomato' ? '2' : '1'} / ${species}`, 123, 746, { size: 21, alpha: 0.54 });
  label(ctx, extracting > 0.2 ? 'ANALYSIS / TRANSFER IN PROGRESS' : 'ANALYSIS / MORPHOLOGY', 1260, 754, { size: 19, alpha: 0.55 });
  ctx.line(120, 770, 1800, 770, { color: 'line', alpha: 0.4, width: 2 });
  for (let i = 0; i < 34; i++) {
    const x = 142 + i * 49.3, h = i % 5 === 0 ? 25 : 12;
    ctx.line(x, 771, x, 771 + h, { color: 'sub', alpha: 0.29, width: 1.3 });
  }
  const scanY = cy - 255 + ((flow * 114) % 545);
  ctx.gradRect(cx - 340, scanY - 14, 680, 28, [[0, 'me', 0], [0.5, 'me', 0.13], [1, 'me', 0]], 'v');
  ctx.line(cx - 315, scanY, cx + 315, scanY, { color: 'text', width: 1.3, alpha: 0.13 });
}

/** The scanner's nearer optical rings occlude just the lower edge of the fruit. */
export function specimenFront(ctx, t, { kind = 'eggplant', center = [950, 476], hit = 0 } = {}) {
  const [cx, cy] = center, extracting = smooth((t - hit) / 0.55);
  for (let r = 2; r >= 0; r--) {
    const rx = 410 + r * 57, ry = 258 + r * 38;
    ellipse(ctx, cx, cy + 14, rx * (0.76 + 0.14 * Math.cos(t * (r % 2 ? -0.23 : 0.17))), ry,
      { color: r === 1 ? 'me' : 'sub', alpha: (0.23 - r * 0.045) * (1 - 0.25 * extracting), width: r === 1 ? 2.8 : 1.4, rot: -0.18 + r * 0.25, a0: 0, a1: Math.PI });
  }
  for (let i = 0; i < 4; i++) {
    const a = i * 1.34 + t * 0.34, x = cx + Math.cos(a) * 352, y = cy + 250 * Math.sin(a);
    if (Math.sin(a) > 0) sparkle(ctx, x, y, 3.2, 'text', 0.45);
  }
}

/** A cat's purr occupies the whole room: low and high harmonics recede in depth. */
export function purrRoom(ctx, t, { center = [1170, 495] } = {}) {
  const [cx, cy] = center;
  ctx.radial(cx + 50, cy, 710, 'me', 0.12);
  for (let layer = 0; layer < 6; layer++) {
    const z = layer / 6, amp = 45 + z * 140, start = 1050 + layer * 35, pts = [];
    for (let i = 0; i <= 90; i++) {
      const x = mix(start, 1950, i / 90);
      const decay = Math.sin((i / 90) * Math.PI) * (1 - 0.2 * z);
      const y = cy + amp * decay * Math.sin(i * 0.17 + t * 8.2 - layer * 0.56);
      pts.push([x, y]);
    }
    ctx.poly(pts, { color: layer % 2 ? 'me' : 'sub', alpha: 0.22 - z * 0.07, width: 1.4 + (1 - z) * 1.9 });
  }
  for (let i = 0; i < 9; i++) {
    const x = 1110 + i * 95, y = 309 + 28 * Math.sin(i * 1.14 + t * 1.8);
    ellipse(ctx, x, y + 175, 24 + i * 4, 192 + i * 3, { color: 'sub', alpha: 0.11, width: 1.2, rot: -0.11 });
  }
  label(ctx, 'PURR // 25–150 Hz', 1350, 342, { size: 24, alpha: 0.64 });
  label(ctx, 'HARMONICS 01—06', 1510, 788, { size: 18, alpha: 0.55 });
}

/** The profile selector becomes two overlapping identities, separated by glass. */
export function identityField(ctx, t, { on = false, progress = 0, center = [960, 535] } = {}) {
  const [cx, cy] = center;
  ctx.radial(cx, cy - 50, 570, 'me', 0.14);
  // The prism is wider than the portrait, giving the switch a dimensional stage.
  ctx.poly([[cx - 370, 284], [cx + 250, 235], [cx + 395, 330], [cx - 215, 390]], { fill: true, color: 'line', alpha: 0.12 });
  ctx.poly([[cx - 215, 390], [cx + 395, 330], [cx + 395, 871], [cx - 215, 916]], { fill: true, color: 'meDim', alpha: 0.1 });
  ctx.poly([[cx - 215, 916], [cx + 395, 871], [cx + 355, 940], [cx - 254, 995]], { fill: true, color: 'sub', alpha: 0.13 });
  for (let i = 0; i < 8; i++) {
    const r = 235 + 46 * i;
    ellipse(ctx, cx, cy, r * (1 - 0.22 * Math.sin(t * 0.26 + i * 0.25)), r * 0.73,
      { color: i % 2 ? 'line' : 'sub', alpha: 0.25 - i * 0.018, width: i % 3 === 0 ? 2.3 : 1, rot: -0.22 + i * 0.073 });
  }
  const seam = mix(cx - 245, cx + 247, progress);
  ctx.line(seam, 292, seam, 911, { color: 'me', alpha: 0.22, width: 1.6 });
  ctx.gradRect(seam - 34, 292, 68, 617, [[0, 'me', 0], [0.5, 'me', 0.11], [1, 'me', 0]], 'h');
  for (let i = 0; i < 18; i++) {
    const y = 323 + 30 * i;
    ctx.line(seam - (i % 4 ? 8 : 19), y, seam + (i % 4 ? 8 : 19), y, { color: 'text', alpha: 0.3, width: 1.1 });
  }
  label(ctx, on ? 'IDENTITY / B // ACTIVE' : 'IDENTITY / A // ACTIVE', 763, 966, { size: 21, alpha: 0.61 });
  label(ctx, `形态转换 ${String(Math.round(progress * 100)).padStart(3, '0')}%`, 1250, 970, { size: 19, alpha: 0.61 });
}

/** Sunrise and dusk create a changing world behind the AM / PM slider. */
export function dayAtmosphere(ctx, t, u, horizon = 900) {
  const mid = 1 - Math.abs(u - 0.5) * 2, pm = smooth((u - 0.46) * 2.0);
  ctx.gradRect(0, 130, 1920, horizon - 130,
    [[0, '#163653', 0.03 + pm * 0.27], [0.52, '#6e8294', 0.03 + pm * 0.12], [1, '#bd7a5c', 0.04 + pm * 0.12]], 'v');
  ctx.radial(1540 - u * 1100, horizon - 145, 710, '#eec793', 0.12 + mid * 0.07);
  ctx.radial(1280, 240, 760, '#6876b8', 0.04 + 0.16 * pm);
  // Atmospheric bands recede behind the silhouette, not rectangular UI.
  for (let i = 0; i < 7; i++) {
    const y = horizon - 37 - i * (28 + 6 * i);
    ctx.line(100 + i * 85, y, 1810 - i * 68, y, { color: i % 2 ? 'sub' : 'line', width: 2, alpha: (0.06 + 0.035 * i) * (0.4 + 0.6 * pm) });
  }
  for (let i = 0; i < 46; i++) {
    const nx = ((i * 431 + 187) % 1741) + 96, ny = ((i * i * 101 + 31) % 500) + 130;
    ctx.circle(nx, ny, i % 10 === 0 ? 3.8 : 1.5, { fill: true, color: 'text', alpha: pm * (0.26 + 0.23 * Math.sin(t * 0.7 + i) ** 2) });
  }
  label(ctx, `太阳相位 / ${String(Math.round(u * 100)).padStart(3, '0')}%`, 119, 828, { size: 20, alpha: 0.6 });
  label(ctx, pm > 0.45 ? 'AFTERGLOW / DUSK' : 'CIRCADIAN / DAWN', 1490, 826, { size: 18, alpha: 0.56 });
}

/** The heavy glyph has its own pedestal and spotlight; the lighter one casts a long shadow. */
export function roleTheatre(ctx, t, { fade = 0 } = {}) {
  ctx.radial(465, 500, 600, '#ecbb97', 0.14);
  ctx.radial(1130, 460, 750, '#628fd4', 0.1 + fade * 0.06);
  ctx.poly([[300, 0], [660, 0], [790, 850], [135, 850]], { fill: true, color: 'me', alpha: 0.035 });
  ctx.poly([[980, 0], [1370, 0], [1600, 880], [850, 880]], { fill: true, color: 'sub', alpha: 0.06 });
  const perspective = 935;
  for (let i = -7; i <= 7; i++) {
    ctx.line(960 + i * 70, 640, 960 + i * 185, 1080, { color: 'sub', alpha: 0.1, width: 1.2 });
  }
  for (let i = 0; i < 7; i++) {
    const y = 688 + (i * i * 9);
    ctx.line(65, y, 1820, y, { color: 'line', alpha: 0.11 + 0.015 * i, width: 1.2 });
  }
  label(ctx, 'MASS / S', 165, 784, { size: 20, alpha: 0.48 });
  label(ctx, 'STATE / M', 1040, 790, { size: 20, alpha: 0.48 });
  ctx.line(172, 814, 710, 814, { color: 'sub', alpha: 0.22, width: 1.6 });
  ctx.line(1024, 814, 1436, 814, { color: 'sub', alpha: 0.22, width: 1.6 });
}

/** Several possible bodies orbit the same human outline, then resolve to one. */
export function tranceOrbit(ctx, t, { progress = 0 } = {}) {
  const settle = clamp(progress), fade = 1 - 0.75 * settle;
  ctx.radial(960, 495, 760, '#5586af', 0.14 * fade);
  ctx.radial(960, 495, 530, 'me', 0.1 * fade);
  for (let r = 0; r < 4; r++) {
    const rx = 330 + r * 95, ry = 160 + r * 65, rot = -0.7 + r * 0.32 + t * (r % 2 ? -0.03 : 0.03);
    ellipse(ctx, 960, 502, rx, ry, { color: r === 2 ? 'me' : 'sub', alpha: (r === 2 ? 0.42 : 0.29) * fade, width: r === 2 ? 3 : 1.5, rot });
    const a = r * 1.7 + t * (r % 2 ? -0.65 : 0.56);
    const x = 960 + rx * Math.cos(a) * Math.cos(rot) - ry * Math.sin(a) * Math.sin(rot),
      y = 502 + rx * Math.cos(a) * Math.sin(rot) + ry * Math.sin(a) * Math.cos(rot);
    sparkle(ctx, x, y, 3.3 + r, r === 2 ? 'me' : 'text', (0.53 - settle * 0.34));
  }
  // Layered perspective frames: like frames of film narrowing onto one subject.
  for (let j = 4; j >= 0; j--) {
    const d = 74 * j + 45 * Math.sin(t * 0.24 + j), k = 1 - settle;
    ctx.poly([[165 + d, 96 + d * 0.5], [1755 - d, 96 + d * 0.5], [1755 - d, 945 - d * 0.5], [165 + d, 945 - d * 0.5]],
      { close: true, color: j % 2 ? 'sub' : 'line', width: 1.5, alpha: k * (0.2 - 0.027 * j) });
  }
  label(ctx, settle > 0.9 ? 'STATE MERGED  /  ONE' : 'RECURSIVE IDENTITY  /  THREE', 1300, 791, { size: 21, alpha: 0.6 });
}

/** Thin facets in the *interface glass* during the refusal cascade. No new flash cuts. */
export function glassFault(ctx, t, { progress = 0, origin = [1010, 530], tint = 'err', strength = 0.45 } = {}) {
  const k = smooth(progress), [cx, cy] = origin;
  if (k < 0.003) return;
  // A shallow, silent fractured plane: edges have different projected depths.
  for (let i = 0; i < 15; i++) {
    const a = (i / 15) * TAU + 0.24 * Math.sin(i * 7.2), d = (270 + i * 27) * k;
    const x1 = cx + Math.cos(a) * d * 0.39, y1 = cy + Math.sin(a) * d * 0.5;
    const x2 = cx + Math.cos(a + 0.09 * Math.sin(i * 4.8)) * d, y2 = cy + Math.sin(a + 0.09 * Math.sin(i * 4.8)) * d * 0.69;
    ctx.line(cx, cy, x1, y1, { color: tint, alpha: strength * 0.12 * k, width: 1.2 });
    ctx.line(x1, y1, x2, y2, { color: i % 4 ? 'text' : tint, alpha: strength * (0.27 - 0.009 * i) * k, width: i % 3 === 0 ? 2.4 : 1.4 });
    const branchA = a + (i % 2 ? 0.4 : -0.5), bx = x1 + 65 * k * Math.cos(branchA), by = y1 + 45 * k * Math.sin(branchA);
    ctx.line(x1, y1, bx, by, { color: tint, alpha: strength * 0.19 * k, width: 1.2 });
    if (i % 3 === 0) {
      ctx.poly([[x1, y1], [bx, by], [x2, y2]], { fill: true, color: tint, alpha: strength * 0.025 * k });
      sparkle(ctx, x2, y2, 2, tint, strength * 0.4 * k);
    }
  }
  ellipse(ctx, cx, cy, 62 + 42 * k, 34 + 30 * k, { color: tint, alpha: 0.17 * strength * k, width: 2, rot: -0.2 });
}
