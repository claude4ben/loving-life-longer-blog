import { test, expect } from '@playwright/test';
import { adminEmail } from '../src/lib/admin-auth';

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

test.describe('Admin sign-in check', () => {
  const req = (token?: string) => new Request('https://x/api/admin/comments', { headers: token ? { 'cf-access-jwt-assertion': token } : {} });

  test('refuses when Cloudflare Access is not set up', async () => {
    expect(await adminEmail(req('anything'), {})).toBeNull();
    expect(await adminEmail(req(), { ACCESS_TEAM_DOMAIN: 'team.cloudflareaccess.com', ACCESS_AUD: 'aud' })).toBeNull();
  });

  test('refuses a fake sign-in token', async () => {
    const env = { ACCESS_TEAM_DOMAIN: 'invalid.invalid', ACCESS_AUD: 'aud', ADMIN_EMAILS: 'ben@example.com' };
    expect(await adminEmail(req('not.a.jwt'), env)).toBeNull();
  });
});
