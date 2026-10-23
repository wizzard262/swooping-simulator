'use strict';
// ---------------------------------------------------------------------------
// The bottle shop on the lawn: a BOTTLE-O in Dan Murphy's green. The name is on a sign on
// posts above the roof (scenery only: the magpie flies past it).
// The interior (shelves of bottles) is part of the ground layer, behind the magpie; the
// front (sign, glass, posters) is drawn on top of him, so we see him fly through the glass.
// ---------------------------------------------------------------------------
const SHOP = { x: 1000, w: 75, roof: 112, ceil: 120, floor: 160 };
const shopSpan = x => mod(x - SHOP.x, LEVEL_W) < SHOP.w;

// Inside: back wall, lights, shelves of bottles, a glowing fridge, a tiled floor. Drawn into the ground layer.
function shopInterior(p, r) {
  const { x, w, ceil, floor } = SHOP;
  p.px(x - 6, floor, '#c9c4b8', w + 12, 6);                          // footpath in front
  p.px(x - 6, floor + 6, '#a9a499', w + 12, 1);
  p.px(x, ceil, '#d9d6cf', w, floor - ceil);                         // back wall
  for (let i = 4; i < w - 4; i += 9) p.px(x + i, ceil + 1, '#fffbe8', 5, 1);   // ceiling lights
  for (const sy of SHELVES) p.px(x + 3, sy, '#8a8a8a', w - 34, 1);  // shelves (the stock goes on in buildShelfStock)
  p.px(x + w - 28, ceil + 5, '#9fb2bd', 25, floor - ceil - 5);       // fridge
  p.px(x + w - 27, ceil + 6, '#e9f6ff', 23, floor - ceil - 7);
  for (const sy of FRIDGE_SHELVES) p.px(x + w - 27, sy, '#b8c8d2', 23, 1);
  for (let i = 0; i < w; i += 6) p.px(x + i, floor - 1, '#b9b3a6', 5, 1);   // floor tiles
}

// The sign on posts above the roof: BOTTLE-O in white on Dan Murphy's green. Part of the
// ground layer, behind the magpie.
function shopSign(p) {
  const bw = 37, bh = 11, bx = SHOP.x + Math.round(SHOP.w / 2 - bw / 2), by = SHOP.roof - 6 - bh;
  for (const dx of [-8, 6]) { p.px(SHOP.x + SHOP.w / 2 + dx, by + bh, '#8a8f94', 2, 6); p.px(SHOP.x + SHOP.w / 2 + dx + 1, by + bh, '#6d7276', 1, 6); }
  p.px(bx - 1, by - 1, DM_DARK, bw + 2, bh + 2);
  p.px(bx, by, DM_GREEN, bw, bh);
  for (let i = 3; i < bw; i += 4) p.px(bx + i, by, DM_LINE, 1, bh);
  p.px(bx, by, '#2f7a42', bw, 1);
  glyphs('BOTTLE-O', bx + 3, by + 3, 1, (x, y) => p.px(x, y, '#f4f6f1'));
}

function buildShopFront() {
  const { w, roof, ceil, floor } = SHOP, top = roof, p = painter(w, floor + 4 - top, false);
  const Y = y => y - top;                                             // canvas rows start at the roof
  p.px(0, Y(roof), DM_GREEN, w, ceil - roof);                         // green fascia, panelled
  for (let i = 0; i < w; i += 6) p.px(i, Y(roof), DM_LINE, 1, ceil - roof);
  p.px(0, Y(roof), '#2f7a42', w, 1);
  p.px(0, Y(ceil) - 1, DM_DARK, w, 1);
  // Glass: a faint tint with a few highlight pixels; white frames
  p.px(0, Y(ceil), 'rgba(80,165,235,0.45)', w, floor - ceil);        // blue glass
  const gr = rng(4);
  for (let n = 0; n < 10; n++) {                                      // little highlight streaks on the glass
    const gx = 4 + gr() * (w - 14), gy = 7 + gr() * (floor - ceil - 18), len = 2 + Math.floor(gr() * 4);
    for (let k = 0; k < len; k++) p.px(gx + k, Y(ceil) + gy + len - k, 'rgba(255,255,255,0.8)');
    if (gr() < 0.6) for (let k = 0; k < len - 1; k++) p.px(gx + k + 3, Y(ceil) + gy + len + 4 - k, 'rgba(255,255,255,0.5)');
  }
  for (let n = 0; n < 12; n++) p.px(3 + gr() * (w - 6), Y(ceil) + 6 + gr() * (floor - ceil - 9), 'rgba(235,250,255,0.7)');   // specks
  for (let i = 0; i <= w; i += 25) p.px(Math.min(i, w - 1), Y(ceil), '#e6e8e6', 1, floor - ceil);
  p.px(0, Y(ceil) + 5, '#e6e8e6', w, 1);                             // transom
  for (const px0 of [3, w - 15]) {                                    // lime "direct to boot" posters
    p.px(px0, Y(ceil) + 14, LIME, 12, 23);
    p.px(px0 + 2, Y(ceil) + 18, DM_DARK, 6, 2); p.px(px0 + 2, Y(ceil) + 22, DM_DARK, 8, 2); p.px(px0 + 2, Y(ceil) + 26, DM_DARK, 5, 2);
    for (let k = 0; k < 5; k++) p.px(px0 + 8 + (k < 3 ? k : 4 - k), Y(ceil) + 30 + k, DM_DARK);   // arrow
  }
  p.px(0, Y(roof), DM_DARK, 3, floor - roof);                         // corner pillars
  p.px(w - 3, Y(roof), DM_DARK, 3, floor - roof);
  p.px(0, Y(floor) - 3, '#d5d7d2', w, 3);                             // kick plate
  p.px(Math.round(w * 0.55), Y(ceil) - 2, '#9aa0a2', w - Math.round(w * 0.55), 3);   // awning
  p.px(Math.round(w * 0.55), Y(ceil) + 1, 'rgba(0,0,0,0.15)', w - Math.round(w * 0.55), 2);
  return { c: p.c, top };
}

const lootSprites = {};
for (const [name, art] of Object.entries(LOOT_ART)) {
  const c = makeCanvas(art.rows[0].length, art.rows.length), g = c.getContext('2d');
  art.rows.forEach((row, y) => [...row].forEach((ch, x) => { if (art.pal[ch]) { g.fillStyle = art.pal[ch]; g.fillRect(x, y, 1, 1); } }));
  lootSprites[name] = c;
}

const loot = [], bubbles = [];
const DRUNK_TIME = 10, ROLL_TIME = 0.55, LOOT_TIME = 4;

// Out the other side: GROG RUN!, bottles and cans tumble out of the door and the magpie goes wobbly.
// If he barrel-rolled while inside, two beer barrels come bouncing out instead.
function leaveShop(exitRight) {
  award(150); say('GROG RUN!');
  const ex = SHOP.x + (exitRight ? SHOP.w + 2 : -2), dir = exitRight ? 1 : -1;
  bird.drunk = DRUNK_TIME;
  if (bird.beerRoll) {
    bird.beerRoll = false;
    for (let i = 0; i < 2; i++) {
      setTimeout(() => Sound.can(0.6), i * 220);
      const vx = dir * (45 + i * 30);
      loot.push({ type: 'barrel', x: ex, y: 150, vx, vy: -90 - i * 25, rot: 0, vr: vx / 5, rest: 163 + i * 2, life: LOOT_TIME + 1.5, bounce: 0.55 });
    }
    return;
  }
  for (let i = 0; i < 9; i++) {
    const type = i % 3 ? 'can' : 'bottle';
    setTimeout(() => Sound.can(), i * 70 + Math.random() * 40);    // cans clanging on the way out
    loot.push({ type, x: ex, y: 146 + Math.random() * 10, vx: dir * (30 + Math.random() * 70), vy: -40 - Math.random() * 60,
      rot: Math.random() * 6, vr: (Math.random() - 0.5) * 14, rest: 162 + Math.random() * 6, life: LOOT_TIME });
  }
}

function updateShopAndDrunk(dt) {
  for (const l of loot) {
    l.life -= dt;
    if (l.y < l.rest || l.vy < 0) {
      l.vy += 320 * dt; l.x += l.vx * dt; l.y += l.vy * dt; l.rot += l.vr * dt;
      if (l.y >= l.rest && l.vy > 0) {
        if (!l.landed || l.bounce) { l.landed = true; Sound.can(l.bounce ? 0.35 : 0.5); }
        l.y = l.rest;
        if (l.bounce) { l.vy = Math.abs(l.vy) > 25 ? -l.vy * l.bounce : 0; l.vx *= 0.8; l.vr = l.vx / 5; }   // barrels: bouncing, then rolling along
        else { l.vy = Math.abs(l.vy) > 40 ? -l.vy * 0.3 : 0; l.vx *= 0.5; l.vr *= 0.5; }
      }
    } else if (l.bounce) { l.x += l.vx * dt; l.rot += l.vr * dt; l.vx *= Math.exp(-0.8 * dt); l.vr = l.vx / 5; }   // rolling on the lawn
  }
  for (let i = loot.length - 1; i >= 0; i--) if (loot[i].life <= 0) loot.splice(i, 1);

  bird.roll = Math.max(0, bird.roll - dt);
  if (bird.drunk > 0) {
    bird.drunk = Math.max(0, bird.drunk - dt);
    if (!bird.grounded) {                                             // erratic flight
      bird.vx += (Math.sin(time * 2.3) * 140 + (Math.random() - 0.5) * 500) * dt;
      bird.vy += (Math.cos(time * 3.7) * 180 + (Math.random() - 0.5) * 500) * dt;
    }
    if (Math.random() < dt * 9)
      bubbles.push({ x: bird.x + bird.face * 7, y: bird.y - 5, vy: -14 - Math.random() * 14, r: 0.7 + Math.random() * 0.9, phase: Math.random() * 6, life: 1.6 });
  }
  for (const b of bubbles) { b.life -= dt; b.y += b.vy * dt; b.x += Math.sin(time * 5 + b.phase) * 6 * dt; }
  for (let i = bubbles.length - 1; i >= 0; i--) if (bubbles[i].life <= 0) bubbles.splice(i, 1);
}

function drawLootAndBubbles(g) {
  g.imageSmoothingEnabled = false;
  for (const l of loot) {
    const img = lootSprites[l.type];
    g.globalAlpha = Math.min(1, l.life / 1.5);
    g.setTransform(K, 0, 0, K, loopX(l.x) * K, l.y * K);
    g.rotate(l.rot);
    g.drawImage(img, -img.width / 2, -img.height / 2);
  }
  g.globalAlpha = 1;
  for (const b of bubbles) {
    g.setTransform(K, 0, 0, K, loopX(b.x) * K, b.y * K);
    g.globalAlpha = Math.min(1, b.life / 0.6);
    g.beginPath(); g.arc(0, 0, b.r, 0, Math.PI * 2);
    g.fillStyle = 'rgba(220,240,255,0.25)'; g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 0.22; g.stroke();
    g.beginPath(); g.arc(-b.r * 0.35, -b.r * 0.35, b.r * 0.25, 0, Math.PI * 2); g.fillStyle = '#ffffff'; g.fill();
  }
  g.globalAlpha = 1;
  g.setTransform(1, 0, 0, 1, 0, 0);
}

// The shelf stock: rows of the bottle and can sprites at half size (half a scenery pixel each),
// built once at 4x and drawn on the smooth canvas under the magpie and the glass
const STOCK_RES = 4;
function buildShelfStock() {
  const { w, ceil, floor } = SHOP, c = makeCanvas(w * STOCK_RES, (floor - ceil) * STOCK_RES), g = c.getContext('2d'), r = rng(8);
  g.imageSmoothingEnabled = false;
  const put = (type, x, shelfY) => {
    const img = lootSprites[type], sw = img.width * STOCK_RES / 2, sh = img.height * STOCK_RES / 2;
    g.drawImage(img, Math.round(x * STOCK_RES), Math.round((shelfY - ceil) * STOCK_RES - sh), sw, sh);
  };
  for (const sy of SHELVES) for (let x = 4; x < w - 33; x += 2.5) put(r() < 0.7 ? 'bottle' : 'can', x, sy);
  for (const sy of FRIDGE_SHELVES) for (let x = w - 26; x < w - 6; x += 2.5) put('can', x, sy);
  return c;
}

// Crisp pixels: no soft, see-through edge pixels, so the pixelated magpie has a sharp outline
// rather than a fuzzy one. Works on a box of +-r pixels round (cx, cy).
function crispen(g, cx, cy, r) {
  const x0 = Math.max(0, Math.round(cx - r)), y0 = Math.max(0, Math.round(cy - r));
  const w = Math.min(g.canvas.width - x0, 2 * r), h = Math.min(g.canvas.height - y0, 2 * r);
  if (w <= 0 || h <= 0) return;
  g.setTransform(1, 0, 0, 1, 0, 0);
  const img = g.getImageData(x0, y0, w, h), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 110) { d[i + 3] = 0; continue; }
    d[i + 3] = 255;
  }
  g.putImageData(img, x0, y0);
}

// Draw a picture on the smooth canvas, smeared along the flight in a swoop like the scenery
function drawSmeared(g, img, x, y, w, h) {
  g.imageSmoothingEnabled = false;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(img, Math.round(x * K), Math.round(y * K), w * K, h * K);
  if (blur > 0.02) {
    const v = Math.hypot(bird.vx, bird.vy) || 1, step = 2.2 * blur;
    for (let i = 1; i <= 7; i++) {
      g.globalAlpha = 1 / (i + 1);
      g.drawImage(img, Math.round((x + bird.vx / v * step * i) * K), Math.round((y + bird.vy / v * step * i) * K), w * K, h * K);
    }
    g.globalAlpha = 1;
  }
}

function drawShelfStock(g) {
  drawSmeared(g, shelfStock, loopX(SHOP.x), SHOP.ceil, SHOP.w, SHOP.floor - SHOP.ceil);
}

// Pop-art captions (SWOOP-AND-POOP!, COOKED, MATE! and the rest): tilted red comic lettering in the
// Roy Lichtenstein style, with a black outline and an offset shadow. Each grows from nothing while it
// fades out over about a second, staying put where the magpie was (or travelling above him, flashing).
function drawCombo(g) {
  captions.forEach((c, i) => {
    const age = c.len - c.t, pop = 1.2 * Math.sqrt(Math.min(1, age / COMBO_TIME)) * 0.35;   // 30% smaller than it was
    const { x, y } = c.follow ? comboSpot() : c.at, flash = c.follow && Math.floor(time * 10) % 2;
    const stack = (i - (captions.length - 1) / 2) * 13 * (y < bird.y ? 1 : -1);   // two or more at once: one under the other
    drawPopText(g, c.text, x, y + stack, pop, Math.max(0, 1 - (age / c.len) ** 2), flash ? '#ffffff' : '#e8232a');
  });
}
// Pop-art lettering centred on (cx, cy) in game pixels, at scale (1: letters about 19 game pixels high)
function drawPopText(g, text, cx, cy, scale, alpha = 1, fill = '#e8232a') {
  g.save();
  g.setTransform(K * scale, 0, 0, K * scale, cx * K, cy * K);
  g.rotate(-0.12);
  g.globalAlpha = alpha;
  g.font = 'italic 900 19px Impact, "Arial Black", sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineJoin = 'round';                                            // rounded outline corners: sharp ones stuck out as little spikes
  g.lineWidth = 5; g.strokeStyle = '#111';
  g.fillStyle = '#111'; g.fillText(text, 2.2, 2.6);                // offset shadow
  g.strokeText(text, 0, 0);
  g.fillStyle = fill; g.fillText(text, 0, 0);
  g.lineWidth = 0.8; g.strokeStyle = '#fff4a0'; g.strokeText(text, -0.6, -0.6);   // a thin light edge on the letters
  g.restore();
}

function drawShopFront(g) {
  drawSmeared(g, shopFront.c, loopX(SHOP.x), shopFront.top, shopFront.c.width, shopFront.c.height);
}
