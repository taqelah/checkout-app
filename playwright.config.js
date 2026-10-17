// @ts-check
const {defineConfig} = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests',
  // The HTML report (with a video of each test) is published to GitHub Pages and linked from Slack.
  reporter: [['list'], ['junit', {outputFile: 'results/junit.xml'}], ['html', {outputFolder: 'playwright-report', open: 'never'}]],
  use: {baseURL: 'http://localhost:3000', video: 'on'},
  webServer: {command: 'node server.js', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI},
});
