import { test, expect, ARTICLE, GREEN } from './fixtures';

const PAGES = ['/', ARTICLE, '/about/', '/policy/'];

test.describe('Every page', () => {
  for (const path of PAGES) {
    test(`${path} loads with header, footer and no sideways scroll`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('.brand-name')).toHaveText('Loving Life Longer');
      await expect(page.locator('.site-footer')).toContainText('© 2026 Loving Life Longer');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test('page titles', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Loving Life Longer');
    await page.goto('/about/');
    await expect(page).toHaveTitle('About · Loving Life Longer');
  });

  test('logo goes home and footer Policy goes to policy', async ({ page }) => {
    await page.goto('/about/');
    await page.locator('.brand').click();
    await expect(page).toHaveURL('/');
    await page.locator('.site-footer a', { hasText: 'Policy' }).click();
    await expect(page).toHaveURL('/policy/');
  });

  test('Policy is not in the main nav', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.site-header nav a', { hasText: 'Policy' })).toHaveCount(0);
  });
});

test.describe('Desktop nav', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test('shows Home, Blog, About and highlights the current page', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('.site-header .nav');
    await expect(nav.locator('a')).toHaveText(['Home', 'Blog', 'About']);
    await expect(page.locator('.burger')).toBeHidden();

    const home = nav.getByRole('link', { name: 'Home' });
    await expect(home).toHaveAttribute('aria-current', 'page');
    await expect(home).toHaveCSS('color', GREEN);
    await expect(home).toHaveCSS('font-weight', '700');

    await nav.getByRole('link', { name: 'Blog' }).click();
    await expect(page).toHaveURL(ARTICLE);
    await expect(nav.getByRole('link', { name: 'Blog' })).toHaveAttribute('aria-current', 'page');
  });
});

test.describe('Mobile menu', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile only');

  test('opens full screen, navigates and closes', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.site-header .nav')).toBeHidden();
    const menu = page.locator('[data-menu]');
    await expect(menu).toBeHidden();

    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(menu).toBeVisible();
    await expect(menu.locator('nav a')).toHaveText(['Home', 'Blog', 'About']);
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(menu).toBeHidden();

    await page.getByRole('button', { name: 'Menu' }).click();
    await menu.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL('/about/');
    await expect(page.locator('[data-menu]')).toBeHidden();
  });
});
