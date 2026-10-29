import { test, expect, ARTICLE } from './fixtures';

// Labels for search engines, AI tools and share previews. All built from the content, so a new article
// gets them automatically.
const SITE = 'https://loving-life-longer-blog.pages.dev';
const graph = async (page) =>
  JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!)['@graph'] as Record<string, any>[];
const find = (items: Record<string, any>[], type: string) => items.find((i) => i['@type'] === type)!;

test.describe('Discoverability', () => {
  test.skip(({ isMobile }) => isMobile, 'same on every screen size');

  test('articles describe themselves to search engines and AI (structured data)', async ({ page }) => {
    await page.goto(ARTICLE);
    const items = await graph(page);
    const post = find(items, 'BlogPosting');
    expect(post.headline).toBe('Blindfolded With 50 Strangers: My First Ecstatic Dance');
    expect(post.author).toMatchObject({ '@type': 'Person', name: 'Ben Parker', url: `${SITE}/about/` });
    expect(post.datePublished).toBe('2026-07-01T00:00:00.000Z');
    expect(post.articleSection).toBe('Move');
    expect(post.image[0]).toMatch(new RegExp(`^${SITE}/_astro/.+\\.jpg$`));
    expect(post.wordCount).toBeGreaterThan(3000);
    const faq = find(items, 'FAQPage');
    expect(faq.mainEntity[0]).toMatchObject({ '@type': 'Question', name: 'What is ecstatic dance?' });
    expect(find(items, 'BreadcrumbList').itemListElement).toHaveLength(2);
  });

  test('articles have share previews and a canonical address', async ({ page }) => {
    await page.goto(ARTICLE);
    const meta = (p: string) => page.locator(`meta[property="${p}"]`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}${ARTICLE}`);
    await expect(meta('og:type')).toHaveAttribute('content', 'article');
    await expect(meta('og:title')).toHaveAttribute('content', 'Blindfolded With 50 Strangers: My First Ecstatic Dance');
    await expect(meta('og:image')).toHaveAttribute('content', new RegExp(`^${SITE}/_astro/.+\\.jpg$`));
    await expect(meta('og:locale')).toHaveAttribute('content', 'en_GB');
    await expect(meta('article:published_time')).toHaveAttribute('content', '2026-07-01T00:00:00.000Z');
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    // The share picture really exists (checked on this test server).
    const img = new URL((await meta('og:image').getAttribute('content'))!).pathname;
    expect((await page.request.get(img)).ok()).toBe(true);
  });

  test('home page names the organisation, the site, its social accounts and its Q&A', async ({ page }) => {
    await page.goto('/');
    const items = await graph(page);
    const org = find(items, 'Organization');
    expect(org.name).toBe('Loving Life Longer');
    expect(org.sameAs).toEqual(['https://www.instagram.com/example', 'https://www.youtube.com/@example']); // email left out
    expect(find(items, 'WebSite').url).toBe(`${SITE}/`);
    expect(find(items, 'FAQPage').mainEntity.length).toBeGreaterThan(0);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\//);
  });

  test('pages without their own photo use the default share picture', async ({ page }) => {
    await page.goto('/policy/');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `${SITE}/og-default.png`);
    expect((await page.request.get('/og-default.png')).ok()).toBe(true);
  });

  test('admin pages get no share or search labels', async ({ page }) => {
    await page.goto('/admin/');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
  });

  test('sitemap lists every public page and each article, and nothing private', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.headers()['content-type']).toContain('xml');
    const xml = await res.text();
    for (const path of ['/', ARTICLE, '/about/', '/policy/']) expect(xml).toContain(`<loc>${SITE}${path}</loc>`);
    expect(xml).toContain('<lastmod>2026-07-01</lastmod>');
    expect(xml).not.toMatch(/admin|keystatic|api/);
  });

  test('llms.txt summarises the site and every article for AI assistants', async ({ request }) => {
    const text = await (await request.get('/llms.txt')).text();
    expect(text).toMatch(/^# Loving Life Longer\n/);
    expect(text).toContain(`[Blindfolded With 50 Strangers: My First Ecstatic Dance](${SITE}${ARTICLE})`);
    expect(text).toContain('**What is ecstatic dance?**');
    expect(text).toContain('not medical or professional advice');
    expect(text).not.toMatch(/\{(think|move|live)\}/);
  });
});
