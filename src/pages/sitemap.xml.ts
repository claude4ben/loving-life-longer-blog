import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Built into /sitemap.xml: every public page, so search engines find new articles straight away.
// Articles are added automatically from src/content/blog/; admin and editor pages are left out.
export const GET: APIRoute = async ({ site }) => {
  const posts = (await getCollection('blog')).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  const day = (d: Date) => d.toISOString().slice(0, 10);
  const newest = posts[0] ? day(posts[0].data.date) : undefined;
  const pages = [
    { path: '/', lastmod: newest },
    ...posts.map((p) => ({ path: `/blog/${p.id}/`, lastmod: day(p.data.date) })),
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
