import type { APIRoute } from 'astro';
import { database, isPost, json, readJson, text } from '../../lib/server';

export const prerender = false;

// Each browser has a random visitor id (kept in the browser), so each visitor counts once.
const VISITOR = /^[A-Za-z0-9-]{8,64}$/;

async function state(db: Awaited<ReturnType<typeof database>>['db'], post: string, visitor: string) {
  const row = await db
    .prepare('SELECT COUNT(*) AS count, SUM(visitor = ?) AS mine FROM likes WHERE post = ?')
    .bind(visitor, post)
    .first<{ count: number; mine: number | null }>();
  return { count: row?.count ?? 0, liked: !!row?.mine };
}

// GET /api/likes?post=<slug>&visitor=<id> → {count, liked}
export const GET: APIRoute = async (ctx) => {
  const post = ctx.url.searchParams.get('post');
  const visitor = ctx.url.searchParams.get('visitor') ?? '';
  if (!(await isPost(post))) return json({ error: 'Unknown article.' }, 400);
  const { db } = await database(ctx);
  return json(await state(db, post!, VISITOR.test(visitor) ? visitor : ''));
};

// POST /api/likes {post, visitor, liked} → {count, liked}
export const POST: APIRoute = async (ctx) => {
  const body = await readJson(ctx.request);
  const visitor = text(body?.visitor);
  if (!body || !(await isPost(body.post)) || !VISITOR.test(visitor) || typeof body.liked !== 'boolean')
    return json({ error: 'Invalid request.' }, 400);
  const { db } = await database(ctx);
  await db
    .prepare(body.liked ? 'INSERT OR IGNORE INTO likes (post, visitor) VALUES (?, ?)' : 'DELETE FROM likes WHERE post = ? AND visitor = ?')
    .bind(body.post, visitor)
    .run();
  return json(await state(db, body.post as string, visitor));
};
