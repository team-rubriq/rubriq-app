import { test, expect } from '@playwright/test';

// https://playwright.dev/docs/test-snapshots

const screenshotOptions = {
  maxDiffPixelRatio: 0.02,
};
test('Login Page Screenshot', async ({ page }) => {
  await page.goto("/signin");
  await page.waitForLoadState('domcontentloaded');
  await expect(page).toHaveScreenshot(screenshotOptions);
});

test('Signup Page Screenshot', async ({ page }) => {
  await page.goto("/signup");
  await page.waitForLoadState('domcontentloaded');
  await expect(page).toHaveScreenshot(screenshotOptions);
});

test('My-Rubrics Page Screenshot', async ({ page }) => {
  await page.goto("/my-rubrics");
  await page.waitForLoadState('domcontentloaded');
  await expect(page).toHaveScreenshot(screenshotOptions);
});

test('Profile Page Screenshot', async ({ page }) => {
  await page.goto("/profile");
  await page.waitForLoadState('domcontentloaded');
  await expect(page).toHaveScreenshot(screenshotOptions);
});

test('Templates Page Screenshot', async ({ page }) => {
  await page.goto("/templates");
  await page.waitForLoadState('domcontentloaded');
  await expect(page).toHaveScreenshot(screenshotOptions);
});

test('Error Page Screenshot', async ({ page }) => {
  await page.goto("/error");
  await page.waitForLoadState('domcontentloaded');
  await expect(page).toHaveScreenshot(screenshotOptions);
});

test('Goodbye Page Screenshot', async ({ page }) => {
  await page.goto("/goodbye");
  await page.waitForLoadState('domcontentloaded');
  await expect(page).toHaveScreenshot(screenshotOptions);
});

// Different as they need to load in actual rubrics/templates
// change urls if we do a database wipe

test('Edit-Rubric Page Screenshot', async ({ page }) => {
  await page.goto("/edit-rubric/68ec64b5-6401-4839-967b-09c5d07f4945");
  await page.waitForLoadState('domcontentloaded');
  await expect(page).toHaveScreenshot(screenshotOptions);
});

test('Edit-Template Page Screenshot', async ({ page }) => {
  await page.goto("/edit-template/82e8cc53-4538-45bb-9558-2e5172ff8c5b");
  await page.waitForLoadState('domcontentloaded');
  await expect(page).toHaveScreenshot(screenshotOptions);
});