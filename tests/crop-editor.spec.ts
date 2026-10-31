import { test, expect } from './fixtures';
import { saveCrops, SaveError } from '../src/lib/github';
import { FOCUS_PATTERN } from '../src/lib/photos';

const HERO = '[data-shot][data-id="hero"]';
const signIn = async (page) => {
  await page.goto('/admin/photos/');
  await page.getByLabel('Admin password').fill('test-admin-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('h1')).toHaveText('Photo crops');
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true'); // editor script has started
};
const position = (page, sel: string) => page.locator(sel).first().evaluate((el) => (el as HTMLImageElement).style.objectPosition || getComputedStyle(el).objectPosition);

test.describe('Photo crop editor', () => {
  test.skip(({ isMobile }) => isMobile, 'checked at desktop size');
  test.beforeEach(async ({ page }) => signIn(page));

  test('dragging inside a frame moves the photo in every frame; Undo puts it back', async ({ page }) => {
    const frame = page.locator(`${HERO} [data-frame]`).first();
    const box = (await frame.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - 100, box.y + box.height / 2 + 40, { steps: 5 });
    await page.mouse.up();

    const moved = await position(page, `${HERO} [data-frame] img`);
    expect(moved).not.toBe('50% 50%');
    const [x, y] = moved.split(' ').map(parseFloat);
    expect(x).toBeGreaterThan(50); // dragged left → shows more of the right
    expect(y).toBeLessThan(50); // dragged down → shows more of the top
    for (const img of await page.locator(`${HERO} [data-frame] img`).all()) expect(await img.evaluate((e) => e.style.objectPosition)).toBe(moved);
    await expect(page.locator('[data-savebar]')).toContainText('1 photo changed');

    await page.locator(HERO).getByRole('button', { name: 'Undo changes' }).click();
    expect(await position(page, `${HERO} [data-frame] img`)).toBe('50% 50%');
    await expect(page.locator('[data-savebar]')).toBeHidden();
  });

  test('clicking the original photo puts the focus point there; arrow keys nudge it', async ({ page }) => {
    const original = page.locator(`${HERO} [data-original]`);
    const box = (await original.boundingBox())!;
    await original.click({ position: { x: box.width * 0.25, y: box.height * 0.75 } });
    const [x, y] = (await position(page, `${HERO} [data-frame] img`)).split(' ').map(parseFloat);
    expect(Math.round(x)).toBe(25);
    expect(Math.round(y)).toBe(75);
    await original.press('ArrowRight');
    expect(parseFloat(await position(page, `${HERO} [data-frame] img`))).toBeCloseTo(x + 1, 0);
  });

  test('the zoom slider zooms every frame', async ({ page }) => {
    await page.locator(HERO).getByLabel('Zoom for Top photo').fill('2');
    await expect(page.locator(`${HERO} [data-zoom-value]`)).toHaveText('2.00×');
    for (const img of await page.locator(`${HERO} [data-frame] img`).all())
      expect(await img.evaluate((e) => getComputedStyle(e).transform)).toBe('matrix(2, 0, 0, 2, 0, 0)');
  });

  test('Save writes the new focus and zoom into the Markdown file on GitHub', async ({ page, request }) => {
    const original = page.locator(`${HERO} [data-original]`);
    const box = (await original.boundingBox())!;
    await original.click({ position: { x: box.width * 0.4, y: box.height * 0.3 } });
    await page.locator(HERO).getByLabel('Zoom for Top photo').fill('1.5');
    const [x, y] = (await position(page, `${HERO} [data-frame] img`)).split(' ').map(parseFloat);

    await page.locator('[data-savebar]').getByRole('button', { name: 'Save' }).click();
    await expect(page.locator(`${HERO} [data-status]`)).toHaveText('Saved');
    await expect(page.locator('[data-savebar]')).toContainText('The site will update in about 2 minutes');

    const last = await (await request.get('http://127.0.0.1:4399/__last')).json();
    expect(last.path).toBe('tests/fixtures/content/blog/blindfolded-with-50-strangers.md'); // the tests' sample copy
    expect(last.branch).toBe('main');
    expect(last.message).toMatch(/^Photo crop: hero/);
    expect(last.text).toContain(`heroFocus: "${x}% ${y}%"\nheroZoom: 1.5\n`);
    // Whatever the editor saves must pass the site's own rules, or the next build fails (bug fixed 2026-10-31).
    expect(last.text.match(/heroFocus: "([^"]+)"/)![1]).toMatch(FOCUS_PATTERN);
    expect(last.text).toContain('title: "Blindfolded With 50 Strangers: My First Ecstatic Dance"'); // rest untouched
  });
});

test.describe('Saving crops (rules)', () => {
  const FILE = 'src/content/blog/blindfolded-with-50-strangers.md';
  const fakeGitHub = (status: number) => (async () => new Response('{}', { status })) as typeof fetch;

  test('explains when the GitHub key is not set up', async () => {
    await expect(saveCrops({}, FILE, [{ id: 'hero', focus: '50% 50%', zoom: 1 }])).rejects.toThrow(/GITHUB_TOKEN/);
  });

  test('refuses bad values and unknown photos before contacting GitHub', async () => {
    const env = { GITHUB_TOKEN: 'x' };
    const never = (async () => { throw new Error('should not call GitHub'); }) as typeof fetch;
    await expect(saveCrops(env, FILE, [{ id: 'hero', focus: 'top', zoom: 1 }], never)).rejects.toThrow(/percentages/);
    await expect(saveCrops(env, FILE, [{ id: 'hero', focus: '150% 50%', zoom: 1 }], never)).rejects.toThrow(/percentages/);
    await expect(saveCrops(env, FILE, [{ id: 'hero', focus: '50% 50%', zoom: 5 }], never)).rejects.toThrow(/between 1 and 3/);
    await expect(saveCrops(env, FILE, [{ id: 'title', focus: '50% 50%', zoom: 1 }], never)).rejects.toThrow(/can’t be edited/);
    await expect(saveCrops(env, 'wrangler.toml', [{ id: 'hero', focus: '50% 50%', zoom: 1 }], never)).rejects.toThrow(/can’t be edited/);
  });

  test('turns GitHub errors into plain English', async () => {
    const env = { GITHUB_TOKEN: 'x' };
    const change = [{ id: 'hero', focus: '50% 50%', zoom: 1 }];
    await expect(saveCrops(env, FILE, change, fakeGitHub(401))).rejects.toThrow(/refused the key/);
    await expect(saveCrops(env, FILE, change, fakeGitHub(404))).rejects.toThrow(/couldn’t find that file/);
    await expect(saveCrops(env, FILE, change, fakeGitHub(500))).rejects.toBeInstanceOf(SaveError);
  });

  test('the save route needs admin sign-in', async ({ request }) => {
    const res = await request.post('/api/admin/photos', { data: { file: FILE, changes: [] } });
    expect(res.status()).toBe(401);
  });
});
