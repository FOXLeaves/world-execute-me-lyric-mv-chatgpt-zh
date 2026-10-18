// V6: a small, original perspective-drawing vocabulary for the lyric film.
// The reference project suggests *depth* as a storytelling device; these
// constructions use the existing Canvas renderer and ChatGPT palette instead
// of importing its Three.js scene code. All shapes are deterministic in t.

const TAU = Math.PI * 2;
const mix = (a, b, k) => a + (b - a) * k;
const hash = (n) => {
  const v = Math.sin(n * 127.1 + 78.233) * 43758.5453123;
  return v - Math.floor(v);
};

/** Distant, lens-layered points with a slight camera orbit. Dark scenes only. */
export function starVolume(ctx, t, {
  focus = [960, 510], spread = [1150, 700], density = 150,
  alpha = 0.65, color = 'text', accent = 'me', seed = 0,
} = {}) {
  const g = ctx.g;
  for (let i = 0; i < density; i++) {
    const n = i + seed * 173, d = 0.18 + 0.82 * hash(n * 3 + 1);
    const phi = TAU * hash(n * 3 + 2), r = Math.sqrt(hash(n * 3 + 3));
    const drift = (1 - d) * 24;
    const x = focus[0] + Math.cos(phi) * r * spread[0] + drift * Math.sin(t * 0.14 + i),
      y = focus[1] + Math.sin(phi) * r * spread[1] * 0.78 + drift * Math.cos(t * 0.12 + i);
    if (x < -15 || x > 1935 || y < -15 || y > 1095) continue;
    const a = alpha * (0.25 + 0.75 * d) * (0.82 + 0.18 * Math.sin(t * 1.6 + i));
    g.fillStyle = ctx.col(i % 13 === 0 ? accent : color, a);
    const radius = i % 31 === 0 ? 2.5 + 1.6 * d : 0.65 + 1.3 * d;
    g.beginPath(); g.arc(x, y, radius, 0, TAU); g.fill();
    if (i % 31 === 0) {
      ctx.line(x - 11, y, x + 11, y, { color: i % 2 ? accent : color, alpha: a * 0.37, width: 0.9 });
      ctx.line(x, y - 11, x, y + 11, { color: i % 2 ? accent : color, alpha: a * 0.37, width: 0.9 });
    }
  }
}

/** Cinematic nebula made of soft, optically stretched light rather than a UI panel. */
export function simulationSky(ctx, t, {
  focus = [960, 470], strength = 0.8, stars = 190, seed = 1,
  broken = false,
} = {}) {
  // The opaque ground of the old plate remains under this field, so registration
  // marks / typography still feel like one print when the cosmic room fades in.
  ctx.rect(0, 0, 1920, 1080, { fill: true, color: 'bg', alpha: 0.58 * strength });
  ctx.radial(focus[0] - 250, focus[1] + 120, 820, '#224d5a', 0.4 * strength);
  ctx.radial(focus[0] + 340, focus[1] - 90, 830, broken ? 'errDim' : 'meDim', 0.34 * strength);
  ctx.at(focus[0], focus[1], () => {
    ctx.radial(0, 0, 800, broken ? 'err' : 'me', 0.12 * strength);
    ctx.radial(80, -80, 420, 'text', 0.09 * strength);
  }, { rot: -0.29 + 0.014 * Math.sin(t * 0.2), sx: 2.0, sy: 0.28 });
  ctx.at(focus[0], focus[1], () => ctx.radial(0, 0, 560, '#2b628c', 0.23 * strength), { rot: -0.28, sx: 1.7, sy: 0.17 });
  starVolume(ctx, t, { focus, spread: [1220, 850], density: stars, alpha: 0.93 * strength, color: 'text', accent: broken ? 'err' : 'me', seed });
  // A restrained, unbroken horizon flare: no strobing or one-frame white hits.
  ctx.gradRect(90, focus[1] + 115, 1740, 2.5,
    [[0, 'me', 0], [0.28, broken ? 'err' : 'me', 0.13 * strength], [0.54, 'text', 0.34 * strength], [0.74, broken ? 'err' : 'me', 0.13 * strength], [1, 'me', 0]], 'h');
}

/** A moving architectural vanishing-point corridor, behind title or code. */
export function perspectiveChamber(ctx, t, {
  center = [960, 515], aperture = [1670, 1040], alpha = 0.26,
  color = 'me', minor = 'line', speed = 0.36, seed = 0,
} = {}) {
  const [cx, cy] = center, [rw, rh] = aperture;
  const depth = 1450, lens = 500, steps = 11;
  const project = (u, v, z) => {
    const p = lens / (lens + z);
    return [cx + u * rw * p, cy + v * rh * p];
  };
  const ring = (z, k) => {
    const v = [project(-0.5, -0.5, z), project(0.5, -0.5, z), project(0.5, 0.5, z), project(-0.5, 0.5, z)];
    ctx.poly(v, { close: true, color: k % 3 === 0 ? color : minor, alpha: alpha * (0.2 + 0.8 * (1 - z / depth)), width: k % 3 === 0 ? 2.2 : 1.1 });
    return v;
  };
  const off = ((t * speed * 145 + seed * 92) % (depth / steps) + depth / steps) % (depth / steps);
  const rings = [];
  for (let i = steps; i >= 0; i--) rings.push(ring(Math.max(0, i * depth / steps - off), i));
  for (let corner = 0; corner < 4; corner++) for (let k = 0; k < rings.length - 1; k++) {
    const a = rings[k][corner], b = rings[k + 1][corner];
    ctx.line(a[0], a[1], b[0], b[1], { color: minor, alpha: alpha * 0.32, width: 1.1 });
  }
  for (let i = 0; i < 28; i++) {
    const z = (hash(i * 7 + seed) * depth + t * speed * 110) % depth;
    const p = project((hash(i * 4 + 4) - 0.5) * 1.9, (hash(i * 4 + 9) - 0.5) * 1.9, z);
    ctx.circle(p[0], p[1], 1.3 + 2 * (1 - z / depth), { fill: true, color, alpha: alpha * (1 - z / depth) * 1.5 });
  }
}

/** Two interlaced currents wrap a lyric's transmission, with faux depth occlusion. */
export function signalHelix(ctx, t, {
  from, to, radius = 92, turns = 4.5, alpha = 0.65, color = 'me', bright = 'text', phase = 0,
} = {}) {
  const dx = to[0] - from[0], dy = to[1] - from[1], len = Math.hypot(dx, dy);
  if (len < 1) return;
  const nx = -dy / len, ny = dx / len, segments = 110;
  const draw = (shift, role) => {
    let last = null;
    for (let i = 0; i <= segments; i++) {
      const u = i / segments, a = u * turns * TAU + t * 0.75 + phase + shift,
        depth = 0.6 + 0.4 * Math.sin(a), side = Math.cos(a) * radius * (0.8 + 0.3 * u);
      const x = from[0] + dx * u + nx * side, y = from[1] + dy * u + ny * side;
      if (last) ctx.line(last[0], last[1], x, y, { color: role, alpha: alpha * depth * Math.sin(Math.PI * u) ** 0.5, width: 1.1 + 2.7 * depth });
      if (i % 11 === 0) ctx.circle(x, y, 2.6 + depth * 2.2, { fill: true, color: role, alpha: alpha * depth * 0.9 });
      last = [x, y];
    }
  };
  draw(0, color); draw(Math.PI, bright);
}

/** Three inclined orbital rings, particles and a central halo: the feedback is a system. */
export function orbitInstrument(ctx, t, {
  center = [760, 432], radius = 400, alpha = 0.5, color = 'me', faint = 'line',
} = {}) {
  const [cx, cy] = center;
  for (let ring = 0; ring < 3; ring++) {
    const phase = t * (ring % 2 ? -0.18 : 0.13) + ring * TAU / 3;
    const tilt = -0.32 + ring * 0.3, points = [];
    for (let i = 0; i <= 96; i++) {
      const a = i / 96 * TAU, rx = radius + ring * 65;
      const x = cx + rx * Math.cos(a) * Math.cos(tilt) - rx * 0.4 * Math.sin(a) * Math.sin(phase),
        y = cy + rx * Math.sin(a) * (0.38 + ring * 0.11) + rx * 0.13 * Math.cos(a) * Math.sin(tilt);
      points.push([x, y]);
    }
    ctx.poly(points, { color: ring === 1 ? color : faint, alpha: alpha * (ring === 1 ? 0.65 : 0.42), width: ring === 1 ? 2.8 : 1.4 });
    const a = phase * 2 + ring * 2, rx = radius + ring * 65,
      px = cx + rx * Math.cos(a) * Math.cos(tilt) - rx * 0.4 * Math.sin(a) * Math.sin(phase),
      py = cy + rx * Math.sin(a) * (0.38 + ring * 0.11) + rx * 0.13 * Math.cos(a) * Math.sin(tilt);
    ctx.circle(px, py, ring === 1 ? 13 : 8, { fill: true, color, alpha: alpha * 0.8 });
    ctx.circle(px, py, ring === 1 ? 27 : 19, { color, alpha: alpha * 0.5, width: 1.5 });
  }
}

/** Quiet clusters of connected points, to turn an empty digital space into distance. */
export function absenceNetwork(ctx, t, {
  center = [1380, 530], radius = 610, alpha = 0.5, seed = 6,
  color = 'mute', spark = 'me', broken = false,
} = {}) {
  const nodes = Array.from({ length: 36 }, (_, i) => {
    const a = TAU * hash(seed * 100 + i * 5), r = radius * Math.sqrt(hash(seed * 100 + i * 5 + 1));
    return [center[0] + r * Math.cos(a) + 18 * Math.sin(t * 0.17 + i * 3), center[1] + 0.66 * r * Math.sin(a) + 12 * Math.cos(t * 0.13 + i), hash(i + 10)];
  });
  nodes.forEach((n, i) => {
    for (let j = i + 1; j < nodes.length; j++) {
      const o = nodes[j], d = Math.hypot(n[0] - o[0], n[1] - o[1]);
      if (d > 200 || broken && hash(i * 99 + j) > 0.32) continue;
      ctx.line(n[0], n[1], o[0], o[1], { color, alpha: alpha * (1 - d / 240) * 0.35, width: 1.1 });
    }
    ctx.circle(n[0], n[1], 1.7 + n[2] * 2.5, { fill: true, color: i % 11 === 0 ? spark : color, alpha: alpha * (0.4 + 0.6 * n[2]) });
  });
}
