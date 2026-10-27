// Admin sign-in with a password.
// The password is a Cloudflare secret (ADMIN_PASSWORD), never stored in GitHub. Signing in sets a
// cookie holding an expiry time plus a signature made from the password, so changing the password
// signs every device out. Too many wrong attempts from one address are blocked for a while.

import type { D1Database } from './db';

export const COOKIE = 'lll_admin';
export const SESSION_DAYS = 30;
export const MIN_PASSWORD_LENGTH = 12;
export const MAX_FAILURES = 5; // per address, per window
export const WINDOW_MINUTES = 15;

const enc = new TextEncoder();
const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const sha256 = async (s: string) => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));

async function sign(value: string, password: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(`lll-admin:${password}`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, enc.encode(value)));
}

/** Compare two strings without leaking how much of them matched. */
async function same(a: string, b: string): Promise<boolean> {
  const [x, y] = await Promise.all([sha256(a), sha256(b)]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}

export const passwordReady = (env: Partial<Env>) => (env.ADMIN_PASSWORD ?? '').length >= MIN_PASSWORD_LENGTH;

export async function checkPassword(attempt: string, env: Partial<Env>): Promise<boolean> {
  return passwordReady(env) && (await same(attempt, env.ADMIN_PASSWORD!));
}

/** The Set-Cookie value for a new signed-in session. */
export async function sessionCookie(env: Partial<Env>, now = Date.now()): Promise<string> {
  const expires = now + SESSION_DAYS * 86400_000;
  const value = `${expires}.${await sign(String(expires), env.ADMIN_PASSWORD!)}`;
  return `${COOKIE}=${value}; Path=/; Max-Age=${SESSION_DAYS * 86400}; HttpOnly; Secure; SameSite=Strict`;
}

export const signOutCookie = `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;

/** Is this request from a signed-in admin? */
export async function isAdmin(request: Request, env: Partial<Env>, now = Date.now()): Promise<boolean> {
  if (!passwordReady(env)) return false;
  const cookie = (request.headers.get('cookie') ?? '').split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`));
  const [expires, signature] = (cookie?.slice(COOKIE.length + 1) ?? '').split('.');
  if (!expires || !signature || !(Number(expires) > now)) return false;
  return same(signature, await sign(expires, env.ADMIN_PASSWORD!));
}

/** Admin changes must come from the site itself (stops other websites sending requests on Ben's behalf). */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(request.url).origin;
}

// --- Slowing down password guessing -------------------------------------------------------------

/** A one-way hash of the visitor's address, so we never store the address itself. */
export const visitorKey = (request: Request) =>
  sha256(`lll:${request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for') ?? 'unknown'}`);

export async function tooManyFailures(db: D1Database, key: string): Promise<boolean> {
  const row = await db
    .prepare(`SELECT COUNT(*) AS n FROM login_failures WHERE ip_hash = ? AND at > datetime('now', ?)`)
    .bind(key, `-${WINDOW_MINUTES} minutes`)
    .first<{ n: number }>();
  return (row?.n ?? 0) >= MAX_FAILURES;
}

export async function recordFailure(db: D1Database, key: string): Promise<void> {
  await db.batch([
    db.prepare('INSERT INTO login_failures (ip_hash) VALUES (?)').bind(key),
    db.prepare("DELETE FROM login_failures WHERE at < datetime('now', '-1 day')"),
  ]);
}

export async function clearFailures(db: D1Database, key: string): Promise<void> {
  await db.prepare('DELETE FROM login_failures WHERE ip_hash = ?').bind(key).run();
}
