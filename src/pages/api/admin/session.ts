import type { APIRoute } from 'astro';
import {
  checkPassword, clearFailures, isAdmin, passwordReady, recordFailure, sameOrigin, sessionCookie,
  signOutCookie, tooManyFailures, visitorKey, WINDOW_MINUTES,
} from '../../../lib/admin-auth';
import { database, json, readJson } from '../../../lib/server';

export const prerender = false;

// GET /api/admin/session → {signedIn, ready}
export const GET: APIRoute = async (ctx) => {
  const env = ctx.locals.runtime.env;
  return json({ signedIn: await isAdmin(ctx.request, env), ready: passwordReady(env) });
};

// POST /api/admin/session {password} → signs in (sets a cookie)
export const POST: APIRoute = async (ctx) => {
  if (!sameOrigin(ctx.request)) return json({ error: 'Invalid request.' }, 403);
  const { db, env } = await database(ctx);
  if (!passwordReady(env)) return json({ error: 'The admin password hasn’t been set up yet (see README).' }, 503);

  const key = await visitorKey(ctx.request);
  if (await tooManyFailures(db, key))
    return json({ error: `Too many wrong attempts. Please wait ${WINDOW_MINUTES} minutes and try again.` }, 429);

  const body = await readJson(ctx.request);
  if (!(await checkPassword(typeof body?.password === 'string' ? body.password : '', env))) {
    await recordFailure(db, key);
    return json({ error: 'That password isn’t right.' }, 401);
  }
  await clearFailures(db, key);
  return new Response(JSON.stringify({ signedIn: true }), {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'set-cookie': await sessionCookie(env) },
  });
};

// DELETE /api/admin/session → signs out
export const DELETE: APIRoute = async () =>
  new Response(JSON.stringify({ signedIn: false }), {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'set-cookie': signOutCookie },
  });
