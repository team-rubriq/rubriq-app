import { test, expect } from '@playwright/test';

// Tests without signing in first
test.beforeEach(async ({ page, context }) => {
  await context.clearCookies();
  await page.goto("/signup");
});

test('signup exists', async ({ page }) => {
  await expect(page).toHaveURL("/signup");
});

test('Signup page elements', async ({ page }) => {
  // Heading
  await expect(page.getByRole('heading', { name: 'Sign Up' })).toBeVisible();
  await expect(page.getByText('Please sign up to making your own rubrics!')).toBeVisible();
  // Form
  await expect(page.getByLabel('First name')).toBeVisible();
  await expect(page.getByLabel('Last name')).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();

  const passwordInput = page.getByLabel('Password', { exact: true });
  await expect(passwordInput).toHaveAttribute('type', 'password');
  await expect(passwordInput).toBeVisible();
  // Toggle password visibility button
  await expect(passwordInput.locator('xpath=..').getByRole('button')).toBeVisible();
  
  const confimpasswordInput = page.getByLabel('Re-enter Password', { exact: true });
  await expect(confimpasswordInput).toHaveAttribute('type', 'password');
  await expect(confimpasswordInput).toBeVisible();
  // Toggle password visibility button
  await expect(confimpasswordInput.locator('xpath=..').getByRole('button')).toBeVisible();


  await expect(page.getByRole('button', { name: 'Admin' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Subject Coordinator' })).toBeVisible();

  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();

});

test('navigate to signin', async ({ page }) => {
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/(signin)?$/);
});
