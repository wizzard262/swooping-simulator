'use strict';
// ---------------------------------------------------------------------------
// Input: arrow keys or WASD, hold Space to swoop, P to poop; on touch screens, hold
// where you want to fly, tap quickly to start or stop a swoop, tap with a second finger to poop
// ---------------------------------------------------------------------------
const keys = { up: false, down: false, left: false, right: false, swoop: false };
const KEYMAP = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
let started = false, startedAt = 0, touch = null, touchAt = 0, touchSwoop = false, isTouch = false;
addEventListener('keydown', e => {
  if (canRestart()) { restart(); return; }
  if (objectivesOpen()) { e.preventDefault(); if (!e.repeat) toggleObjectives(false); return; }   // any key closes the list (the game waits behind it)
  if (e.code === 'KeyO') { if (!e.repeat) toggleObjectives(true); return; }
  if (e.code === 'Space') { e.preventDefault(); keys.swoop = true; begin(); return; }
  if (e.code === 'KeyP') { if (!e.repeat) poop(); begin(); return; }
  if (e.code === 'KeyB') { if (!e.repeat) barrelRoll(); begin(); return; }
  if (e.code === 'KeyL') { if (!e.repeat) loopTheLoop(); begin(); return; }
  if (e.code === 'KeyM') { if (!e.repeat) Sound.toggle(); begin(); return; }
  const k = KEYMAP[e.code];
  if (k) { keys[k] = true; e.preventDefault(); begin(); }
});
addEventListener('keyup', e => { if (e.code === 'Space') keys.swoop = false; const k = KEYMAP[e.code]; if (k) keys[k] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; touch = null; });
function toInternal(e) {
  const rect = canvas.getBoundingClientRect(), s = Math.min(rect.width / W, rect.height / H);
  return { x: (e.clientX - rect.left - (rect.width - W * s) / 2) / s, y: (e.clientY - rect.top - (rect.height - H * s) / 2) / s };   // the game is centred
}
document.getElementById('sound').addEventListener('click', e => { e.currentTarget.blur(); Sound.toggle(); begin(); });
// Touch controls are for fingers and pens only: a mouse click (say, to focus the window)
// just starts the game and the sound, and never steers or swoops
let fingers = 0;
const isFinger = e => e.pointerType !== 'mouse';
front.addEventListener('pointerdown', e => {
  if (canRestart()) { restart(); return; }
  if (onObjLink(toInternal(e))) { toggleObjectives(true); return; }
  begin();
  if (!isFinger(e)) return;
  isTouch = true;
  if (++fingers > 1) { poop(); return; }                          // a second finger poops
  touch = toInternal(e); touchAt = performance.now(); front.setPointerCapture(e.pointerId);
});
front.addEventListener('pointermove', e => {
  if (touch && isFinger(e)) touch = toInternal(e);
  front.style.cursor = onObjLink(toInternal(e)) ? 'pointer' : '';   // the objectives link looks clickable
});
front.addEventListener('pointerup', e => {
  if (!isFinger(e)) return;
  fingers = Math.max(0, fingers - 1); if (fingers) return;
  if (performance.now() - touchAt < 180) touchSwoop = !touchSwoop;  // a quick tap starts or stops a swoop
  touch = null;
});
front.addEventListener('pointercancel', e => { if (!isFinger(e)) return; fingers = Math.max(0, fingers - 1); if (!fingers) touch = null; });
function begin() { Sound.start(); if (!started) { started = true; startedAt = time; } }

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------
// Swooping: fast flight while Space is held. The charge bar empties in 3 seconds of
// swooping and takes 10 seconds to fill again. Up and down tilt the magpie 30 degrees.
const SWOOP_SPEED = 330, SWOOP_DRAIN = 1 / 6, SWOOP_RECHARGE = 1 / 10, TILT = Math.PI / 6;   // a full swoop bar lasts 6 seconds: time to swoop-poop or loop in it
const bird = { x: 120, y: 90, vx: 0, vy: 0, face: 1, grounded: false, flapT: 0, walkT: 0, pitch: 0, swooping: false, spent: false, charge: 1, poop: 1, inside: false, wasIn: false, drunk: 0, roll: 0, loopT: 0, loop: null, onHoist: false, hoistAt: 0, hoistR: 0, hoistTurn: 1, hoistFaceAt: 0, onRoo: false, rooAt: 0, turnDir: 0, turnRate: 0, callIn: 12, calling: 0, onBbq: false, hot: 0, hotFade: 0, flung: false, onBack: 0, dazed: false, onCarrier: null, carrierAt: 0, hanging: false, whipped: false, snag: false, beerRoll: false, loopEndAt: -99 };
const ON_BACK_TIME = 2.2, GET_UP_TIME = 0.4;   // after the barbecue: on his back waving his legs, then he rolls back up
const CALL_TIME = 2;              // a magpie call lasts 2 seconds, every 10 to 20 seconds on the ground

// Stunts: B for a barrel roll (two full turns on his own axis, bursting forward at swoop speed), L for a loop-the-loop
// (a full vertical circle, carrying on forward as he goes round)
const LOOP_TIME = 1.1, LOOP_R = 22;
// SOLAR-SLINGSHOT!!!!: loop-the-loop with the sun's middle inside the loop and the sun catches him.
// He whips round it three times in 4 seconds (the camera holds still), speeding up all the way,
// bent round it and stretching out, smearing into a blur that grows into a full grey-white ring.
// All the while the sun swells to 2.5 times its size (dropping a little so he stays on screen), his
// circle widening with it, and everything fades to white. Then he's spat out forward at twice swoop
// speed on twin afterburners, shrinking back to size, the white clears, the whole game jumps 30%
// closer and bounces back over 2 seconds (always filling the window), the sun shrinks back over 3,
// and the clouds burn away: none for 10 seconds, then they fade back one at a time over 20.
const SLING = { t: 0, out: 0, th0: 0, th1: 0 }, SLING_ORBIT = 4, SLING_TURNS = 3, SLING_OUT = 1.5, SLING_R = 28;   // SLING_R: just outside the sun's face
const SUN_SWELL = 2.5, SUN_SHRINK = 3, WHITE_CLEAR = 0.25;
const slingProgress = () => 1 - SLING.t / SLING_ORBIT;              // 0 to 1 through the orbit
const slingBlur = () => SLING.t > 0 ? clamp((slingProgress() - 0.2) / 0.6, 0, 1) : 0;   // how much of the circle the blur covers
const NOVA = { at: -Infinity }, NOVA_ZOOM = 0.3, NOVA_BOUNCE = 2, CLOUDS_GONE = 10, CLOUDS_BACK = 20;
function sunGrow() {                                                 // the sun's size, 1 normally
  if (SLING.t > 0) return 1 + (SUN_SWELL - 1) * slingProgress();
  const k = (time - NOVA.at) / SUN_SHRINK;                           // after the slingshot: shrinking back, smoothly
  return k >= 0 && k < 1 ? SUN_SWELL - (SUN_SWELL - 1) * (k * k * (3 - 2 * k)) : 1;
}
const slingR = () => SLING_R * sunGrow();                             // his circle round it, widening as it grows
const sunCentre = () => ({ x: sunLeft() + SUN_SIZE / 2, y: Math.max(SUN_TOP + SUN_SIZE / 2, slingR() + 4) });   // on screen
function novaWhite() {                                               // how white the screen is: fading in all the way round, clearing fast after
  if (SLING.t > 0) return slingProgress() ** 1.5;
  const k = (time - NOVA.at) / WHITE_CLEAR;
  return k >= 0 && k < 1 ? 1 - k : 0;
}
function startSlingshot() {
  const s = sunCentre();
  SLING.th0 = Math.atan2(bird.face * (bird.x - cam - s.x), bird.y - s.y);   // where he is round it, the same way the loop goes
  SLING.th1 = Math.PI * 2 * Math.ceil((SLING.th0 + SLING_TURNS * Math.PI * 2) / (Math.PI * 2));   // three times round, ending underneath going forward
  SLING.t = SLING_ORBIT;
  bird.loopT = 0; bird.swooping = false;
}
// Spat out, he leaves a wake: a 30-degree cone behind him, half above and half below, up to WAKE_LEN
// pixels back. Everything in it is hit as if he'd both pooped on it and swooped it (each thing once per
// slingshot; the cyclist's cable ties can't sting it). It shows as anime speed lines, and he glides to
// the middle of the screen so the cone has room both sides
const WAKE_LEN = 260, WAKE_ANGLE = Math.PI / 6, wakeHit = new Set();
function inWake(sx, y) {                                             // is a point on screen inside the cone?
  const d = -bird.face * (sx - (bird.x - cam)), v = y - bird.y;
  return d > 0 && d < WAKE_LEN && Math.abs(v) <= 6 + d * Math.tan(WAKE_ANGLE / 2);
}
function sweepWake() {
  const once = (key, fn) => { if (!wakeHit.has(key)) { wakeHit.add(key); fn(); } };
  for (const t of TARGETS) if (inWake(loopX(t.x + t.w / 2), t.y + t.h / 2)) once(t, () => t.hit({}));   // the poop hits
  if (inWake(loopX(HOIST.x), HOIST.mastTop + 10)) once('hoist', () => { HOIST.spin = -bird.face * HOIST_WHIRL; showCombo('WHIPPER-SNIPPER!', true); });
  if (ROO.dizzy <= 0 && inWake(loopX(ROO.x), rooTop())) once('roo', () => knockOver());
  for (let d = 4; d < WAKE_LEN; d += 4)                              // the rest by where they are on their own layers
    for (let v = -6 - d * Math.tan(WAKE_ANGLE / 2); v <= 6 + d * Math.tan(WAKE_ANGLE / 2); v += 3) {
      const sx = bird.x - cam - bird.face * d, y = bird.y + v;
      if (postieHitBy(sx, y)) once('postie', knockPostie);
      if (possumHitBy(sx, y)) once('possum', spinPossum);
      if (climbersHitBy(sx, y)) once('climbers', hitClimbers);
      if (SHARK.sink <= 0 && sharkHitBy(sx, y)) once('shark', swoopShark);
    }
}
function updateSlingshot(dt) {
  if (SLING.out > 0) { SLING.out = Math.max(0, SLING.out - dt); sweepWake(); }
  if (SLING.t <= 0) return;
  SLING.t = Math.max(0, SLING.t - dt);
  const p = slingProgress(), th = SLING.th0 + (SLING.th1 - SLING.th0) * p * p, s = sunCentre(), R = slingR();   // p squared: speeding up all the way round
  bird.x = cam + s.x + bird.face * R * Math.sin(th);
  bird.y = s.y + R * Math.cos(th);
  bird.vx = bird.vy = 0; bird.pitch = -th; bird.flapT += dt * 14; bird.swooping = false; bird.grounded = false;
  if (SLING.t === 0) {                                               // let go: flung out
    bird.pitch = 0; SLING.out = SLING_OUT; NOVA.at = time; wakeHit.clear();
    showCombo('SOLAR-SLINGSHOT!!!!');
  }
}
function novaZoom() {                                                // the whole game's scale: 1.3, bouncing back to 1 (never below)
  const t = (time - NOVA.at) / NOVA_BOUNCE;
  return t < 0 || t >= 1 ? 1 : 1 + NOVA_ZOOM * (1 - bounceOut(t));
}
function bounceOut(t) {                                              // the classic bounce ease: settles in three bounces
  if (t < 1 / 2.75) return 7.5625 * t * t;
  if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
  if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
  return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
}
function cloudAlpha(cl) {
  const each = CLOUDS_BACK / clouds.list.length;                     // each cloud's turn to fade in
  return clamp((time - NOVA.at - CLOUDS_GONE - cl.back * each) / each, 0, 1);
}
function barrelRoll() {
  if (bird.roll > 0) return;
  bird.roll = ROLL_TIME;
  if (bird.inside) { showCombo('BEER-BARREL!'); bird.beerRoll = true; }   // barrel-rolling through the BOTTLE-O: pop art, and barrels come out
  if (bird.swooping) showCombo('BARREL SWOOP!');                    // rolling mid-swoop (both, if it's both)
  if (!bird.inside && !bird.swooping && !bird.grounded) award(10);
}
// TRUE-BLUE!: barrel roll past the Aussie flag and he takes it off the pole and wears it as a cape
// for 5 seconds; then it's back flying on its pole
const CAPE = { t: 0 }, CAPE_TIME = 5;
function checkTrueBlue() {
  if (bird.roll <= 0 || CAPE.t > 0) return;
  const sx = suburbX(FLAG.x + 2), top = SUBURB_BASE - FLAG.pole + 1;
  if (Math.abs(wrapDx(bird.x - cam, sx + FLAG.w / 2, suburb.P)) < FLAG.w / 2 + 6 && Math.abs(bird.y - (top + FLAG.h / 2)) < 12) {
    CAPE.t = CAPE_TIME;
    showCombo('TRUE-BLUE!');
  }
}
function loopTheLoop() {
  if (bird.loopT > 0 || bird.inside || bird.onBack > 0) return;    // no room under the shop ceiling; not while on his back
  if (bird.swooping) showCombo('SWOOP-AND-LOOP!');
  bird.swooping = false;
  bird.grounded = false;
  const y0 = Math.max(bird.y, TOP_Y + 2 * LOOP_R);                  // keep the top of the loop on screen
  bird.loop = { x: bird.x, y: y0, vx: Math.abs(bird.vx) > 30 ? bird.vx : bird.face * 60, face: bird.face };
  bird.loopT = LOOP_TIME;
  award(20);
}

// Pooping: P drops a white teardrop. It takes a full poop bar, which fills again in 3 seconds.
// Drops splosh on whatever they hit: a target in TARGETS, the bridge climbers, the postie,
// the possum, or the lawn.
const POOP_RECHARGE = 1 / 3, DROP_GRAVITY = 320;   // a full poop bar every 3 seconds
const POOP_REACH = 1.25;          // a poop hits anything within a quarter wider than it looks
const TARGETS = [];               // { x, y, w, h, hit(drop) } in world pixels
const drops = [], sploshes = [], splashes = [], SPLOSH_TIME = 10;

// Pop-art captions showing: { text, t: seconds left, len, follow, at }. Several can show at once
// (two things done together), stacked one under the other. at: where on the screen, just above
// the magpie (below him if he's at the top); follow: it travels along above him, flashing
// (SNAG-ROCKET!, WHIPPER-SNIPPER!)
const captions = [], COMBO_TIME = 1;
let comboText = '';                // the latest caption
const comboSpot = () => ({ x: clamp(bird.x - cam, 50, W - 50), y: bird.y - 26 >= 18 ? bird.y - 26 : bird.y + 26 });
const showCombo = (text, follow = false, pts = 200) => {
  markObjective(text);
  comboText = text;
  const len = COMBO_TIME * (follow ? 1.6 : 1);
  captions.push({ text, t: len, len, follow, at: comboSpot() });
  if (pts) award(pts);
};
const say = text => showCombo(text, false, 0);   // a pop-art caption for something that scores (or costs) points of its own

function poop() {
  if (bird.poop < 1) return;
  bird.poop = 0; bird.snag = false;                                 // pooping: he drops the snag
  Sound.plop();
  drops.push({ x: bird.x - bird.face * 10, y: bird.y + 3, vx: bird.vx * 0.7, vy: Math.max(bird.vy, 0) * 0.7 + 15,
    swoop: bird.swooping,                                             // dropped in a swoop: SWOOP-AND-POOP! if it hits someone
    afterLoop: bird.swooping && time - bird.loopEndAt < LOOP_POOP_TIME });   // ...and LOOP-POOP-SWOOP! if he'd just looped
}
const LOOP_POOP_TIME = 6;          // a loop, then a swoop-poop on someone within this many seconds: LOOP-POOP-SWOOP!
// A poop dropped in a swoop has hit someone (or the barbie)
function swoopPoopHit(d) {
  showCombo('SWOOP-AND-POOP!');
  if (d.afterLoop) { showCombo('LOOP-POOP-SWOOP!', false, 400); markObjective('SWOOP-AND-LOOP!'); }   // counts for the swoop-and-loop too
}

function splosh(x, y) {
  const r = rng(Math.floor(x * 7 + y * 13));
  const blobs = [{ dx: 0, dy: 0, rx: 3.2, ry: 1.1 }];
  for (let i = 0; i < 6; i++) blobs.push({ dx: (r() - 0.5) * 11, dy: (r() - 0.5) * 2, rx: 0.4 + r() * 0.8, ry: 0.3 + r() * 0.4 });
  sploshes.push({ x, y, blobs, born: time });
  Sound.splosh();
  while (sploshes.length && time - sploshes[0].born > SPLOSH_TIME) sploshes.shift();
  for (let i = 0; i < 7; i++) splashes.push({ x, y, vx: (r() - 0.5) * 90, vy: -30 - r() * 50, life: 0.45 });
}

function updateDrops(dt) {
  for (const d of drops) {
    d.vy += DROP_GRAVITY * dt;
    d.x += d.vx * dt; d.y += d.vy * dt;
    const target = TARGETS.find(t => mod(d.x - t.x + t.w * (POOP_REACH - 1) / 2, LEVEL_W) < t.w * POOP_REACH && d.y > t.y && d.y < t.y + t.h);   // allowing for the loop
    if (target) { d.done = true; target.hit(d); splosh(d.x, d.y); }
    else if (climbersHitBy(loopX(d.x), d.y)) { d.done = true; hitClimbers(); }   // splat on the bridge climbers
    else if (postieHitBy(loopX(d.x), d.y)) { d.done = true; knockPostie(); }       // splat on the postie
    else if (possumHitBy(loopX(d.x), d.y)) { d.done = true; spinPossum(); }        // splat on the possum
    else if (d.y >= LAND_Y + 1) { d.done = true; d.swoop = 0; splosh(d.x, LAND_Y + 1); }   // just the lawn
    if (d.done && d.swoop) swoopPoopHit(d);
  }
  for (let i = drops.length - 1; i >= 0; i--) if (drops[i].done) drops.splice(i, 1);
  for (const sp of splashes) { sp.vy += DROP_GRAVITY * dt; sp.x += sp.vx * dt; sp.y += sp.vy * dt; sp.life -= dt; }
  for (let i = splashes.length - 1; i >= 0; i--) if (splashes[i].life <= 0) splashes.splice(i, 1);
}
let cam = bird.x - SCREEN * 0.42, time = 0;
const trail = [];
let blur = 0;                     // 0 to 1: how much the screen is smeared by a swoop
let sunHi, clouds, hills, backStreets, suburb, ground, shopFront, shelfStock;

// Game controller (standard layout, e.g. Xbox or PlayStation):
//   left stick or D-pad: fly   A / Cross: flap   right trigger or right bumper (hold): swoop
//   X / Square: poop   B / Circle: barrel roll   Y / Triangle: loop-the-loop   Back / Select: sound
const PAD = { up: false, down: false, left: false, right: false, swoop: false, connected: false };
let padPrev = [];
function pollPad() {
  const pads = navigator.getGamepads ? [...navigator.getGamepads()] : [];
  const gp = pads.find(p => p && p.connected);
  PAD.connected = !!gp;
  if (!gp) { Object.assign(PAD, { up: false, down: false, left: false, right: false, swoop: false }); padPrev = []; return; }
  const b = i => !!(gp.buttons[i] && gp.buttons[i].pressed), ax = gp.axes[0] || 0, ay = gp.axes[1] || 0, dead = 0.35;
  PAD.left = ax < -dead || b(14); PAD.right = ax > dead || b(15);
  PAD.up = ay < -dead || b(12) || b(0); PAD.down = ay > dead || b(13);
  PAD.swoop = b(7) || b(5);
  const pressed = i => b(i) && !padPrev[i];
  const any = gp.buttons.some((x, i) => x.pressed && !padPrev[i]);
  if (canRestart() && any) { restart(); return; }
  if (objectivesOpen()) { if (any) toggleObjectives(false); }       // any button closes the list
  else {
    if (pressed(9)) toggleObjectives(true);                          // Start: the objectives list
    if (pressed(2)) poop();
    if (pressed(1)) barrelRoll();
    if (pressed(3)) loopTheLoop();
    if (pressed(8)) Sound.toggle();
  }
  if (any || Math.abs(ax) > dead || Math.abs(ay) > dead) begin();
  padPrev = gp.buttons.map(x => x.pressed);
}
addEventListener('gamepadconnected', () => { isTouch = false; });

function controls() {
  const c = { ...keys };
  for (const k of ['up', 'down', 'left', 'right']) c[k] = c[k] || PAD[k];
  if (bird.drunk > 0 && Math.sin(time * 1.3) > 0.55) [c.left, c.right] = [c.right, c.left];   // drunk: left and right swap now and then
  if (touch) {
    const dx = touch.x - (bird.x - cam), dy = touch.y - bird.y;
    if (dx < -8) c.left = true; if (dx > 8) c.right = true;
    if (dy < -8) c.up = true; if (dy > 8) c.down = true;
  }
  return c;
}

function update(dt) {
  time += dt;
  const c = controls(), dirX = (c.right ? 1 : 0) - (c.left ? 1 : 0), dirY = (c.down ? 1 : 0) - (c.up ? 1 : 0);
  if (dirX) bird.face = dirX;

  // Start a swoop with a little charge in the bar; keep going until let go or empty
  const wantSwoop = keys.swoop || touchSwoop || PAD.swoop;
  if (!wantSwoop) bird.spent = false;                               // after running dry, let go of Space before the next swoop
  if (wantSwoop && !bird.swooping && !bird.spent && bird.loopT <= 0 && bird.onBack <= 0 && bird.charge > 0.05) {
    bird.swooping = true; bird.grounded = false; bird.snag = false;   // swooping: he drops the snag
    if (bird.flung && !bird.whipped) { bird.whipped = true; showCombo('SNAG-ROCKET!', true); }   // swooping while tumbling: off like a snag fired off the barbie
  }
  if (bird.swooping && bird.charge <= 0) { bird.spent = true; touchSwoop = false; }
  if (!wantSwoop || bird.spent) bird.swooping = false;
  bird.charge = clamp(bird.charge + (bird.swooping ? -SWOOP_DRAIN : SWOOP_RECHARGE) * dt, 0, 1);
  bird.poop = Math.min(1, bird.poop + POOP_RECHARGE * dt);
  updateDrops(dt);
  updateShopAndDrunk(dt);
  // What's under him: the shop roof, the top of the Hills Hoist (only from above), or the lawn
  const overHoist = Math.abs(hoistDx(bird.x)) < HOIST.r && bird.y <= HOIST.top - FEET + 3;
  const overRoo = ROO.dizzy <= 0 && Math.abs(rooDx(bird.x)) < 9 && bird.y <= rooTop() - FEET + 3;
  const overBbq = Math.abs(bbqDx(bird.x)) < BBQ.half && bird.y <= BBQ.top - FEET + 3;
  const carrier = bird.onCarrier || carrierUnder();
  const perch = PERCHES.reduce((top, pc) => mod(bird.x - pc.x0, LEVEL_W) < pc.x1 - pc.x0 && bird.y <= pc.y - FEET + 3 ? Math.min(top, pc.y) : top, Infinity);   // the tree's perches
  const floorTop = bird.onCarrier ? CARRIERS[bird.onCarrier].top() : shopSpan(bird.x) && !bird.inside ? SHOP.roof : overHoist || bird.onHoist ? HOIST.top : overRoo || bird.onRoo ? rooTop() : overBbq || bird.onBbq ? BBQ.top : carrier ? CARRIERS[carrier].top() : perch < Infinity ? perch : LAND_Y;
  const floor = floorTop - FEET;
  if (bird.grounded && bird.y < floor - 0.5) bird.grounded = false;                // walked off the roof

  if (bird.hanging && (c.down || bird.swooping || bird.loopT > 0)) {   // let go of the hoist: off the way he's facing
    bird.hanging = false; bird.vy = 20; bird.vx = bird.face * Math.abs(HOIST.spin) * 20;
  }
  if (bird.swooping) {
    // Swoop: straight and fast; up or down angles the dive 30 degrees
    const a = dirY * TILT;
    bird.vx = bird.face * SWOOP_SPEED * Math.cos(a);
    bird.vy = SWOOP_SPEED * Math.sin(a);
    bird.y += bird.vy * dt;
    if (bird.y < TOP_Y) bird.y = TOP_Y;
    if (bird.y > floor) bird.y = floor;                              // skims along the lawn (or the roof)
  } else if (bird.grounded && bird.onBack > 0) {                     // flat on his back: no going anywhere till he's up
    bird.vx = 0;
    bird.onBack = Math.max(0, bird.onBack - dt);
  } else if (bird.grounded) {
    bird.vx = dirX * WALK;
    if (dirX) bird.walkT += dt;
    if (c.up) { bird.grounded = false; bird.vy = -60; bird.onRoo = false; if (bird.onHoist) { bird.onHoist = false; bird.vx = bird.face * HOIST.spin * 20; } }   // off the hoist: flung the way he's facing
  }
  if (!bird.grounded && !bird.swooping && !bird.hanging) {
    const maxX = c.down ? MAX_X_DIVE : MAX_X;
    // Turning round: whatever speed he's going, he's flying full speed the other way 1 second later
    if (dirX && bird.turnDir !== dirX && dirX * bird.vx < -5) { bird.turnDir = dirX; bird.turnRate = (Math.abs(bird.vx) + maxX) / TURN_TIME; }
    if (bird.turnDir && (dirX !== bird.turnDir || dirX * bird.vx >= maxX)) bird.turnDir = 0;
    if (bird.turnDir) bird.vx = clamp(bird.vx + dirX * bird.turnRate * dt, -Math.max(maxX, Math.abs(bird.vx)), Math.max(maxX, Math.abs(bird.vx)));
    else if (Math.abs(bird.vx) > maxX) bird.vx += (Math.sign(bird.vx) * maxX - bird.vx) * Math.min(1, 2 * dt);  // ease back after a swoop
    else if (dirX) bird.vx = clamp(bird.vx + dirX * ACCEL_X * dt, -maxX, maxX);
    else bird.vx *= Math.exp(-0.8 * dt);                           // glide keeps most of its speed
    if (SLING.out > 0) { bird.vx = bird.face * SWOOP_SPEED * 2; bird.vy = (H / 2 - bird.y) * 6; }   // flung out of the SOLAR-SLINGSHOT!!!!, gliding to the middle of the screen
    else if (bird.roll > 0) { bird.vx = bird.face * SWOOP_SPEED; bird.vy = 0; }   // barrel roll: a straight burst forward at swoop speed (no afterburner)
    else {
      bird.vy += (GRAVITY - (c.up ? FLAP : 0) + (c.down ? DIVE : 0)) * dt;
      const maxDown = c.down ? MAX_DIVE : MAX_FALL;
      if (bird.vy > maxDown) bird.vy += (maxDown - bird.vy) * Math.min(1, 6 * dt);  // ease to falling speed
      bird.vy = Math.max(bird.vy, -MAX_CLIMB);
    }
    bird.y += bird.vy * dt;
    if (bird.y < TOP_Y) { bird.y = TOP_Y; bird.vy = Math.max(0, bird.vy); }
    if (bird.vy < 0 && bird.loopT <= 0 && Math.abs(hoistDx(bird.x)) < HOIST.r - 2 && bird.y > HOIST.top && bird.y < HOIST.top + 14) {
      // flew up under the Hills Hoist: grab hold and ride round underneath it, upside down by his feet
      const dx = hoistDx(bird.x);
      bird.hanging = true; bird.vx = bird.vy = 0; bird.hoistR = Math.abs(dx); award(20); say('DOWN UNDER!');
      bird.hoistAt = (dx >= 0 ? 0 : Math.PI) - HOIST.angle;
      bird.hoistFaceAt = (bird.face > 0 ? 0 : Math.PI) - HOIST.angle;
    }
    if (bird.y >= floor) {
      bird.y = floor; bird.vy = 0; bird.grounded = true; bird.walkT = 0;
      if (bird.flung) { bird.flung = false; bird.onBack = ON_BACK_TIME; bird.vx = 0; }   // came down from the barbecue: tumbles onto his back
      else if (overRoo && floorTop === rooTop()) { bird.onRoo = true; bird.rooAt = clamp(rooDx(bird.x), -6, 6); award(50); say('ROO-DIMENTARY!'); }   // landed on the kangaroo
      else if (overBbq && floorTop === BBQ.top) bird.onBbq = true;   // landed on the barbecue: ouch
      else if (carrier && !bird.onCarrier) {                           // landed on the postie or the ferry: hitch a ride
        bird.onCarrier = carrier; bird.carrierAt = clamp(bird.x - cam - CARRIERS[carrier].x(), -4, 4); award(50);
        say(carrier === 'ferry' ? 'BLUDGER!' : 'POSTIE-PILLION!');
        if (carrier === 'postie' && bird.drunk > 0) say('RBT TIME!');   // drunk on the postie's bike: random breath test
      }
      else if (floorTop === HOIST.top) {                               // landed on the Hills Hoist: hop on for a ride
        const dx = clamp(hoistDx(bird.x), -HOIST.r, HOIST.r);
        bird.onHoist = true; bird.hoistR = Math.abs(dx); award(20); say('SPIN-CYCLE!');
        bird.hoistAt = (dx >= 0 ? 0 : Math.PI) - HOIST.angle;          // where round the hoist he is (left or right of the mast)
        bird.hoistFaceAt = (bird.face > 0 ? 0 : Math.PI) - HOIST.angle; // and which way he's facing
      }
    }
  }
  if (!bird.grounded) bird.flapT += dt * (bird.swooping ? 0 : c.up ? 14 : dirX ? 8 : 0);
  bird.x += bird.vx * dt;

  // The bottle shop: come in from the side below the roof line and you're inside, under the
  // ceiling; leave by either side and the fun starts
  const nowIn = shopSpan(bird.x);
  if (nowIn && !bird.wasIn) { bird.inside = bird.y > SHOP.roof - 2; bird.beerRoll = false; }
  if (!nowIn && bird.wasIn && bird.inside) { bird.inside = false; leaveShop(mod(bird.x - SHOP.x, LEVEL_W) < LEVEL_W / 2); }
  if (nowIn && bird.inside && bird.y < SHOP.ceil + 7) { bird.y += (SHOP.ceil + 7 - bird.y) * Math.min(1, 12 * dt); bird.vy = Math.max(0, bird.vy); }
  bird.wasIn = nowIn;

  if (bird.onHoist && !bird.grounded) bird.onHoist = false;          // swooped or looped off it
  if (bird.onRoo && !bird.grounded) bird.onRoo = false;
  if (bird.onBbq && !bird.grounded) bird.onBbq = false;
  if (bird.onCarrier && !bird.grounded) bird.onCarrier = null;
  updateRoo(dt);
  updateCast(dt);
  if (bird.swooping && ROO.dizzy <= 0 && Math.abs(rooDx(bird.x)) < 10 && bird.y > rooTop() - 8 && bird.y < ROO.ground) knockOver();   // swooped him
  if (bird.onRoo) {                                                  // riding along on his back
    bird.x = bird.x - rooDx(bird.x) + bird.rooAt;
    bird.y = rooTop() - FEET; bird.vx = 0; bird.face = ROO.dir;
  }
  updateHoist(dt);
  if (bird.onHoist || bird.hanging) {                               // on (or under) the hoist: carried round with it, turning as it turns
    bird.x = HOIST.x + Math.round((bird.x - HOIST.x) / LEVEL_W) * LEVEL_W + Math.cos(HOIST.angle + bird.hoistAt) * bird.hoistR;
    bird.y = bird.hanging ? HOIST.top + HANG_Y : HOIST.top - FEET;
    bird.vx = 0;
    bird.hoistTurn = Math.cos(HOIST.angle + bird.hoistFaceAt);         // 1 facing right, -1 facing left, between = turning
    bird.face = bird.hoistTurn >= 0 ? 1 : -1;
  }

  // Up and down tilt the magpie 30 degrees; it eases between angles
  const targetPitch = bird.grounded ? 0 : dirY * TILT;
  bird.pitch += (targetPitch - bird.pitch) * Math.min(1, 8 * dt);

  if (bird.loopT > 0) {                                            // loop-the-loop: round a circle, nose along it
    bird.loopT = Math.max(0, bird.loopT - dt);
    const L = bird.loop, t = 1 - bird.loopT / LOOP_TIME, th = t * Math.PI * 2, el = t * LOOP_TIME;
    bird.x = L.x + L.vx * el * 0.6 + L.face * LOOP_R * Math.sin(th);
    bird.y = L.y - LOOP_R + LOOP_R * Math.cos(th);
    bird.vx = L.vx; bird.vy = 0; bird.face = L.face;
    bird.pitch = -th;
    bird.flapT += dt * 14;
    if (!L.sunChecked && t >= 0.5) {                                 // halfway round: is the sun inside the loop?
      L.sunChecked = true;
      const cx = L.x + L.vx * el * 0.6 - cam, cy = L.y - LOOP_R;
      if (Math.hypot(cx - sunCentre().x, cy - sunCentre().y) < LOOP_R) startSlingshot();
    }
    if (bird.loopT === 0 && SLING.t <= 0) { bird.pitch = 0; bird.loopEndAt = time; }
  }
  updateSlingshot(dt);

  // Speed streaks when going fast
  const speed = Math.hypot(bird.vx, bird.vy);
  if (speed > 120 && Math.random() < dt * 50) trail.push({ x: bird.x - bird.face * 8, y: bird.y + (Math.random() - 0.5) * 8, life: 0.35 });
  for (const t of trail) t.life -= dt;
  while (trail.length && trail[0].life <= 0) trail.shift();

  // On the barbecue he heats up, smoking and going red, then he's flung off with a sizzle
  if (bird.onBbq) {
    bird.hot = Math.min(1, bird.hot + dt / 1.1);
    if (bird.hot >= 1) {
      bird.onBbq = false; bird.grounded = false; bird.vy = -150; bird.vx = (Math.random() < 0.5 ? -1 : 1) * 90; bird.hotFade = 2.5;
      Sound.sizzle(); Sound.scream(); penalty(100); say('COOKED, MATE!');
      bird.flung = true; bird.whipped = false; bird.snag = false;     // he'll land on his back (and the snag's gone)
    }
  } else if (bird.hotFade > 0) { bird.hotFade = Math.max(0, bird.hotFade - dt); bird.hot = bird.hotFade / 2.5; }
  else bird.hot = 0;
  if (bird.hot > 0 && Math.random() < dt * 25) smoke.push({ x: bird.x + (Math.random() - 0.5) * 8, y: bird.y - 2, life: 1.2, r: 1 + Math.random() });

  // A magpie call now and then while he's on the ground
  if (bird.calling > 0) bird.calling = Math.max(0, bird.calling - dt);
  else if (bird.grounded && bird.onBack <= 0) { bird.callIn -= dt; if (bird.callIn <= 0) { bird.calling = CALL_TIME; bird.callIn = 10 + Math.random() * 10; Sound.carol(); } }

  const fast = bird.swooping || SLING.out > 0;
  blur += ((fast ? 1 : 0) - blur) * Math.min(1, (fast ? 6 : 3) * dt);
  CAPE.t = Math.max(0, CAPE.t - dt);
  checkTrueBlue();
  for (const c of captions) c.t -= dt;
  for (let i = captions.length - 1; i >= 0; i--) if (captions[i].t <= 0) captions.splice(i, 1);
  Sound.tick(dt);

  const target = bird.x - W * 0.42 + bird.face * W * 0.06 + clamp(bird.vx * 0.25, -60, 60);
  if (SLING.t <= 0) cam += (target - cam) * Math.min(1, 3 * dt);    // held still while he whips round the sun
  if (bird.onCarrier && bird.grounded) {                             // riding: stay put on the postie or the ferry, on screen
    const c = CARRIERS[bird.onCarrier];
    bird.x = cam + c.x() + bird.carrierAt; bird.y = c.top() - FEET; bird.vx = 0; bird.face = c.dir();
  }
}

function magpiePose() {
  const pose = basePose();
  if (bird.flung && !bird.grounded) {                                // flung off the barbecue: tumbling over and over, wings flailing
    pose.flip = (time * 11) % (Math.PI * 2);
    pose.wings = 0.2 + 0.8 * Math.sin(time * 30);
  }
  if (bird.onBack > 0) {                                             // on his back, legs waving in the air, then rolling back up
    const up = bird.onBack < GET_UP_TIME ? bird.onBack / GET_UP_TIME : 1;
    Object.assign(pose, { pitch: -0.35, headPitch: 0.5, wings: 'folded', legs: time * 22, flip: Math.PI * up, bob: 15 * up });
  }
  if (bird.hanging) {                                                 // upside down by his feet, swinging round
    Object.assign(pose, { pitch: -0.35, headPitch: 0.4, wings: 0.2 + 0.3 * Math.sin(time * 14), legs: 0, dangle: false, burn: 0, bob: 0,
      flip: Math.sin(time * 3) * 0.45, hang: true });
  }
  if (bird.calling > 0) {                                            // calling: head raised, beak opening and shutting
    pose.headPitch = -0.55;
    pose.beak = Math.abs(Math.sin((CALL_TIME - bird.calling) * Math.PI * 5));
  }
  pose.roll = bird.roll > 0 ? (1 - bird.roll / ROLL_TIME) * Math.PI * 4 : 0;    // barrel roll: two full turns about his body
  const stunt = Math.max(bird.roll > 0 ? 1 - bird.roll / ROLL_TIME : 0, bird.loopT > 0 ? 1 - bird.loopT / LOOP_TIME : 0);
  pose.stretch = stunt > 0 ? 1 + 0.5 * Math.sin(Math.PI * stunt) : 1;   // barrel roll or loop: stretched out to half as long again and back
  if (SLING.t > 0) pose.stretch = 1 + 2.5 * slingProgress();                    // round the sun: stretching out as he speeds up
  else if (SLING.out > 0) pose.stretch = 1 + SLING.out / SLING_OUT;                   // spat out at double length, shrinking back as the boost dies
  pose.drunk = bird.drunk > 0;
  pose.snag = bird.snag;
  if (pose.drunk) pose.pitch += Math.sin(time * 7) * 0.18;
  return pose;
}

function basePose() {
  const c = controls();
  if (bird.grounded) {
    const walking = bird.vx !== 0;
    return { pitch: -0.35, headPitch: 0.3, wings: 'folded', legs: walking ? bird.walkT * 24 : 0, bob: walking ? -Math.abs(Math.sin(bird.walkT * 24)) * 1.5 : 0 };   // quicker steps to match the speed
  }
  const flapping = c.up || c.left || c.right || bird.loopT > 0;
  return {
    pitch: bird.pitch, headPitch: -bird.pitch * 0.3,
    wings: bird.swooping ? 'folded' : flapping ? 0.2 + 0.8 * Math.sin(bird.flapT * Math.PI / 2) : 0.35,
    legs: null, bob: 0, burn: blur * (SLING.out > 0 ? 1.6 : 1), twin: SLING.out > 0, dangle: bird.swooping
  };
}
