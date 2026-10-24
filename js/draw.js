'use strict';
// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------
const scene = makeCanvas(SCREEN, H), sctx = scene.getContext('2d');
const birdBuf = makeCanvas(1, 1), bbctx = birdBuf.getContext('2d', { willReadFrequently: true });   // the magpie and the cast, at a lower resolution
const poopBuf = makeCanvas(1, 1), poopCtx = poopBuf.getContext('2d');   // the poop, drawn at the same low resolution
let BIRD_PIX = 2;                 // screen pixels per pixel of those two (set in resize)
function drawTiled(img, P, offset, y = 0) {
  for (let x = -mod(Math.round(offset), P); x < W; x += P) sctx.drawImage(img, x, y);
}

// A charge bar, top left (swoop, then poop); it flashes when full
function drawBar(label, x, y, value, colour, fullColour, active, hint) {
  const full = value >= 1, bw = 40, bx = x + textWidth('SWOOP') + 4;
  drawText('- ' + hint, bx + bw + 4, y, '#ffffff');                // which key to press
  drawText(label, x, y, full || active ? fullColour : '#ffffff');
  ctx.fillStyle = '#18222e'; ctx.fillRect(bx - 1, y - 1, bw + 2, 7);
  ctx.fillStyle = '#3c4a5a'; ctx.fillRect(bx, y, bw, 5);
  ctx.fillStyle = active ? '#ff9a3c' : full && Math.floor(time * 3) % 2 ? fullColour : colour;
  ctx.fillRect(bx, y, Math.round(bw * value), 5);
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(bx, y, Math.round(bw * value), 1);
}

// Screen x of a world position, allowing for the level looping round
const loopX = x => { let sx = mod(x - cam, LEVEL_W); if (sx > W + 40) sx -= LEVEL_W; return sx; };

// Falling drops (white teardrops, pointing back along their fall), sploshes and splashes. Drawn at
// the magpie's low resolution into their own buffer, then scaled up, so they're pixelated like him.
function drawPoop(out) {
  const g = poopCtx, PK = K / BIRD_PIX;                              // buffer pixels per game pixel
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, poopBuf.width, poopBuf.height);
  for (const s of sploshes) {
    const sx = loopX(s.x), grow = Math.min(1, (time - s.born) / 0.08);
    g.globalAlpha = clamp(1 - (time - s.born) / SPLOSH_TIME, 0, 1);   // fades away over 10 seconds
    g.setTransform(PK * 1.5, 0, 0, PK * 1.5, sx * PK, s.y * PK);
    for (const b of s.blobs) {
      g.beginPath(); g.ellipse(b.dx * grow, b.dy, b.rx * grow, b.ry, 0, 0, Math.PI * 2);
      g.fillStyle = '#f6f6f2'; g.fill();
      g.strokeStyle = 'rgba(120,130,110,0.35)'; g.lineWidth = 0.2; g.stroke();
    }
    g.beginPath(); g.ellipse(-0.8, -0.3, 1.2, 0.35, 0, 0, Math.PI * 2); g.fillStyle = '#ffffff'; g.fill();
  }
  g.globalAlpha = 1;
  g.fillStyle = '#f6f6f2';
  for (const sp of splashes) {
    g.setTransform(PK, 0, 0, PK, loopX(sp.x) * PK, sp.y * PK);
    g.globalAlpha = Math.min(1, sp.life / 0.2);
    g.beginPath(); g.arc(0, 0, 0.6, 0, Math.PI * 2); g.fill();
  }
  g.globalAlpha = 1;
  for (const d of drops) {
    g.setTransform(PK * 1.4, 0, 0, PK * 1.4, loopX(d.x) * PK, d.y * PK);
    g.rotate(Math.atan2(d.vy, d.vx) - Math.PI / 2);
    g.beginPath();
    g.moveTo(0, -3.4); g.bezierCurveTo(1.1, -1.7, 1.8, -0.2, 1.8, 0.8);
    g.arc(0, 0.8, 1.8, 0, Math.PI); g.bezierCurveTo(-1.8, -0.2, -1.1, -1.7, 0, -3.4);
    const gr = g.createRadialGradient(-0.6, 0.2, 0.2, 0, 0.6, 2.2);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#d9dde0');
    g.fillStyle = gr; g.fill();
    g.strokeStyle = 'rgba(60,70,80,0.35)'; g.lineWidth = 0.25; g.stroke();
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  out.setTransform(1, 0, 0, 1, 0, 0);
  out.imageSmoothingEnabled = false;
  out.drawImage(poopBuf, 0, 0, poopBuf.width * BIRD_PIX, poopBuf.height * BIRD_PIX);
}

// The flag worn as a cape (magpie units, he faces +x): tied round his neck and draped over the top
// half of his body, just over his back, the Union Jack end at his neck. The loose end lifts and flaps.
// It follows his body: tipped with his pitch, stretched in a stunt, squashed in a barrel roll
function drawCape(g, pose) {
  const cols = FLAG.w, rows = FLAG.h, x0 = 15, x1 = -33, cw = (x0 - x1) / cols, fold = Math.min(1, CAPE.t / 0.4);   // furls up in the last moment
  const st = pose.stretch || 1;
  g.save();
  g.rotate(pose.pitch || 0);
  g.scale(st, 1 / Math.sqrt(st));
  g.scale(1, Math.cos(pose.roll || 0));
  for (let i = 0; i < cols * fold; i++) {
    const x = x0 - (i + 1) * cw, k = i / (cols - 1);                    // k: 0 at his neck, 1 at the loose end
    const back = -Math.sqrt(Math.max(0, 1 - ((x + cw / 2) / 27) ** 2)) * 16;   // the curve of his back
    const lift = k * k * (5 + 3.5 * Math.sin(time * 14 - i * 0.7));   // the loose end lifting off his back and flapping
    const ch = 1.55 + 0.25 * k;                                       // a little fuller towards the end
    for (let j = 0; j < rows; j++) {
      g.fillStyle = flagColour(i, j);
      g.fillRect(x, back - 1.5 - lift + j * ch + Math.sin(time * 9 - i * 0.5 + j * 0.2) * 0.6 * k, cw + 0.3, ch + 0.3);
    }
  }
  g.restore();
}
let shownZoom = 1;                // the zoom last set on the canvases
let shownGlare = '';              // the overexposure last set on the background canvases
// Drunk glitch: every so often the game (not the key hints and score) is cut into 10 strips across
// the screen that jolt sideways, alternate ways and by different amounts, then slide back
const GLITCH = { at: -9, next: 0, amp: [] }, GLITCH_STRIPS = 10, GLITCH_OUT = 0.07, GLITCH_BACK = 0.22;
const glitchTmp = makeCanvas(1, 1), gtctx = glitchTmp.getContext('2d');
function glitchShift(i) {                                            // how far strip i is shifted right now, in game pixels
  const t = time - GLITCH.at, f = t < 0 ? 0 : t < GLITCH_OUT ? t / GLITCH_OUT : Math.max(0, 1 - (t - GLITCH_OUT) / GLITCH_BACK);
  return (GLITCH.amp[i] || 0) * f * f * (3 - 2 * f);
}
function updateGlitch(drunk) {
  if (drunk <= 0 || time < GLITCH.next) return;
  GLITCH.at = time; GLITCH.next = time + 0.45 + Math.random() * 0.9;
  GLITCH.amp = Array.from({ length: GLITCH_STRIPS }, (_, i) => (i % 2 ? 1 : -1) * (3 + Math.random() * 11) * drunk);
}
function glitchStrips(g, cv, scale) {                                // shift this canvas's strips (scale: its pixels per game pixel)
  if (time - GLITCH.at > GLITCH_OUT + GLITCH_BACK) return;
  if (glitchTmp.width !== cv.width || glitchTmp.height !== cv.height) { glitchTmp.width = cv.width; glitchTmp.height = cv.height; }
  gtctx.clearRect(0, 0, cv.width, cv.height); gtctx.drawImage(cv, 0, 0);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  const h = cv.height / GLITCH_STRIPS;
  for (let i = 0; i < GLITCH_STRIPS; i++) {
    const y = Math.round(i * h), sh = Math.round((i + 1) * h) - y, dx = Math.round(glitchShift(i) * scale);
    if (!dx) continue;
    g.clearRect(0, y, cv.width, sh);
    g.drawImage(glitchTmp, 0, y, cv.width, sh, dx, y, cv.width, sh);
    g.drawImage(glitchTmp, 0, y, cv.width, sh, dx - Math.sign(dx) * cv.width, y, cv.width, sh);   // wrapped round, so no gap shows
  }
  g.restore();
}
// Where the sun's left edge is on screen: it takes SUN_LOOPS trips round the level to cross the screen
function sunLeft() {
  const span = W + SUN_SIZE;
  return mod(W * 0.62 - cam * span / (SUN_LOOPS * LEVEL_W) + SUN_SIZE, span) - SUN_SIZE;
}
const SUN_TOP = 8;                // the sun's top edge on screen

// Drunk: the whole scene sways from side to side, a sine swing of 3% of the screen's width, by drawing
// it from a swaying camera (so the picture still fills the window)
const drunkLevel = () => clamp(bird.drunk / 2, 0, 1);                // eases off over his last 2 seconds of being drunk
const drunkSway = t => drunkLevel() * 0.03 * W * Math.sin(t * 1.8);
// Echoes (drunk, and spat out of the slingshot): three faint see-through copies of him, each the whole
// bird, following along his path like traces, each fainter than the last, spaced half his length apart
const echoPath = [];                                                 // where he's been, newest first, in world pixels
const ECHOES = 3, ECHO_ALPHA = [0.26, 0.15, 0.07];                 // nearest first
function recordEchoPath(pose) {
  echoPath.unshift({ x: bird.x, y: bird.y + pose.bob * BIRD_SCALE, pose: { ...pose } });
  if (echoPath.length > 120) echoPath.pop();
}
const echoBuf = makeCanvas(1, 1), ectx = echoBuf.getContext('2d');
function drawEchoTrail(sc, turn, level) {
  // each echo is drawn whole into its own canvas first, then laid down see-through in one go,
  // so it's the same bird all over, just fainter (not patchy where his parts overlap)
  if (echoBuf.width !== birdBuf.width || echoBuf.height !== birdBuf.height) { echoBuf.width = birdBuf.width; echoBuf.height = birdBuf.height; }
  const span = 1.5 * 95 * BIRD_SCALE * (echoPath[0].pose.stretch || 1);   // 1.5 times his length, in game pixels
  let k = 1, walked = 0;
  for (let i = 1; i < echoPath.length && k <= ECHOES; i++) {
    const step = Math.hypot(echoPath[i].x - echoPath[i - 1].x, echoPath[i].y - echoPath[i - 1].y);
    if (step > 40) break;                                            // he jumped (round the loop of the level, say): no trail across it
    walked += step;
    if (walked < k * span / ECHOES) continue;
    const e = echoPath[i];
    ectx.setTransform(1, 0, 0, 1, 0, 0);
    ectx.clearRect(0, 0, echoBuf.width, echoBuf.height);
    ectx.setTransform(sc * turn, 0, 0, sc / novaZoom(), (e.x - cam) * K / BIRD_PIX, e.y * K / BIRD_PIX);
    if (e.pose.flip) ectx.rotate(e.pose.flip);
    drawMagpie(ectx, e.pose);
    bbctx.setTransform(1, 0, 0, 1, 0, 0);
    bbctx.globalAlpha = ECHO_ALPHA[k - 1] * level;
    bbctx.drawImage(echoBuf, 0, 0);
    k++;
  }
  bbctx.globalAlpha = 1;
}
// SOLAR-SLINGSHOT!!!!: the blur of him whipping round the sun. An arc trailing behind him round the
// circle, growing with his speed until it's a whole blurred grey-white ring
function drawSlingRing() {
  const b = slingBlur(), s = sunCentre(), p = slingProgress();
  const th = SLING.th0 + (SLING.th1 - SLING.th0) * p * p, phi = Math.PI / 2 - bird.face * th;   // where he is, as a canvas angle
  const len = b >= 0.999 ? Math.PI * 2 : Math.PI * 2 * b;
  fctx.save();
  fctx.filter = `blur(${(K * (1.5 + 2.5 * b)).toFixed(1)}px)`;
  fctx.strokeStyle = `rgba(236,238,242,${(0.25 + 0.65 * b).toFixed(2)})`;
  fctx.lineWidth = K * 9; fctx.lineCap = 'round';
  fctx.beginPath();
  if (bird.face > 0) fctx.arc(s.x * K, s.y * K, slingR() * K, phi, phi + len);
  else fctx.arc(s.x * K, s.y * K, slingR() * K, phi - len, phi);
  fctx.stroke();
  fctx.restore();
}
// SOLAR-SLINGSHOT!!!!: the magpie bent round the sun. He's drawn straight (and stretched) into his
// own canvas, then laid down along the circle a sliver at a time, each sliver turned to the curve,
// his back to the sun
const bendBuf = makeCanvas(1, 1), bendCtx = bendBuf.getContext('2d');
function drawBentMagpie(pose, sc) {
  const st = pose.stretch || 1, half = Math.ceil(52 * st * sc) + 2, tall = Math.ceil(60 * sc) + 2;
  if (bendBuf.width !== 2 * half || bendBuf.height !== 2 * tall) { bendBuf.width = 2 * half; bendBuf.height = 2 * tall; }
  bendCtx.setTransform(1, 0, 0, 1, 0, 0);
  bendCtx.clearRect(0, 0, bendBuf.width, bendBuf.height);
  bendCtx.setTransform(sc, 0, 0, sc, half, tall);                    // facing +x, level: the curve does the turning
  drawMagpie(bendCtx, { ...pose, pitch: 0 });
  const s = sunCentre(), cx = s.x * K / BIRD_PIX, cy = s.y * K / BIRD_PIX, R = slingR() * K / BIRD_PIX;
  const p = slingProgress(), th = SLING.th0 + (SLING.th1 - SLING.th0) * p * p, phi = Math.PI / 2 - bird.face * th;
  for (let u = -half; u < half; u += 1) {                            // u: along his body, + towards his head
    const a = phi - bird.face * (u + 0.5) / R;                        // where this sliver sits round the circle
    const turn = bird.face > 0 ? a - Math.PI / 2 : a + Math.PI / 2;  // along the way he's going
    bbctx.setTransform(1, 0, 0, 1, 0, 0);
    bbctx.translate(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
    bbctx.rotate(turn);
    if (bird.face < 0) bbctx.scale(1, -1);                            // keep his back to the sun
    bbctx.drawImage(bendBuf, half + u, 0, 1, 2 * tall, -0.5, -tall, 1.6, 2 * tall);
  }
}
function draw() {
  const real = cam;
  cam = real - drunkSway(time);
  try { drawScene(); } finally { cam = real; }
}
function drawScene() {
  // Back canvas: the pixel sky scaled up, then the smooth sun.
  // The sun is slowest of all: it takes SUN_LOOPS trips round the level to cross the screen.
  bctx.imageSmoothingEnabled = false;
  bctx.drawImage(skyCanvas, 0, 0, back.width, back.height);
  const sun = sunCentre(), size = SUN_SIZE * sunGrow();              // it swells in the SOLAR-SLINGSHOT!!!!
  bctx.imageSmoothingEnabled = true; bctx.imageSmoothingQuality = 'high';
  bctx.filter = blur > 0.02 ? 'blur(' + (blur * K * 1.2).toFixed(1) + 'px)' : 'none';   // the sun blurs in a swoop too
  const glow = bctx.createRadialGradient(sun.x * K, sun.y * K, 0, sun.x * K, sun.y * K, size * 0.75 * K);
  glow.addColorStop(0, 'rgba(255,236,170,0.55)'); glow.addColorStop(1, 'rgba(255,236,170,0)');
  bctx.fillStyle = glow; bctx.fillRect((sun.x - size) * K, (sun.y - size) * K, size * 2 * K, size * 2 * K);
  if (sunHi.complete) bctx.drawImage(sunHi, (sun.x - size * SUN_ASPECT / 2) * K, (sun.y - size / 2) * K, size * SUN_ASPECT * K, size * K);
  bctx.filter = 'none';
  if (drunkLevel() > 0) glitchStrips(bctx, back, K);                 // drunk: the sky glitches too


  // Pixel canvas: clouds, hills, suburb, lawn
  sctx.clearRect(0, 0, W, H);
  const cOff = cam * PARALLAX.clouds + time * clouds.wind;
  for (const cl of clouds.list) {
    sctx.globalAlpha = cloudAlpha(cl);                               // burnt away after a SOLAR-SLINGSHOT!!!!
    if (sctx.globalAlpha > 0)
      for (let x = mod(Math.round(cl.x - cOff), clouds.P) - clouds.P; x < W; x += clouds.P)
        if (x + cl.img.width > 0) sctx.drawImage(cl.img, x, cl.y);
  }
  sctx.globalAlpha = 1;
  drawRainbow(sctx);
  drawCockies(sctx);
  drawTiled(hills.c, hills.P, cam * PARALLAX.hills, -HILLS_LIFT);
  drawFerry(sctx);
  drawClimbers(sctx);
  drawShark(sctx);
  for (let i = backStreets.length - 1; i >= 0; i--) drawTiled(backStreets[i].c, backStreets[i].P, cam * backStreets[i].f);
  drawTiled(suburb.c, suburb.P, cam * PARALLAX.suburb);
  drawFlag(sctx);
  drawPostie(sctx);
  drawPossum(sctx);
  drawTiled(ground.c, ground.P, cam * PARALLAX.ground);
  drawHoist(sctx);
  drawNest(sctx);
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(scene, 0, 0);
  if (blur > 0.02) {                                   // swoop blur: smear the scenery along the flight
    const v = Math.hypot(bird.vx, bird.vy) || 1, step = 2.2 * blur;
    for (let i = 1; i <= 7; i++) {
      ctx.globalAlpha = 1 / (i + 1);
      ctx.drawImage(scene, Math.round(bird.vx / v * step * i), Math.round(bird.vy / v * step * i));
    }
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = '#ffffff';
  for (const t of trail) {
    ctx.globalAlpha = t.life / 0.35;
    ctx.fillRect(Math.round(t.x - cam - bird.face * 3), Math.round(t.y), 4, 1);
  }
  ctx.globalAlpha = 1;
  drawStorm(ctx);
  drawClimberBubble();
  updateGlitch(drunkLevel());
  if (drunkLevel() > 0) glitchStrips(ctx, canvas, 1);              // drunk: the scenery glitches, but not the key hints and score
  drawScore();
  drawEndStats();

  const pad = PAD.connected;                                        // with a controller, show its buttons instead
  drawBar('SWOOP', 4, 4, bird.charge, '#ffd23f', '#fff3a0', bird.swooping, pad ? 'RIGHT TRIGGER' : isTouch ? 'QUICK TAP' : 'SPACE BAR');
  drawBar('POOP', 4, 12, bird.poop, '#e9ece6', '#ffffff', false, pad ? 'X' : isTouch ? 'SECOND FINGER' : 'P KEY');
  drawBar('COMBO', 4, 20, SCORE.comboT / COMBO_WINDOW, '#ffe066', '#ffe066', SCORE.combo > 1, 'X' + SCORE.combo);   // time left to keep the combo going
  const hintX = 4 + textWidth('SWOOP') + 4 + 40 + 4;               // lines up with the bars' key hints
  drawText('BARREL ROLL', 4, 28, bird.roll > 0 ? '#ffe066' : '#ffffff'); drawText(pad ? '- B' : '- B KEY', hintX, 28, '#ffffff');
  drawText('LOOP-DE-LOOP', 4, 36, bird.loopT > 0 ? '#ffe066' : '#ffffff'); drawText(pad ? '- Y' : '- L KEY', hintX, 36, '#ffffff');
  drawText(Sound.isMuted() ? 'SOUND OFF' : 'SOUND ON', 4, 44, '#ffffff'); drawText(pad ? '- BACK' : '- M KEY', hintX, 44, '#ffffff');
  drawText('OBJECTIVES', 4, 52, objectivesOpen() ? '#ffe066' : '#ffffff'); drawText(pad ? '- START' : isTouch ? '- TAP LINK' : '- O KEY', hintX, 52, '#ffffff');
  const titleAlpha = started ? clamp(1 - (time - startedAt - 2), 0, 1) : 1;
  if (titleAlpha > 0) {
    ctx.globalAlpha = titleAlpha;
    drawTextCentred('SWOOPING SIMULATOR', 66, '#ffffff', 2);
    drawTextCentred(PAD.connected ? 'LEFT STICK OR D-PAD TO FLY' : isTouch ? 'HOLD WHERE TO FLY - TAP TO SWOOP' : 'ARROW KEYS OR WASD TO FLY', 86, '#ffe066');
    drawTextCentred(PAD.connected ? 'A TO FLAP - HOLD RIGHT TRIGGER TO SWOOP - X TO POOP' : isTouch ? 'SECOND FINGER TO POOP' : 'UP TO FLAP - HOLD SPACE TO SWOOP - P TO POOP', 94, '#ffe066');
    ctx.globalAlpha = 1;
  }

  // Front canvas: the smooth magpie
  fctx.setTransform(1, 0, 0, 1, 0, 0);
  fctx.clearRect(0, 0, front.width, front.height);
  drawPoop(fctx);
  drawShelfStock(fctx);
  if (!bird.inside) drawShopFront(fctx);                         // outside: the shop is behind him
  const pose = magpiePose();
  // A barrel roll turns him on his own axis: drawMagpie squashes him through his back and belly
  const turn = bird.onHoist ? Math.sign(bird.hoistTurn || 1) * Math.max(0.2, Math.abs(bird.hoistTurn)) : bird.face;   // turning on the hoist
  // Slightly pixelated: he's drawn at 1/BIRD_PIX of the screen's resolution, then scaled up
  const sc = K * BIRD_SCALE / BIRD_PIX;
  bbctx.setTransform(1, 0, 0, 1, 0, 0);
  bbctx.clearRect(0, 0, birdBuf.width, birdBuf.height);
  const rx = loopX(ROO.x);
  if (rx > -40 && rx < W + 40) {                                    // the kangaroo, in the same low-res style, behind the magpie
    const rs = K * ROO.scale / BIRD_PIX;
    bbctx.setTransform(rs * ROO.dir, 0, 0, rs, rx * K / BIRD_PIX, (ROO.ground - rooHeight()) * K / BIRD_PIX);
    drawKangaroo(bbctx);
    crispen(bbctx, rx * K / BIRD_PIX, (ROO.ground - 14 - rooHeight()) * K / BIRD_PIX, Math.ceil(48 * K / BIRD_PIX / 2));
  }
  drawCast();
  drawCharacter(CYCLIST.x, CYCLIST.ground, CYCLIST_SCALE, CYCLIST.dir, drawCyclist);
  if (DROPBEAR.state !== 'hidden') drawCharacter(DROPBEAR.x, DROPBEAR.y, 0.42, 1, drawDropBear);
  recordEchoPath(pose);
  const echo = Math.max(drunkLevel(), SLING.out / SLING_OUT);        // drunk, or spat out of the slingshot: his echoes
  if (echo > 0 && SLING.t <= 0) drawEchoTrail(sc, turn, echo);
  if (SLING.t > 0) drawBentMagpie(pose, sc);                         // SOLAR-SLINGSHOT!!!!: bent round the sun
  else {
  bbctx.setTransform(sc * turn, 0, 0, sc / novaZoom(), (bird.x - cam) * K / BIRD_PIX, (bird.y + pose.bob * BIRD_SCALE) * K / BIRD_PIX);   // never taller, even when the game zooms in
  if (bird.hot > 0) bbctx.filter = `sepia(${bird.hot}) saturate(${1 + 6 * bird.hot}) hue-rotate(${-40 * bird.hot}deg) brightness(${1 + 0.4 * bird.hot})`;   // going red
  if (pose.flip) bbctx.rotate(pose.flip);                           // upside down, on his back
  if (pose.hang) bbctx.scale(1, -1);                                 // hanging upside down by his feet, still facing the same way
  drawMagpie(bbctx, pose);
  if (CAPE.t > 0) drawCape(bbctx, pose);                            // TRUE-BLUE!: the Aussie flag as a cape, over his back
  bbctx.filter = 'none';
  }
  if (bird.dazed) {                                                  // seeing stars after the drop bear
    const ss = K * 0.3 / BIRD_PIX;
    bbctx.setTransform(ss, 0, 0, ss, (bird.x - cam) * K / BIRD_PIX, (bird.y - 4) * K / BIRD_PIX);
    dizzyStars(bbctx, 0, -6);
  }
  crispen(bbctx, (bird.x - cam) * K / BIRD_PIX, bird.y * K / BIRD_PIX, Math.ceil(80 * K / BIRD_PIX / 4) * 2);
  fctx.setTransform(1, 0, 0, 1, 0, 0);
  if (slingBlur() > 0) drawSlingRing();                              // SOLAR-SLINGSHOT!!!!: his blur round the sun, behind him
  fctx.imageSmoothingEnabled = false;
  fctx.drawImage(birdBuf, 0, 0, birdBuf.width * BIRD_PIX, birdBuf.height * BIRD_PIX);
  if (bird.inside) drawShopFront(fctx);                          // inside: we see him through the glass
  drawLootAndBubbles(fctx);
  drawSmoke(fctx);
  const dark = stormDark();                                          // the storm darkens the characters too
  if (dark > 0) { fctx.setTransform(1, 0, 0, 1, 0, 0); fctx.fillStyle = `rgba(25,35,55,${0.3 * dark})`; fctx.globalCompositeOperation = 'source-atop'; fctx.fillRect(0, 0, front.width, front.height); fctx.globalCompositeOperation = 'source-over'; }
  drawCombo(fctx);
  drawFlockCount(fctx);
  if (drunkLevel() > 0) glitchStrips(fctx, front, K);                // drunk: the magpie and everyone glitch with the scenery
  drawEnd(fctx);
  const white = novaWhite();
  if (white > 0) {                                                   // SOLAR-SLINGSHOT!!!!: fading to white all the way round the sun
    fctx.setTransform(1, 0, 0, 1, 0, 0);
    fctx.fillStyle = `rgba(255,255,255,${white.toFixed(3)})`;
    fctx.fillRect(0, 0, front.width, front.height);
  }
  // SOLAR-SLINGSHOT!!!!: the whole game jumps closer and bounces back. Never zoomed out, so it always fills the window.
  const zoom = novaZoom();
  if (zoom !== shownZoom) {
    for (const cv of [back, canvas, front]) cv.style.transform = zoom === 1 ? '' : `scale(${zoom.toFixed(4)})`;
    shownZoom = zoom;
  }
  // ...and the super boost out of it overexposes the background (sky and scenery, not the magpie), fading back to normal
  const glare = SLING.out / SLING_OUT, look = glare > 0 ? `brightness(${(1 + 1.3 * glare).toFixed(3)}) saturate(${(1 - 0.5 * glare).toFixed(3)})` : '';
  if (look !== shownGlare) { back.style.filter = canvas.style.filter = look; shownGlare = look; }
}
