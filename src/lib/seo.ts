// Discoverability: the hidden labels that tell search engines and AI tools what each page is
// (structured data, share previews, canonical links). Everything is built from the content, so a new
// article is picked up automatically on the next build.
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { SITE_NAME } from '../data/site';

export const SITE_DESCRIPTION = 'First-person accounts of things Ben has tried to think, move and live better.';
export const LOCALE = 'en_GB';

type Img = ImageMetadata | string;

// A share picture (1200px wide JPEG, the size Facebook, LinkedIn, WhatsApp and X expect), as a full web address.
export async function shareImage(src: Img | undefined, site: URL): Promise<string> {
  if (!src) return new URL('/og-default.png', site).href;
  if (typeof src === 'string') return src;
  const img = await getImage({ src, width: 1200, format: 'jpg', quality: 80 });
  return new URL(img.src, site).href;
}

export const organization = (site: URL, sameAs: string[] = []) => ({
  '@type': 'Organization',
  '@id': new URL('/#organization', site).href,
  name: SITE_NAME,
  url: site.href,
  logo: { '@type': 'ImageObject', url: new URL('/apple-touch-icon.png', site).href, width: 180, height: 180 },
  ...(sameAs.length ? { sameAs } : {}),
});

export const person = (name: string, site: URL) => ({
  '@type': 'Person',
  name,
  url: new URL('/about/', site).href,
});

export const website = (site: URL) => ({
  '@type': 'WebSite',
  '@id': new URL('/#website', site).href,
  name: SITE_NAME,
  url: site.href,
  description: SITE_DESCRIPTION,
  inLanguage: 'en-GB',
  publisher: { '@id': new URL('/#organization', site).href },
});

// Questions and answers, in the format search engines and AI assistants read.
export const faqPage = (faqs: { q: string; a: string }[]) =>
  faqs.length
    ? {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      }
    : undefined;

export function blogPosting(o: {
  url: string; title: string; description: string; image: string; date: Date; author: string;
  pillar: string; wordCount: number; site: URL;
}) {
  return {
    '@type': 'BlogPosting',
    '@id': `${o.url}#article`,
    mainEntityOfPage: o.url,
    headline: o.title,
    description: o.description,
    image: [o.image],
    datePublished: o.date.toISOString(),
    dateModified: o.date.toISOString(),
    author: person(o.author, o.site),
    publisher: { '@id': new URL('/#organization', o.site).href },
    articleSection: o.pillar,
    wordCount: o.wordCount,
    inLanguage: 'en-GB',
  };
}

export const breadcrumbs = (items: { name: string; url: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
});

// One <script type="application/ld+json"> with all of a page's labels. "<" is escaped so text can't end the tag.
export const jsonLd = (items: (object | undefined)[]) =>
  JSON.stringify({ '@context': 'https://schema.org', '@graph': items.filter(Boolean) }).replace(/</g, '\\u003c');
