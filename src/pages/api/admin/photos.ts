import type { APIRoute } from 'astro';
import { isAdmin, sameOrigin } from '../../../lib/admin-auth';
import { saveCrops, SaveError } from '../../../lib/github';
import { json, readJson } from '../../../lib/server';

export const prerender = false;

// POST /api/admin/photos {file, changes: [{id, focus, zoom}]} → saves the crops into that Markdown file
export const POST: APIRoute = async (ctx) => {
  const env = ctx.locals.runtime.env;
  if (!sameOrigin(ctx.request) || !(await isAdmin(ctx.request, env))) return json({ error: 'Please sign in.' }, 401);
  const body = await readJson(ctx.request);
  if (!body || typeof body.file !== 'string') return json({ error: 'Invalid request.' }, 400);
  try {
    const result = await saveCrops(env, body.file, body.changes as never);
    return json({ ok: true, ...result });
  } catch (e) {
    if (e instanceof SaveError) return json({ error: e.message }, e.status);
    return json({ error: 'Something went wrong while saving. Please try again.' }, 500);
  }
};
