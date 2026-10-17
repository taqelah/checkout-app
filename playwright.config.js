// @ts-check
const {defineConfig} = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests',
  // The HTML report (with a video of each test) is published to GitHub Pages and linked from Slack.
  reporter: [['list'], ['junit', {outputFile: 'results/junit.xml'}], ['html', {outputFolder: 'playwright-report', open: 'never'}]],
  // slowMo and the hold in the tests' afterEach make the videos readable: without them a test ends
  // before its result is on screen.
  // The window and the video are the same size, so the page is recorded 1:1, not shrunk.
  use: {
    baseURL: 'http://localhost:3000',
    viewport: {width: 800, height: 450},
    video: {mode: 'on', size: {width: 800, height: 450}},
    launchOptions: {slowMo: 400},
  },
  webServer: {command: 'node server.js', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI},
});
