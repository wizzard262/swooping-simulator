'use strict';
// ---------------------------------------------------------------------------
// The scenery, built once at start-up: sky, sun, clouds, hills with Aussie icons, the suburb's
// streets, the lawn and the big gum
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Sky (static: flat strips, dithered at the joins)
// ---------------------------------------------------------------------------
const SKY_RGB = SKY.map(hex);       // the sky's colours as [r, g, b]
let skyCanvas;
function buildSky() {
  const c = makeCanvas(W, H), g = c.getContext('2d'), img = g.createImageData(W, H);
  const strip = GRASS_TOP / SKY.length, last = SKY.length - 1;
  for (let y = 0; y < H; y++) {
    const k = Math.round(y / strip), edge = y - k * strip;           // the nearest join, and how far from it
    const blending = k >= 1 && k <= last && Math.abs(edge) < SKY_BLEND / 2, f = (edge + SKY_BLEND / 2) / SKY_BLEND;
    for (let x = 0; x < W; x++) {
      const o = (y * W + x) * 4;
      img.data.set(SKY_RGB[blending ? k - (dither(x, y, f) ? 0 : 1) : Math.min(last, Math.floor(y / strip))], o);
      img.data[o + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  skyCanvas = c;
}

// ---------------------------------------------------------------------------
// The sun: the Sun King picture supplied with the prompts (prompt-art/01-sun-king.png), cut out
// of its marble background and drawn as it is, at full quality (not pixel art)
// ---------------------------------------------------------------------------
function loadSun() {
  const img = new Image();
  img.src = SUN_PNG;
  return img;
}

// ---------------------------------------------------------------------------
// Clouds: billowy pixel-art cumulus. Many round puffs, lit from the top left; lower
// puffs sit in front, so their bright tops show as billows inside the cloud.
// Colours taken from the reference picture in prompt-art/.
// ---------------------------------------------------------------------------
const CLOUD_LIGHT = (() => { const v = [-0.45, -0.8, 0.45], m = Math.hypot(...v); return v.map(a => a / m); })();
function makeCloud(r, w, h, tower) {
  const base = h - 2, unit = clamp(h / 8, 2.5, 6), puffs = [];
  const humps = [];
  for (let i = 0, n = 2 + Math.floor(r() * 3); i < n; i++) humps.push({ x: w * (0.2 + 0.6 * r()), s: w * (0.1 + 0.14 * r()), t: 0.35 + 0.4 * r() });
  if (tower) humps.push({ x: w * (0.35 + 0.3 * r()), s: w * 0.19, t: 1 });
  const prof = x => humps.reduce((v, hp) => Math.max(v, hp.t * Math.exp(-(((x - hp.x) / hp.s) ** 2))), 0);
  const surface = x => base - unit - prof(x) * (base - 2 * unit - 1);   // height of the top puffs' centres

  for (let x = unit; x < w - unit; x += unit * (0.6 + 0.5 * r())) {     // bumpy top
    const s = surface(x);
    if (s > base - unit * 1.2 && r() < 0.4) continue;
    const rad = unit * (0.7 + 0.6 * r());
    puffs.push({ cx: x, cy: Math.min(s + rad * 0.3, base - rad * 0.4), rad });
  }
  let area = 0;
  for (let x = 0; x < w; x++) area += Math.max(0, base - surface(x));
  for (let k = 0, n = Math.round(area / (unit * unit * 2)); k < n; k++) {   // billows inside
    const x = unit + r() * (w - 2 * unit), top = surface(x);
    if (top > base - unit) continue;
    const rad = unit * (0.7 + 0.9 * r());
    let cy = top + unit + r() * (base - top - unit);
    cy = clamp(cy, top - unit * 0.3 + rad, base - rad * 0.3);
    puffs.push({ cx: x, cy, rad });
  }
  for (let x = unit; x < w - unit; x += unit * 0.9) {                   // flat base
    if (surface(x) > base - unit) continue;
    const rad = unit * (0.7 + 0.5 * r());
    puffs.push({ cx: x, cy: base - rad * 0.6, rad });
  }
  for (let k = 0, n = 2 + Math.floor(r() * 4); k < n; k++) {           // little torn-off bits
    const x = unit + r() * (w - 2 * unit), rad = 1 + r() * 1.4;
    puffs.push({ cx: x, cy: Math.max(rad, surface(x) - unit * 1.4 - r() * 3), rad });
  }
  puffs.sort((a, b) => a.cy - b.cy);

  const owner = new Int16Array(w * h).fill(-1);
  puffs.forEach((p, i) => {
    for (let y = Math.max(0, Math.floor(p.cy - p.rad)); y <= Math.min(base, Math.ceil(p.cy + p.rad)); y++)
      for (let x = Math.max(0, Math.floor(p.cx - p.rad)); x <= Math.min(w - 1, Math.ceil(p.cx + p.rad)); x++)
        if ((x + 0.5 - p.cx) ** 2 + (y + 0.5 - p.cy) ** 2 <= p.rad * p.rad) owner[y * w + x] = i;
  });
  let topY = h;
  for (let i = 0; i < w * h; i++) if (owner[i] >= 0) { topY = Math.floor(i / w); break; }

  const c = makeCanvas(w, h), g = c.getContext('2d');
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = owner[y * w + x];
    if (i < 0) continue;
    const p = puffs[i], u = (x + 0.5 - p.cx) / p.rad, v = (y + 0.5 - p.cy) / p.rad;
    const nz = Math.sqrt(Math.max(0, 1 - u * u - v * v));
    const lam = Math.max(0, u * CLOUD_LIGHT[0] + v * CLOUD_LIGHT[1] + nz * CLOUD_LIGHT[2]);
    const depth = (y - topY) / (base - topY + 1);
    let val = lam * 1.0 + 0.3 - depth * 0.6;
    const above = y > 0 ? owner[(y - 1) * w + x] : -1, below = y < h - 1 ? owner[(y + 1) * w + x] : -1;
    if (above >= 0 && above < i) val = Math.max(val, 0.86 - depth * 0.3);  // bright rim where a billow overlaps the one behind
    if (below > i) val -= 0.12;                                             // shadow just above a billow in front
    val += (BAYER[(y & 3) * 4 + (x & 3)] / 16 - 0.47) * 0.08;
    g.fillStyle = CLOUD_TONES[val > 0.9 ? 0 : val > 0.72 ? 1 : val > 0.56 ? 2 : val > 0.42 ? 3 : val > 0.28 ? 4 : 5];
    g.fillRect(x, y, 1, 1);
  }
  return c;
}
// The clouds: their own slow parallax layer in front of the sky, drifting a little in the wind
function buildClouds() {
  const r = rng(7), P = LEVEL_W * PARALLAX.clouds, n = 7, list = [];
  for (let i = 0; i < n; i++) {
    const tower = i === 1 || i === 4;
    const w = tower ? 90 + Math.floor(r() * 40) : 30 + Math.floor(r() * 60);
    const h = tower ? 60 + Math.floor(r() * 20) : clamp(Math.round(w * (0.3 + r() * 0.25)), 14, 40);
    const bottom = tower ? 85 + r() * 25 : 30 + r() * 70;
    list.push({ x: (i + r() * 0.6) * P / n, y: Math.max(2, Math.round(bottom - h)), img: makeCloud(r, w, h, tower) });
  }
  return { P, list, wind: 3 };
}

// ---------------------------------------------------------------------------
// Hills behind the houses, with Australian icons: Sydney Harbour with the Harbour
// Bridge and the Opera House, and Uluru out in the red centre
// ---------------------------------------------------------------------------
function buildHills() {
  const P = LEVEL_W * PARALLAX.hills, p = painter(P, H, true), r = rng(31);
  const WATER = 138, OUTBACK = [400, 600], ULURU_X = 450;
  const ph = [1, 2, 3, 5, 8].map(() => r() * Math.PI * 2);
  const zone = (x, [a, b], soft) => clamp(Math.min(x - a, b - x) / soft, 0, 1);
  const top = x => {
    let y = 133 + [5, 3, 2, 1, 0.5].reduce((s, amp, i) => s + amp * Math.sin(2 * Math.PI * [1, 2, 3, 5, 8][i] * x / P + ph[i]), 0);
    y += (WATER + 2 - y) * zone(x, HARBOUR, 30);                        // dip down to the harbour
    y += (136 - y) * zone(x, OUTBACK, 40);                              // flat red plain
    return Math.round(y);
  };
  for (let x = 0; x < P; x++) {
    const t = top(x), slope = top(x + 1) - top(x - 1), red = zone(x, OUTBACK, 40), harbour = zone(x, HARBOUR, 30);
    for (let y = t; y < H; y++) {
      const d = y - t;
      let c;
      if (red > 0.5) c = d === 0 ? '#e0905a' : (x * 7 + y * 13) % 17 === 0 ? '#7d7a3a' : dither(x, y, d / 14) ? '#b9643a' : '#cc7646';
      else {
        let tone = slope < -1 ? 0 : slope > 1 ? 2 : 1;                    // slopes facing the light are paler
        if (d < 2) tone = 0;
        else if (d > 3) tone += hash(x, y) < 0.35 ? 2 : 1;                 // forest texture
        c = HILL_GREENS[Math.min(4, tone)];
      }
      const water = harbour > 0 && t >= WATER - 2 && y >= WATER;
      if (water) c = (y + Math.floor(x / 9)) % 6 === 0 ? '#9fd8f2' : y === WATER ? '#7cc4ea' : '#3d93d4';
      p.px(x, y, water || red > 0.5 ? mix(c, '#8fc3ea', 0.12) : mix(c, HILL_HAZE, FAR));
    }
  }

  // Bush on the hills: little dark trees, lit on the left
  for (let k = 0; k < 420; k++) {
    const x = Math.floor(r() * P);
    if (zone(x, OUTBACK, 30) > 0 || zone(x, HARBOUR, 20) > 0) continue;
    const y = top(x) + 1 + Math.floor(r() ** 2 * 10), th = 2 + Math.floor(r() * 2);
    for (let j = 0; j < th; j++) {
      const half = Math.min(j, th - 1 - j < 1 ? 0 : 2) >> 1;
      p.px(x - half, y - th + j, mix(HILL_GREENS[4], HILL_HAZE, FAR), half * 2 + 1, 1);
      p.px(x - half, y - th + j, mix(HILL_GREENS[2], HILL_HAZE, FAR));
    }
  }

  // Sydney Harbour Bridge: a steel arch between granite pylons, with the deck through it
  const bx0 = 110, bx1 = 220, mid = (bx0 + bx1) / 2, half = (bx1 - bx0) / 2 - 12, deck = 127;
  const arch = (x, apex, end) => apex + (end - apex) * ((x - mid) / half) ** 2;
  for (let x = bx0 + 12; x <= bx1 - 12; x++) {
    const yt = Math.round(arch(x, 99, 120)), yb = Math.round(arch(x, 104, 134));
    for (let y = yt; y <= Math.min(yb, WATER); y++) {
      const edge = y === yt || y === yb, lattice = (x + y) % 4 === 0 || (x - y) % 4 === 0;
      if (edge) p.px(x, y, '#4f565e');
      else if (lattice) p.px(x, y, '#7a838c');
    }
    if (yb < deck && x % 3 === 0) p.px(x, yb, '#6a727a', 1, deck - yb);  // hangers
  }
  p.px(bx0, deck, '#5a6168', bx1 - bx0, 2);
  p.px(bx0, deck + 2, '#3c4248', bx1 - bx0, 1);
  for (const px0 of [bx0 + 2, bx1 - 12]) {                               // granite pylons
    p.px(px0, 110, '#c9b99a', 10, WATER - 110);
    p.px(px0 + 7, 110, '#a8987a', 3, WATER - 110);
    p.px(px0 - 1, 109, '#ddd0b2', 12, 2);
    p.px(px0 + 3, 113, '#8f8064', 4, 5);
  }

  // Sydney Opera House: white sails on a sandstone podium
  // Each shell is a pointed sail: a steep curved front rising to its tip, a long curved back
  const ox = 236, ob = 136;
  p.px(ox - 4, ob, '#d8c8a8', 62, 3);
  p.px(ox - 4, ob + 3, '#b8a888', 62, 1);
  for (const [sx, w, h] of [[ox + 34, 13, 15], [ox + 43, 11, 11], [ox, 18, 24], [ox + 11, 16, 19], [ox + 22, 13, 14]]) {
    const peak = Math.round(w * 0.22);
    for (let i = 0; i < w; i++) {
      const t = i < peak ? Math.sqrt(i / peak) : 1 - ((i - peak) / (w - peak)) ** 1.7;
      const hh = Math.round(h * t);
      for (let j = 0; j < hh; j++) {
        let c = i <= peak ? '#ffffff' : i > w - 3 ? '#c9cdd0' : (j + 2 * i) % 6 === 0 ? '#dfe0da' : '#f1f0ea';
        if (j === hh - 1 && i > peak) c = '#d6d8d6';                     // edge of the shell
        if (j < 3 && i > 1 && i < w * 0.55) c = '#3c4650';               // glass under the shell
        p.px(sx + i, ob - 1 - j, c);
      }
    }
  }

  // Uluru: a red monolith with dark gullies down its face, scrub along its foot
  const uw = 96, uh = 27, ub = 137;
  for (let i = 0; i < uw; i++) {
    const t = i / (uw - 1);
    const hh = Math.round(uh * Math.sqrt(Math.max(0, 1 - Math.abs(2 * t - 1) ** 3.2)) + Math.sin(i * 0.7) * 0.6);
    for (let j = 0; j < hh; j++) {
      const y = ub - j, fromTop = hh - j;
      let c = t < 0.35 ? '#de7a3e' : t < 0.75 ? '#c75d2c' : '#a8471f';
      if (fromTop <= 1) c = t < 0.6 ? '#ee9a5c' : '#cf6a36';
      else if (i % 7 === 3 && fromTop < hh * 0.8) c = '#9a3f1c';          // gullies
      else if (dither(i, j, j / uh * 0.5)) c = mix(c, '#7a2e14', 0.35);   // darker towards the base
      p.px(ULURU_X + i, y, c);
    }
  }
  for (let k = 0; k < 40; k++) p.px(ULURU_X - 10 + r() * (uw + 20), ub + r() * 2, r() < 0.5 ? '#6f7a34' : '#58622a', 2, 1);
  return { P, c: p.c };
}

// ---------------------------------------------------------------------------
// Suburb: single-storey Australian brick houses with shallow roofs, fences,
// gum trees, jacarandas, bottlebrush, hedges, Hills Hoists and TV aerials
// ---------------------------------------------------------------------------

function leafClump(p, r, cx, cy, rx, ry, pal, flatBase) {
  for (let dy = -Math.ceil(ry); dy <= Math.ceil(ry); dy++) {
    if (flatBase && dy > 0) break;
    for (let dx = -Math.ceil(rx); dx <= Math.ceil(rx); dx++) {
      const e = (dx / rx) ** 2 + (dy / ry) ** 2;
      if (e > 1 - r() * 0.3) continue;
      const t = dy / ry + dx / rx * 0.4 + (r() - 0.5) * 0.5;
      p.px(cx + dx, cy + dy, t < -0.45 ? pal[0] : t < 0.35 ? pal[1] : pal[2]);
    }
  }
}

function tree(p, r, x0, base, height, kind, scale = 1) {
  const clumps = [];
  const bark = kind === 'gum' ? ['#efe8d8', '#d9cfb9', '#b0a38a'] : ['#7a6250', '#5f4a3b', '#46362a'];
  const spread = kind === 'jacaranda' ? 0.95 : 0.7;
  function branch(x, y, ang, len, w, depth) {
    for (let i = 0; i < len; i++) {
      x += Math.cos(ang); y += Math.sin(ang); ang += (r() - 0.5) * 0.12;
      const ww = Math.max(1, Math.round(w * (1 - 0.4 * i / len)));
      for (let s = 0; s < ww; s++) {
        let c = bark[1];
        if (ww > 1 && s === 0) c = bark[0];
        else if (ww > 1 && s === ww - 1) c = bark[2];
        else if (kind === 'gum' && r() < 0.08) c = '#c99a5e';
        p.px(x - ww / 2 + s, y, c);
      }
    }
    if (depth < 3) {
      const n = 2 + (r() < 0.4 ? 1 : 0);
      for (let k = 0; k < n; k++)
        branch(x, y, ang + (k - (n - 1) / 2) * spread + (r() - 0.5) * 0.3, len * (0.55 + r() * 0.2), w * 0.6, depth + 1);
    }
    if (depth >= 2) clumps.push([x, y]);
  }
  branch(x0, base, -Math.PI / 2 + (r() - 0.5) * 0.25, height * 0.4, (kind === 'gum' ? 4 : 3) * scale, 0);
  const pal = kind === 'gum' ? GUM_LEAF : kind === 'jacaranda' ? JACARANDA : LEAFY;
  const size = (kind === 'gum' ? 1 : 1.35) * scale;
  for (const [cx, cy] of clumps) leafClump(p, r, cx, cy, (5 + r() * 4) * size, (3 + r() * 2) * size, pal);
}

function bush(p, r, x, base, kind) {
  if (kind === 'hedge') {
    const w = 10 + Math.floor(r() * 10), h = 5 + Math.floor(r() * 3);
    for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) {
      if ((y === 0 && (i === 0 || i === w - 1))) continue;
      p.px(x + i, base - h + y, y === 0 ? BUSH[0] : (r() < 0.25 ? BUSH[2] : BUSH[1]));
    }
    return;
  }
  const rx = 3 + r() * 3, ry = 3 + r() * 2.5;
  leafClump(p, r, x, base, rx, ry * 1.4, BUSH, true);
  if (kind === 'bottlebrush') {
    for (let k = 0; k < rx * 2; k++) {
      const bx = x + (r() - 0.5) * rx * 1.6, by = base - 2 - r() * ry * 1.1;
      p.px(bx, by, '#d42f2f'); p.px(bx, by + 1, '#a61f22');
    }
  } else if (kind === 'agapanthus') {
    for (let k = 0; k < 4; k++) p.px(x + (k - 1.5) * 2.5, base - ry * 1.4 - 2, '#7d8fe0', 2, 2);
  }
}

function fence(p, r, x, w) {
  const cols = pick(r, [['#5d6466', '#4c5254', '#737a7c'], ['#6f8a6c', '#5c7559', '#86a083'], ['#8a8578', '#77736a', '#a19c8f']]);
  const top = SUBURB_BASE - 11;
  for (let i = 0; i < w; i++) for (let y = top; y < SUBURB_BASE; y++)
    p.px(x + i, y, y === top ? cols[2] : i % 3 === 0 ? cols[1] : cols[0]);
}

function hillsHoist(p, x) {
  const top = SUBURB_BASE - 30;
  p.px(x, top, '#9da3a8', 1, 30);
  for (let i = 1; i <= 16; i++) { const dy = Math.round(i / 4); p.px(x - i, top + dy, '#b9bec2'); p.px(x + i, top + dy, '#b9bec2'); }
  p.px(x - 12, top + 4, '#d64534', 5, 5);    // shirt
  p.px(x - 5, top + 3, '#f2efe6', 4, 8);     // sheet
  p.px(x + 4, top + 3, '#3f6fc4', 4, 7);     // towel
  p.px(x + 10, top + 4, '#f1c640', 3, 4);    // tea towel
}

function house(p, r, x, w) {
  const B = SUBURB_BASE, wallH = 15 + Math.floor(r() * 4), top = B - wallH;
  const [bc, bc2, mortar] = pick(r, BRICKS);
  for (let y = top; y < B; y++) for (let i = 0; i < w; i++) {
    const row = y - top, course = Math.floor(row / 3);
    const isMortar = row % 3 === 2 || (i + (course % 2) * 2) % 5 === 4;
    p.px(x + i, y, isMortar ? mortar : ((i * 7 + course * 13) % 11 < 3 ? bc2 : bc));
  }
  p.px(x, top, 'rgba(0,0,0,0.28)', w, 1);       // shadow under the eaves

  // Garage roller door at one end
  const garageLeft = r() < 0.5, gw = 16, gx = garageLeft ? x + 3 : x + w - 3 - gw;
  for (let y = B - 11; y < B; y++) p.px(gx, y, y === B - 11 ? '#8f897d' : y % 2 ? '#d8d2c4' : '#c4bdae', gw, 1);

  // Front door, then aluminium windows along the rest of the wall
  const sx = garageLeft ? gx + gw + 4 : x + 4, ex = garageLeft ? x + w - 4 : gx - 4;
  const dx = garageLeft ? sx : ex - 6;
  p.px(dx, B - 12, '#bdb6a8', 7, 12);
  p.px(dx + 1, B - 11, pick(r, ['#7a4b2c', '#2f4a3a', '#efebe1', '#8a2f2a']), 5, 11);
  p.px(dx + 4, B - 6, '#e6c35a');
  const frame = r() < 0.5 ? '#e8e8e4' : '#b9bec2';
  let wx = garageLeft ? dx + 11 : sx, wEnd = garageLeft ? ex : dx - 5;
  while (wx + 10 <= wEnd) {
    const ww = Math.min(14, wEnd - wx), wy = top + 4;
    p.px(wx, wy, frame, ww, 7);
    for (let j = 0; j < 5; j++) p.px(wx + 1, wy + 1 + j, ['#c3dbe8', '#a9c7d9', '#8fb1c6', '#7aa0b8', '#6f94ad'][j], ww - 2, 1);
    p.px(wx + Math.floor(ww / 2), wy + 1, frame, 1, 5);
    p.px(wx + 2, wy + 3, '#e8f4fa'); p.px(wx + 3, wy + 2, '#e8f4fa');
    p.px(wx - 1, wy + 7, '#cfc8b8', ww + 2, 1);
    wx += ww + 6;
  }

  // Shallow hip roof: a low trapezoid with wide eaves
  const roof = pick(r, ROOFS), rh = 5 + Math.floor(r() * 3), run = 2.6;
  for (let j = 0; j < rh; j++) {
    const y = top - 1 - j, xl = x - 3 + Math.round(j * run), xr = x + w + 2 - Math.round(j * run);
    for (let xx = xl; xx <= xr; xx++) {
      let c;
      if (j === 0) c = roof.fascia;
      else if (j === rh - 1 || xx === xl || xx === xr) c = roof.cap;
      else if (roof.steel) c = xx & 1 ? roof.c1 : roof.c2;
      else c = j % 2 === 0 ? roof.c2 : ((xx + j) % 4 === 0 ? roof.c3 : roof.c1);
      p.px(xx, y, c);
    }
  }
  const ridge = top - rh;
  if (r() < 0.45) {                                   // solar panels
    const n = 3 + Math.floor(r() * 4), px0 = x + 9 + Math.floor(r() * Math.max(1, w - 18 - n * 5));
    for (let k = 0; k < n; k++) { p.px(px0 + k * 5, top - 4, '#27365c', 4, 3); p.px(px0 + k * 5, top - 4, '#3d5288', 4, 1); }
  }
  if (r() < 0.5) {                                    // TV aerial
    const ax = x + Math.round(w * (0.25 + r() * 0.5));
    p.px(ax, ridge - 10, '#9aa0a5', 1, 10);
    p.px(ax - 5, ridge - 10, '#9aa0a5', 11, 1);
    for (let k = 0; k < 6; k++) { const len = 5 - Math.floor(k * 0.6); p.px(ax - 5 + k * 2, ridge - 10 - Math.floor(len / 2), '#b3b9bd', 1, len); }
  }
  const roofTop = top - rh;
  if (r() < 0.2) {                                    // brick chimney
    const cx = x + Math.round(w * (0.2 + r() * 0.6));
    p.px(cx, ridge - 4, bc, 4, 5); p.px(cx - 1, ridge - 5, mortar, 6, 1);
  }
  return roofTop;
}

function letterbox(p, r, x) {
  const B = SUBURB_BASE;
  if (r() < 0.5) {                                    // brick pillar
    p.px(x, B - 8, '#a8492f', 5, 8); p.px(x - 1, B - 9, '#c9a48a', 7, 1); p.px(x + 1, B - 6, '#2a2a2a', 3, 1);
  } else {                                            // post and box
    p.px(x + 2, B - 7, '#6b5038', 1, 7); p.px(x, B - 11, '#c0392b', 5, 4); p.px(x, B - 11, '#e05a48', 5, 1);
  }
}

function buildSuburb() {
  const P = LEVEL_W * PARALLAX.suburb, p = painter(P, H, true), r = rng(2024);
  const lots = 8, lotW = P / lots;
  let movedHoist = false;
  for (let i = 0; i < lots; i++) {
    const lx = i * lotW;
    if (i === 5) {                                    // a little park
      tree(p, r, lx + 25, SUBURB_BASE, 80, 'gum');
      tree(p, r, lx + 70, SUBURB_BASE, 66, 'gum');
      tree(p, r, lx + 100, SUBURB_BASE, 52, 'leafy');
      p.px(lx + 45, SUBURB_BASE - 6, '#8a5a32', 14, 2); p.px(lx + 47, SUBURB_BASE - 4, '#6b4426', 1, 4); p.px(lx + 56, SUBURB_BASE - 4, '#6b4426', 1, 4);
      bush(p, r, lx + 85, SUBURB_BASE, 'bottlebrush');
      continue;
    }
    if (r() < 0.75) tree(p, r, lx + 10 + r() * (lotW - 20), SUBURB_BASE - 2, 50 + r() * 28, pick(r, ['gum', 'gum', 'jacaranda', 'leafy']));
    const w = 60 + Math.floor(r() * 16), hx = lx + 10 + Math.floor(r() * (lotW - w - 20));
    // A backyard Hills Hoist in some yards; any that would sit under the power line (lots 3 and 4)
    // goes to the next house along instead (lot 6, past the park)
    const hoistX = hx - lx > lotW / 2 - w / 2 ? hx - 14 : hx + w + 14;
    if (r() < 0.45) { if (i === 3 || i === 4) movedHoist = true; else hillsHoist(p, hoistX); }
    else if (i === 6 && movedHoist) hillsHoist(p, hoistX);
    fence(p, r, lx, lotW);
    HOUSES[i] = { x: hx, w, top: house(p, r, hx, w) };
    if (i === 2) {                                    // a flagpole in this front yard (the flag is drawn each frame)
      FLAG.x = hx + w + 7;
      p.px(FLAG.x, SUBURB_BASE - FLAG.pole, '#c9ced2', 1, FLAG.pole); p.px(FLAG.x + 1, SUBURB_BASE - FLAG.pole, '#8f959a', 1, FLAG.pole);
      p.px(FLAG.x - 1, SUBURB_BASE - FLAG.pole - 1, '#e0c070', 3, 1);     // the gold ball on top
    }
    letterbox(p, r, lx + 3);
    LETTERBOXES.push(lx + 5);
    for (let k = 0; k < 2 + Math.floor(r() * 3); k++)
      bush(p, r, hx + 6 + r() * (w - 12), SUBURB_BASE, pick(r, ['bush', 'bottlebrush', 'hedge', 'agapanthus']));
  }
  // One power line, strung between two houses, a little (20%) above their roofs
  const a = HOUSES[3], b = HOUSES[4], roof = Math.min(a.top, b.top), height = SUBURB_BASE - roof;
  Object.assign(WIRE, { x0: a.x + a.w + 3, x1: b.x - 4, top: Math.round(roof - height * 0.2) });
  for (const px of [WIRE.x0, WIRE.x1]) {
    p.px(px, WIRE.top, '#6b5038', 2, SUBURB_BASE - WIRE.top); p.px(px + 1, WIRE.top, '#4f3a28', 1, SUBURB_BASE - WIRE.top);
    p.px(px - 2, WIRE.top + 1, '#5a4330', 6, 1);                    // crossarm
  }
  for (let x = WIRE.x0 + 1; x < WIRE.x1; x++) p.px(x, wireY(x), '#2b2b2b');
  return { P, c: p.c };
}

// An Australian flag flying on a pole in one front yard: drawn each frame so it can ripple.
// 18 x 10 pixels: the Union Jack in the corner, the Commonwealth Star below it, the Southern Cross on the fly.
const FLAG = { x: 0, pole: 38, w: 18, h: 10 };
const LETTERBOXES = [];             // where the postie stops (front street pixels)
function flagColour(x, y) {
  const BLUE = '#012169', RED = '#e4002b', WHITE = '#ffffff';
  if (x < 9 && y < 5) {                                              // Union Jack
    if (y === 2 || x === 4) return RED;
    if (y >= 1 && y <= 3 && x >= 3 && x <= 5) return WHITE;
    if (Math.abs(x * 4 / 8 - y) < 0.6 || Math.abs((8 - x) * 4 / 8 - y) < 0.6) return (x + y) % 3 === 0 ? RED : WHITE;
    return BLUE;
  }
  const stars = [[4, 7], [3, 7], [5, 7], [4, 6], [4, 8],              // Commonwealth Star
    [13, 1], [13, 2], [11, 5], [16, 4], [13, 8], [15, 6]];             // Southern Cross
  return stars.some(([sx, sy]) => sx === x && sy === y) ? WHITE : BLUE;
}
const FLAG_TONES = [0, 0.18, -0.25].map(t => {                       // plain, lit, in shade: [x * h + y]
  const pix = [];
  for (let x = 0; x < FLAG.w; x++) for (let y = 0; y < FLAG.h; y++) pix.push(t ? mix(flagColour(x, y), t > 0 ? '#ffffff' : '#000000', Math.abs(t)) : flagColour(x, y));
  return pix;
});
function drawFlag(g) {
  const P = suburb.P, top = SUBURB_BASE - FLAG.pole + 1;
  const sx = suburbX(FLAG.x + 2);
  for (let x0 = sx - P; x0 < W + P; x0 += P) {                        // every copy across even a very wide screen
    if (x0 < -FLAG.w || x0 > W) continue;
    for (let x = 0; x < FLAG.w; x++) {
      const k = x / FLAG.w, wave = Math.sin(time * 7 - x * 0.55), dy = Math.round(wave * 1.6 * k);
      const shade = Math.cos(time * 7 - x * 0.55) * k;                 // folds catch the light or fall into shade
      const tones = FLAG_TONES[shade > 0.45 ? 1 : shade < -0.45 ? 2 : 0];
      for (let y = 0; y < FLAG.h; y++) { g.fillStyle = tones[x * FLAG.h + y]; g.fillRect(x0 + x, top + y + dy, 1, 1); }
    }
  }
}

// The back streets: smaller, simpler houses (flat brick, no fine detail) in rows that
// tier off into the distance, with fences, trees and a haze over everything
function farHouse(p, r, x, s, base) {
  const S = n => Math.max(1, Math.round(n * s));
  const w = Math.round((56 + r() * 18) * s), wallH = S(15 + r() * 3), top = base - wallH;
  const [bc, bc2, mortar] = pick(r, BRICKS);
  for (let y = top; y < base; y++) p.px(x, y, s > 0.6 && (y - top) % 3 === 2 ? mortar : bc, w, 1);
  p.px(x, top, bc2, w, 1);                                           // shadow under the eaves
  const garageLeft = r() < 0.5, gw = S(16), gx = garageLeft ? x + S(3) : x + w - S(3) - gw;
  p.px(gx, base - S(11), '#cfc9bb', gw, S(11));
  const ww = S(12), wh = S(6), wy = top + S(4);
  let wx = garageLeft ? gx + gw + S(4) : x + S(4);
  const wEnd = garageLeft ? x + w - S(3) : gx - S(3);
  while (wx + ww <= wEnd) {
    p.px(wx, wy, '#dfe3e5', ww, wh);
    if (ww > 2 && wh > 2) p.px(wx + 1, wy + 1, '#7f9fb5', ww - 2, wh - 2);
    wx += ww + S(6);
  }
  const dx = garageLeft ? gx + gw + S(2) : gx - S(8);
  p.px(dx, base - S(11), pick(r, ['#5a3a24', '#2f4a3a', '#7a2c26']), S(5), S(11));
  const roof = pick(r, ROOFS), rh = S(5 + r() * 2), eave = S(3);
  for (let j = 0; j < rh; j++) {
    const y = top - 1 - j, xl = x - eave + Math.round(j * 2.6), xr = x + w - 1 + eave - Math.round(j * 2.6);
    for (let xx = xl; xx <= xr; xx++)
      p.px(xx, y, j === 0 ? roof.fascia : j === rh - 1 ? roof.cap : roof.steel ? (xx & 1 ? roof.c1 : roof.c2) : (j % 2 ? roof.c1 : roof.c2));
  }
  if (r() < 0.4) {                                                   // TV aerial
    const ax = x + Math.round(w * (0.3 + r() * 0.4)), ah = S(8);
    p.px(ax, top - rh - ah, '#9aa0a5', 1, ah);
    p.px(ax - S(3), top - rh - ah, '#9aa0a5', S(7), 1);
  }
  return w;
}

function buildBackStreet({ f, base, scale, haze, seed }) {
  const P = LEVEL_W * f, canvasP = painter(P, H, true), r = rng(seed);
  const p = { px: (x, y, col, w, h) => canvasP.px(x, y, col[0] === '#' ? mix(col, HILL_HAZE, haze) : col, w, h) };
  // Leave a gap wherever this row could be in front of the harbour. The row scrolls faster
  // than the hills, so the gap covers every screen position (-40 to 520) the harbour passes.
  const ratio = f / PARALLAX.hills;
  const gapEnd = HARBOUR[1] * ratio + (1 - ratio) * -40, gapStart = HARBOUR[0] * ratio + (1 - ratio) * 520;
  const from = Math.ceil(gapEnd), to = Math.floor(gapStart + P);      // the street runs from the end of the gap round to its start
  for (let x = from; x < to; x++) for (let y = base; y < H; y++)       // back yards, hiding the rows behind
    p.px(x, y, dither(x, y, 0.5) ? '#78a648' : '#6c9a40');
  const fh = Math.max(2, Math.round(10 * scale));                     // a long run of back fences
  for (let x = from; x < to; x++) p.px(x, base - fh, scale > 0.6 && x % 3 === 0 ? '#5c6264' : '#6c7476', 1, fh);
  for (let k = 0, n = Math.round((to - from) / 110); k < n; k++)
    tree(p, r, from + 12 + r() * (to - from - 24), base - 1, (32 + r() * 22) * scale, pick(r, ['gum', 'gum', 'leafy', 'jacaranda']), scale);
  let x = from + r() * 10;
  while (x < to - 80 * scale) {
    const w = farHouse(p, r, Math.round(x), scale, base);
    for (let k = 0; k < 2; k++) if (r() < 0.6) leafClump(p, r, x + r() * w, base, (2 + r() * 3) * scale + 1, (2 + r() * 2) * scale + 1, BUSH, true);
    x += w + (6 + r() * 18) * scale;
  }
  return { P, c: canvasP.c, f };
}

// A big gum tree on the lawn in the foreground, well away from the Hills Hoist and the
// BOTTLE-O, in the same pixel style as the trees behind. The tops of its three clumps of
// leaves are perches the magpie can land on.
const BIG_GUM_X = 560;
const PERCHES = [];                 // { x0, x1, y } in level pixels: flat tops to land on
const TRUNK = [];                   // points up the trunk and the central branch, from the ground to the canopy
function bigGum(p, r0) {
  const r = rng(77), x0 = BIG_GUM_X, base = 166, bark = ['#f1ebdc', '#ddd3bd', '#b4a78e', '#c99a5e'];
  const pal = ['#9bb162', '#73924a', '#526e36'], clumps = [];
  // A gnarly gum: the trunk leans and bends, then forks again and again into crooked limbs
  // that wander as they go; leaves gather in clumps at the ends and along the way
  function limb(x, y, ang, len, w, depth, main) {
    for (let i = 0; i < len; i++) {
      ang += (r() - 0.5) * 0.18 + Math.sin(i * 0.25 + depth) * 0.02;   // wandering, not straight
      x += Math.cos(ang); y += Math.sin(ang);
      if (main) TRUNK.push([x, y]);                                     // the koala climbs this line: trunk, then the central branch
      const ww = Math.max(1, Math.round(w * (1 - 0.45 * i / len)));
      for (let k = 0; k < ww; k++) p.px(x - ww / 2 + k, y, k === 0 ? bark[0] : k === ww - 1 ? bark[2] : (i * 7 + k * 3) % 11 === 0 ? bark[3] : bark[1]);
      if (depth >= 2 && i > len * 0.5 && r() < 0.06) clumps.push([x, y, 5 + r() * 4, 3 + r() * 2]);   // leaves along the way
    }
    if (depth < 4) {
      const n = depth === 0 ? 3 : 2 + (r() < 0.35 ? 1 : 0);
      for (let k = 0; k < n; k++) {
        const spread = (k - (n - 1) / 2) * (0.55 + r() * 0.35);
        limb(x, y, ang + spread + (r() - 0.5) * 0.3, len * (0.55 + r() * 0.2), w * 0.62, depth + 1, main && k === (n >> 1));
      }
    } else clumps.push([x, y, 7 + r() * 5, 4 + r() * 2.5]);
  }
  for (let k = 0; k < 4; k++) p.px(x0 - 5 - k, base - k, bark[2], 2, 1), p.px(x0 + 4 + k, base - k, bark[2], 2, 1);   // roots flaring out
  limb(x0, base, -Math.PI / 2 - 0.12, 34, 9, 0, true);
  for (const [cx, cy, rx, ry] of clumps) leafClump(p, r, cx, cy, rx, ry, pal);
  // Perches: the tops of the clumps that nothing covers, so the magpie stands on the outside of the tree
  const inside = (x, y) => clumps.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1);
  for (const [cx, cy, rx, ry] of clumps) {
    if (rx < 6 || inside(cx, cy - ry - 2)) continue;
    PERCHES.push({ x0: cx - rx * 0.6, x1: cx + rx * 0.6, y: cy - ry + 1 });
  }
  for (let k = 0; k < 6; k++) bush(p, r0, x0 - 14 + k * 6, base, 'bush');     // grass and scrub round its foot
}

// ---------------------------------------------------------------------------
// Ground: mown lawn with stripes, clover and dandelions
// ---------------------------------------------------------------------------
function buildGround() {
  const P = LEVEL_W, p = painter(P, H, true), r = rng(99);
  const light = ['#7db446', '#77ad42'], dark = ['#6a9c3a', '#64953a'];
  for (let x = 0; x < P; x++) {
    const stripe = Math.sin(x / 48 * Math.PI);        // mower stripes
    const tuft = r() < 0.35 ? 1 + Math.floor(r() * 2) : 0;
    for (let y = GRASS_TOP - tuft; y < H; y++) {
      const depth = (y - GRASS_TOP) / (H - GRASS_TOP);
      const isLight = dither(x, y, (stripe + 1) / 2);
      let c = isLight ? light[depth > 0.6 ? 1 : 0] : dark[depth > 0.6 ? 1 : 0];
      if (y < GRASS_TOP) c = '#8bc252';
      else if (y === GRASS_TOP) c = '#93c95a';
      else if (r() < 0.06) c = '#5a8a32';
      p.px(x, y, c);
    }
  }
  for (let k = 0; k < 160; k++) {                     // clover and dandelions
    const x = r() * P, y = GRASS_TOP + 3 + r() * (H - GRASS_TOP - 4);
    p.px(x, y, r() < 0.7 ? '#f4f4ee' : '#f2d43a');
  }
  shopInterior(p, r);
  shopSign(p);
  bigGum(p, r);
  return { P, c: p.c };
}
