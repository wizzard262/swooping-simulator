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

let shownShift = '0.00%,1.0000';  // the slide and zoom last set on the canvases
// Drunk glitch: a few frames in every second, bands of the picture jump sideways, the same on all three canvases
function drunkGlitch(drunk) {
  if (Math.random() > drunk * 0.35) return;
  for (let n = 1 + Math.floor(Math.random() * 4); n > 0; n--) {
    const y = Math.floor(Math.random() * H), h = 1 + Math.floor(Math.random() * 10), dx = Math.round((Math.random() - 0.5) * 24);
    ctx.drawImage(canvas, 0, y, W, h, dx, y, W, h);
    for (const [g, cv] of [[bctx, back], [fctx, front]]) {
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.drawImage(cv, 0, y * K, cv.width, h * K, dx * K, y * K, cv.width, h * K);
    }
  }
}
// Where the sun's left edge is on screen: it takes SUN_LOOPS trips round the level to cross the screen
function sunLeft() {
  const span = W + SUN_SIZE;
  return mod(W * 0.62 - cam * span / (SUN_LOOPS * LEVEL_W) + SUN_SIZE, span) - SUN_SIZE;
}
const SUN_TOP = 8;                // the sun's top edge on screen

function draw() {
  // Back canvas: the pixel sky scaled up, then the smooth sun.
  // The sun is slowest of all: it takes SUN_LOOPS trips round the level to cross the screen.
  bctx.imageSmoothingEnabled = false;
  bctx.drawImage(skyCanvas, 0, 0, back.width, back.height);
  const sunX = sunLeft();
  bctx.imageSmoothingEnabled = true; bctx.imageSmoothingQuality = 'high';
  bctx.filter = blur > 0.02 ? 'blur(' + (blur * K * 1.2).toFixed(1) + 'px)' : 'none';   // the sun blurs in a swoop too
  const glow = bctx.createRadialGradient((sunX + SUN_SIZE / 2) * K, (SUN_TOP + SUN_SIZE / 2) * K, 0, (sunX + SUN_SIZE / 2) * K, (SUN_TOP + SUN_SIZE / 2) * K, SUN_SIZE * 0.75 * K);
  glow.addColorStop(0, 'rgba(255,236,170,0.55)'); glow.addColorStop(1, 'rgba(255,236,170,0)');
  bctx.fillStyle = glow; bctx.fillRect((sunX - SUN_SIZE / 2) * K, (SUN_TOP - SUN_SIZE / 2) * K, SUN_SIZE * 2 * K, SUN_SIZE * 2 * K);
  if (sunHi.complete) bctx.drawImage(sunHi, (sunX + SUN_SIZE * (1 - SUN_ASPECT) / 2) * K, SUN_TOP * K, SUN_SIZE * SUN_ASPECT * K, SUN_SIZE * K);
  bctx.filter = 'none';


  // Pixel canvas: clouds, hills, suburb, lawn
  sctx.clearRect(0, 0, W, H);
  const cOff = cam * PARALLAX.clouds + time * clouds.wind;
  for (const cl of clouds.list) {
    sctx.globalAlpha = cloudAlpha(cl);                               // burnt away after a SOLAR-NOVA!
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
  bbctx.setTransform(sc * turn, 0, 0, sc, (bird.x - cam) * K / BIRD_PIX, (bird.y + pose.bob * BIRD_SCALE) * K / BIRD_PIX);
  if (bird.hot > 0) bbctx.filter = `sepia(${bird.hot}) saturate(${1 + 6 * bird.hot}) hue-rotate(${-40 * bird.hot}deg) brightness(${1 + 0.4 * bird.hot})`;   // going red
  if (pose.flip) bbctx.rotate(pose.flip);                           // upside down, on his back
  if (pose.hang) bbctx.scale(1, -1);                                 // hanging upside down by his feet, still facing the same way
  drawMagpie(bbctx, pose);
  bbctx.filter = 'none';
  if (bird.dazed) {                                                  // seeing stars after the drop bear
    const ss = K * 0.3 / BIRD_PIX;
    bbctx.setTransform(ss, 0, 0, ss, (bird.x - cam) * K / BIRD_PIX, (bird.y - 4) * K / BIRD_PIX);
    dizzyStars(bbctx, 0, -6);
  }
  crispen(bbctx, (bird.x - cam) * K / BIRD_PIX, bird.y * K / BIRD_PIX, Math.ceil(80 * K / BIRD_PIX / 4) * 2);
  fctx.setTransform(1, 0, 0, 1, 0, 0);
  fctx.imageSmoothingEnabled = false;
  fctx.drawImage(birdBuf, 0, 0, birdBuf.width * BIRD_PIX, birdBuf.height * BIRD_PIX);
  if (bird.inside) drawShopFront(fctx);                          // inside: we see him through the glass
  drawLootAndBubbles(fctx);
  drawSmoke(fctx);
  const dark = stormDark();                                          // the storm darkens the characters too
  if (dark > 0) { fctx.setTransform(1, 0, 0, 1, 0, 0); fctx.fillStyle = `rgba(25,35,55,${0.3 * dark})`; fctx.globalCompositeOperation = 'source-atop'; fctx.fillRect(0, 0, front.width, front.height); fctx.globalCompositeOperation = 'source-over'; }
  drawCombo(fctx);
  drawEnd(fctx);
  // Drunk: the whole game slides about from side to side, and now and then glitches
  const drunk = clamp(bird.drunk / 2, 0, 1);                        // eases off over his last 2 seconds of being drunk
  if (drunk > 0) drunkGlitch(drunk);
  const slide = drunk * (Math.sin(time * 1.1) * 0.6 + Math.sin(time * 2.7 + 1) * 0.3 + Math.sin(time * 5.3 + 2) * 0.1) * 4;   // % of the screen width
  const zoom = novaZoom() * (1 + 0.1 * drunk), shift = slide.toFixed(2) + '%,' + zoom.toFixed(4);   // zoomed in a little when drunk so the edges never show
  if (shift !== shownShift) {                                        // SOLAR-NOVA!: the whole game bounces back into place
    for (const cv of [back, canvas, front]) cv.style.transform = zoom === 1 && !slide ? '' : `translateX(${slide.toFixed(2)}%) scale(${zoom.toFixed(4)})`;
    shownShift = shift;
  }
  const white = novaWhite();
  if (white > 0) {                                                   // SOLAR-NOVA!: everything fades to white, then bounces back
    fctx.setTransform(1, 0, 0, 1, 0, 0);
    fctx.fillStyle = `rgba(255,255,255,${white.toFixed(3)})`;
    fctx.fillRect(0, 0, front.width, front.height);
  }
}
