// The app around the requirement under test: signing in and out, and submitting an expense. These are
// plain regression checks, not approved criteria, so their names carry no AC key and Spec Keeper reports
// them as unmapped. File sizes stay well under any limit the team has discussed, so a change to REQ-7
// can't break them.
const {test, expect} = require('@playwright/test');
const {captionHooks, signIn, mb} = require('./helpers');

captionHooks(test);

test('signed out, the app sends you to sign in', async ({page}) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', {name: 'Sign in'})).toBeVisible();
});

test('signs in with the demo button and shows who is signed in', async ({page}) => {
  await signIn(page);
  await expect(page.locator('header')).toContainText('Maya Lim');
  await expect(page.locator('header')).toContainText('ML');
});

test('signs in with an email as that person', async ({page}) => {
  await page.goto('/login');
  await page.getByLabel('Work email').fill('jo.tan@acme.test');
  await page.getByLabel('Password').fill('any password');
  await page.getByRole('button', {name: 'Sign in', exact: true}).click();
  await expect(page.getByRole('heading', {name: 'New expense'})).toBeVisible();
  await expect(page.locator('header')).toContainText('Jo Tan');
});

test('signs out, and the app needs a sign-in again', async ({page}) => {
  await signIn(page);
  await page.locator('header').getByRole('link', {name: 'Sign out'}).click();
  await expect(page.getByRole('heading', {name: 'Sign in'})).toBeVisible();
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
});

test('submits an expense once its receipt has uploaded', async ({page}) => {
  await signIn(page);
  const submit = page.getByRole('button', {name: 'Submit expense'});
  await expect(submit).toBeDisabled();
  await page.getByLabel('Choose a file').setInputFiles(mb(1, 'coffee-receipt.pdf'));
  await expect(page.getByText('coffee-receipt.pdf')).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('Upload complete');
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.getByRole('alert')).toHaveText('Expense submitted for review');
});

test('a name with HTML in it is shown as text, never run', async ({page, context, baseURL}) => {
  await context.addCookies([{name: 'user', value: encodeURIComponent('<img src=x onerror=alert(1)>'), url: baseURL}]);
  let dialog = false;
  page.on('dialog', async (d) => {
    dialog = true;
    await d.dismiss();
  });
  await page.goto('/');
  await expect(page.locator('header')).toContainText('<img src=x onerror=alert(1)>');
  await expect(page.locator('header img')).toHaveCount(0);
  expect(dialog).toBe(false);
});
