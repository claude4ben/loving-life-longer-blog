import { test as base, expect } from '@playwright/test';

export const ARTICLE = '/blog/blindfolded-with-50-strangers/';
export const GREEN = 'rgb(64, 118, 61)'; // #40763d

// Every test: block outside photos and fonts (placeholders, and they make tests slow and flaky),
// and fail if the page throws a JavaScript error.
export const test = base.extend<{ isMobile: boolean }>({
  isMobile: async ({ viewport }, use) => use((viewport?.width ?? 1280) < 960),
  page: async ({ page }, use) => {
    await page.route(/picsum\.photos|fonts\.googleapis\.com|fonts\.gstatic\.com/, (r) => r.abort());
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await use(page);
    expect(errors, 'JavaScript errors on the page').toEqual([]);
  },
});

export { expect };
