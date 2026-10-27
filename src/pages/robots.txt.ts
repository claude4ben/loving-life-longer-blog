import type { APIRoute } from 'astro';
import { HIDE_FROM_SEARCH } from '../data/site';

// Built into /robots.txt. Before launch it asks every crawler (search engines and AI) to stay away.
export const GET: APIRoute = () =>
  new Response(
    HIDE_FROM_SEARCH
      ? '# Not launched yet: please do not crawl.\nUser-agent: *\nDisallow: /\n'
      : 'User-agent: *\nDisallow: /admin\nDisallow: /api/\nDisallow: /keystatic\n',
    { headers: { 'content-type': 'text/plain; charset=utf-8' } },
  );
