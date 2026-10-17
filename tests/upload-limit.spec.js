// Each test name starts with the acceptance criterion it proves and the version of that criterion
// it was written for. The criteria are REQ-7's, as approved from the Checkout v2 kickoff (issue #1).
// Spec Keeper maps results by this key; a pass tagged with an older version than the criterion
// counts as stale.
const {test, expect} = require('@playwright/test');
const {captionHooks, signIn, mb} = require('./helpers');

captionHooks(test);
test.beforeEach(({page}) => signIn(page));

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
