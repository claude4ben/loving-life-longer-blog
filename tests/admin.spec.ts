import { test, expect } from './fixtures';

const POST = 'blindfolded-with-50-strangers';
const ARTICLE = `/blog/${POST}/`;

// The admin page, signed in with the local test password.
test.describe('Comment admin', () => {
  test.skip(({ isMobile }) => isMobile, 'admin is checked at desktop size');

  test('reply as Ben, delete and restore', async ({ page, request }) => {
    const text = `Admin test ${Date.now()}`;
    await request.post('/api/comments', { data: { post: POST, name: 'Reader', email: 'reader@example.com', text } });

    await page.goto('/admin/');
    await page.getByLabel('Admin password').fill('test-admin-password');
    await page.getByRole('button', { name: 'Sign in' }).click();
    const card = page.locator('.a-card', { hasText: text });
    await expect(card).toContainText('reader@example.com'); // Ben sees the email; readers never do

    // Reply
    await card.getByRole('button', { name: 'Reply' }).click();
    await card.getByLabel('Your reply').fill('Thanks for reading!');
    await card.getByRole('button', { name: 'Post reply' }).click();
    await expect(page.locator('.a-card.reply', { hasText: 'Thanks for reading!' }).first()).toBeVisible();

    await page.goto(ARTICLE);
    const thread = page.locator('[data-comments] > div', { hasText: text });
    await expect(thread.locator('.c.reply .c-name')).toHaveText('Ben');
    await expect(thread.locator('.c.reply .c-badge')).toHaveText('Author');

    // Delete
    await page.goto('/admin/');
    page.once('dialog', (d) => d.accept());
    await page.locator('.a-card', { hasText: text }).getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('.a-card', { hasText: text })).toHaveCount(0);
    await page.goto(ARTICLE);
    await expect(page.locator('.c-text', { hasText: text })).toHaveCount(0);

    // Restore
    await page.goto('/admin/');
    await page.getByLabel('Show deleted').check();
    await page.locator('.a-card', { hasText: text }).getByRole('button', { name: 'Restore' }).click();
    await page.goto(ARTICLE);
    await expect(page.locator('.c-text', { hasText: text })).toBeVisible();
  });

  test('links to the article editor and the photo crop editor', async ({ page }) => {
    await page.goto('/admin/');
    await expect(page.getByRole('link', { name: /Keystatic/ })).toHaveAttribute('href', '/keystatic');
    await expect(page.getByRole('link', { name: 'Check photo crops →' })).toHaveAttribute('href', '/admin/photos/');
  });

  test('asks for the password, explains a wrong one, and signs out', async ({ page }) => {
    await page.goto('/admin/');
    await expect(page.getByLabel('Admin password')).toBeVisible();
    await expect(page.locator('[data-admin]')).toBeHidden();

    await page.getByLabel('Admin password').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.locator('[data-msg]')).toHaveText('That password isn’t right.');

    await page.getByLabel('Admin password').fill('test-admin-password');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.locator('[data-admin]')).toBeVisible();

    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page.getByLabel('Admin password')).toBeVisible();
    await page.reload();
    await expect(page.getByLabel('Admin password')).toBeVisible(); // still signed out after reload
  });
});
