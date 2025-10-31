import { test, expect } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

// For local testing
if (!process.env.TEST_USER_EMAIL) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
}

// Tests without signing in first
// Clear cookies before each test in this file
test.beforeEach(async ({ page, context }) => {
  await context.clearCookies();
  await page.goto("/");
});



test('signin exists', async ({ page }) => {
  // regex to match signin or /
  await expect(page).toHaveURL(/\/(signin)?$/);
});

test('Signin page elements', async ({ page }) => {
  // Logo and title
  await expect(page.locator('img[alt="Logo"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Rubriq.' })).toBeVisible();
  await expect(page.getByText('Welcome back! Please sign in to view your rubrics.')).toBeVisible();
  // Form
  await expect(page.getByLabel('Email')).toBeVisible();

  const passwordInput = page.getByLabel('Password', { exact: true });
  await expect(passwordInput).toHaveAttribute('type', 'password');
  await expect(passwordInput).toBeVisible();
  // Toggle password visibility button
  await expect(passwordInput.locator('xpath=..').getByRole('button')).toBeVisible();

  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create New Account' })).toBeVisible();

});

test('login form submission', async ({ page }) => {
  // Perform authentication steps.
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  await page.getByLabel('email').fill(email || '');
  await page.getByLabel('password').fill(password || '');
  await page.getByRole('button', { name: 'Sign in' }).click();
  // Wait until the page receives the cookies.
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL('/my-rubrics');

  // End of authentication steps.
});


test('navigate to signup', async ({ page }) => {
  await page.getByRole('button', { name: 'Create New Account' }).click();
  await expect(page).toHaveURL("/signup");
});
