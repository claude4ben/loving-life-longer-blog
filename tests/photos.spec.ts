import { test, expect, ARTICLE } from './fixtures';
import { focusPosition, FOCUS_PATTERN } from '../src/lib/photos';

test.describe('Photo focus words', () => {
  test('turn into crop positions', () => {
    expect(focusPosition()).toBe('50% 50%');
    expect(focusPosition('center')).toBe('50% 50%');
    expect(focusPosition('top')).toBe('50% 0%');
    expect(focusPosition('bottom')).toBe('50% 100%');
    expect(focusPosition('left')).toBe('0% 50%');
    expect(focusPosition('top right')).toBe('100% 0%');
    expect(focusPosition('Bottom Left')).toBe('0% 100%');
    expect(focusPosition('50%   30%')).toBe('50% 30%');
  });

  test('only sensible values are accepted (a typo stops the build)', () => {
    for (const ok of ['center', 'top', 'top left', 'bottom right', '50% 30%', '0% 100%']) expect(ok).toMatch(FOCUS_PATTERN);
    for (const bad of ['middle-ish', 'up', '50', '50% 30', 'top top top']) expect(bad).not.toMatch(FOCUS_PATTERN);
  });
});

test.describe('Photos on the article', () => {
  test.beforeEach(async ({ page }) => page.goto(ARTICLE));

  test('top photo is taller on desktop (up to 480px) and 16:9 on phones', async ({ page, isMobile }) => {
    const box = (await page.locator('.hero').boundingBox())!;
    if (isMobile) expect(Math.round(box.height)).toBe(Math.round((box.width * 9) / 16));
    else expect(box.height).toBe(480);
  });

  test('photos are resized copies in a fast format, not the original files', async ({ page }) => {
    const hero = page.locator('.hero img');
    await expect(hero).toHaveAttribute('src', /\/_astro\/.+\.webp$/);
    await expect(hero).toHaveAttribute('srcset', /\d+w/);
    await expect(hero).toHaveAttribute('loading', 'eager');
    await expect(page.locator('.sec-img img').first()).toHaveAttribute('loading', 'lazy');
    expect(await page.locator('img[src*="picsum"]').count()).toBe(0);
  });

  test('each photo uses its focus setting', async ({ page }) => {
    await expect(page.locator('.hero img')).toHaveCSS('object-position', '50% 50%');
    await expect(page.locator('#dancing-in-the-dark .sec-img img')).toHaveCSS('object-fit', 'cover');
  });
});

test.describe('Crop preview page', () => {
  test.skip(({ isMobile }) => isMobile, 'checked at desktop size');

  const signIn = async (page) => {
    await page.getByLabel('Admin password').fill('test-admin-password');
    await page.getByRole('button', { name: 'Sign in' }).click();
  };

  test('needs the admin password, then returns to the photos', async ({ page, request }) => {
    const res = await request.get('/admin/photos/', { maxRedirects: 0 });
    expect(res.status()).toBe(302);
    expect(res.headers()['location']).toBe('/admin/?next=/admin/photos/');

    await page.goto('/admin/photos/');
    await expect(page).toHaveURL('/admin/?next=/admin/photos/');
    await signIn(page);
    await expect(page).toHaveURL('/admin/photos/');
    await expect(page.locator('h1')).toHaveText('Photo crops');
  });

  test('shows every photo in each of its frames', async ({ page }) => {
    await page.goto('/admin/photos/');
    await signIn(page);
    await expect(page.locator('h1')).toHaveText('Photo crops');
    // Article: top photo in 3 frames + 3 section photos in 2 frames each; About: 1 frame.
    await expect(page.locator('figure')).toHaveCount(3 + 3 * 2 + 1);
    await expect(page.locator('.photo-block h3').first()).toHaveText('Top photo (heroImage)');
    await expect(page.locator('.photo-block .meta code').first()).toHaveText('hero.jpg'); // Ben's own file name
    await expect(page.locator('figure .dot')).toHaveCount(10);
    await expect(page.locator('figure .caption', { hasText: '50 dancers. Blindfolded. In the dark.' })).toHaveCount(2);
  });

  test('is linked from the admin page', async ({ page }) => {
    await page.goto('/admin/');
    await signIn(page);
    await page.getByRole('link', { name: 'Check photo crops →' }).click();
    await expect(page).toHaveURL('/admin/photos/');
  });
});
