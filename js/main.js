'use strict';
// ---------------------------------------------------------------------------
// Setup and main loop
// ---------------------------------------------------------------------------
function resize() {
  // Always 16:9 (320 x 180), scaled to fit any window and centred in it, with black bars
  // top and bottom (tall windows) or at the sides (wide ones)
  W = SCREEN;
  canvas.width = scene.width = W; canvas.height = H;
  ctx.imageSmoothingEnabled = false;
  K = Math.max(1, Math.min(innerWidth / W, innerHeight / H) * (devicePixelRatio || 1));
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
resize();
addEventListener('resize', resize);
isTouch = matchMedia('(pointer: coarse)').matches;
Sound.updateIcon();

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  pollPad();
  if (!objectivesOpen()) update(dt);                                 // paused while the objectives list is open
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
