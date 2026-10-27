import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { ensureSchema } from './db';

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

/** The database, with its tables ready. */
export async function database(ctx: APIContext) {
  const env = ctx.locals.runtime.env;
  await ensureSchema(env.DB);
  return { db: env.DB, env };
}

let slugs: Set<string> | undefined;
export async function isPost(slug: unknown): Promise<boolean> {
  slugs ??= new Set((await getCollection('blog')).map((p) => p.id));
  return typeof slug === 'string' && slugs.has(slug);
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
