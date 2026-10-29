import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { OWNER_NAME, SITE_NAME } from '../data/site';
import { SITE_DESCRIPTION } from '../lib/seo';

// Built into /llms.txt: a plain summary of the site for AI assistants (the llms.txt convention),
// listing every article with its summary and questions. Updated automatically on every build.
const plain = (s: string) => s.replace(/\{(think|move|live)\}/g, (_, w: string) => w).replace(/\*\*?|__?/g, '').replace(/\s+/g, ' ').trim();

export const GET: APIRoute = async ({ site }) => {
  const home = (await getEntry('home', 'home'))!.data;
  const posts = (await getCollection('blog')).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  const url = (path: string) => new URL(path, site).href;
  const lines = [
    `# ${SITE_NAME}`,
    '',
    `> ${plain(home.headline)} ${SITE_DESCRIPTION}`,
    '',
    `First-person accounts by ${OWNER_NAME} of things he has actually tried, under three pillars: Think, Move and Live.`,
    'Personal experience, not medical or professional advice.',
    '',
    '## Articles',
    '',
    ...posts.map((p) => `- [${p.data.title}](${url(`/blog/${p.id}/`)}) (${p.data.pillar}, ${p.data.date.toISOString().slice(0, 10)}): ${plain(p.data.standfirst)}`),
    '',
    ...posts.flatMap((p) =>
      p.data.faqs.length
        ? [`### Questions answered in "${p.data.title}"`, '', ...p.data.faqs.map((f) => `- **${plain(f.q)}** ${plain(f.a)}`), '']
        : [],
    ),
    '## About',
    '',
    `- [About ${SITE_NAME} and Ben](${url('/about/')})`,
    `- [Policies, including the health disclaimer](${url('/policy/')})`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
