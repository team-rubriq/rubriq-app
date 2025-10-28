import { test, expect } from '@playwright/test';

// https://playwright.dev/docs/test-snapshots

test('Login Page Screenshot', async ({ page }) => {
  await page.goto("/signin");
  await expect(page).toHaveScreenshot();
});

test('Signup Page Screenshot', async ({ page }) => {
  await page.goto("/signup");
  await expect(page).toHaveScreenshot();
});

test('My-Rubrics Page Screenshot', async ({ page }) => {
  await page.goto("/my-rubrics");
  await expect(page).toHaveScreenshot();
});

test('Profile Page Screenshot', async ({ page }) => {
  await page.goto("/profile");
  await expect(page).toHaveScreenshot();
});

test('Templates Page Screenshot', async ({ page }) => {
  await page.goto("/templates");
  await expect(page).toHaveScreenshot();
});

test('Error Page Screenshot', async ({ page }) => {
  await page.goto("/error");
  await expect(page).toHaveScreenshot();
});

test('Goodbye Page Screenshot', async ({ page }) => {
  await page.goto("/goodbye");
  await expect(page).toHaveScreenshot();
});

// Different as they need to load in actual rubrics/templates
// change urls if we do a database wipe

test('Edit-Rubric Page Screenshot', async ({ page }) => {
  await page.goto("/edit-rubric/68ec64b5-6401-4839-967b-09c5d07f4945");
  await expect(page).toHaveScreenshot();
});

test('Edit-Template Page Screenshot', async ({ page }) => {
  await page.goto("/edit-template/82e8cc53-4538-45bb-9558-2e5172ff8c5b");
  await expect(page).toHaveScreenshot();
});