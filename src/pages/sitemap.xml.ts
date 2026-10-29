import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { PILLARS, pillarHref } from '../lib/pillars';

// Built into /sitemap.xml: every public page, so search engines find new articles straight away.
// Articles and pillar pages are added automatically from src/content/blog/; admin and editor pages are left out.
export const GET: APIRoute = async ({ site }) => {
  const posts = (await getCollection('blog')).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  const day = (d: Date) => d.toISOString().slice(0, 10);
  const newest = posts[0] ? day(posts[0].data.date) : undefined;
  const pages = [
    { path: '/', lastmod: newest },
    ...posts.map((p) => ({ path: `/blog/${p.id}/`, lastmod: day(p.data.date) })),
    // Pillar pages, once they have an article (empty ones are hidden from search).
    ...PILLARS.flatMap((pillar) => {
      const newestInPillar = posts.find((p) => p.data.pillar === pillar);
      return newestInPillar ? [{ path: pillarHref(pillar), lastmod: day(newestInPillar.data.date) }] : [];
    }),
    { path: '/about/' },
    { path: '/policy/' },
  ];
  const urls = pages
    .map((p) => `  <url><loc>${new URL(p.path, site).href}</loc>${p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ''}</url>`)
    .join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'content-type': 'application/xml; charset=utf-8' } },
  );
};
