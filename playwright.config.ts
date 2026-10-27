import { defineConfig, devices } from '@playwright/test';

// Runs every test at desktop and phone sizes (the design's breakpoint is 960px).
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
    { name: 'mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, hasTouch: true } },
  ],
  webServer: [
    // A pretend GitHub, so the photo crop editor's Save can be tested without touching the real one.
    { command: 'node tests/mock-github.mjs', port: 4399, reuseExistingServer: !process.env.CI },
    // The built site on a local copy of Cloudflare, with a fresh, empty database each time. It's built from
    // a frozen sample of the content (tests/fixtures/content), so Ben's edits in Keystatic never break tests.
    // The admin password and GitHub key here are for local tests only; the real ones are Cloudflare secrets.
    {
      command:
        'LLL_CONTENT=tests/fixtures/content npm run build && rm -rf .wrangler/test-state && wrangler pages dev dist --port 4321 --persist-to .wrangler/test-state' +
        ' --binding ADMIN_PASSWORD=test-admin-password --binding GITHUB_TOKEN=test-github-token' +
        ' --binding GITHUB_API_URL=http://127.0.0.1:4399',
      env: { WRANGLER_SEND_METRICS: 'false', NO_PROXY: 'localhost,127.0.0.1', no_proxy: 'localhost,127.0.0.1' },
      url: 'http://localhost:4321',
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
});
