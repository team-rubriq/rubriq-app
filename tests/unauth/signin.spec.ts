import { test, expect } from '@playwright/test';

// Tests without signing in first

// Login tests
test('login exists', async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL("/signin");
});

test('login form submission', async ({ page }) => {
  // Perform authentication steps.
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  await page.goto('/signin');
  await page.getByLabel('email').fill(email || '');
  await page.getByLabel('password').fill(password || '');
  await page.getByRole('button', { name: 'Sign in' }).click();
  // Wait until the page receives the cookies.
  //
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL('/my-rubrics');

  // End of authentication steps.

  await page.context().storageState({ path: authFile });
});

// Signup Tests
test('navigate to signup', async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL("/signup");
});

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
