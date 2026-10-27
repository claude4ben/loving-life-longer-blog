import { test, expect } from '@playwright/test';
import { isAdmin, sessionCookie, passwordReady, COOKIE } from '../src/lib/admin-auth';

const POST = 'blindfolded-with-50-strangers';

// Server routes: the rules they enforce, checked directly.
test.describe('Comments API', () => {
  test('refuses bad comments', async ({ request }) => {
    const send = (data: object) => request.post('/api/comments', { data: { post: POST, name: 'Sam', text: 'Hi', ...data } });
    expect((await send({ post: 'not-an-article' })).status()).toBe(400);
    expect((await send({ name: '' })).status()).toBe(400);
    expect((await send({ name: 'x'.repeat(81) })).status()).toBe(400);
    expect((await send({ text: '' })).status()).toBe(400);
    expect((await send({ text: 'x'.repeat(5001) })).status()).toBe(400);
    expect((await send({ email: 'not-an-email' })).status()).toBe(400);
  });

  test('ignores bots that fill in the hidden field', async ({ request }) => {
    const text = `Bot ${Date.now()}`;
    const res = await request.post('/api/comments', { data: { post: POST, name: 'Bot', text, website: 'http://spam' } });
    expect(res.status()).toBe(201);
    const { comments } = await (await request.get(`/api/comments?post=${POST}`)).json();
    expect(JSON.stringify(comments)).not.toContain(text);
  });

  test('never returns commenters\' email addresses', async ({ request }) => {
    await request.post('/api/comments', { data: { post: POST, name: 'Private', text: 'Hello', email: 'private@example.com' } });
    const body = await (await request.get(`/api/comments?post=${POST}`)).text();
    expect(body).not.toContain('private@example.com');
  });
});

test.describe('Likes API', () => {
  test('one like per visitor', async ({ request }) => {
    const visitor = `test-${Date.now()}`;
    const like = (liked: boolean) => request.post('/api/likes', { data: { post: POST, visitor, liked } });
    const first = await (await like(true)).json();
    const again = await (await like(true)).json();
    expect(again.count).toBe(first.count);
    expect(again.liked).toBe(true);
    expect((await (await like(false)).json()).liked).toBe(false);
    expect((await request.post('/api/likes', { data: { post: POST, visitor: 'x', liked: true } })).status()).toBe(400);
  });
});

test.describe('Admin sign-in', () => {
  const env = { ADMIN_PASSWORD: 'a-long-test-password' };
  const withCookie = (cookie: string) => new Request('https://x/', { headers: { cookie: cookie.split(';')[0] } });

  test('a fresh sign-in cookie is accepted', async () => {
    expect(await isAdmin(withCookie(await sessionCookie(env)), env)).toBe(true);
  });

  test('refuses expired, tampered or old-password cookies', async () => {
    const old = await sessionCookie(env, Date.now() - 31 * 86400_000);
    expect(await isAdmin(withCookie(old), env)).toBe(false);
    const good = (await sessionCookie(env)).split(';')[0];
    expect(await isAdmin(withCookie(good.slice(0, -2) + '00'), env)).toBe(false);
    expect(await isAdmin(withCookie(good), { ADMIN_PASSWORD: 'a-different-password' })).toBe(false);
    expect(await isAdmin(withCookie(`${COOKIE}=9999999999999.abc`), env)).toBe(false);
    expect(await isAdmin(new Request('https://x/'), env)).toBe(false);
  });

  test('admin is off until a password of 12+ characters is set', async () => {
    expect(passwordReady({})).toBe(false);
    expect(passwordReady({ ADMIN_PASSWORD: 'short' })).toBe(false);
    expect(await isAdmin(withCookie(await sessionCookie({ ADMIN_PASSWORD: 'short' })), { ADMIN_PASSWORD: 'short' })).toBe(false);
  });

  test('blocks an address after 5 wrong passwords', async ({ request }) => {
    const ip = `10.0.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
    const attempt = (password: string) =>
      request.post('/api/admin/session', { data: { password }, headers: { 'cf-connecting-ip': ip } });
    for (let i = 0; i < 5; i++) expect((await attempt('wrong')).status()).toBe(401);
    expect((await attempt('wrong')).status()).toBe(429);
    expect((await attempt('test-admin-password')).status()).toBe(429); // even the right one, until the wait is over
  });

  test('admin data needs sign-in, and changes must come from the site itself', async ({ request }) => {
    expect((await request.get('/api/admin/comments')).status()).toBe(401);
    const ip = `10.1.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
    const ok = await request.post('/api/admin/session', { data: { password: 'test-admin-password' }, headers: { 'cf-connecting-ip': ip } });
    expect(ok.status()).toBe(200);
    expect((await request.get('/api/admin/comments')).status()).toBe(200);
    const crossSite = await request.post('/api/admin/comments', { data: { id: 1, action: 'delete' }, headers: { origin: 'https://evil.example' } });
    expect(crossSite.status()).toBe(401);
    // Sign-out tells the browser to drop the cookie (the real-browser sign-out is tested in admin.spec.ts).
    const signOut = await request.delete('/api/admin/session', { headers: { origin: 'http://localhost:4321' } });
    expect(signOut.status()).toBe(200);
    expect(signOut.headers()['set-cookie']).toMatch(/^lll_admin=; .*Max-Age=0/);
  });
});
