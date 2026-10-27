import { test, expect, ARTICLE } from './fixtures';

test.describe('Links from this article', () => {
  test.beforeEach(async ({ page }) => page.goto(ARTICLE));
  const cards = (page) => page.locator('#links .link-card');

  test('shows a card for each link with name, type and description', async ({ page }) => {
    await expect(page.locator('#links-title')).toHaveText('Links from this article');
    await expect(cards(page)).toHaveCount(5);
    const first = cards(page).first();
    await expect(first.locator('.name')).toHaveText('Pulse Music & Dance Festival, Angsbacka');
    await expect(first.locator('.type')).toHaveText('Website');
    await expect(first.locator('.desc')).toContainText('Swedish community festival');
  });

  test('round icons: a picture when given, otherwise the first letter', async ({ page }) => {
    await expect(cards(page).first().locator('.initial')).toHaveText('P');
    const withIcon = cards(page).nth(1).locator('.icon img');
    await expect(withIcon).toHaveAttribute('src', /\/_astro\/.+\.webp$/);
    const box = (await cards(page).nth(1).locator('.icon').boundingBox())!;
    expect(box.width).toBe(48);
    await expect(cards(page).nth(1).locator('.icon')).toHaveCSS('border-radius', '50%');
  });

  test('links open in a new tab; affiliate links are labelled, explained and marked sponsored', async ({ page }) => {
    const normal = cards(page).first();
    await expect(normal).toHaveAttribute('target', '_blank');
    await expect(normal).toHaveAttribute('rel', 'noopener');
    await expect(normal.locator('.affiliate')).toHaveCount(0);

    const affiliate = page.locator('#links .link-card', { hasText: 'Contoured sleep mask' });
    await expect(affiliate).toHaveAttribute('rel', 'sponsored noopener');
    await expect(affiliate.locator('.affiliate')).toHaveText('Affiliate');
    await expect(page.locator('#links .note')).toContainText('may earn Loving Life Longer a small commission');
  });

  test('two columns on desktop, one on phones', async ({ page, isMobile }) => {
    const [a, b] = await cards(page).evaluateAll((els) => els.slice(0, 2).map((e) => e.getBoundingClientRect().top));
    if (isMobile) expect(b).toBeGreaterThan(a);
    else expect(b).toBe(a);
  });

  test('sit between the article text and the Q&A', async ({ page }) => {
    const order = await page.evaluate(() =>
      ['#article-body', '#links', '.faq-wrap'].map((s) => document.querySelector(s)!.getBoundingClientRect().top),
    );
    expect(order[0]).toBeLessThan(order[1]);
    expect(order[1]).toBeLessThan(order[2]);
  });
});

test('the article template is not published as an article', async ({ page }) => {
  await page.goto('/blog/_template/');
  await expect(page.locator('h1', { hasText: 'Your article title' })).toHaveCount(0);
  await page.goto('/');
  await expect(page.getByText('Your article title')).toHaveCount(0);
});
