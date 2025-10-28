import { test as setup, expect } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

if (!process.env.TEST_USER_EMAIL) {
  dotenv.config({ path: path.resolve(__dirname, '.env.test') });
}

// https://playwright.dev/docs/auth

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
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