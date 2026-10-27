import { test, expect } from './fixtures';

test.describe('About', () => {
  test.beforeEach(async ({ page }) => page.goto('/about/'));

  test('content blocks', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('I started this because I got tired of my own excuses.');
    await expect(page.locator('.pillar-label')).toHaveText(['Think', 'Move', 'Live']);
    await expect(page.locator('.person .name')).toHaveText(['Ben', 'Emma']);
    await expect(page.locator('.note-card')).toContainText("I'm not a therapist, doctor, or clinician.");
    await expect(page.locator('.strip img')).toHaveCount(3);
  });

  test('pillar cards: three across on desktop, stacked on mobile', async ({ page, isMobile }) => {
    const boxes = await page.locator('.pillar-card').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().top));
    if (isMobile) expect(boxes[1]).toBeGreaterThan(boxes[0]);
    else expect(boxes[1]).toBe(boxes[0]);
  });
});

test('Policy page has its three sections', async ({ page }) => {
  await page.goto('/policy/');
  await expect(page.locator('h1')).toHaveText('Policies');
  await expect(page.locator('h2')).toHaveText(['Comments policy', 'Data & privacy', 'Cookies']);
});
