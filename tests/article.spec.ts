import { test, expect, ARTICLE, LIKE_RED } from './fixtures';

const SECTION_HEADINGS = 9;

test.beforeEach(async ({ page }) => page.goto(ARTICLE));

test.describe('Article content', () => {
  test('header, byline and sections', async ({ page }) => {
    await expect(page.locator('.article-head .pillar-tag')).toHaveText('Move');
    await expect(page.locator('.article-head h1')).toHaveText('Blindfolded With 50 Strangers: My First Ecstatic Dance');
    await expect(page.locator('.byline')).toContainText('Ben Parker');
    await expect(page.locator('.byline')).toContainText('15 min read');
    await expect(page.locator('.byline')).toContainText('1 Jul 2026');
    // Date and read time sit under the name, lined up with it (not floating on the right).
    const name = (await page.locator('.by-name').boundingBox())!;
    const meta = (await page.locator('.by-meta').boundingBox())!;
    expect(meta.x).toBe(name.x);
    expect(meta.y).toBeGreaterThan(name.y);
    // Industry-standard order: read time, then the full date (as on Medium, Substack, The Guardian).
    await expect(page.locator('.by-meta')).toHaveText('15 min read·1 Jul 2026');
    await expect(page.locator('.by-meta time')).toHaveAttribute('datetime', '2026-07-01');
    await expect(page.locator('#article-body section h2')).toHaveCount(SECTION_HEADINGS);
  });

  test('desktop title fits on one line and the summary is exactly as wide as the title', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop only');
    const h1 = page.locator('.article-head h1');
    const lineHeight = await h1.evaluate((el) => parseFloat(getComputedStyle(el).lineHeight));
    const title = (await h1.boundingBox())!;
    expect(title.height).toBeLessThan(lineHeight * 1.5); // one line
    const summary = (await page.locator('.standfirst').boundingBox())!;
    expect(Math.abs(summary.width - title.width)).toBeLessThan(2);
    expect(summary.x).toBe(title.x);
  });

  test('photo sections and captions', async ({ page }) => {
    await expect(page.locator('.sec-split')).toHaveCount(3);
    await expect(page.locator('.caption')).toHaveText(['Five days in Dorset.', '50 dancers. Blindfolded. In the dark.', 'You’re welcome… Feel free.'.replace('’', "'")]);
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
    for (const id of ['mealtime-fun', 'dancing-in-the-dark', 'final-sharing-circle-finale']) {
      const sec = page.locator(`#${id}`);
      const img = (await sec.locator('.sec-img').boundingBox())!;
      const text = (await sec.locator('.sec-text').boundingBox())!;
      const below = await sec.locator('.sec-text p, .sec-text li').evaluateAll(
        (ps, imgBottom) => ps.map((p) => p.getBoundingClientRect()).filter((r) => r.top > imgBottom).map((r) => r.width),
        img.y + img.height,
      );
      expect(below.length, `${id} has text below its photo`).toBeGreaterThan(0);
      // A paragraph that starts beside the photo keeps that column width all the way to its end.
      const beside = await sec.locator('.sec-text p, .sec-text li').evaluateAll(
        (ps, imgBottom) => ps.map((p) => p.getBoundingClientRect()).filter((r) => r.top < imgBottom).map((r) => r.width),
        img.y + img.height,
      );
      for (const w of beside) expect(w).toBeLessThan(text.width * 0.6);
      for (const w of below) expect(w).toBeGreaterThan(text.width - 40); // full width of the row (bullets are indented)
    }
  });

  test('desktop photos line up with the top of their section', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop only');
    for (const id of ['mealtime-fun', 'dancing-in-the-dark', 'final-sharing-circle-finale']) {
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
    await page.locator('#using-grass-to-do-yoga-final-day').scrollIntoViewIfNeeded();
    await expect.poll(width).toBeGreaterThan(50);
  });

  test('photos zoom in once they scroll into view', async ({ page }) => {
    const img = page.locator('#final-sharing-circle-finale .sec-img');
    await expect(img).not.toHaveClass(/is-visible/);
    await img.scrollIntoViewIfNeeded();
    await expect(img).toHaveClass(/is-visible/);
  });

  test('the zoom waits until (nearly) the whole photo is on screen', async ({ page }) => {
    const img = page.locator('#final-sharing-circle-finale .sec-img');
    // Scroll so only the top 40% of the photo shows at the bottom of the screen.
    await page.mouse.wheel(0, 10);
    await page.evaluate(() => {
      const el = document.querySelector('#final-sharing-circle-finale .sec-img')!;
      const r = el.getBoundingClientRect();
      window.scrollTo(0, scrollY + r.top - innerHeight + r.height * 0.4);
    });
    await page.waitForTimeout(400);
    await expect(img).not.toHaveClass(/is-visible/);
    await page.evaluate(() => {
      const el = document.querySelector('#final-sharing-circle-finale .sec-img')!;
      window.scrollTo(0, scrollY + el.getBoundingClientRect().top - 80);
    });
    await expect(img).toHaveClass(/is-visible/);
  });

  test('reading progress bar is 6px deep', async ({ page }) => {
    await expect(page.locator('.progress')).toHaveCSS('height', '6px');
  });

  test('readers who only read get nothing saved in their browser', async ({ page, isMobile }) => {
    await page.waitForLoadState('networkidle');
    expect(await page.evaluate(() => localStorage.getItem('lll-visitor'))).toBeNull();
    await page.locator(isMobile ? '.engage-bar [data-like]' : '.engage-rail [data-like]').click();
    await expect.poll(() => page.evaluate(() => localStorage.getItem('lll-visitor'))).not.toBeNull();
  });

  test('comments button uses the standard speech-bubble icon with the count', async ({ page, isMobile }) => {
    const btn = page.locator(isMobile ? '.engage-bar [data-to-comments]' : '.engage-rail [data-to-comments]');
    await expect(btn.locator('svg.icon')).toBeVisible();
    await expect(btn).toHaveAccessibleName(/^Comments \d+$/);
  });

  test('photo captions sit over the bottom left, on the top photo too', async ({ page }) => {
    for (const sel of ['.hero', '#dancing-in-the-dark .sec-img']) {
      const photo = (await page.locator(sel).boundingBox())!;
      const text = (await page.locator(`${sel} .caption span`).boundingBox())!;
      expect(text.x - photo.x).toBeLessThan(24);
      expect(photo.y + photo.height - (text.y + text.height)).toBeLessThan(24);
      await expect(page.locator(`${sel} .caption span`)).toHaveCSS('color', 'rgb(255, 255, 255)');
    }
    await expect(page.locator('.hero .caption')).toHaveText('Five days in Dorset.');
  });

  test('space between a section and the next heading is 20% less than before', async ({ page }) => {
    const gaps = await page.locator('#article-body').evaluate((body) =>
      [...body.querySelectorAll(':scope > section.sec-plain')]
        .filter((s) => s.nextElementSibling && s.lastElementChild?.tagName === 'P')
        .map((s) => s.nextElementSibling!.querySelector('h2')!.getBoundingClientRect().top - s.lastElementChild!.getBoundingClientRect().bottom),
    );
    expect(gaps.length).toBeGreaterThan(0);
    for (const g of gaps) expect(Math.round(g)).toBe(45); // was 56
  });

  test('the top photo waits for the first scroll before zooming', async ({ page }) => {
    const hero = page.locator('.hero');
    await page.waitForLoadState('load');
    await page.waitForTimeout(400);
    await expect(hero).not.toHaveClass(/is-visible/);
    await page.mouse.wheel(0, 200);
    await expect(hero).toHaveClass(/is-visible/);
  });

  test('comments come straight after the article, then links, then common questions', async ({ page }) => {
    const top = (sel: string) => page.locator(sel).evaluate((el) => el.getBoundingClientRect().top + scrollY);
    const [body, comments, links, faq] = [await top('#article-body'), await top('#comments-section'), await top('#links'), await top('.faq-wrap')];
    expect(body).toBeLessThan(comments);
    expect(comments).toBeLessThan(links);
    expect(links).toBeLessThan(faq);
  });

  test('top photo and header line up with the text on desktop; photo is edge to edge on phones', async ({ page, isMobile }) => {
    const hero = (await page.locator('.hero').boundingBox())!;
    const text = (await page.locator('.article-head h1').boundingBox())!;
    const vw = page.viewportSize()!.width;
    if (isMobile) {
      expect(Math.round(hero.x)).toBe(0);
      expect(Math.round(hero.width)).toBe(vw);
    } else {
      expect(Math.round(hero.x)).toBe(Math.round(text.x));
      expect(Math.round(hero.width)).toBe(vw - 2 * Math.round(text.x));
      const logo = (await page.locator('.brand-logo').boundingBox())!;
      const nav = (await page.locator('.site-header .nav').boundingBox())!;
      expect(Math.round(logo.x)).toBe(Math.round(text.x));
      expect(Math.round(nav.x + nav.width)).toBe(Math.round(hero.x + hero.width));
    }
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
    const heart = like.locator('svg.heart path');
    await expect(like).toHaveAttribute('aria-pressed', 'false');
    await expect(heart).toHaveCSS('fill', 'none');
    await page.waitForLoadState('networkidle');
    const before = await count();

    await like.click();
    await expect(like).toHaveAttribute('aria-pressed', 'true');
    await expect(heart).toHaveCSS('fill', LIKE_RED); // standard outline heart, filled red when liked
    await page.waitForLoadState('networkidle');
    expect(await count()).toBeGreaterThanOrEqual(before + 1);

    await page.reload();
    await expect(like).toHaveAttribute('aria-pressed', 'true'); // remembered by the database

    await like.click();
    await expect(like).toHaveAttribute('aria-pressed', 'false');
    await expect(heart).toHaveCSS('fill', 'none');
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
  const EVERYWHERE = ['WhatsApp', 'Facebook', 'X', 'LinkedIn', 'Email', 'Instagram', 'Threads', 'Bluesky', 'Reddit', 'Pinterest', 'Telegram', 'Snapchat'];
  const PHONES_ONLY = ['Messenger', 'Messages'];

  test('opens, shows every option as a round brand icon, and closes on the dimmed area', async ({ page, isMobile }) => {
    const sheet = page.locator('[data-share]');
    await expect(sheet).toBeHidden();
    await open(page, isMobile);
    await expect(sheet.getByText('Share this article')).toBeVisible();
    await expect(sheet.getByText('Copy link', { exact: true })).toBeVisible();
    for (const name of EVERYWHERE) await expect(sheet.locator('.share-label', { hasText: new RegExp(`^${name}$`) })).toBeVisible();
    for (const name of PHONES_ONLY)
      await expect(sheet.locator('.share-label', { hasText: new RegExp(`^${name}$`) })).toBeVisible({ visible: isMobile });
    // Genuine brand colours on round tiles, e.g. WhatsApp green and Snapchat yellow with a black ghost.
    const tile = (name: string) =>
      sheet.locator('.share-opt', { has: page.locator('.share-label', { hasText: new RegExp(`^${name}$`) }) }).locator('.tile');
    await expect(tile('WhatsApp')).toHaveCSS('background-color', 'rgb(37, 211, 102)');
    await expect(tile('LinkedIn')).toHaveCSS('background-color', 'rgb(10, 102, 194)');
    await expect(tile('Snapchat')).toHaveCSS('color', 'rgb(0, 0, 0)');
    await expect(tile('WhatsApp')).toHaveCSS('border-radius', '50%');
    // Comfortable to tap.
    const box = (await sheet.locator('.share-opt').first().boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);

    await sheet.click({ position: { x: 5, y: 5 } });
    await expect(sheet).toBeHidden();
  });

  test('every share option opens that service with the article address', async ({ page }) => {
    const url = encodeURIComponent(new URL(ARTICLE, 'http://localhost:4321').href);
    const href = (k: string) => page.locator(`[data-share-link="${k}"]`).getAttribute('href');
    expect(await href('email')).toMatch(/^mailto:\?subject=.+&body=/);
    expect(await href('email')).toContain(url);
    expect(await href('whatsapp')).toMatch(/^https:\/\/wa\.me\/\?text=/);
    expect(await href('x')).toContain('https://x.com/intent/post?');
    expect(await href('facebook')).toBe(`https://www.facebook.com/sharer/sharer.php?u=${url}`);
    expect(await href('linkedin')).toBe(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`);
    expect(await href('reddit')).toMatch(/^https:\/\/www\.reddit\.com\/submit\?url=.+&title=/);
    expect(await href('pinterest')).toMatch(/&media=https%3A%2F%2F.+\.jpg&description=/); // the article's photo
    expect(await href('threads')).toMatch(/^https:\/\/www\.threads\.com\/intent\/post\?text=/);
    expect(await href('bluesky')).toMatch(/^https:\/\/bsky\.app\/intent\/compose\?text=/);
    expect(await href('telegram')).toMatch(/^https:\/\/t\.me\/share\/url\?url=/);
    expect(await href('messenger')).toMatch(/^fb-messenger:\/\/share\/\?link=/);
    expect(await href('sms')).toMatch(/^sms:/);
    for (const k of ['whatsapp', 'x', 'linkedin', 'reddit', 'pinterest', 'threads', 'bluesky', 'telegram', 'snapchat'])
      expect(await href(k)).toContain(url.replace(/%3A/g, '%3A'));
  });

  test('copy link confirms with "Copied!"', async ({ page, isMobile, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await open(page, isMobile);
    await page.locator('[data-share] .copy-row').click();
    await expect(page.locator('[data-copy-label]')).toHaveText('Copied!');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(ARTICLE);
    await expect(page.locator('[data-share]')).toBeHidden();
  });

  test('Instagram copies the link and says to paste it into Instagram', async ({ page, isMobile, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await open(page, isMobile);
    await page.locator('[data-share] .share-opt', { hasText: 'Instagram' }).click();
    await expect(page.locator('[data-copy-label]')).toHaveText('Link copied: paste it into Instagram');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(ARTICLE);
  });
});

test.describe('Comments', () => {
  const form = (page) => page.locator('[data-comment-form]');

  test('form fields are labelled and let browsers fill in name and email', async ({ page }) => {
    await expect(form(page).getByLabel('Name')).toHaveAttribute('autocomplete', 'name');
    const email = form(page).getByLabel(/^Email/);
    await expect(email).toHaveAttribute('autocomplete', 'email');
    await expect(email).toHaveAttribute('type', 'email');
    await expect(email).toHaveAttribute('placeholder', 'Email (optional, not published)');
    await expect(email).toHaveAccessibleDescription('Only used to let you know we have replied.');
    await expect(form(page).locator('.field-hint')).toBeVisible();
  });
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
    await expect(page).toHaveURL('/policy/#comments-policy');
    await expect(page.getByRole('heading', { name: 'Comments policy' })).toBeVisible();
  });
});
