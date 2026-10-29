import { test, expect, ARTICLE } from './fixtures';
import { HIDE_FROM_SEARCH } from '../src/data/site';

// Until launch (HIDE_FROM_SEARCH = true), search engines and AI crawlers are asked to stay away.
test.describe('Hidden from search until launch', () => {
  test.skip(!HIDE_FROM_SEARCH, 'site has launched');

  for (const path of ['/', ARTICLE, '/about/', '/policy/', '/move/', '/admin/', '/admin/photos/']) {
    test(`${path} carries one "noindex" tag`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).toHaveCount(1);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
    });
  }

  test('robots.txt blocks all crawlers', async ({ request }) => {
    const body = await (await request.get('/robots.txt')).text();
    expect(body).toMatch(/User-agent: \*\s*\nDisallow: \/\s*$/m);
  });
});

test('admin is never indexed, even after launch', async ({ page }) => {
  await page.goto('/admin/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});
