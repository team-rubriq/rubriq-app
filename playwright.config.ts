import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    // tests without authenticated state (login/signup)
    {
      name: 'chromium-unauth',
      testMatch: /.*\/(unauth)\/.*\.spec\.ts$/,
      use: { 
        ...devices['Desktop Chrome'],
        storageState: { cookies: [], origins: [] }
      },
    },

    {
      name: 'firefox-unauth',
      testMatch: /.*\/(unauth)\/.*\.spec\.ts$/,
      use: {
        ...devices['Desktop Firefox'],
        storageState: { cookies: [], origins: [] }
      },
    },

    {
      name: 'webkit-unauth',
      testMatch: /.*\/(unauth)\/.*\.spec\.ts$/,
      use: {
        ...devices['Desktop Safari'],
        storageState: { cookies: [], origins: [] }
      },
    },
    // Setup project (auth for login state)
    { name: 'setup', testMatch: /.*\.setup\.ts$/ },
    // tests with authenticated state
    {
      name: 'chromium',
      testIgnore: /.*\/(unauth)\/.*\.spec\.ts$/,
      use: { 
        ...devices['Desktop Chrome'],
        // Use prepared auth state.
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      testIgnore: /.*\/(unauth)\/.*\.spec\.ts$/,
      use: {
        ...devices['Desktop Firefox'],
        // Use prepared auth state.
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'webkit',
      testIgnore: /.*\/(unauth)\/.*\.spec\.ts$/,
      use: {
        ...devices['Desktop Safari'],
        // Use prepared auth state.
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
