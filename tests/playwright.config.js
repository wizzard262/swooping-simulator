// Playwright tests for the game, opened straight from the file (no server needed).
// They run in a visible window, a little slowed down, so you can watch.
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    headless: false,
    launchOptions: { slowMo: 60 },
  },
  projects: [
    { name: 'phone', use: { ...devices['Pixel 7 landscape'] } },
  ],
});
