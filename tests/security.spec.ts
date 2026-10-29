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
