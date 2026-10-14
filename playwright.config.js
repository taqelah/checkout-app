// @ts-check
const {defineConfig} = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests',
  reporter: [['list'], ['junit', {outputFile: 'results/junit.xml'}]],
  use: {baseURL: 'http://localhost:3000'},
  webServer: {command: 'node server.js', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI},
});
