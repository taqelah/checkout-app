// Shared by the specs: the video caption, and signing in the way a person would.
const {expect} = require('@playwright/test');

// For the videos: a caption naming the test, in a closed shadow root so the tests' own text and role
// lookups never see it; at the end it shows the result and holds it on screen.
function captionHooks(test) {
  test.beforeEach(async ({page}, testInfo) => {
    await page.addInitScript((title) => {
      addEventListener('DOMContentLoaded', () => {
        const host = document.createElement('div');
        const root = host.attachShadow({mode: 'closed'});
        root.innerHTML = `<div style="position:fixed;left:0;right:0;bottom:0;padding:14px 20px;font:600 15px system-ui;background:#111;color:#fff"></div>`;
        const bar = root.firstElementChild;
        bar.textContent = title;
        window.__caption = (text, color) => {
          bar.textContent = text;
          bar.style.background = color;
        };
        document.body.append(host);
      });
    }, testInfo.title);
  });

  test.afterEach(async ({page}, testInfo) => {
    const passed = testInfo.status === testInfo.expectedStatus;
    await page
      .evaluate(([text, color]) => window.__caption?.(text, color), [`${passed ? '✓ passed' : '✗ failed'} · ${testInfo.title}`, passed ? '#1a7f37' : '#b42318'])
      .catch(() => {});
    await page.waitForTimeout(1500);
  });
}

// The app is behind a demo login: sign in with the demo button, as a person would.
async function signIn(page) {
  await page.goto('/');
  await page.getByRole('button', {name: 'Continue as Maya (demo)'}).click();
  await expect(page.getByRole('heading', {name: 'New expense'})).toBeVisible();
}

const mb = (n, name = `receipt-${n}mb.pdf`) => ({name, mimeType: 'application/pdf', buffer: Buffer.alloc(n * 1024 * 1024)});

module.exports = {captionHooks, signIn, mb};
