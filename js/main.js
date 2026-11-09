'use strict';
// ---------------------------------------------------------------------------
// Setup and main loop
// ---------------------------------------------------------------------------
function resize() {
  // Always 16:9 (320 x 180), scaled to fit and centred, with black bars top and bottom (tall
  // windows) or at the sides (wide ones). On touch screens it fits in the room the controls leave
  W = SCREEN;
  canvas.width = scene.width = W; canvas.height = H;
  ctx.imageSmoothingEnabled = false;
  const area = layoutTouchControls();                               // where the game goes, in CSS pixels
  for (const c of [back, canvas, front]) {                          // all three canvases, one on top of the other
    c.style.left = area.left + 'px'; c.style.top = area.top + 'px';
    c.style.width = area.width + 'px'; c.style.height = area.height + 'px';
  }
  K = Math.max(1, Math.min(area.width / W, area.height / H) * (devicePixelRatio || 1));
  back.width = front.width = Math.round(W * K);
  BIRD_PIX = Math.max(3, Math.round(K * 0.7));                      // magpie pixels: about 3/4 of a scenery pixel
  birdBuf.width = Math.ceil(front.width / BIRD_PIX) + 1;
  back.height = front.height = Math.round(H * K);
  birdBuf.height = Math.ceil(front.height / BIRD_PIX) + 1;
  poopBuf.width = birdBuf.width; poopBuf.height = birdBuf.height;
  buildSky();
}

sunHi = loadSun();
clouds = buildClouds();
hills = buildHills();
backStreets = BACK_STREETS.map(buildBackStreet);
suburb = buildSuburb();
ground = buildGround();
shopFront = buildShopFront();
TARGETS.push(ROO_TARGET);
setUpCast();
shelfStock = buildShelfStock();
isTouch = matchMedia('(pointer: coarse)').matches;                 // a phone or tablet: the touch controls show
resize();
addEventListener('resize', resize);
Sound.updateIcon();

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  pollPad();
  syncTouchControls();                                               // show or hide them, and light the busy ones
  if (!objectivesOpen()) update(dt);                                 // paused while the objectives list is open
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
