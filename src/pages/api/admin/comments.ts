import type { APIRoute } from 'astro';
import { isAdmin, sameOrigin } from '../../../lib/admin-auth';
import type { CommentRow } from '../../../lib/db';
import { database, json, readJson, text } from '../../../lib/server';

export const prerender = false;

const denied = () => json({ error: 'Please sign in.' }, 401);

// GET /api/admin/comments → every comment (all statuses), newest first, with emails
export const GET: APIRoute = async (ctx) => {
  if (!(await isAdmin(ctx.request, ctx.locals.runtime.env))) return denied();
  const { db } = await database(ctx);
  const { results } = await db.prepare('SELECT * FROM comments ORDER BY created_at DESC, id DESC').all<CommentRow>();
  return json({ comments: results });
};

// POST /api/admin/comments {id, action: 'reply' | 'delete' | 'restore' | 'approve', text?}
export const POST: APIRoute = async (ctx) => {
  if (!sameOrigin(ctx.request) || !(await isAdmin(ctx.request, ctx.locals.runtime.env))) return denied();
  const body = await readJson(ctx.request);
  const id = Number(body?.id);
  if (!body || !Number.isInteger(id)) return json({ error: 'Invalid request.' }, 400);

  const { db } = await database(ctx);
  const target = await db.prepare('SELECT * FROM comments WHERE id = ?').bind(id).first<CommentRow>();
  if (!target) return json({ error: 'Comment not found.' }, 404);

  switch (body.action) {
    case 'reply': {
      const message = text(body.text);
      if (!message || message.length > 5000) return json({ error: 'Please write a reply.' }, 400);
      const parent = target.parent_id ?? target.id; // replies are one level deep
      await db
        .prepare("INSERT INTO comments (post, parent_id, name, text, is_author, status) VALUES (?, ?, 'Ben', ?, 1, 'published')")
        .bind(target.post, parent, message)
        .run();
      break;
    }
    case 'delete':
      await db.prepare("UPDATE comments SET status = 'deleted' WHERE id = ?").bind(id).run();
      break;
    case 'restore':
    case 'approve':
      await db.prepare("UPDATE comments SET status = 'published' WHERE id = ?").bind(id).run();
      break;
    default:
      return json({ error: 'Unknown action.' }, 400);
  }
  return json({ ok: true });
};
