'use strict';
// ---------------------------------------------------------------------------
// Helpers: the page's canvases, maths, colours, pixel painting and the pixel font
// ---------------------------------------------------------------------------

// The page's three canvases, one on top of the other
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const back = document.getElementById('back'), bctx = back.getContext('2d');
const front = document.getElementById('front'), fctx = front.getContext('2d');
let W = SCREEN, K = 4;            // K: screen pixels per internal pixel on the smooth canvases


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function rng(seed) {
  return function () {
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const pick = (r, list) => list[Math.floor(r() * list.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mod = (a, n) => ((a % n) + n) % n;
const wrapDx = (a, b, P = LEVEL_W) => mod(a - b + P / 2, P) - P / 2;   // a - b the short way round a loop of length P
// Screen x of something on a layer that scrolls at f times the camera and repeats every P
const layerX = (x, f, P) => mod(x - Math.round(cam * f), P);
const suburbX = x => layerX(x, PARALLAX.suburb, suburb.P), hillsX = x => layerX(x, PARALLAX.hills, hills.P);
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
const dither = (x, y, t) => t * 16 > BAYER[(y & 3) * 4 + (x & 3)];
const hash = (x, y) => { const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return v - Math.floor(v); };

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

// A canvas to paint pixels on. With wrap, anything off one side comes back on the other,
// so the layer tiles seamlessly.
function painter(w, h, wrap) {
  const c = makeCanvas(w, h), g = c.getContext('2d');
  return {
    c, w, h,
    px(x, y, col, pw = 1, ph = 1) {
      x = Math.round(x); y = Math.round(y);
      g.fillStyle = col;
      if (!wrap) return g.fillRect(x, y, pw, ph);
      x = mod(x, w);
      g.fillRect(x, y, pw, ph);
      if (x + pw > w) g.fillRect(x - w, y, pw, ph);
    }
  };
}

// ---------------------------------------------------------------------------
// 3x5 pixel font: each glyph is 5 rows of 3 bits (4 = left, 2 = middle, 1 = right)
// ---------------------------------------------------------------------------
function glyphs(str, x, y, s, plot) {
  for (const ch of str) {
    const g = FONT[ch];
    if (g) for (let row = 0; row < 5; row++)
      for (let col = 0; col < 3; col++)
        if (+g[row] & (4 >> col)) plot(x + col * s, y + row * s, s);
    x += 4 * s;
  }
}
const textWidth = (str, s = 1) => str.length * 4 * s - s;
function drawText(str, x, y, col, s = 1, outline = '#18222e') {
  ctx.fillStyle = outline;
  for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1], [-1, 1], [1, -1], [-1, -1]])
    glyphs(str, x + ox, y + oy, s, (px, py, ps) => ctx.fillRect(px, py, ps, ps));
  ctx.fillStyle = col;
  glyphs(str, x, y, s, (px, py, ps) => ctx.fillRect(px, py, ps, ps));
}
const drawTextCentred = (str, y, col, s = 1) => drawText(str, Math.round((W - textWidth(str, s)) / 2), y, col, s);
