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
  // Runs the built site on a local copy of Cloudflare, with a fresh, empty database each time.
  // ADMIN_DEV_BYPASS lets tests use /admin without signing in (local only; never set on Cloudflare).
  webServer: {
    command:
      'npm run build && rm -rf .wrangler/test-state && wrangler pages dev dist --port 4321 --persist-to .wrangler/test-state --binding ADMIN_DEV_BYPASS=1',
    env: { WRANGLER_SEND_METRICS: 'false' },
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
