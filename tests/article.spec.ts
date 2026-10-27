import { test, expect, ARTICLE, GREEN } from './fixtures';

const SECTION_HEADINGS = 9;

test.beforeEach(async ({ page }) => page.goto(ARTICLE));

test.describe('Article content', () => {
  test('header, byline and sections', async ({ page }) => {
    await expect(page.locator('.article-head .pillar-tag')).toHaveText('Move');
    await expect(page.locator('.article-head h1')).toHaveText('Blindfolded With 50 Strangers: My First Ecstatic Dance');
    await expect(page.locator('.byline')).toContainText('Ben Parker');
    await expect(page.locator('.byline')).toContainText('15 min read');
    await expect(page.locator('.byline')).toContainText('Jul 2026');
    await expect(page.locator('#article-body section h2')).toHaveCount(SECTION_HEADINGS);
  });

  test('photo sections and captions', async ({ page }) => {
    await expect(page.locator('.sec-split')).toHaveCount(3);
    await expect(page.locator('.caption')).toHaveText(['50 dancers. Blindfolded. In the dark.', 'You’re welcome… Feel free.'.replace('’', "'")]);
  });

  test('photo side alternates on desktop and text comes first on mobile', async ({ page, isMobile }) => {
    const sec = page.locator('#dancing-in-the-dark');
    // Where the heading's words actually sit (its box spans behind a floated photo).
    const words = await sec.locator('h2').evaluate((h) => {
      const r = document.createRange();
      r.selectNodeContents(h);
      const b = r.getBoundingClientRect();
      return { x: b.left, y: b.top };
    });
    const img = (await sec.locator('.sec-img').boundingBox())!;
    if (isMobile) expect(img.y).toBeGreaterThan(words.y);
    else expect(words.x).toBeGreaterThan(img.x + img.width); // photo on the left for this section
  });

  test('text runs full width once it passes the bottom of the photo (desktop)', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop only');
    for (const id of ['mealtime-fun', 'dancing-in-the-dark', 'final-sharing-and-finale']) {
      const sec = page.locator(`#${id}`);
      const img = (await sec.locator('.sec-img').boundingBox())!;
      const text = (await sec.locator('.sec-text').boundingBox())!;
      const below = await sec.locator('.sec-text p, .sec-text li').evaluateAll(
        (ps, imgBottom) => ps.map((p) => p.getBoundingClientRect()).filter((r) => r.top > imgBottom).map((r) => r.width),
        img.y + img.height,
      );
      expect(below.length, `${id} has text below its photo`).toBeGreaterThan(0);
      for (const w of below) expect(w).toBeGreaterThan(text.width - 40); // full width of the row (bullets are indented)
    }
  });

  test('desktop photos line up with the top of their section', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop only');
    for (const id of ['mealtime-fun', 'dancing-in-the-dark', 'final-sharing-and-finale']) {
      const img = await page.locator(`#${id} .sec-img`).boundingBox();
      const heading = await page.locator(`#${id} h2`).boundingBox();
      expect(Math.abs(img!.y - heading!.y)).toBeLessThan(20);
    }
  });

  test('Like/Share rail never covers article text', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop only');
    const rail = await page.locator('.engage-rail').boundingBox();
    const rightEdges = await page.locator('#article-body p').evaluateAll((ps) => ps.map((p) => p.getBoundingClientRect().right));
    expect(Math.max(...rightEdges)).toBeLessThan(rail!.x);
  });

  test('Seth\'s prep list shows as five bullet points', async ({ page }) => {
    await expect(page.locator('#dancing-in-the-dark ul > li')).toHaveCount(5);
    await expect(page.locator('#dancing-in-the-dark ul > li').first()).toContainText('Yes you can make noise');
  });

  test('text-only sections line up with the text-and-photo rows on desktop; mobile uses the screen width', async ({ page, isMobile }) => {
    const inner = (sel: string) => page.locator(sel).evaluate((el) => {
      const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      return { left: r.left + parseFloat(cs.paddingLeft), right: r.right - parseFloat(cs.paddingRight) };
    });
    const plain = await inner('#arriving');
    if (isMobile) return expect(plain.right - plain.left).toBe(350);
    const split = await inner('#mealtime-fun');
    expect(plain).toEqual(split);
  });

  test('article FAQ', async ({ page }) => {
    await expect(page.locator('.faq-card .qa-q')).toHaveCount(2);
  });
});

test.describe('Article interactions', () => {
  test('progress bar grows as you scroll', async ({ page }) => {
    const bar = page.locator('[data-progress]');
    const width = () => bar.evaluate((el) => parseFloat((el as HTMLElement).style.width) || 0);
    expect(await width()).toBeLessThan(5);
    await page.locator('#yoga-final-day').scrollIntoViewIfNeeded();
    await expect.poll(width).toBeGreaterThan(50);
  });

  test('photos zoom in once they scroll into view', async ({ page }) => {
    const img = page.locator('#final-sharing-and-finale .sec-img');
    await expect(img).not.toHaveClass(/is-visible/);
    await img.scrollIntoViewIfNeeded();
    await expect(img).toHaveClass(/is-visible/);
  });

  test('table of contents opens, jumps to a section and closes', async ({ page }) => {
    const btn = page.locator('[data-toc-toggle]');
    const list = page.locator('[data-toc]');
    await expect(list).toBeHidden();
    await expect(btn).toContainText('+');
    await btn.click();
    await expect(list).toBeVisible();
    await expect(btn).toContainText('−');
    await expect(list.locator('a')).toHaveCount(SECTION_HEADINGS);

    await list.getByText('Dancing in the Dark').click();
    await expect(list).toBeHidden();
    await expect
      .poll(() => page.locator('#dancing-in-the-dark').evaluate((el) => Math.round(el.getBoundingClientRect().top)))
      .toBeLessThan(150);
  });

  test('like toggles on and off and is saved', async ({ page, isMobile }) => {
    const like = page.locator(isMobile ? '.engage-bar [data-like]' : '.engage-rail [data-like]');
    const count = async () => Number(await like.locator('[data-like-count]').textContent());
    await expect(like).toContainText('♡');
    await page.waitForLoadState('networkidle');
    const before = await count();

    await like.click();
    await expect(like).toContainText('♥');
    await expect(like).toHaveCSS('color', GREEN);
    await page.waitForLoadState('networkidle');
    expect(await count()).toBeGreaterThanOrEqual(before + 1);

    await page.reload();
    await expect(like).toContainText('♥'); // remembered by the database

    await like.click();
    await expect(like).toContainText('♡');
  });

  test('only the right engagement controls show for the screen size', async ({ page, isMobile }) => {
    await expect(page.locator('.engage-bar')).toBeVisible({ visible: isMobile });
    await expect(page.locator('.engage-rail')).toBeVisible({ visible: !isMobile });
  });

  test('comments button scrolls to comments', async ({ page, isMobile }) => {
    await page.locator(isMobile ? '.engage-bar [data-to-comments]' : '.engage-rail [data-to-comments]').click();
    await expect(page.locator('#comments-section h2')).toBeInViewport();
  });
});

test.describe('Share sheet', () => {
  const open = (page, isMobile) =>
    page.locator(isMobile ? '.engage-bar [data-share-open]' : '.engage-rail [data-share-open]').click();

  test('opens, lists the right options and closes on the dimmed area', async ({ page, isMobile }) => {
    const sheet = page.locator('[data-share]');
    await expect(sheet).toBeHidden();
    await open(page, isMobile);
    await expect(sheet.getByText('Share this article')).toBeVisible();

    for (const name of ['Copy link', 'Email', 'WhatsApp', 'X']) await expect(sheet.getByText(name, { exact: true })).toBeVisible();
    for (const name of ['Facebook', 'Instagram', 'Snapchat'])
      await expect(sheet.getByText(name, { exact: true })).toBeVisible({ visible: !isMobile });

    await sheet.click({ position: { x: 5, y: 5 } });
    await expect(sheet).toBeHidden();
  });

  test('share links point at the article', async ({ page }) => {
    const url = encodeURIComponent(new URL(ARTICLE, 'http://localhost:4321').href);
    const href = (k: string) => page.locator(`[data-share-link="${k}"]`).getAttribute('href');
    expect(await href('email')).toMatch(/^mailto:\?subject=.+&body=/);
    expect(await href('email')).toContain(url);
    expect(await href('whatsapp')).toMatch(/^https:\/\/wa\.me\/\?text=/);
    expect(await href('x')).toContain(`https://x.com/intent/post?`);
    expect(await href('x')).toContain(url);
    expect(await href('facebook')).toBe(`https://www.facebook.com/sharer/sharer.php?u=${url}`);
  });

  test('copy link confirms with "Copied!"', async ({ page, isMobile, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await open(page, isMobile);
    await page.locator('[data-share] .row', { hasText: 'Copy link' }).click();
    await expect(page.locator('[data-copy-label]')).toHaveText('Copied!');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(ARTICLE);
    await expect(page.locator('[data-share]')).toBeHidden();
  });
});

test.describe('Comments', () => {
  const form = (page) => page.locator('[data-comment-form]');
  const items = (page) => page.locator('[data-comments] > div');
  const unique = () => `Test comment ${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const post = async (page, name: string, text: string) => {
    await form(page).getByPlaceholder('Name').fill(name);
    await form(page).getByPlaceholder('Add a comment').fill(text);
    await form(page).getByRole('button', { name: 'Post comment' }).click();
  };

  test('says when there are no comments yet', async ({ page }) => {
    // Pretend the article has no comments (other tests post some to the shared test database).
    await page.route('**/api/comments?*', (r) => r.fulfill({ json: { comments: [] } }));
    await page.reload();
    await expect(page.locator('.c-empty')).toHaveText('No comments yet. Be the first to share your thoughts.');
    await expect(page.locator('#comments-section h2')).toHaveText('Comments (0)');
  });

  test('name and comment are required', async ({ page }) => {
    const text = unique();
    await post(page, '   ', text);
    await expect(page.locator('[data-comment-notice]')).toHaveText('Please add your name and a comment.');
    await post(page, 'Sam', '   ');
    await expect(page.getByText(text)).toHaveCount(0);
  });

  test('posting adds the comment to the top, updates every count, and is saved', async ({ page }) => {
    const text = unique();
    await post(page, 'sam', text);

    const first = items(page).first();
    await expect(first.locator('.c-text')).toHaveText(text);
    await expect(first.locator('.c-av')).toHaveText('S');
    await expect(first.locator('.c-name')).toHaveText('sam');
    await expect(first.locator('.c-time')).toHaveText('Just now');
    await expect(form(page).getByPlaceholder('Name')).toHaveValue('');

    const counts = await page.locator('[data-comment-count]').allTextContents();
    expect(new Set(counts).size).toBe(1);
    expect(Number(counts[0])).toBeGreaterThanOrEqual(1);

    await page.reload();
    await expect(page.locator('.c-text', { hasText: text })).toBeVisible(); // loaded from the database
  });

  test('comment text is shown as plain text, not run as code', async ({ page }) => {
    await post(page, '<b>Bob</b>', '<img src=x onerror="window.hacked=1">');
    await expect(items(page).first().locator('.c-name')).toHaveText('<b>Bob</b>');
    expect(await page.evaluate(() => (window as any).hacked)).toBeUndefined();
  });

  test('Policy link opens the comments policy', async ({ page }) => {
    await form(page).getByRole('link', { name: 'Policy' }).click();
    await expect(page).toHaveURL('/policy/#comments');
    await expect(page.getByRole('heading', { name: 'Comments policy' })).toBeVisible();
  });
});
