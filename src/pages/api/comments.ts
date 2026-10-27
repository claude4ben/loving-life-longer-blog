import type { APIRoute } from 'astro';
import { thread, type CommentRow } from '../../lib/db';
import { database, isPost, json, readJson, text } from '../../lib/server';

export const prerender = false;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET /api/comments?post=<slug> → published comments with their replies
export const GET: APIRoute = async (ctx) => {
  const post = ctx.url.searchParams.get('post');
  if (!(await isPost(post))) return json({ error: 'Unknown article.' }, 400);
  const { db } = await database(ctx);
  const { results } = await db
    .prepare("SELECT * FROM comments WHERE post = ? AND status = 'published' ORDER BY created_at")
    .bind(post)
    .all<CommentRow>();
  return json({ comments: thread(results) });
};

// POST /api/comments {post, name, email?, text, website?} → saves a new comment
export const POST: APIRoute = async (ctx) => {
  const body = await readJson(ctx.request);
  if (!body) return json({ error: 'Invalid request.' }, 400);
  const name = text(body.name), email = text(body.email), message = text(body.text);

  if (!(await isPost(body.post))) return json({ error: 'Unknown article.' }, 400);
  if (!name || name.length > 80) return json({ error: 'Please add your name (up to 80 characters).' }, 400);
  if (!message || message.length > 5000) return json({ error: 'Please add a comment (up to 5,000 characters).' }, 400);
  if (email && (email.length > 254 || !EMAIL.test(email))) return json({ error: 'That email address doesn’t look right.' }, 400);

  // "website" is a hidden field people never see; bots fill it in. Pretend it worked, save nothing.
  if (text(body.website)) return json({ status: 'published', comment: null }, 201);

  const { db, env } = await database(ctx);
  const status = env.COMMENTS_NEED_APPROVAL === 'true' ? 'pending' : 'published';
  const row = await db
    .prepare('INSERT INTO comments (post, name, email, text, status) VALUES (?, ?, ?, ?, ?) RETURNING *')
    .bind(body.post, name, email || null, message, status)
    .first<CommentRow>();
  return json({ status, comment: row && thread([row])[0] }, 201);
};
