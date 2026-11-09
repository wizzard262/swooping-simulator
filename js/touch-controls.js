'use strict';
// ---------------------------------------------------------------------------
// Touch controls: a thumbpad on the left to fly (push up to flap), and four buttons in a
// diamond on the right, like a controller: LOOP at the top, POOP on the left, ROLL on the
// right, SWOOP at the bottom (hold it, like Space). Phones are wider than the 16:9 game, so the
// game moves into the middle and the controls sit in the strips either side; held upright, the
// game goes at the top and the controls underneath. Shown on touch screens only, and hidden
// while a game controller is plugged in.
// ---------------------------------------------------------------------------
const STICK = { up: false, down: false, left: false, right: false };   // which way the thumbpad is pushed
const STICK_DEAD = 0.3;            // how far the thumb must move (out of the pad's radius) before it counts
const KNOB_TRAVEL = 0.55;          // how far the knob follows the thumb (out of the pad's radius)
const touchUi = document.getElementById('touch');
const thumbpad = document.getElementById('thumbpad');
const knob = document.getElementById('knob');
const touchButtons = [...touchUi.querySelectorAll('.tbtn')];
let stickFinger = null;            // the finger on the thumbpad, if any
let touchShownNow = false;         // whether the controls are on screen now (resize() lays them out)

const touchControlsShown = () => isTouch && !PAD.connected;

// ---------------------------------------------------------------------------
// Layout: where the controls go and the room left for the game
// ---------------------------------------------------------------------------
// Lays out the controls for this window and says where the game goes: { left, top, width, height } in CSS pixels
function layoutTouchControls() {
  const w = innerWidth, h = innerHeight;
  touchShownNow = touchControlsShown();
  touchUi.hidden = !touchShownNow;
  document.body.classList.toggle('touch', touchShownNow);           // moves the links and sound button out of the way
  if (!touchShownNow) return { left: 0, top: 0, width: w, height: h };   // keyboard or controller: the whole window

  const upright = h > w;                                            // a phone held upright
  const short = upright ? w : h;                                    // the controls are sized to the short side
  const pad = Math.round(clamp(short * 0.36, 96, 170));             // thumbpad width
  const button = Math.round(pad * 0.42);                            // each button's width
  const spread = Math.round(button * 1.05);                         // from the diamond's middle to each button's
  const block = Math.max(pad, 2 * spread + button);                 // the width of the bigger of the two
  const margin = 12;

  if (upright) {
    // Controls along the bottom, the game in the room above them
    const band = block + 2 * margin;
    const y = h - band / 2;
    placeControls(w * 0.27, y, w * 0.73, y, pad, button, spread);
    return { left: 0, top: 0, width: w, height: h - band };
  }
  // Controls in strips either side, the game between them
  const side = block + 2 * margin;
  const y = h * 0.58;                                               // a little below the middle, where thumbs rest
  placeControls(side / 2, y, w - side / 2, y, pad, button, spread);
  return { left: side, top: 0, width: w - 2 * side, height: h };
}

// Puts the thumbpad's middle at (padX, padY) and the diamond's middle at (diamondX, diamondY)
function placeControls(padX, padY, diamondX, diamondY, pad, button, spread) {
  placeAt(thumbpad, padX, padY, pad);
  const offsets = { loop: [0, -spread], poop: [-spread, 0], roll: [spread, 0], swoop: [0, spread] };   // the diamond
  for (const el of touchButtons) {
    const [dx, dy] = offsets[el.dataset.act];
    placeAt(el, diamondX + dx, diamondY + dy, button);
    el.style.setProperty('--fs', Math.round(button * 0.22) + 'px');  // label size to suit the button
  }
}
function placeAt(el, x, y, size) {
  el.style.left = Math.round(x) + 'px';
  el.style.top = Math.round(y) + 'px';
  el.style.width = size + 'px';
  el.style.height = size + 'px';
}

// Every frame: show or hide the controls if that's changed (a controller plugged in, or the
// first finger on a laptop's touch screen), and light up a stunt button while its stunt is going
function syncTouchControls() {
  if (touchControlsShown() !== touchShownNow) { releaseTouchControls(); resize(); }
  if (!touchShownNow) return;
  for (const el of touchButtons) el.classList.toggle('busy', stuntGoing(el.dataset.act));
}
function stuntGoing(act) {
  if (act === 'swoop') return bird.swooping;
  if (act === 'roll') return bird.roll > 0;
  if (act === 'loop') return bird.loopT > 0;
  return false;                                                     // a poop is over at once
}

// Lets go of everything: the window lost focus, or the objectives list opened over the game
function releaseTouchControls() {
  releaseStick();
  touchSwoop = false;
  for (const el of touchButtons) el.classList.remove('down');
}

// ---------------------------------------------------------------------------
// The thumbpad
// ---------------------------------------------------------------------------
thumbpad.addEventListener('pointerdown', e => {
  e.preventDefault();
  if (canRestart()) { restart(); return; }                          // after the game's complete, any tap starts again
  if (objectivesOpen()) return;
  stickFinger = e.pointerId;
  thumbpad.setPointerCapture(e.pointerId);                          // it keeps following the thumb off the pad
  begin();
  moveStick(e);
});
thumbpad.addEventListener('pointermove', e => {
  if (e.pointerId === stickFinger) moveStick(e);
});
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  thumbpad.addEventListener(type, e => {
    if (e.pointerId === stickFinger) releaseStick();
  });
}
// The thumb has moved: which way is it pushing, and the knob follows it
function moveStick(e) {
  const box = thumbpad.getBoundingClientRect();
  const radius = box.width / 2;
  let dx = (e.clientX - (box.left + radius)) / radius;              // -1 (left edge) to 1 (right edge)
  let dy = (e.clientY - (box.top + radius)) / radius;               // -1 (top) to 1 (bottom)
  const far = Math.hypot(dx, dy);
  if (far > 1) { dx /= far; dy /= far; }                            // past the edge: as far as it goes
  knob.style.transform = 'translate(' + Math.round(dx * radius * KNOB_TRAVEL) + 'px, ' + Math.round(dy * radius * KNOB_TRAVEL) + 'px)';
  STICK.left = dx < -STICK_DEAD;
  STICK.right = dx > STICK_DEAD;
  STICK.up = dy < -STICK_DEAD;                                      // up flaps
  STICK.down = dy > STICK_DEAD;
}
function releaseStick() {
  stickFinger = null;
  for (const k in STICK) STICK[k] = false;
  knob.style.transform = '';                                        // the knob springs back to the middle
}

// ---------------------------------------------------------------------------
// The buttons: SWOOP is held, the others do their thing once per press
// ---------------------------------------------------------------------------
for (const el of touchButtons) {
  el.addEventListener('pointerdown', e => {
    e.preventDefault();
    if (canRestart()) { restart(); return; }
    if (objectivesOpen()) return;
    el.setPointerCapture(e.pointerId);                              // so lifting the finger off it is always seen
    el.classList.add('down');
    begin();
    pressTouchButton(el.dataset.act);
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    el.addEventListener(type, () => {
      el.classList.remove('down');
      if (el.dataset.act === 'swoop') touchSwoop = false;           // let go of SWOOP: the swoop ends
    });
  }
}
function pressTouchButton(act) {
  if (act === 'swoop') touchSwoop = true;                           // held, like Space
  if (act === 'poop') poop();
  if (act === 'roll') barrelRoll();
  if (act === 'loop') loopTheLoop();
}
