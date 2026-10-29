import { test, expect, ARTICLE } from './fixtures';

// Security headers (src/lib/security-headers.mjs) and self-hosted fonts.
const PUBLIC_PAGES = ['/', ARTICLE, '/about/', '/policy/', '/admin/'];

test.describe('Security headers', () => {
  test.skip(({ isMobile }) => isMobile, 'same on every screen size');

  for (const path of [...PUBLIC_PAGES, '/admin/photos/', '/api/likes?post=blindfolded-with-50-strangers']) {
    test(`${path} sends the security headers`, async ({ request }) => {
      const h = (await request.get(path, { maxRedirects: 0 })).headers();
      expect(h['content-security-policy']).toContain("script-src 'self'");
      expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
      expect(h['content-security-policy']).not.toContain('unsafe-eval');
      expect(h['x-content-type-options']).toBe('nosniff');
      expect(h['x-frame-options']).toBe('DENY');
      expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(h['strict-transport-security']).toContain('max-age=31536000');
      expect(h['permissions-policy']).toContain('camera=()');
    });
  }

  test('public pages only run scripts from this site', async ({ request }) => {
    const csp = (await request.get(ARTICLE)).headers()['content-security-policy'];
    expect(csp).toMatch(/script-src 'self'(;|$)/); // no inline scripts, no other sites
    expect(csp).toContain("connect-src 'self'");
  });

  test('the Keystatic editor gets its own, slightly wider policy', async ({ request }) => {
    const csp = (await request.get('/keystatic', { maxRedirects: 0 })).headers()['content-security-policy'];
    expect(csp).toContain('https://api.github.com');
    expect(csp).toContain("frame-ancestors 'none'");
  });

  test('nothing on the public pages is blocked by the policy', async ({ page }) => {
    const blocked: string[] = [];
    page.on('console', (m) => /Content Security Policy|Refused to/i.test(m.text()) && blocked.push(m.text()));
    for (const path of PUBLIC_PAGES) {
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.mouse.wheel(0, 600);
    }
    await page.goto(ARTICLE, { waitUntil: 'networkidle' });
    await page.locator('.engage-rail [data-share-open]').click();
    await page.locator('.engage-rail [data-like]').click({ force: true }).catch(() => {});
    expect(blocked).toEqual([]);
  });
});

test.describe('Fonts', () => {
  test.skip(({ isMobile }) => isMobile, 'same on every screen size');

  test('are served from this site, never from Google', async ({ page }) => {
    const external: string[] = [];
    page.on('request', (r) => /fonts\.(googleapis|gstatic)\.com/.test(r.url()) && external.push(r.url()));
    await page.goto(ARTICLE, { waitUntil: 'networkidle' });
    expect(external).toEqual([]);
    expect(await page.evaluate(async () => {
      await document.fonts.ready;
      return ['16px "Inter Variable"', '16px "Source Serif 4 Variable"', '600 16px "Rubik"', '600 16px "Fraunces Wordmark"'].map((f) => document.fonts.check(f));
    })).toEqual([true, true, true, true]);
    await expect(page.locator('.article-head h1')).toHaveCSS('font-family', /Source Serif 4 Variable/);
    await expect(page.locator('body')).toHaveCSS('font-family', /Inter Variable/);
  });
});

test.describe('Keystatic editor', () => {
  test.skip(({ isMobile }) => isMobile, 'checked at desktop size');

  // Guards against upgrades that leave the editor blank (as Keystatic 6.0 did with this setup).
  test('the editor screen loads and offers GitHub sign-in', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/keystatic');
    await expect(page.getByText(/GitHub/i).first()).toBeVisible({ timeout: 20000 });
    expect(errors).toEqual([]);
  });
});

test.describe('Fast page changes', () => {
  test.skip(({ isMobile }) => isMobile, 'same on every screen size');

  test('fingerprinted files are kept by browsers for a year, so page changes don\'t re-download them', async ({ page, request }) => {
    await page.goto('/');
    const font = await page.locator('link[rel="preload"][as="font"][href^="/_astro/"]').first().getAttribute('href');
    expect((await request.get(font!)).headers()['cache-control']).toBe('public, max-age=31536000, immutable');
  });

  test('the main fonts are fetched with the page and styles are inside it', async ({ page }) => {
    await page.goto('/');
    const preloads = await page.locator('link[rel="preload"][as="font"]').evaluateAll((ls) => ls.map((l) => l.getAttribute('href')));
    expect(preloads.join(' ')).toMatch(/inter-latin-wght/);
    expect(preloads.join(' ')).toMatch(/source-serif-4-latin-opsz/);
    expect(preloads).toContain('/fonts/fraunces-wordmark.woff2');
    await expect(page.locator('link[rel="stylesheet"]')).toHaveCount(0); // no separate style files to wait for
  });

  test('the next page starts loading when a reader hovers over a link', async ({ page }) => {
    await page.goto('/');
    const prefetched = page.waitForRequest((r) => r.url().endsWith('/about/'));
    await page.locator('.site-header a[href="/about/"]').hover();
    await prefetched;
  });
});
