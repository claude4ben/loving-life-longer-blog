import { test, expect, ARTICLE } from './fixtures';

test.describe('Home', () => {
  test.beforeEach(async ({ page }) => page.goto('/'));

  test('mission line', async ({ page }) => {
    await expect(page.locator('.mission')).toContainText('Loving Life Longer is written by Ben');
  });

  test('featured article links to the article', async ({ page }) => {
    const feature = page.locator('a.feature');
    await expect(feature.locator('.pillar-tag')).toHaveText('Move');
    await expect(feature.locator('h1')).toHaveText('Blindfolded With 50 Strangers: My First Ecstatic Dance');
    await expect(feature).toContainText('15 min read');
    await feature.click();
    await expect(page).toHaveURL(ARTICLE);
  });

  test('FAQ starts closed and opens', async ({ page }) => {
    const faq = page.locator('details.home-faq');
    await expect(faq.locator('.qa-q').first()).toBeHidden();
    await faq.locator('summary').click();
    await expect(faq.locator('.qa-q').first()).toHaveText('What is ecstatic dance?');
  });

  test('one-article note shows while there is one article', async ({ page }) => {
    await expect(page.getByText('Only one article published so far')).toBeVisible();
  });
});

test.describe('Signup block', () => {
  test('needs an email and consent, then thanks the reader', async ({ page }) => {
    await page.goto('/');
    const block = page.locator('.signup');
    await block.getByRole('button', { name: 'Subscribe' }).click();
    await expect(block.locator('form')).toBeVisible(); // blocked: empty email

    await block.getByPlaceholder('Email address').fill('reader@example.com');
    await block.getByRole('button', { name: 'Subscribe' }).click();
    await expect(block.locator('form')).toBeVisible(); // blocked: no consent tick

    await block.getByRole('checkbox').check();
    await block.getByRole('button', { name: 'Subscribe' }).click();
    await expect(block.getByText('Thanks — you’re on the list.')).toBeVisible();
  });

  test('compact version on About has no body text or checkbox', async ({ page }) => {
    await page.goto('/about/');
    const block = page.locator('.signup-compact');
    await expect(block.getByRole('heading')).toHaveText('Get new pieces by email');
    await expect(block.getByRole('checkbox')).toHaveCount(0);
    await expect(block.locator('p')).toHaveCount(0);
  });
});
