import type { APIRoute } from 'astro';
import { HIDE_FROM_SEARCH } from '../data/site';

// Built into /robots.txt. Before launch it asks every crawler (search engines and AI) to stay away.
// After launch it also points crawlers at the sitemap, which lists every article.
export const GET: APIRoute = ({ site }) =>
  new Response(
    HIDE_FROM_SEARCH
      ? '# Not launched yet: please do not crawl.\nUser-agent: *\nDisallow: /\n'
      : `User-agent: *\nDisallow: /admin\nDisallow: /api/\nDisallow: /keystatic\n\nSitemap: ${new URL('/sitemap.xml', site).href}\n`,
    { headers: { 'content-type': 'text/plain; charset=utf-8' } },
  );
