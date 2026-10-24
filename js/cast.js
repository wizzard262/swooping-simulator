'use strict';
// ---------------------------------------------------------------------------
// The cast: the Hills Hoist, the kangaroo, the koala, the kookaburra, the bloke at his barbie and his
// snags, the nest, the postie, the ferry, the shark, the possum, the cyclist, the drop bear, the
// cockatoos, the storms, the bridge climbers, and the score
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// The Hills Hoist on the lawn, well away from the shop: a rotary clothesline with washing on it. The
// magpie can land on top; then it spins round with him riding on it. Drawn as pixel art each
// frame (it turns), seen from the side: four arms on a mast, lines strung between them.
// ---------------------------------------------------------------------------
const HOIST = { x: 90 - 3 * 60 + LEVEL_W, r: 30,   // three of its widths left of where it was (the level loops)
  mastTop: 113, top: 115, spin: 0, angle: 0.4, creakIn: 0 };
const HANG_Y = 9;                       // hanging upside down under it by his feet: how far below the top his middle is
for (const w of WASHING) w.dull = mix(w.col, '#7d8a96', 0.3);   // each piece's colour on the far side, a little duller
const hoistDx = x => wrapDx(x, HOIST.x);   // how far from the mast, allowing for the loop

const HOIST_WHIRL = 10;            // how fast a swoop past sends it spinning (radians a second)
function updateHoist(dt) {
  // Swoop past it and it whirls round the way you went, the washing flung outwards, then slowly winds down
  if (bird.swooping && !bird.onHoist && !bird.hanging && Math.abs(hoistDx(bird.x)) < HOIST.r && bird.y > HOIST.mastTop - 20 && bird.y < LAND_Y - 5
      && Math.abs(HOIST.spin) < HOIST_WHIRL * 0.8) {
    HOIST.spin = -Math.sign(bird.vx || bird.face) * HOIST_WHIRL;
    showCombo('WHIPPER-SNIPPER!', true);                             // +200, the words travelling along above him, flashing
  }
  const riding = bird.onHoist || bird.hanging, target = riding ? 2.6 : 0;   // spins up with him on it (or under it), slows down without
  HOIST.spin += (target - HOIST.spin) * Math.min(1, (riding ? 1.2 : 0.5) * dt);
  HOIST.angle += HOIST.spin * dt;
  // Rusty: it creaks like an old gate every half turn while it's going round, if it's on screen
  if ((HOIST.creakIn -= Math.abs(HOIST.spin) * dt) <= 0) {
    HOIST.creakIn = Math.PI;
    const hx = loopX(HOIST.x);
    if (Math.abs(HOIST.spin) > 0.3 && hx > -HOIST.r - 20 && hx < W + HOIST.r + 20) Sound.creak(Math.min(1, Math.abs(HOIST.spin) / HOIST_WHIRL));
  }
}

function drawHoist(g) {
  const hx = Math.round(loopX(HOIST.x));
  if (hx < -HOIST.r - 10 || hx > W + HOIST.r + 10) return;
  const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
  const line = (x0, y0, x1, y1, c) => {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) px(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, 1, 1, c);
  };
  // Points on an arm: side view of a horizontal circle, plus a little droop towards the tips
  const pt = (k, frac) => {
    const a = HOIST.angle + k * Math.PI / 2;
    return { x: hx + Math.cos(a) * HOIST.r * frac, y: HOIST.mastTop + 1 + frac * 3 + Math.sin(a) * frac * 2, z: Math.sin(a), u: Math.cos(a) };
  };
  px(hx, HOIST.mastTop, 1, LAND_Y - HOIST.mastTop, '#9da3a8');       // mast
  px(hx + 1, HOIST.mastTop, 1, LAND_Y - HOIST.mastTop, '#7d8388');
  // Washing at the back first, then lines and arms, then washing at the front
  const clothes = WASHING.map(({ side, li, along, kind, col, dull }) => {
    const a = pt(side, HOIST_LINES[li]), b = pt((side + 1) % 4, HOIST_LINES[li]);
    const u = a.u + (b.u - a.u) * along, z = a.z + (b.z - a.z) * along, n = Math.hypot(u, z) || 1;
    return { x: a.x + (b.x - a.x) * along, y: a.y + (b.y - a.y) * along, z, ux: u / n, uz: z / n, kind, col: z < 0 ? dull : col };   // ux, uz: straight out from the mast
  });
  // Spinning fast, the washing swings out from the mast (centrifugal force), up to nearly flat out
  const fling = Math.min(1, (HOIST.spin / 7) ** 2) * 1.15, out = Math.sin(fling), down = Math.cos(fling);
  const drawCloth = c => {
    const col = c.col, [w, h] = CLOTH_SIZE[c.kind];
    for (let i = 0; i < h; i++) {                                    // row by row from the pegs, swung outwards
      const x = c.x - w / 2 + i * out * c.ux, y = c.y + 1 + i * down - i * out * c.uz * 0.15;
      px(x, y, w, 1, col);
      if (c.kind === 'shirt' && i < 2) { px(x - 1, y, 1, 1, col); px(x + w, y, 1, 1, col); }   // sleeves
    }
    px(c.x - 1, c.y, 1, 1, '#e0c070'); px(c.x + 1, c.y, 1, 1, '#e0c070');   // pegs
  };
  clothes.filter(c => c.z < 0).forEach(drawCloth);
  for (let k = 0; k < 4; k++) {
    for (const frac of HOIST_LINES) { const a = pt(k, frac), b = pt((k + 1) % 4, frac); line(a.x, a.y, b.x, b.y, '#d6dadc'); }
  }
  for (let k = 0; k < 4; k++) { const tip = pt(k, 1); line(hx, HOIST.mastTop, tip.x, tip.y, tip.z < 0 ? '#9aa0a5' : '#c4c9cd'); }
  clothes.filter(c => c.z >= 0).forEach(drawCloth);
}

// ---------------------------------------------------------------------------
// A kangaroo in a cork hat, hopping along the front of the lawn, drawn the same way as the
// magpie (smooth, then slightly pixelated). Units: about 70 high; origin at his feet, facing
// right, +y down. Swoop into him or poop on him and he falls over, dizzy, with stars going
// round his head for 5 seconds. The magpie can land on his back and ride along.
// ---------------------------------------------------------------------------
const ROO = { x: 700, dir: -1, phase: 0, dizzy: 0, ground: 168, scale: 0.32, back: 20 };
const ROO_HOP_TIME = 0.75, ROO_HOP_LEN = 34, ROO_DIZZY_TIME = 5;
const rooDx = x => wrapDx(x, ROO.x);   // how far from him, allowing for the loop

function updateRoo(dt) {
  if (ROO.dizzy > 0) { ROO.dizzy = Math.max(0, ROO.dizzy - dt); ROO.phase = 0; return; }
  ROO.phase = (ROO.phase + dt / ROO_HOP_TIME) % 1;
  const air = ROO.phase > 0.15 && ROO.phase < 0.85;
  if (air) ROO.x = mod(ROO.x + ROO.dir * ROO_HOP_LEN * dt / (ROO_HOP_TIME * 0.7), LEVEL_W);
}
function rooHeight() {                                               // how high off the ground he is, in internal pixels
  const p = ROO.phase;
  return ROO.dizzy > 0 ? 0 : p > 0.15 && p < 0.85 ? Math.sin(Math.PI * (p - 0.15) / 0.7) * 16 : 0;
}
const rooTop = () => ROO.ground - ROO.back - rooHeight();             // his back, where the magpie can sit
function knockOver(caption = 'ROO THE DAY!') {                      // swooped (ROO THE DAY!) or pooped on (KANGA-POO!)
  if (ROO.dizzy > 0) return;
  ROO.dizzy = ROO_DIZZY_TIME;
  award(100, ROO.x, ROO.ground - 20); say(caption);
  Sound.boing();
  if (bird.onRoo) { bird.onRoo = false; bird.grounded = false; bird.vy = -40; }   // thrown off
}
const ROO_TARGET = {                                                 // a poop target (added to TARGETS at start-up)
  get x() { return ROO.x - 8; }, get y() { return ROO.ground - 24 - rooHeight(); }, w: 16, h: 24,
  hit: () => knockOver('KANGA-POO!')
};

// Dizzy stars: little yellow stars going round in a ring
function dizzyStars(g, cx, cy) {
  for (let k = 0; k < 4; k++) {
    const a = time * 4 + k * Math.PI / 2, x = cx + Math.cos(a) * 14, y = cy + Math.sin(a) * 4.5;
    g.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 2 : 5, t = i * Math.PI / 5 - Math.PI / 2 + time * 3; g.lineTo(x + Math.cos(t) * r, y + Math.sin(t) * r); }
    g.closePath(); g.fillStyle = Math.sin(a) > 0 ? '#ffe14a' : '#e8b820'; g.fill();
  }
}

function drawKangaroo(g) {
  if (ROO.dizzy > 0) {                                               // flat on his back, legs in the air, seeing stars
    g.save(); g.translate(18, -4); g.rotate(-Math.PI / 2 * 0.92);
    drawRooBody(g, 0, 0, 0.6);
    g.restore();
    dizzyStars(g, -32, -40);
    return;
  }
  const p = ROO.phase, air = p > 0.15 && p < 0.85, crouch = air ? 0 : 1 - (p < 0.15 ? p : 1 - p) / 0.15;
  const ext = air ? Math.sin(Math.PI * (p - 0.15) / 0.7) : 0;          // legs stretch out in the air
  drawRooBody(g, crouch, ext, Math.sin(p * Math.PI * 2) * 0.5 + ext * 0.4);
}

function drawRooBody(g, crouch, ext, swing) {
  const fur = '#b5653a', dark = '#8a4a28', belly = '#e6bd8e', black = '#1a1310';
  const { fill } = brush(g);
  g.save();
  g.translate(0, crouch * 4);                                         // squats a little before and after each hop
  // tail: thick at the hips, tapering back to the ground (lifted in the air)
  fill(dark, () => {
    g.moveTo(-6, -24); g.quadraticCurveTo(-30, -16 - ext * 6, -46, -3 - ext * 10);
    g.lineTo(-44, 1 - ext * 10); g.quadraticCurveTo(-28, -8 - ext * 4, -4, -14);
  });
  // big hind leg: thigh, then the long foot (flat on the ground, pointing back and down in the air)
  fill(fur, () => g.ellipse(-2, -18, 13, 9, -0.5, 0, Math.PI * 2));
  g.save(); g.translate(-6, -6); g.rotate(ext * 0.9);
  fill(dark, () => { g.moveTo(-4, -4); g.lineTo(18, 2); g.lineTo(18, 6); g.lineTo(-6, 4); });
  g.restore();
  // body leaning forward, pale belly, small arms
  fill(fur, () => g.ellipse(6, -32, 11, 18, 0.4 - ext * 0.2, 0, Math.PI * 2));
  fill(belly, () => g.ellipse(11, -30, 6, 13, 0.4 - ext * 0.2, 0, Math.PI * 2));
  g.strokeStyle = dark; g.lineWidth = 3; g.lineCap = 'round';
  g.beginPath(); g.moveTo(14, -40); g.lineTo(19 + ext * 3, -33 + ext * 2); g.stroke();
  // head, snout, nose, eye
  fill(fur, () => g.ellipse(15, -51, 7.5, 6, 0.2, 0, Math.PI * 2));
  fill(fur, () => { g.moveTo(17, -55); g.quadraticCurveTo(28, -52, 27, -47); g.quadraticCurveTo(22, -44, 14, -46); });
  fill(black, () => g.ellipse(26.5, -48.5, 1.6, 1.3, 0, 0, Math.PI * 2));
  fill(black, () => g.arc(18, -52.5, 1.3, 0, Math.PI * 2));
  fill('#fff', () => g.arc(17.6, -53, 0.45, 0, Math.PI * 2));
  // cork hat: brim and crown, corks dangling on strings and swinging as he hops
  g.strokeStyle = '#3b2a1a'; g.lineWidth = 1.4;
  for (const bx of [2, 8, 14, 20, 25]) {
    const len = 5 + (bx % 2) * 2, cx = bx + Math.sin(swing + bx) * 2.5, cy = -57 + len;
    g.beginPath(); g.moveTo(bx, -57); g.lineTo(cx, cy); g.stroke();
    fill('#d8b57a', () => g.rect(cx - 2, cy, 4, 5.5));                 // a cork
    fill('#a6834e', () => g.rect(cx - 2, cy + 4, 4, 1.5));
  }
  fill('#7a5530', () => g.ellipse(13, -57, 12, 2.4, 0, 0, Math.PI * 2));   // brim
  fill('#8d643b', () => { g.moveTo(7, -57); g.quadraticCurveTo(7, -64, 13, -64.5); g.quadraticCurveTo(19, -64, 19, -57); });
  fill('#5a3d22', () => g.rect(7, -59, 12, 1.6));                        // hat band
  // ears poking up through the hat
  fill(fur, () => g.ellipse(9.5, -66, 2.4, 6, -0.25, 0, Math.PI * 2));
  fill(fur, () => g.ellipse(15.5, -67, 2.4, 6, 0.15, 0, Math.PI * 2));
  fill(belly, () => g.ellipse(15.6, -67, 1.1, 4, 0.15, 0, Math.PI * 2));
  g.restore();
}

// ---------------------------------------------------------------------------
// The supporting cast: a koala climbing the big gum, a kookaburra on top of it, a bloke at his
// barbecue, the postie on his motorbike along the front street, and a shark fin in the harbour.
// The animals and the bloke are drawn like the magpie (smooth, then slightly pixelated).
// ---------------------------------------------------------------------------
const KOALA = { u: 0.3, target: 0.6, wait: 0, step: 0 };
const KOOKA = { x: 0, y: 0, state: 'perched', t: 0, fx: 0, fy: 0, vy: 0, rot: 0, callIn: 40, calling: 0 };
const KOOKA_CALL_TIME = 2.8;      // his laugh; rarely (every 1 to 2 minutes of him being on screen), and never off screen
const KOOKA_SCALE = 0.6;          // a big kookaburra (twice the size he was)
const BBQ_SCALE = 0.48;
const BBQ_WIDE = 1.6;              // twice as wide as it was
// The barbie stands on the lawn between the BOTTLE-O (x 1000 to 1075) and the Hills Hoist (x 1830)
const BBQ = { x: 1450, top: Math.round(166 - 32 * BBQ_SCALE), half: 17 * BBQ_SCALE * BBQ_WIDE, flipT: 0, flipIn: 2 };
// Every 4 seconds the bloke flips a snag high in the air (up to half the screen's height), spinning;
// the magpie can catch it in his beak and take it to the nest of chicks at the top of the big gum
const SNAG = { in: 4, air: false, x: 0, y: 0, vy: 0, rot: 0 }, SNAG_EVERY = 4, SNAG_GRAVITY = 300;
const NEST = { x: 0, y: 0, fed: 0, beg: 0, cheepIn: 0 };
const POSTIE = { x: 40, dir: 1, stop: 0, last: -1, wheel: 0, down: 0 };   // down: knocked off, then picking his bike up
// Knocked off, a 4-second sequence: he somersaults off over the handlebars in slow motion, arms and
// legs flailing, and lands on his feet; stands there dazed, walks back to the bike, then hauls it
// upright and rides off the other way
const POSTIE_DOWN = 4, POSTIE_FLY = 1.7, POSTIE_DAZED = 0.4, POSTIE_LIFT = 0.8, POSTIE_LAND = 14;
const SHARK = { in: 8, t: 0, x: 0, dir: 1, sink: 0 }, SHARK_TIME = 9, SHARK_SINK = 0.6;   // sink: swooped, diving out of sight
const smoke = [];
const bbqDx = x => wrapDx(x, BBQ.x), kookaDx = x => wrapDx(x, KOOKA.x);
const KOOKA_TARGET = {               // a poop target while he's up the tree
  get x() { return KOOKA.x - 14; }, get y() { return KOOKA.state === 'perched' ? KOOKA.y - 20 : -999; }, w: 28, h: 22,
  hit: knockKooka
};
function knockKooka() {
  if (KOOKA.state !== 'perched') return;
  Object.assign(KOOKA, { state: 'falling', t: 0, fx: KOOKA.x, fy: KOOKA.y, vy: -40, rot: 0 });
  award(100, KOOKA.x, KOOKA.y); say('KOOKA-BOOM-A!');
  Sound.boing();
}
const BBQ_TARGET = {                 // poop on the hot plate: it sizzles
  get x() { return BBQ.x - BBQ.half; }, y: BBQ.top - 3, w: 2 * BBQ.half, h: 6,
  hit() {
    Sound.sizzle(); award(30, BBQ.x, BBQ.top); say('BARBIE-POO!');
    for (let i = 0; i < 10; i++) smoke.push({ x: BBQ.x + (Math.random() - 0.5) * 2 * BBQ.half, y: BBQ.top - 2, life: 1.2, r: 1.5 + Math.random() * 1.5, bbq: true });
  }
};
function setUpCast() {
  TARGETS.push(BBQ_TARGET, CYCLIST_TARGET);
  const top = PERCHES.reduce((a, b) => b.y < a.y ? b : a);            // the kookaburra sits on the highest perch
  KOOKA.x = (top.x0 + top.x1) / 2; KOOKA.y = top.y;
  const nest = PERCHES.filter(pc => Math.abs((pc.x0 + pc.x1) / 2 - KOOKA.x) > 14).reduce((a, b) => b.y < a.y ? b : a);   // the nest: next highest, clear of him
  NEST.x = (nest.x0 + nest.x1) / 2; NEST.y = nest.y;
  TARGETS.push(KOOKA_TARGET);
}

function updateCast(dt) {
  updateFerry(dt);
  updateClimbers(dt);
  updateMore(dt);
  // Koala: climbs a little way up or down the trunk, has a rest, climbs again
  if (KOALA.wait > 0) KOALA.wait -= dt;
  else {
    const d = KOALA.target - KOALA.u, sp = 0.07 * dt;
    if (Math.abs(d) <= sp) { KOALA.u = KOALA.target; KOALA.wait = 1.5 + Math.random() * 3; KOALA.target = 0.05 + Math.random() * 0.9; }
    else { KOALA.u += Math.sign(d) * sp; KOALA.step += dt * 6; }
  }
  // Kookaburra: knocked off, he tumbles to the ground spinning, sees stars, then flies back up
  if (bird.swooping && KOOKA.state === 'perched' && Math.abs(kookaDx(bird.x)) < 13 && Math.abs(bird.y - (KOOKA.y - 10)) < 14) knockKooka();
  KOOKA.t += dt;
  KOOKA.calling = Math.max(0, KOOKA.calling - dt);
  const kx = loopX(KOOKA.x), kookaSeen = kx > 20 && kx < W - 20;
  if (KOOKA.state === 'perched' && kookaSeen && (KOOKA.callIn -= dt) <= 0) {   // laughs now and then while you can see him
    KOOKA.callIn = 60 + Math.random() * 60; KOOKA.calling = KOOKA_CALL_TIME; Sound.laugh();
  }
  if (KOOKA.calling > 0 && (kx < 0 || kx > W)) { KOOKA.calling = 0; Sound.hushLaugh(); }   // the moment he's off screen, the laugh stops
  if (KOOKA.state === 'falling') {
    KOOKA.vy += 300 * dt; KOOKA.fy += KOOKA.vy * dt; KOOKA.fx += 12 * dt; KOOKA.rot += 9 * dt;
    if (KOOKA.fy >= LAND_Y + 4) { KOOKA.fy = LAND_Y + 4; KOOKA.state = 'stunned'; KOOKA.t = 0; }
  } else if (KOOKA.state === 'stunned' && KOOKA.t > 3.5) { KOOKA.state = 'flying'; KOOKA.t = 0; KOOKA.sx = KOOKA.fx; KOOKA.sy = KOOKA.fy; }
  else if (KOOKA.state === 'flying') {
    const k = Math.min(1, KOOKA.t / 1.4), e = k * k * (3 - 2 * k);
    KOOKA.fx = KOOKA.sx + (KOOKA.x - KOOKA.sx) * e; KOOKA.fy = KOOKA.sy + (KOOKA.y - KOOKA.sy) * e - Math.sin(k * Math.PI) * 20;
    if (k >= 1) { KOOKA.state = 'perched'; if (kookaSeen) { KOOKA.calling = KOOKA_CALL_TIME; Sound.laugh(); } }   // back on his branch: laughs, if you can see him
  }
  // The snag: tossed every 4 seconds whatever happens, spinning up and back down onto the hot plate
  if ((SNAG.in -= dt) <= 0) {
    Object.assign(SNAG, { in: SNAG_EVERY, air: true, x: BBQ.x - 4, y: BBQ.top - 2, vy: -Math.sqrt(2 * SNAG_GRAVITY * (BBQ.top - 2 - H * 0.5)), rot: 0 });
    BBQ.flipT = 0.7;                                                  // the bloke flicks it up with his tongs
  }
  if (SNAG.air) {
    SNAG.vy += SNAG_GRAVITY * dt; SNAG.y += SNAG.vy * dt; SNAG.rot += 9 * dt;
    if (SNAG.vy > 0 && SNAG.y >= BBQ.top - 2) SNAG.air = false;       // back on the barbie
    const bx = bird.x + bird.face * 9, by = bird.y - 3;               // his beak
    if (!bird.snag && !bird.swooping && !bird.flung && bird.onBack <= 0 && Math.abs(wrapDx(SNAG.x, bx)) < 8 && Math.abs(SNAG.y - by) < 8) {
      SNAG.air = false; bird.snag = true; showCombo('SNAG-A-SNAG!', false, 100);
    }
  }
  // The nest: the chicks beg when he comes near with a snag, and he feeds them if he gets right up to it
  NEST.fed = Math.max(0, NEST.fed - dt);
  const nestDx = Math.abs(wrapDx(bird.x, NEST.x)), nestDy = bird.y + FEET - NEST.y;
  NEST.beg = bird.snag && nestDx < 40 && Math.abs(nestDy) < 40 ? 1 : 0;
  if (NEST.beg && (NEST.cheepIn -= dt) <= 0) { NEST.cheepIn = 0.9; Sound.cheep(); }
  if (bird.snag && nestDx < 10 && nestDy > -14 && nestDy < 6) {
    bird.snag = false; NEST.fed = 3; Sound.cheep(); showCombo('BREKKIE!', false, 200);
  }
  // Barbecue: every few seconds he flips a burger
  BBQ.flipIn -= dt;
  if (BBQ.flipIn <= 0 && BBQ.flipT <= 0) { BBQ.flipT = 0.7; BBQ.flipIn = 2 + Math.random() * 2; }
  BBQ.flipT = Math.max(0, BBQ.flipT - dt);
  if (Math.random() < dt * 6) smoke.push({ x: BBQ.x + (Math.random() - 0.5) * 2 * BBQ.half, y: BBQ.top - 1, life: 1.6, r: 1 + Math.random() * 1.5, bbq: true });
  for (const p of smoke) { p.life -= dt; p.y -= 12 * dt; p.x += Math.sin(time * 2 + p.y) * 3 * dt; p.r += dt * 1.5; }
  for (let i = smoke.length - 1; i >= 0; i--) if (smoke[i].life <= 0) smoke.splice(i, 1);
  // Postie: rides along the front street, stopping briefly at some letterboxes. Poop on him and
  // he's knocked off sideways; he gets up, picks up his bike and rides off the other way.
  if (POSTIE.down > 0) {
    POSTIE.down = Math.max(0, POSTIE.down - dt);
    if (POSTIE.down === 0) POSTIE.dir *= -1;
  } else if (POSTIE.stop > 0) POSTIE.stop -= dt;
  else {
    POSTIE.x = mod(POSTIE.x + POSTIE.dir * 32 * dt, suburb.P); POSTIE.wheel += dt * 12;
    const box = LETTERBOXES.findIndex(b => Math.abs(b - POSTIE.x) < 0.6);
    if (box >= 0 && box !== POSTIE.last) { POSTIE.last = box; if (Math.random() < 0.6) POSTIE.stop = 1.2 + Math.random() * 1.3; }
  }
  // Shark: often (until you've swooped it) a fin rises in the harbour, cruises along and sinks
  if (SHARK.t > 0) {
    SHARK.t = Math.max(0, SHARK.t - dt);
    if (SHARK.sink > 0 && (SHARK.sink -= dt) <= 0) SHARK.t = 0;        // swooped: gone under
    else if (bird.swooping && SHARK.sink <= 0 && sharkHitBy(bird.x - cam, bird.y)) swoopShark();
  } else if ((SHARK.in -= dt) <= 0) {
    // About half the time there's a fin to swoop (up 9 seconds, back every 6 to 14); once you've
    // swooped it (FIN-ISHED!), it's rarer again, every 15 to 30 seconds
    SHARK.t = SHARK_TIME; SHARK.in = RUN.done.has('FIN-ISHED!') ? 15 + Math.random() * 15 : 6 + Math.random() * 8;
    SHARK.dir = Math.random() < 0.5 ? -1 : 1; SHARK.sink = 0;
    SHARK.x = 150 + Math.random() * 90;
  }
}

// The barbecue (the bloke stands to its left: drawBloke)
function drawBbq(g) {
  const { fill, line } = brush(g);
  line('#2b2b2e', 2.4, [[-13, 0], [-12, -24]]); line('#2b2b2e', 2.4, [[13, 0], [12, -24]]);       // legs
  fill('#1c1c1f', () => g.arc(-13, -1, 2.4, 0, Math.PI * 2)); fill('#1c1c1f', () => g.arc(13, -1, 2.4, 0, Math.PI * 2));
  fill('#1d1d20', () => g.rect(-16, -50, 32, 20));                    // the hood, open behind
  fill('#3a3a3f', () => g.rect(-16, -50, 32, 3));
  fill('#9aa0a5', () => g.rect(-17, -31, 34, 9));                      // stainless body
  fill('#c4c9cd', () => g.rect(-17, -31, 34, 2));
  fill('#4a4a50', () => g.rect(-15, -32, 30, 1.6));                    // hot plate
  for (const px of [-9, 9]) fill('#6b3a1e', () => g.ellipse(px, -33, 4.5, 1.8, 0, 0, Math.PI * 2));   // burgers
  const k = BBQ.flipT > 0 ? 1 - BBQ.flipT / 0.7 : 0;                   // the one being flipped
  g.save(); g.translate(0, -33 - Math.sin(k * Math.PI) * 16); g.rotate(k * Math.PI * 2);
  fill(k > 0.25 && k < 0.75 ? '#8a4a24' : '#6b3a1e', () => g.ellipse(0, 0, 4.5, 1.8, 0, 0, Math.PI * 2));
  g.restore();
}

// The bloke at his barbie, facing it, flipping a burger now and then
function drawBloke(g) {
  const { fill, line } = brush(g);
  const k = BBQ.flipT > 0 ? 1 - BBQ.flipT / 0.7 : 0, lift = Math.sin(k * Math.PI) * 6;
  line('#d9a07a', 3, [[-3, -1], [-3, -18]]); line('#d9a07a', 3, [[3, -1], [3, -18]]);              // legs
  fill('#1d4a8a', () => g.rect(-6, 0, 5, 1.6)); fill('#1d4a8a', () => g.rect(1, 0, 5, 1.6));      // thongs
  fill('#b9a26a', () => g.rect(-6.5, -27, 13, 10));                    // shorts
  fill('#1f3a6b', () => g.rect(-6.5, -45, 13, 19));                    // singlet
  line('#d9a07a', 2.6, [[-5, -42], [-8, -30]]);                        // arm with a stubby
  fill('#2f6fbf', () => g.rect(-10, -31, 4, 5));
  line('#d9a07a', 2.6, [[5, -42], [14, -34 - lift]]);                  // arm with the spatula
  line('#8a8f94', 1.4, [[14, -34 - lift], [24, -34 - lift * 1.4]]);
  fill('#b4b9bd', () => g.rect(22, -35.5 - lift * 1.4, 6, 2));
  fill('#d9a07a', () => g.arc(0, -51, 6, 0, Math.PI * 2));             // head
  fill('#111', () => g.rect(0, -53, 7, 2));                            // sunnies
  fill('#e8e0c8', () => g.ellipse(0, -56, 10, 2.4, 0, 0, Math.PI * 2)); // bucket hat
  fill('#e8e0c8', () => { g.moveTo(-6, -56); g.quadraticCurveTo(-6, -63, 0, -63); g.quadraticCurveTo(6, -63, 6, -56); });
}

// Koala hugging the trunk, arms and legs taking turns as he climbs
function drawKoala(g) {
  const { fill } = brush(g);
  const a = Math.sin(KOALA.step * Math.PI), grey = '#8e939a', dark = '#6f747b';
  fill(dark, () => g.ellipse(-8, -6 + a * 3, 3, 4.5, 0.4, 0, Math.PI * 2));   // arms round the trunk
  fill(dark, () => g.ellipse(8, -6 - a * 3, 3, 4.5, -0.4, 0, Math.PI * 2));
  fill(dark, () => g.ellipse(-7, 8 - a * 2, 3, 4, 0.3, 0, Math.PI * 2));      // legs
  fill(dark, () => g.ellipse(7, 8 + a * 2, 3, 4, -0.3, 0, Math.PI * 2));
  fill(grey, () => g.ellipse(0, 1, 7, 9, 0, 0, Math.PI * 2));                // body
  fill('#d8dadc', () => g.ellipse(0, 3, 4, 6, 0, 0, Math.PI * 2));
  for (const sx of [-6.5, 6.5]) { fill(grey, () => g.arc(sx, -15, 4, 0, Math.PI * 2)); fill('#f2f2f0', () => g.arc(sx, -15, 2.4, 0, Math.PI * 2)); }   // fluffy ears
  fill(grey, () => g.arc(0, -11, 6.5, 0, Math.PI * 2));                 // head
  fill('#1a1a1c', () => g.ellipse(0, -10, 2, 2.8, 0, 0, Math.PI * 2));  // big nose
  fill('#1a1a1c', () => g.arc(-2.8, -13, 0.9, 0, Math.PI * 2)); fill('#1a1a1c', () => g.arc(2.8, -13, 0.9, 0, Math.PI * 2));
}

// Kookaburra: cream head with a dark eye stripe, brown back, a big bill, a barred rufous tail
function drawKookaburra(g, flap) {
  const { fill } = brush(g);
  fill('#b5643a', () => { g.moveTo(-6, -8); g.lineTo(-17, -1); g.lineTo(-15, 2); g.lineTo(-4, -5); });   // tail
  for (const t of [0.35, 0.65]) fill('#2a1d14', () => g.rect(-6 - 11 * t, -8 + 7 * t, 1.5, 3));
  fill('#efe6d2', () => g.ellipse(0, -8, 7, 6.5, 0, 0, Math.PI * 2));   // belly
  fill('#6b4a2b', () => g.ellipse(-2, -10, 6, 4.5, -0.3, 0, Math.PI * 2));   // back and wing
  if (flap !== undefined) fill('#5a3d22', () => g.ellipse(-2, -12 - flap * 8, 3, 7, -0.2 + flap * 0.4, 0, Math.PI * 2));
  fill('#7ab3d6', () => g.ellipse(-1, -10, 3, 1.4, -0.3, 0, Math.PI * 2));   // blue wing flash
  fill('#efe6d2', () => g.arc(5, -16, 5.5, 0, Math.PI * 2));             // head
  fill('#4a3220', () => g.ellipse(4, -19.5, 4, 1.8, 0, 0, Math.PI * 2)); // crown
  fill('#4a3220', () => g.ellipse(4, -16, 4.5, 1.2, 0, 0, Math.PI * 2)); // eye stripe
  fill('#111', () => g.arc(6, -16.4, 0.9, 0, Math.PI * 2));
  const open = KOOKA.calling > 0 && KOOKA.state === 'perched' ? Math.abs(Math.sin((KOOKA_CALL_TIME - KOOKA.calling) * Math.PI * 7)) : 0;   // beak working as he laughs
  g.save(); g.translate(9, -15); g.rotate(-open * 0.35); g.translate(-9, 15);
  fill('#2b2520', () => { g.moveTo(9, -17.5); g.lineTo(18, -15.5); g.lineTo(9, -14.5); });   // bill (top)
  g.restore();
  g.save(); g.translate(9, -14); g.rotate(open * 0.3); g.translate(-9, 14);
  fill('#d9cfb8', () => { g.moveTo(9, -14.5); g.lineTo(17, -15.2); g.lineTo(9, -13.2); });   // bill (bottom)
  g.restore();
  fill('#4a3d30', () => g.rect(-1, -2, 1.2, 2)); fill('#4a3d30', () => g.rect(2, -2, 1.2, 2));
}

// All the cast drawn the slightly pixelated way, into the magpie's low-resolution buffer
function drawCharacter(xWorld, yFeet, scale, dir, draw, rot = 0, wide = 1) {
  const sx = loopX(xWorld);
  if (sx < -50 || sx > W + 50) return;
  const s = K * scale / BIRD_PIX;
  bbctx.setTransform(s * dir * wide, 0, 0, s, sx * K / BIRD_PIX, yFeet * K / BIRD_PIX);
  if (rot) bbctx.rotate(rot);
  draw(bbctx);
  crispen(bbctx, sx * K / BIRD_PIX, (yFeet - 10) * K / BIRD_PIX, Math.ceil(26 * K / BIRD_PIX));
}
// A snag: a browned sausage, about 18 units long, centred on the origin
function drawSnag(g) {
  g.lineCap = 'round';
  g.strokeStyle = '#5e2a14'; g.lineWidth = 6.5; g.beginPath(); g.moveTo(-9, 0); g.quadraticCurveTo(0, 1.5, 9, 0); g.stroke();
  g.strokeStyle = '#9a4422'; g.lineWidth = 5; g.stroke();
  g.strokeStyle = '#d07a46'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-6, -1.2); g.quadraticCurveTo(0, 0, 6, -1.2); g.stroke();   // shine
  g.strokeStyle = '#3d1a0c'; g.lineWidth = 0.8;                       // grill marks
  for (const x of [-4, 0, 4]) { g.beginPath(); g.moveTo(x - 1, -2); g.lineTo(x + 1, 2.2); g.stroke(); }
}
// The nest on top of the big gum: a bowl of twigs with three grey chicks, gaping when he brings food
function drawNest(g) {
  const sx = Math.round(loopX(NEST.x)), y = NEST.y;
  if (sx < -20 || sx > W + 20) return;
  const px = (x, yy, w, h, c) => { g.fillStyle = c; g.fillRect(sx + x, y + yy, w, h); };
  for (let i = 0; i < 3; i++) {                                       // the chicks
    const cx = -5 + i * 4, hop = NEST.fed > 0 ? -Math.round(Math.abs(Math.sin(time * 9 + i)) * 2) : NEST.beg ? -1 - (Math.floor(time * 8 + i) % 2) : -(Math.floor(time * 1.5 + i * 0.7) % 2);
    px(cx, -4 + hop, 3, 3, '#8d8f96'); px(cx, -4 + hop, 1, 1, '#c3c5cb');   // fluffy grey heads
    px(cx + 1, -3 + hop, 1, 1, '#141418');                                     // eye
    if (NEST.beg && NEST.fed <= 0) { px(cx, -7 + hop, 3, 3, '#ffcf3a'); px(cx + 1, -6 + hop, 1, 1, '#e8541c'); }   // gaping yellow mouths, wanting tucker
    else px(cx + 1, -5 + hop, 1, 1, '#d9c79a');                                // little beak
  }
  px(-8, -2, 16, 2, '#7a5a34'); px(-7, 0, 14, 1, '#5e4226'); px(-9, -2, 1, 1, '#9c7a4c'); px(8, -2, 1, 1, '#9c7a4c');   // twigs
  for (let i = 0; i < 5; i++) px(-7 + i * 3, -2, 1, 1, '#a88a5a');
}

function drawCast() {
  drawCharacter(BBQ.x, 166, BBQ_SCALE, 1, drawBbq, 0, BBQ_WIDE);
  drawCharacter(BBQ.x - BBQ.half - 9, 166, BBQ_SCALE, 1, drawBloke);
  if (TRUNK.length) {
    const i = Math.floor(KOALA.u * (TRUNK.length - 1)), [tx, ty] = TRUNK[i];
    drawCharacter(tx, ty + 6, 0.36, 1, drawKoala);
  }
  if (SNAG.air) drawCharacter(SNAG.x, SNAG.y, 0.3, 1, drawSnag, SNAG.rot);   // spinning in the air
  if (KOOKA.state === 'perched') drawCharacter(KOOKA.x, KOOKA.y, KOOKA_SCALE, -1, g => drawKookaburra(g));
  else if (KOOKA.state === 'falling') drawCharacter(KOOKA.fx, KOOKA.fy, KOOKA_SCALE, -1, g => drawKookaburra(g), KOOKA.rot);
  else if (KOOKA.state === 'stunned') drawCharacter(KOOKA.fx, KOOKA.fy, KOOKA_SCALE, -1, g => { g.save(); g.rotate(-1.4); drawKookaburra(g); g.restore(); dizzyStars(g, 0, -22); });
  else drawCharacter(KOOKA.fx, KOOKA.fy, KOOKA_SCALE, -1, g => drawKookaburra(g, Math.sin(KOOKA.t * 30)));
}

// Smoke: from the barbecue, and off a red-hot magpie
function drawSmoke(g) {
  for (const p of smoke) {
    g.setTransform(K, 0, 0, K, loopX(p.x) * K, p.y * K);
    g.globalAlpha = Math.min(0.55, p.life * 0.5);
    g.beginPath(); g.arc(0, 0, p.r, 0, Math.PI * 2); g.fillStyle = '#c9c9c9'; g.fill();
  }
  g.globalAlpha = 1; g.setTransform(1, 0, 0, 1, 0, 0);
}

// Postie: red motorbike, hi-vis vest, white helmet, letters in the box on the back (pixel art).
// A poop knocks him off.
// The postie on foot, his feet at (x, y) from the bike, turned by angle (radians), facing forward or
// back towards the bike, legs apart on alternate steps. flail (0 to 1): arms and legs thrashing about,
// mid-air. Each pixel is turned about his middle.
function postieMan(px, x, y, angle, forward, step, flail = 0) {
  const dots = [];                                                    // [u, v, colour] from his middle
  const block = (x0, y0, w, h, col) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) dots.push([x0 + i + 0.5, y0 + j + 0.5, col]); };
  const limb = (x0, y0, a, len, col) => { for (let k = 0; k < len; k++) dots.push([x0 + Math.sin(a) * (k + 0.5), y0 + Math.cos(a) * (k + 0.5), col]); };
  block(0, -13, 3, 3, '#f4f4f4'); block(forward ? 2 : 0, -12, 1, 1, '#222');   // helmet, visor
  block(0, -10, 3, 5, '#ff8c1a'); block(0, -8, 3, 1, '#f4f4f4');               // hi-vis vest
  if (flail > 0) {
    const w = time * 45;                                              // arms windmilling, legs kicking, fast
    limb(0, -9.5, Math.PI * (0.6 + 0.5 * Math.sin(w)) * flail, 4, '#ff8c1a');
    limb(3, -9.5, -Math.PI * (0.6 + 0.5 * Math.sin(w + 2)) * flail, 4, '#ff8c1a');
    limb(0.5, -5, (0.5 + 0.6 * Math.sin(w * 1.3 + 1)) * flail, 5, '#1d3a6b');
    limb(2.5, -5, -(0.5 + 0.6 * Math.sin(w * 1.3 + 3)) * flail, 5, '#1d3a6b');
  } else {
    block(step ? -1 : 0, -5, 1, 5, '#1d3a6b'); block(step ? 3 : 2, -5, 1, 5, '#1d3a6b');   // legs
  }
  const c = Math.cos(angle), s = Math.sin(angle), mx = 1.5, my = -6.5;
  for (const [a, b, col] of dots) {
    const u = a - mx, v = b - my;
    px(Math.round(x + mx + u * c - v * s - 0.5), Math.round(y + my + u * s + v * c - 0.5), 1, 1, col);
  }
}
const postieSx = () => suburbX(POSTIE.x);
function postieHitBy(sx, y) {
  return POSTIE.down <= 0 && Math.abs(wrapDx(sx, postieSx(), suburb.P)) < 6 * POOP_REACH && y >= 139 && y <= 152;
}
function knockPostie() {
  POSTIE.down = POSTIE_DOWN; POSTIE.stop = 0;
  Sound.can(0.8); Sound.oi(); say('SPECIAL DELIVERY!');
  if (bird.onCarrier === 'postie') { bird.onCarrier = null; bird.grounded = false; bird.vy = -50; }
  award(80, cam + postieSx(), 130);
}
function drawPostie(g) {
  const P = suburb.P, base = 152;
  const sx0 = postieSx(), d = POSTIE.dir;
  for (let sx = sx0 - P; sx < W + P; sx += P) {
    if (sx < -14 || sx > W + 14) continue;
    const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(sx + (d > 0 ? x : -x - w + 1)), base + y, w, h); };   // faces the way he's going
    if (POSTIE.down > POSTIE_LIFT) {                                   // knocked off: bike on its side, and him...
      px(-6, -2, 3, 2, '#1b1b1b'); px(3, -2, 3, 2, '#1b1b1b');         // wheels, flat
      px(-5, -3, 10, 2, '#d0101c'); px(-8, -4, 4, 3, '#d0101c');       // frame, box
      const t = POSTIE_DOWN - POSTIE.down, walkFrom = POSTIE_FLY + POSTIE_DAZED, walkTime = POSTIE_DOWN - POSTIE_LIFT - walkFrom;
      if (t < POSTIE_FLY) {                                            // ...somersaulting off over the handlebars
        const f = t / POSTIE_FLY;
        postieMan(px, POSTIE_LAND * f, -16 * Math.sin(Math.PI * f), f * Math.PI * 2, true, 0, Math.sin(Math.PI * f));
      } else if (t < walkFrom) {                                       // ...standing there, seeing stars
        postieMan(px, POSTIE_LAND, 0, Math.sin(time * 9) * 0.15, true, 0);
        if (Math.floor(time * 6) % 2) px(POSTIE_LAND + 1, -16, 1, 1, '#ffffff');
      } else {                                                         // ...walking back to the bike
        const f = (t - walkFrom) / walkTime;
        postieMan(px, POSTIE_LAND + (7 - POSTIE_LAND) * f, 0, 0, false, Math.floor(time * 7) % 2);
      }
      continue;
    }
    if (POSTIE.down > 0) {                                             // getting up, hauling the bike upright
      const k = 1 - POSTIE.down / POSTIE_LIFT;
      for (const wx of [-5, 4]) px(wx - 1, -3, 3, 3, '#1b1b1b');
      px(-5, -5 + Math.round((1 - k) * 2), 10, 2, '#d0101c');
      px(-7, -9 + Math.round((1 - k) * 3), 4, 4, '#d0101c');
      px(7, -10, 3, 5, '#ff8c1a'); px(7, -5, 2, 5, '#1d3a6b'); px(7, -13, 3, 3, '#f4f4f4');   // standing beside it
      continue;
    }
    const spin = Math.floor(POSTIE.wheel) % 2;
    for (const wx of [-5, 4]) { px(wx - 1, -3, 3, 3, '#1b1b1b'); px(wx, -2, 1, 1, spin ? '#888' : '#444'); }   // wheels
    px(-5, -5, 10, 2, '#d0101c');                                   // frame
    px(-7, -9, 4, 4, '#d0101c'); px(-7, -9, 4, 1, '#ff5a5a');       // the red box on the back
    px(3, -8, 1, 3, '#555'); px(3, -9, 3, 1, '#333');                // handlebars
    px(-2, -10, 4, 5, '#ff8c1a'); px(-2, -8, 4, 1, '#f4f4f4');       // hi-vis vest
    px(1, -9, 3, 1, '#ff8c1a');                                     // arm to the bars
    px(-2, -5, 2, 2, '#1d3a6b');                                    // legs
    px(-1, -13, 3, 3, '#f4f4f4'); px(1, -12, 1, 1, '#222');           // helmet, visor
  }
}

// A green-and-cream Sydney ferry crossing the harbour and back. It's double-ended, with a
// wheelhouse at each end, so it never turns round: it just reverses. Pixel art on the hills layer.
const FERRY = { x: 140, dir: 1, speed: 5, from: 112, to: 284 };
const ferrySprite = (() => {
  const c = makeCanvas(FERRY_ROWS[0].length, FERRY_ROWS.length), g = c.getContext('2d');
  FERRY_ROWS.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') { g.fillStyle = FERRY_COLOURS[ch]; g.fillRect(x, y, 1, 1); } }));
  return c;
})();
function updateFerry(dt) {
  FERRY.x += FERRY.dir * FERRY.speed * dt;
  if (FERRY.x > FERRY.to) { FERRY.x = FERRY.to; FERRY.dir = -1; }
  if (FERRY.x < FERRY.from) { FERRY.x = FERRY.from; FERRY.dir = 1; }
}
function drawFerry(g) {
  const P = hills.P, w = FERRY_ROWS[0].length, h = FERRY_ROWS.length;
  const top = 138 - HILLS_LIFT + 8 - h + Math.round(Math.sin(time * 1.8) * 0.5);   // sits in the water, bobbing a little
  const sx = hillsX(Math.round(FERRY.x));
  for (let x0 = sx - P; x0 < W + P; x0 += P) {
    if (x0 < -w || x0 > W) continue;
    g.drawImage(ferrySprite, x0 - (w >> 1), top);
    g.fillStyle = '#e8f6ff';                                        // wake behind it
    const back = FERRY.dir > 0 ? x0 - (w >> 1) - 4 : x0 + (w >> 1) + 1;
    g.fillRect(back, top + h - 1, 3, 1); g.fillRect(back + (FERRY.dir > 0 ? -3 : 3), top + h, 2, 1);
  }
}

// Shark fin cruising in the harbour (on the hills layer, in front of the bridge)
// Swoop the shark fin (it's out in the harbour, on the hills layer, so matched on screen) and it
// dives out of sight with a splash: FIN-ISHED!
const SHARK_WATER = 138 - HILLS_LIFT + 7;                             // out in the harbour, not at the shore
const sharkSx = () => hillsX(SHARK.x + SHARK.dir * (1 - SHARK.t / SHARK_TIME) * 50);
const sharkHitBy = (sx, y) => Math.abs(wrapDx(sx, sharkSx(), hills.P)) < 9 && y > SHARK_WATER - 16 && y < SHARK_WATER + 4;
function swoopShark() {
  SHARK.sink = SHARK_SINK;
  Sound.splosh(); award(150, cam + sharkSx(), SHARK_WATER - 6); say('FIN-ISHED!');
}
function drawShark(g) {
  if (SHARK.t <= 0) return;
  const P = hills.P, k = 1 - SHARK.t / SHARK_TIME, water = SHARK_WATER;
  const rise = Math.min(1, k / 0.12, (1 - k) / 0.12) * (SHARK.sink > 0 ? SHARK.sink / SHARK_SINK : 1);   // swooped: sinking fast
  const sx = sharkSx();
  for (let x0 = sx - P; x0 < W + P; x0 += P) {                        // every copy across even a very wide screen
    if (x0 < -8 || x0 > W + 8) continue;
    // A dorsal fin: a curved, sloping front edge and a hollowed-out back edge, its tip
    // sweeping back, away from the way it's going
    const fh = 9, h = Math.round(fh * rise), d = SHARK.dir;
    for (let j = 0; j < h; j++) {
      const t = j / (fh - 1);
      const front = -4.5 * Math.pow(t, 1.6), back = -7 + 1.8 * t + 1.4 * Math.sin(Math.PI * t);
      const xa = Math.round(x0 + d * back), xb = Math.round(x0 + d * front), lo = Math.min(xa, xb), hi = Math.max(xa, xb);
      for (let x = lo; x <= hi; x++) {
        g.fillStyle = x === (d > 0 ? hi : lo) || j === h - 1 ? '#8d9aa6' : '#55606b';   // lit along the front edge
        g.fillRect(x, water - j - 1, 1, 1);
      }
    }
    if (h > 0) { g.fillStyle = '#e8f6ff'; g.fillRect(Math.round(x0) + (d > 0 ? 1 : -3), water, 3, 1); g.fillRect(Math.round(x0) - d * 9, water, 2, 1); }   // bow wave and wake
  }
}

// ---------------------------------------------------------------------------
// More of Australia: power lines with a possum, a cyclist to swoop,
// a drop bear in the gum tree, a flock of cockatoos, summer storms, and a score.
// ---------------------------------------------------------------------------
const HOUSES = [];                    // the front street's houses: { x, w, top } (top: the roof)
const WIRE = { x0: 0, x1: 0, top: 0 };   // the one power line, between two of them
function wireY(x) {                                                  // the sag of the wire between its two poles
  const t = clamp((x - WIRE.x0) / (WIRE.x1 - WIRE.x0), 0, 1);
  return Math.round(WIRE.top + 1 + 3 * 4 * t * (1 - t));
}
const POSSUM = { in: 8, x: 0, dir: 1, visit: 0, pause: 0, spin: 0 };   // out on the wire about a third of the time; spin: pooped, whirling round the wire
const POSSUM_SPIN = 3;
const POSSUM_SCALE = 1.25;         // a quarter bigger than his first drawing
const POSSUM_GAP = 0.65;           // shorter waits between visits: he comes out 30% more often
const CYCLIST = { x: 1200, dir: -1, speed: 36, wobble: 0, sting: 0, ties: 4, ground: 170, crank: 0 };   // ties: always on his helmet
const CYCLIST_SCALE = 0.6;        // a bit taller than the kangaroo
const DROPBEAR = { state: 'hidden', x: 0, y: 0, vy: 0, t: 0, under: 0 };
const COCKIES = { in: 12, t: 0, dir: 1, x: 0, y: 50, screechIn: 0, with: 0, joined: false };   // x: the leader, in the world; with: seconds flown with them
const COCKY_SPEED = 60, FLOCK_TIME = 5;   // they fly slower than the magpie can, so he can keep up; 5 seconds in among them: FLOCK YEAH!
const STORM = { in: 100, t: 0, len: 30, flash: 0, nextBolt: 0, bolt: null, rainbow: 0, rx: -70, ry: 260, ox: 0, oy: 0 };   // rx, ry: the rain as he sees it
const RAINBOW_TIME = 20;
const SCORE = { pts: 0, hi: 0, combo: 1, comboT: 0, pops: [] };   // comboT: seconds left to score again and keep the combo going
const COMBO_WINDOW = 6;
try { SCORE.hi = +localStorage.getItem('swoopHi') || 0; } catch (e) { /* no saved high score */ }

// Points: knocking things over, poops on target, stunts, rides. Each score within 6 seconds of the last builds the combo (up to x5).
function award(base, x = bird.x, y = bird.y) {
  SCORE.combo = SCORE.comboT > 0 ? Math.min(5, SCORE.combo + 1) : 1;
  SCORE.comboT = COMBO_WINDOW;
  const pts = base * SCORE.combo;
  SCORE.pts += pts;                                                  // (the high score is only set when the game's complete)
  SCORE.pops.push({ text: '+' + pts + (SCORE.combo > 1 ? '  COMBO X' + SCORE.combo : ''), x, y: popY(y), life: SCORE.combo > 1 ? 1.6 : 1.2 });   // with the combo once it's building
}
const popY = y => Math.max(y - 14, 66);                              // points pop up above where they were won, but never under the key hints
// Losing points (swooping the cyclist, the barbecue, the drop bear): shown in red, and the score can go below zero
function penalty(base, x = bird.x, y = bird.y) {
  SCORE.combo = 1; SCORE.comboT = 0;
  SCORE.pts -= base;
  SCORE.pops.push({ text: '-' + base, x, y: popY(y), life: 1.4, bad: true });
}

const stormDark = () => STORM.t > 0 ? clamp(Math.min((STORM.len - STORM.t) / 4, STORM.t / 4), 0, 1) : 0;
const cyclistDx = x => wrapDx(x, CYCLIST.x);
function hitCyclist() {                                               // pooped on: he wobbles, shakes his fist, rings his bell
  if (CYCLIST.wobble > 0) return;
  CYCLIST.wobble = 1.6;
  Sound.bell(); Sound.oi(); award(100, CYCLIST.x, CYCLIST.ground - 30); say('CYCLO-PATH!');
}
const CYCLIST_TARGET = { get x() { return CYCLIST.x - 10; }, get y() { return CYCLIST.ground - 28; }, w: 20, h: 22, hit: hitCyclist };   // from his helmet down to the frame

function updateMore(dt) {
  // Score
  SCORE.comboT = Math.max(0, SCORE.comboT - dt);
  if (SCORE.comboT === 0) SCORE.combo = 1;
  for (const p of SCORE.pops) { p.life -= dt; p.y -= 10 * dt; }
  while (SCORE.pops.length && SCORE.pops[0].life <= 0) SCORE.pops.shift();
  // Possum: comes out onto the power line for 10 to 15 seconds at a time (resting now and then,
  // turning back at the poles), then is gone for twice as long: out about a third of the time
  if (POSSUM.visit > 0) {
    POSSUM.visit -= dt;
    if (POSSUM.spin > 0) POSSUM.spin = Math.max(0, POSSUM.spin - dt);   // whirling round the wire: going nowhere
    else if (POSSUM.pause > 0) POSSUM.pause -= dt;
    else {
      POSSUM.x += POSSUM.dir * 12 * dt;
      if (Math.random() < dt * 0.4) POSSUM.pause = 1 + Math.random() * 2.5;
      const end = POSSUM.dir > 0 ? POSSUM.x >= WIRE.x1 - 2 : POSSUM.x <= WIRE.x0 + 2;
      if (end) { if (POSSUM.visit < 3) POSSUM.visit = 0; else POSSUM.dir *= -1; }   // off down the pole, or turn back
    }
    if (POSSUM.visit <= 0) POSSUM.in = 2 * (10 + Math.random() * 5) * POSSUM_GAP;
  } else if ((POSSUM.in -= dt) <= 0) {
    POSSUM.visit = 10 + Math.random() * 5; POSSUM.pause = 0; POSSUM.dir = Math.random() < 0.5 ? -1 : 1;
    POSSUM.x = POSSUM.dir > 0 ? WIRE.x0 + 2 : WIRE.x1 - 2;
  }
  // Cyclist: pedals along the front of the lawn. Poop him and he wobbles; swoop him and the
  // cable ties on his helmet spike the magpie: knocked back spinning, squawking, to land on his back legs waving, and he loses points
  CYCLIST.wobble = Math.max(0, CYCLIST.wobble - dt); CYCLIST.sting = Math.max(0, CYCLIST.sting - dt);
  CYCLIST.x = mod(CYCLIST.x + CYCLIST.dir * CYCLIST.speed * dt, LEVEL_W); CYCLIST.crank += dt * 7;
  if (bird.swooping && CYCLIST.sting <= 0 && Math.abs(cyclistDx(bird.x)) < 12 && bird.y > CYCLIST.ground - 30 && bird.y < CYCLIST.ground) {   // only if he actually reaches him
    CYCLIST.sting = 1.5; bird.swooping = false; bird.spent = true; bird.vy = -120; bird.vx = -bird.face * 90;
    bird.flung = true; bird.whipped = true; bird.snag = false;       // tumbling back (no SNAG-ROCKET! from this one), snag gone
    Sound.scream(1.2, 0.6); penalty(100, CYCLIST.x, CYCLIST.ground - 30); say('STREWTH!');
  }
  // Drop bear: hang about under the big gum for 3 seconds and it drops on you, then climbs back up into the leaves
  const under = Math.abs(wrapDx(bird.x, BIG_GUM_X)) < 26 && bird.y > 100;
  DROPBEAR.under = under ? DROPBEAR.under + dt : Math.min(0, DROPBEAR.under);
  if (DROPBEAR.state === 'hidden' && DROPBEAR.under > 3) {
    Object.assign(DROPBEAR, { state: 'drop', x: bird.x, y: 92, vy: 0, t: 0 });
    Sound.growl();
  } else if (DROPBEAR.state === 'drop') {
    DROPBEAR.vy += 420 * dt; DROPBEAR.y += DROPBEAR.vy * dt; DROPBEAR.x += (bird.x - DROPBEAR.x) * Math.min(1, 4 * dt);
    const hit = Math.abs(bird.x - DROPBEAR.x) < 8 && DROPBEAR.y >= bird.y - 8;
    if (hit) { bird.flung = true; bird.whipped = false; bird.snag = false; bird.dazed = true; bird.grounded = false; bird.onHoist = bird.onRoo = false; bird.hanging = false; bird.vy = 60; bird.vx = 0; penalty(100); say('YEAH, NAH!'); }
    if (hit || DROPBEAR.y >= LAND_Y) { DROPBEAR.state = 'climb'; DROPBEAR.t = 0; DROPBEAR.from = DROPBEAR.y; DROPBEAR.under = -6; }
  } else if (DROPBEAR.state === 'climb') {
    DROPBEAR.t += dt;
    DROPBEAR.y = DROPBEAR.from + (88 - DROPBEAR.from) * Math.min(1, DROPBEAR.t / 1.3);
    DROPBEAR.x += (BIG_GUM_X - DROPBEAR.x) * Math.min(1, 2 * dt);
    if (DROPBEAR.t > 1.5) DROPBEAR.state = 'hidden';                  // gone into the canopy
  }
  if (bird.dazed && bird.onBack <= 0 && bird.grounded) bird.dazed = false;
  // Cockatoos: now and then a screeching flock wheels across the sky
  // They fly through the world (not just across the screen), so the magpie can fly along with them:
  // fly in among the flock for 5 seconds and he's one of them, FLOCK YEAH!
  if (COCKIES.t > 0) {
    COCKIES.t -= dt; COCKIES.x += COCKIES.dir * COCKY_SPEED * dt;
    if ((COCKIES.screechIn -= dt) <= 0) { Sound.screech(); COCKIES.screechIn = 2 + Math.random() * 2; }
    const f = flockBox(), bx = bird.x - cam;
    if (bx > f.x0 - 6 && bx < f.x1 + 6 && bird.y > f.top - 6 && bird.y < f.bottom + 6) COCKIES.with += dt;   // in among them
    else COCKIES.with = Math.max(0, COCKIES.with - 2 * dt);
    if (COCKIES.with >= FLOCK_TIME && !COCKIES.joined) { COCKIES.joined = true; Sound.screech(); showCombo('FLOCK YEAH!'); }
    if (COCKIES.t < 28 && (f.x1 < -60 || f.x0 > W + 60)) COCKIES.t = 0;   // gone off the screen
  } else if ((COCKIES.in -= dt) <= 0) {
    // Often until you've joined them (every 12 to 20 seconds), then every 25 to 55
    COCKIES.in = RUN.done.has('FLOCK YEAH!') ? 25 + Math.random() * 30 : 12 + Math.random() * 8;
    COCKIES.dir = Math.random() < 0.5 ? -1 : 1; COCKIES.y = 30 + Math.random() * 40;
    COCKIES.x = cam + (COCKIES.dir > 0 ? -40 : W + 40); COCKIES.t = 30;
    Object.assign(COCKIES, { screechIn: 0, with: 0, joined: false });
  }
  // Storms: every few minutes the sky darkens, it pours, lightning cracks; then a rainbow.
  // The rain falls past him at its own speed less his: fly forward, swoop, climb or dive and it tilts.
  const ease = Math.min(1, 6 * dt);
  STORM.rx += (-70 - bird.vx - STORM.rx) * ease; STORM.ry += (Math.max(120, 260 - bird.vy * 0.6) - STORM.ry) * ease;
  STORM.ox += STORM.rx * dt; STORM.oy += STORM.ry * dt;
  if (STORM.t > 0) {
    STORM.t = Math.max(0, STORM.t - dt);
    STORM.flash = Math.max(0, STORM.flash - dt);
    if ((STORM.nextBolt -= dt) <= 0 && stormDark() > 0.6) {
      STORM.nextBolt = 3 + Math.random() * 5; STORM.flash = 0.3;
      const pts = []; let x = 40 + Math.random() * (W - 80);
      for (let y = 0; y < 100; y += 6) { pts.push([x, y]); x += (Math.random() - 0.5) * 10; }
      STORM.bolt = pts;
      setTimeout(() => Sound.thunder(), 300 + Math.random() * 900);
    }
    if (STORM.t === 0) STORM.rainbow = RAINBOW_TIME;
  } else {
    STORM.rainbow = Math.max(0, STORM.rainbow - dt);
    if ((STORM.in -= dt) <= 0) { STORM.t = STORM.len; STORM.in = 150 + Math.random() * 120; STORM.nextBolt = 6; }
  }
}

// Riding the postie or the ferry: they're further back (their own layers), so the magpie matches
// them on screen. Each carrier gives its screen x, the top to stand on, and its half-width.
const CARRIERS = {
  postie: { x: postieSx, top: () => 141, half: 5, dir: () => POSTIE.dir },
  ferry: { x: () => hillsX(Math.round(FERRY.x)), top: () => 138 - HILLS_LIFT + 8 - FERRY_ROWS.length + 2, half: 8, dir: () => FERRY.dir }
};
function carrierUnder() {                                            // a carrier right under the magpie, if any
  const sx = bird.x - cam;
  for (const [name, c] of Object.entries(CARRIERS)) {
    const P = name === 'postie' ? suburb.P : hills.P;
    if (Math.abs(wrapDx(sx, c.x(), P)) < c.half && bird.y <= c.top() - FEET + 3) return name;
  }
  return null;
}

// Bridge climbers: a few tiny figures walking slowly up and over the Harbour Bridge arch
// Poop on them (they're one group) and they scream, a word bubble pops up, and they jump up and
// down for 3 seconds.
const CLIMBERS = [0, 4, 8, 12].map(k => ({ along: k, dir: 1 }));
const CLIMB = { hit: 0, word: '' }, CLIMB_MID = 165, CLIMB_HALF = 43;
function climberPos(c) {                                             // where a climber is on screen (feet), allowing for the loop
  const hx = CLIMB_MID - CLIMB_HALF + c.along, hy = 99 + 21 * ((hx - CLIMB_MID) / CLIMB_HALF) ** 2 - HILLS_LIFT;
  const jump = CLIMB.hit > 0 ? -Math.round(Math.abs(Math.sin(time * 12 + c.along)) * 3) : 0;
  return { x: hillsX(Math.round(hx)), y: Math.round(hy) + jump };
}
function updateClimbers(dt) {
  CLIMB.hit = Math.max(0, CLIMB.hit - dt);
  if (CLIMB.hit > 0) return;                                          // too busy jumping about to walk
  for (const c of CLIMBERS) {
    c.along += c.dir * 2.5 * dt;
    if (c.along > 2 * CLIMB_HALF - 2 || c.along < 0) c.dir *= -1;
  }
}
function climbersHitBy(sx, y) {                                      // does a drop at screen x, height y land on them?
  return CLIMB.hit <= 0 && CLIMBERS.some(c => {
    const p = climberPos(c);
    return Math.abs(wrapDx(sx, p.x, hills.P)) < 5 * POOP_REACH && y >= p.y - 6 && y <= p.y + 2;
  });
}
function hitClimbers() {
  CLIMB.hit = 3; CLIMB.word = pick(Math.random, ['#!$?', '@#%!', '$%&!', '#@*!', '%$#!']);   // cartoon swearing
  [1.5, 1.8, 1.65].forEach((pch, i) => Sound.scream(pch, 0.4, i * 0.12));   // little screams, far off
  const p = climberPos(CLIMBERS[1]);
  award(60, cam + p.x, p.y - 22); say('COAT-HANGER!');                                    // above the bubble
}
function drawClimbers(g) {
  for (const c of CLIMBERS) {
    const p = climberPos(c);
    for (let x0 = p.x - hills.P; x0 < W + hills.P; x0 += hills.P) {
      if (x0 < 0 || x0 > W) continue;
      g.fillStyle = '#5b6470'; g.fillRect(x0, p.y - 2, 1, 2);        // grey climbing suit
      g.fillStyle = '#e8b48a'; g.fillRect(x0, p.y - 3, 1, 1);        // head
      if (CLIMB.hit > 0 && Math.sin(time * 12 + c.along) > 0) g.fillRect(x0 + (c.along % 2 ? 1 : -1), p.y - 3, 1, 1);   // arms flung up
    }
  }
}
// The word bubble over the group: a white speech bubble with a tail, black pixel lettering
function drawClimberBubble() {
  if (CLIMB.hit <= 0) return;
  const xs = CLIMBERS.map(c => climberPos(c)), cx0 = xs.reduce((a, p) => a + p.x, 0) / xs.length, top = Math.min(...xs.map(p => p.y));
  const w = textWidth(CLIMB.word) + 4, h = 9;
  for (let cx = cx0 - hills.P; cx < W + hills.P; cx += hills.P) {
    if (cx < -w || cx > W + w) continue;
    const bx = Math.round(cx - w / 2), by = top - 18;
    ctx.fillStyle = '#18222e'; ctx.fillRect(bx - 1, by - 1, w + 2, h + 2);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(bx, by, w, h);
    ctx.fillStyle = '#18222e'; ctx.fillRect(Math.round(cx) - 1, by + h + 1, 3, 1); ctx.fillRect(Math.round(cx), by + h + 2, 2, 1); ctx.fillRect(Math.round(cx) + 1, by + h + 3, 1, 1);   // tail
    ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(cx), by + h, 2, 1); ctx.fillRect(Math.round(cx) + 1, by + h + 1, 1, 1);
    glyphs(CLIMB.word, bx + 2, by + 2, 1, (x, y) => { ctx.fillStyle = '#18222e'; ctx.fillRect(x, y, 1, 1); });
  }
}

// The possum on the wire (front street layer). Poop on him and he whirls round and round the
// wire for 3 seconds.
const possumSx = () => suburbX(Math.round(POSSUM.x));
function possumHitBy(sx, y) {
  if (POSSUM.visit <= 0 || POSSUM.spin > 0) return false;
  const wy = wireY(POSSUM.x);
  return Math.abs(wrapDx(sx, possumSx(), suburb.P)) < 5 * POSSUM_SCALE * POOP_REACH && y >= wy - 6 * POSSUM_SCALE && y <= wy + 1;
}
function spinPossum() {
  POSSUM.spin = POSSUM_SPIN; POSSUM.visit = Math.max(POSSUM.visit, POSSUM_SPIN + 3);
  Sound.boing(); award(80, cam + possumSx(), wireY(POSSUM.x) - 6); say('ROUND THE TWIST!');
}

function drawPossum(g) {
  if (POSSUM.visit <= 0) return;
  const P = suburb.P, sx0 = possumSx(), y = wireY(POSSUM.x);
  const leg = POSSUM.pause > 0 || POSSUM.spin > 0 ? 0 : Math.floor(time * 10) % 2, d = POSSUM.dir;
  const k = POSSUM.spin / POSSUM_SPIN, turn = Math.cos(3 * Math.PI * 2 * (1 - k * k));   // three turns round the wire, slowing down; seen side on
  for (let sx = sx0 - P; sx < W + P; sx += P) {
    if (sx < -10 || sx > W + 10) continue;
    const px = (x, yy, w, h, c) => {                                  // each row swung round the wire (over the top, then hanging under it), scaled up
      g.fillStyle = c;
      const x0 = Math.round(x * POSSUM_SCALE), x1 = Math.round((x + w) * POSSUM_SCALE);
      const y0 = Math.round(yy * POSSUM_SCALE), y1 = Math.round((yy + h) * POSSUM_SCALE);
      for (let r = y0; r < y1; r++) g.fillRect(sx + (d > 0 ? x0 : -x1 + 1), y + Math.round(r * turn), x1 - x0, 1);
    };
    px(-5, -2, 2, 1, '#2a2a2a'); px(-6, -1, 1, 2, '#2a2a2a'); px(-5, 1, 1, 1, '#2a2a2a');   // bushy black tail, curling
    px(-3, -3, 4, 2, '#8a8f96'); px(1, -4, 2, 2, '#9aa0a6'); px(3, -3, 1, 1, '#e8a0a8');   // body, head, pink nose
    px(1, -5, 1, 1, '#5a5f66');                                                            // ear
    px(-2 + leg, -1, 1, 1, '#5a5f66'); px(1 - leg, -1, 1, 1, '#5a5f66');                   // legs
  }
}

// Cockatoos: white with a yellow crest, flapping and wheeling in a loose flock
// Where each of the ten is on screen: two loose rows trailing behind the leader, bobbing
function cockyAt(i) {
  return { x: loopX(COCKIES.x) - COCKIES.dir * (i % 5) * 9 + (i > 4 ? 5 : 0),
    y: COCKIES.y + Math.sin(time * 1.4 + i * 0.6) * 7 + (i > 4 ? 8 : 0) + (i % 5) * 2 };
}
function flockBox() {                                               // the flock's extent on screen
  const at = Array.from({ length: 10 }, (_, i) => cockyAt(i)), xs = at.map(c => c.x), ys = at.map(c => c.y);
  return { x0: Math.min(...xs), x1: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) };
}
function drawCockies(g) {
  if (COCKIES.t <= 0) return;
  for (let i = 0; i < 10; i++) {
    const { x: bx, y: by } = cockyAt(i);
    const up = Math.sin(time * 14 + i) > 0, x = Math.round(bx), y = Math.round(by), d = COCKIES.dir;
    g.fillStyle = '#f6f6f2'; g.fillRect(x - 1, y, 4, 2);               // body
    g.fillRect(x - 1, y + (up ? -2 : 2), 3, 2);                        // wings
    g.fillStyle = '#d8d8d4'; g.fillRect(x - 2, y + (up ? -3 : 3), 2, 1);
    g.fillStyle = '#f2d33a'; g.fillRect(x + (d > 0 ? 3 : -2), y - 1, 1, 1);   // crest
    g.fillStyle = '#333'; g.fillRect(x + (d > 0 ? 3 : -2), y + 1, 1, 1);      // beak
  }
}
// Flying with the cockatoos: the seconds left to FLOCK YEAH!, in pop-art lettering just above the magpie
function drawFlockCount(g) {
  if (COCKIES.with <= 0.3 || COCKIES.joined) return;
  drawPopText(g, String(Math.ceil(FLOCK_TIME - COCKIES.with)), clamp(bird.x - cam, 20, W - 20), Math.max(14, bird.y - 15), 0.42, 1, '#ffd23f');
}

// Storm and rainbow
function drawRainbow(g) {
  if (STORM.rainbow <= 0) return;
  const a = Math.min(1, STORM.rainbow / 4, (RAINBOW_TIME - STORM.rainbow) / 4) * 0.55;
  g.globalAlpha = a; g.lineWidth = 2;
  ['#e8323a', '#f28a2e', '#f6d33c', '#4cb848', '#3a7fd8', '#4b3fa8', '#8a4fb8'].forEach((c, i) => {
    g.strokeStyle = c; g.beginPath(); g.arc(W * 0.62, 170, 92 - i * 2, Math.PI, Math.PI * 2); g.stroke();
  });
  g.globalAlpha = 1;
}
function drawStorm(g) {
  const d = stormDark();
  if (d <= 0) return;
  g.fillStyle = `rgba(25,35,55,${0.45 * d})`; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(200,214,230,0.75)';
  const sp = Math.hypot(STORM.rx, STORM.ry), ux = STORM.rx / sp, uy = STORM.ry / sp, len = clamp(sp / 90, 3, 7);   // longer streaks the faster it goes past
  for (let i = 0, n = Math.round(170 * d); i < n; i++) {               // rain, slanting the way it's going past him
    const x = mod(i * 53.7 + STORM.ox, W + 20) - 10, y = mod(i * 91.3 + STORM.oy, H);
    for (let j = 0; j < len; j++) g.fillRect(Math.round(x - ux * j), Math.round(y - uy * j), 1, 1);
  }
  if (STORM.flash > 0) {
    g.fillStyle = `rgba(255,255,255,${Math.min(0.7, STORM.flash * 2.5)})`; g.fillRect(0, 0, W, H);
    if (STORM.flash > 0.15 && STORM.bolt) {
      g.fillStyle = '#ffffff';
      for (let i = 1; i < STORM.bolt.length; i++) {
        const [x0, y0] = STORM.bolt[i - 1], [x1, y1] = STORM.bolt[i];
        for (let t = 0; t <= 1; t += 0.15) g.fillRect(Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t), 1, 1);
      }
    }
  }
}

// Score, combo and the points popping up
function drawScore() {
  const right = t => W - 4 - textWidth(t);                           // top right
  const sc = 'SCORE ' + SCORE.pts, hi = 'HI ' + SCORE.hi;
  drawText(sc, right(sc), 4, '#ffffff');
  drawText(hi, right(hi), 12, '#cfd8e0');
  const tm = 'TIME ' + clock(runTime());
  drawText(tm, right(tm), 20, RUN.finished ? '#ffe066' : '#ffffff');
  const ob = 'OBJECTIVES ' + RUN.done.size + '/' + OBJECTIVES.length;  // a link: click or tap it for the list
  objLink = { x: right(ob) - 2, y: 26, w: textWidth(ob) + 4, h: 10 };
  drawText(ob, right(ob), 28, '#9fdcff');
  ctx.fillStyle = '#9fdcff'; ctx.fillRect(right(ob), 34, textWidth(ob), 1);
  for (const p of SCORE.pops) {
    ctx.globalAlpha = Math.min(1, p.life * 2);
    drawText(p.text, Math.round(loopX(p.x) - textWidth(p.text) / 2), Math.round(p.y), p.bad ? '#ff4a3d' : '#ffe066');
  }
  ctx.globalAlpha = 1;
}

// Cyclist: a chunky, blocky bloke in lycra on a road bike, his helmet bristling with cable
// ties (they spike any magpie that swoops him). Units: about 44 high, origin on the ground, facing right.
function drawCyclist(g) {
  const { line } = brush(g, 'square');                                // square ends: he's blocky
  const block = (col, x, y, w, h, a = 0) => { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = col; g.fillRect(-w / 2, -h / 2, w, h); g.restore(); };
  const wob = CYCLIST.wobble > 0 ? Math.sin(time * 22) * 0.18 : 0, c = CYCLIST.crank;
  g.rotate(wob);
  for (const wx of [-13, 13]) {                                        // chunky wheels with a turning spoke
    g.strokeStyle = '#151515'; g.lineWidth = 3.2; g.beginPath(); g.arc(wx, -8, 7.5, 0, Math.PI * 2); g.stroke();
    line('#8a8f94', 1.4, [[wx + Math.cos(c) * 6, -8 + Math.sin(c) * 6], [wx - Math.cos(c) * 6, -8 - Math.sin(c) * 6]]);
    block('#8a8f94', wx, -8, 2.5, 2.5);
  }
  line('#d6322d', 3.2, [[-13, -8], [-2, -9], [9, -20], [-5, -21], [-2, -9]]);   // red frame
  line('#d6322d', 3.2, [[9, -20], [13, -8]]);
  block('#222', -5, -23, 6, 2);                                         // saddle
  line('#333', 2.6, [[9, -20], [11, -26]]); block('#333', 12.5, -26, 4, 2); // bars
  const k1 = [-2 + Math.cos(c) * 4, -9 + Math.sin(c) * 4], k2 = [-2 - Math.cos(c) * 4, -9 - Math.sin(c) * 4];
  line('#2a2a2a', 4, [[-4, -24], [2, -17 - Math.sin(c) * 2], k2]);      // back leg
  line('#e8b48a', 3.6, [[-4, -24], [2, -17 + Math.sin(c) * 2], k1]);    // front leg (bare calf)
  block('#1b1b1b', -3, -25, 8, 6, -0.5);                                // black knicks
  block('#ffd23f', 1.5, -31, 9, 13, 0.85);                              // yellow jersey, leaning over the bars
  block('#2f7ad6', 1.5, -31, 9, 3, 0.85);                               // blue stripe
  if (CYCLIST.wobble > 0) line('#e8b48a', 3, [[5, -35], [4 + Math.sin(time * 18) * 2, -45]]);   // shaking his fist
  else line('#e8b48a', 3, [[5, -35], [12, -27]]);
  block('#e8b48a', 9, -38, 7, 7);                                       // blocky head
  block('#111', 11.5, -38.5, 3, 1.5);                                   // sunnies
  block('#2f7ad6', 8.5, -42.5, 10, 4);                                  // helmet
  block('#1d5aa8', 8.5, -42.5, 1.4, 4); block('#1d5aa8', 5.5, -42.5, 1.4, 4);   // vents
  for (let i = 0; i < CYCLIST.ties; i++) {                             // short cable ties fanning out round the helmet, like spokes
    const a = -Math.PI * (0.82 - 0.64 * i / Math.max(1, CYCLIST.ties - 1)), c = Math.cos(a), s = Math.sin(a);
    line('#111', 1, [[8.5 + c * 5.5, -41 + s * 4], [8.5 + c * 8, -41 + s * 6.5]]);
  }
}

// Drop bear: like a koala gone wrong: dark, red eyes, fangs, claws out
function drawDropBear(g) {
  const { fill } = brush(g);
  const dark = '#4a4440', fur = '#635b55';
  fill(dark, () => g.ellipse(-9, -2, 3, 6, 0.6, 0, Math.PI * 2)); fill(dark, () => g.ellipse(9, -2, 3, 6, -0.6, 0, Math.PI * 2));   // arms out
  for (const sx of [-11, 11]) for (const k of [-1, 0, 1]) fill('#eee', () => g.rect(sx + k * 1.3, 3, 0.8, 2.5));   // claws
  fill(fur, () => g.ellipse(0, 1, 8, 9, 0, 0, Math.PI * 2));
  for (const sx of [-7, 7]) { fill(fur, () => g.arc(sx, -15, 4.5, 0, Math.PI * 2)); fill('#2a2522', () => g.arc(sx, -15, 2.4, 0, Math.PI * 2)); }
  fill(fur, () => g.arc(0, -11, 7, 0, Math.PI * 2));
  fill('#ff2a1a', () => g.arc(-3, -13, 1.3, 0, Math.PI * 2)); fill('#ff2a1a', () => g.arc(3, -13, 1.3, 0, Math.PI * 2));   // red eyes
  fill('#1a1a1c', () => g.ellipse(0, -10, 2, 2.4, 0, 0, Math.PI * 2));
  fill('#3a0d0d', () => g.ellipse(0, -6, 3.5, 2, 0, 0, Math.PI * 2));   // snarling mouth
  fill('#fff', () => g.rect(-2.5, -7, 1, 2)); fill('#fff', () => g.rect(1.5, -7, 1, 2));   // fangs
}
