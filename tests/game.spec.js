// Swooping Simulator: the touch controls, the best time and the objectives on the title screen.
// The game's own variables (bird, STICK, BEST...) are read straight from the page.
const { test, expect, devices } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

const GAME = pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href;

// The box an element sits in, in CSS pixels
async function box(page, selector) {
  const b = await page.locator(selector).boundingBox();
  return { ...b, right: b.x + b.width, bottom: b.y + b.height, cx: b.x + b.width / 2, cy: b.y + b.height / 2 };
}
// Real touch events (as a phone sends them), with as many fingers as needed
async function touchScreen(page) {
  const cdp = await page.context().newCDPSession(page);
  return (type, points) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points });
}
// Waits for the game to have run for a moment, so a frame has been drawn
async function openGame(page) {
  await page.goto(GAME);
  await page.waitForFunction(() => typeof bird === 'object' && time > 0.2);
}

test.describe('touch controls on a phone held sideways', () => {
  test('the thumbpad and four buttons show, either side of the game', async ({ page }) => {
    await openGame(page);
    await expect(page.locator('#touch')).toBeVisible();
    const game = await box(page, '#game'), pad = await box(page, '#thumbpad');
    const buttons = await Promise.all(['loop', 'poop', 'roll', 'swoop'].map(a => box(page, `.tbtn[data-act="${a}"]`)));
    expect(pad.right).toBeLessThanOrEqual(game.x + 1);                          // the thumbpad is left of the game
    for (const b of buttons) expect(b.x).toBeGreaterThanOrEqual(game.right - 1);  // the buttons are right of it
    const [loop, poop, roll, swoop] = buttons;                                    // a diamond: loop top, swoop bottom, poop left, roll right
    expect(loop.cy).toBeLessThan(poop.cy);
    expect(swoop.cy).toBeGreaterThan(roll.cy);
    expect(poop.cx).toBeLessThan(roll.cx);
    for (const b of buttons) expect(b.width).toBeGreaterThanOrEqual(40);          // big enough for a thumb
  });

  test('pushing the thumbpad right flies him right; letting go stops it', async ({ page }) => {
    await openGame(page);
    const touch = await touchScreen(page), pad = await box(page, '#thumbpad');
    await touch('touchStart', [{ x: pad.cx, y: pad.cy, id: 1 }]);
    await touch('touchMove', [{ x: pad.cx + pad.width * 0.4, y: pad.cy, id: 1 }]);
    await expect.poll(() => page.evaluate(() => STICK.right)).toBe(true);
    await expect.poll(() => page.evaluate(() => bird.vx)).toBeGreaterThan(20);
    await touch('touchEnd', []);
    await expect.poll(() => page.evaluate(() => STICK.right || STICK.left || STICK.up || STICK.down)).toBe(false);
  });

  test('pushing the thumbpad up flaps him up', async ({ page }) => {
    await openGame(page);
    const touch = await touchScreen(page), pad = await box(page, '#thumbpad');
    await touch('touchStart', [{ x: pad.cx, y: pad.cy, id: 1 }]);
    await touch('touchMove', [{ x: pad.cx, y: pad.cy - pad.height * 0.4, id: 1 }]);
    await expect.poll(() => page.evaluate(() => STICK.up)).toBe(true);
    await expect.poll(() => page.evaluate(() => bird.vy)).toBeLessThan(0);
    await touch('touchEnd', []);
  });

  test('ROLL, LOOP and POOP each do their thing', async ({ page }) => {
    await openGame(page);
    await page.tap('.tbtn[data-act="roll"]');
    await expect.poll(() => page.evaluate(() => bird.roll)).toBeGreaterThan(0);
    await page.waitForFunction(() => bird.roll <= 0);
    await page.tap('.tbtn[data-act="loop"]');
    await expect.poll(() => page.evaluate(() => bird.loopT)).toBeGreaterThan(0);
    await page.waitForFunction(() => bird.loopT <= 0);
    await page.tap('.tbtn[data-act="poop"]');
    await expect.poll(() => page.evaluate(() => bird.poop)).toBeLessThan(1);
  });

  test('SWOOP swoops while held and stops when let go', async ({ page }) => {
    await openGame(page);
    const touch = await touchScreen(page), swoop = await box(page, '.tbtn[data-act="swoop"]');
    await touch('touchStart', [{ x: swoop.cx, y: swoop.cy, id: 1 }]);
    await expect.poll(() => page.evaluate(() => bird.swooping)).toBe(true);
    await expect(page.locator('.tbtn[data-act="swoop"]')).toHaveClass(/busy/);    // lit while it's going
    await touch('touchEnd', []);
    await expect.poll(() => page.evaluate(() => bird.swooping)).toBe(false);
  });

  test('one thumb on the pad and the other on a button work together', async ({ page }) => {
    await openGame(page);
    const touch = await touchScreen(page), pad = await box(page, '#thumbpad'), roll = await box(page, '.tbtn[data-act="roll"]');
    const steer = { x: pad.cx + pad.width * 0.4, y: pad.cy, id: 1 };
    await touch('touchStart', [{ x: pad.cx, y: pad.cy, id: 1 }]);
    await touch('touchMove', [steer]);
    await touch('touchStart', [steer, { x: roll.cx, y: roll.cy, id: 2 }]);    // second thumb on ROLL
    await expect.poll(() => page.evaluate(() => bird.roll)).toBeGreaterThan(0);
    expect(await page.evaluate(() => STICK.right)).toBe(true);                // still steering with the other thumb
    await touch('touchEnd', []);                                               // both thumbs off
    await expect(page.locator('.tbtn[data-act="roll"]')).not.toHaveClass(/down/);
    expect(await page.evaluate(() => STICK.right)).toBe(false);
  });

  test('the links and sound button move to the top right, clear of the buttons', async ({ page }) => {
    await openGame(page);
    const sound = await box(page, '#sound'), loop = await box(page, '.tbtn[data-act="loop"]');
    expect(sound.bottom).toBeLessThan(loop.y);
  });

  test('the HUD names the buttons', async ({ page }) => {
    await openGame(page);
    const drawn = await textsDrawn(page);
    expect(drawn).toContain('- SWOOP BUTTON');
    expect(drawn).toContain('- ROLL BUTTON');
    expect(drawn).toContain('THUMBPAD TO FLY - PUSH UP TO FLAP');
  });
});

test.describe('touch controls on a phone held upright', () => {
  const { defaultBrowserType, ...upright } = devices['Pixel 7'];
  test.use(upright);
  test('the controls sit under the game', async ({ page }) => {
    await openGame(page);
    const game = await box(page, '#game'), pad = await box(page, '#thumbpad'), swoop = await box(page, '.tbtn[data-act="swoop"]');
    expect(pad.y).toBeGreaterThanOrEqual(game.bottom - 1);
    expect(swoop.cx).toBeGreaterThan(pad.cx);                                  // thumbpad left, buttons right
  });
});

test.describe('on a computer (no touch screen)', () => {
  test.use({ viewport: { width: 1280, height: 720 }, hasTouch: false, isMobile: false });
  test('no touch controls, and the game fills the window', async ({ page }) => {
    await openGame(page);
    await expect(page.locator('#touch')).toBeHidden();
    const game = await box(page, '#game');
    expect(game.width).toBeCloseTo(1280, 0);
    expect(game.height).toBeCloseTo(720, 0);
  });
});

// Every bit of text the game draws in one frame
async function textsDrawn(page) {
  return page.evaluate(() => new Promise(done => {
    const real = drawText, seen = [];
    drawText = (str, ...rest) => { seen.push(str); return real(str, ...rest); };
    requestAnimationFrame(() => requestAnimationFrame(() => { drawText = real; done(seen); }));
  }));
}

test.describe('best time', () => {
  // Finishes the game with every objective, as if it took this many seconds
  const finishIn = (page, seconds) => page.evaluate(s => {
    begin(); startedAt = time - s;
    for (const [name] of OBJECTIVES) markObjective(name);
  }, seconds);

  test('the first finish is a new best time, kept after a reload', async ({ page }) => {
    await openGame(page);
    await finishIn(page, 300);
    expect(await page.evaluate(() => RUN.newBest)).toBe(true);
    expect(await page.evaluate(() => Math.round(+localStorage.getItem('swoopBestTime')))).toBe(300);
    await openGame(page);
    expect(await page.evaluate(() => Math.round(BEST.time))).toBe(300);
    const drawn = await textsDrawn(page);
    expect(drawn).toContain('BEST 5:00');                                      // top right, under the timer
    expect(drawn).toContain('BEST TIME 5:00');                                 // on the title screen
  });

  test('a slower finish keeps the old best; a faster one replaces it', async ({ page }) => {
    await openGame(page);
    await page.evaluate(() => localStorage.setItem('swoopBestTime', 200));
    await openGame(page);
    await finishIn(page, 260);
    expect(await page.evaluate(() => RUN.newBest)).toBe(false);
    expect(await page.evaluate(() => Math.round(BEST.time))).toBe(200);
    await openGame(page);
    await finishIn(page, 150);
    expect(await page.evaluate(() => RUN.newBest)).toBe(true);
    expect(await page.evaluate(() => Math.round(+localStorage.getItem('swoopBestTime')))).toBe(150);
  });

  test('the objectives list shows the best time', async ({ page }) => {
    await openGame(page);
    await page.evaluate(() => localStorage.setItem('swoopBestTime', 95));
    await openGame(page);
    await page.evaluate(() => toggleObjectives(true));
    await expect(page.locator('#objTime')).toContainText('BEST 1:35');
  });
});

test.describe('objectives on the title screen', () => {
  test('it says how many there are and shows them one at a time', async ({ page }) => {
    await openGame(page);
    const first = await textsDrawn(page);
    expect(first.some(t => t.startsWith('DO ALL 31 OBJECTIVES'))).toBe(true);
    const n = await page.evaluate(() => mod(Math.floor(time / TITLE_OBJ_EVERY), OBJECTIVES.length));
    const caption = await page.evaluate(i => (i + 1) + '. ' + OBJECTIVES[i][0], n);
    expect(first).toContain(caption);
    await page.evaluate(() => { time += TITLE_OBJ_EVERY; });                   // the next one comes up
    const next = await textsDrawn(page);
    const after = (n + 1) % 31;                                                // wraps round after the last
    expect(next).toContain(await page.evaluate(i => (i + 1) + '. ' + OBJECTIVES[i][0], after));
  });

  test('it goes once the game starts', async ({ page }) => {
    await openGame(page);
    await page.tap('.tbtn[data-act="poop"]');                                  // starts the game
    await page.waitForFunction(() => time - startedAt > 3.2);                  // the title fades out over 3 s
    const drawn = await textsDrawn(page);
    expect(drawn.some(t => t.startsWith('DO ALL'))).toBe(false);
  });
});
