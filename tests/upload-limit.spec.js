// Each test name starts with the acceptance criterion it proves and the version of that criterion
// it was written for. The criteria are REQ-7's, as approved from the Checkout v2 kickoff (issue #1).
// Spec Keeper maps results by this key; a pass tagged with an older version than the criterion
// counts as stale.
const {test, expect} = require('@playwright/test');

// For the videos: a caption naming the test, in a closed shadow root so the tests' own text and role
// lookups never see it; at the end it shows the result and holds it on screen.
test.beforeEach(async ({page}, testInfo) => {
  await page.addInitScript((title) => {
    addEventListener('DOMContentLoaded', () => {
      const host = document.createElement('div');
      const root = host.attachShadow({mode: 'closed'});
      root.innerHTML = `<div style="position:fixed;left:0;right:0;bottom:0;padding:14px 20px;font:600 15px system-ui;background:#111;color:#fff"></div>`;
      const bar = root.firstElementChild;
      bar.textContent = title;
      window.__caption = (text, color) => { bar.textContent = text; bar.style.background = color; };
      document.body.append(host);
    });
  }, testInfo.title);
});

// The app is behind a demo login: sign in the way a person would, with the demo button.
test.beforeEach(async ({page}) => {
  await page.goto('/');
  await page.getByRole('button', {name: 'Continue as Maya (demo)'}).click();
  await expect(page.getByRole('heading', {name: 'New expense'})).toBeVisible();
});

test.afterEach(async ({page}, testInfo) => {
  const passed = testInfo.status === testInfo.expectedStatus;
  await page.evaluate(([text, color]) => window.__caption?.(text, color), [`${passed ? '✓ passed' : '✗ failed'} · ${testInfo.title}`, passed ? '#1a7f37' : '#b42318']).catch(() => {});
  await page.waitForTimeout(1500);
});

const mb = (n) => ({name: `receipt-${n}mb.pdf`, mimeType: 'application/pdf', buffer: Buffer.alloc(n * 1024 * 1024)});

test('AC-7-1@v1 shows the 25 MB limit on the upload screen', async ({page}) => {
  await page.goto('/');
  await expect(page.getByText('Files up to 25 MB.')).toBeVisible();
});

test('AC-7-2@v1 shows "File exceeds 25 MB" for a larger file before uploading', async ({page}) => {
  await page.goto('/');
  await page.getByLabel('Choose a file').setInputFiles(mb(30));
  await expect(page.getByRole('status')).toHaveText('File exceeds 25 MB');
});

// Not an approved criterion: kept as a plain regression check, reported to Spec Keeper as unmapped.
test('accepts a 20 MB file', async ({page}) => {
  await page.goto('/');
  await page.getByLabel('Choose a file').setInputFiles(mb(20));
  await expect(page.getByRole('status')).toHaveText('Upload complete');
});
