import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { FOCUS_HELP, FOCUS_PATTERN } from './lib/photos';

// A photo is either a file stored next to the Markdown file (e.g. ./my-article/hero.jpg) or a web link.
const photo = (image: () => z.ZodTypeAny) => z.union([z.string().url(), image()]);
const focus = z.string().regex(FOCUS_PATTERN, FOCUS_HELP).default('center');
// How far a photo is zoomed in inside its frame: 1 = not zoomed, up to 3. Set it with the crop editor.
const zoom = z.number().min(1).max(3).default(1);

// Settings every article must have. The same rules check the article template (_template.md).
const article = ({ image }: { image: () => z.ZodTypeAny }) => z.object({
    title: z.string(),
    pillar: z.enum(['Think', 'Move', 'Live']),
    standfirst: z.string(),
    date: z.coerce.date(),
    dateLabel: z.string(),
    readTime: z.string(),
    author: z.string(),
    disclosure: z.string(),
    avatar: photo(image),
    avatarFocus: focus,
    avatarZoom: zoom,
    heroImage: photo(image),
    heroAlt: z.string().default(''),
    heroFocus: focus,
    heroZoom: zoom,
    featured: z.boolean().default(false),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    sectionImages: z
      .record(
        z.object({
          src: photo(image),
          alt: z.string().default(''),
          focus,
          zoom,
          side: z.enum(['left', 'right']).default('right'),
          caption: z.string().optional(),
        }),
      )
      .default({}),
    // "Links from this article": websites, social accounts, shops, people, with a small round icon each.
    linksTitle: z.string().optional(),
    links: z
      .array(
        z.object({
          name: z.string(),
          url: z.string().url(),
          description: z.string(),
          type: z.string().optional(), // e.g. Website, Instagram, Podcast, Shop
          icon: photo(image).optional(), // round picture; without one, the first letter is shown
          affiliate: z.boolean().default(false), // paid/affiliate link: labelled and disclosed
        }),
      )
      .default([]),
  });

// Articles: every .md file in src/content/blog except ones starting with "_" (like the template).
const blog = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/_*.md'], base: './src/content/blog' }),
  schema: article,
});

// The article template is checked on every build too, so it always matches the rules above.
const blogTemplate = defineCollection({
  loader: glob({ pattern: '_template.md', base: './src/content/blog' }),
  schema: article,
});

const faqs = z.array(z.object({ q: z.string(), a: z.string() })).default([]);
const page = (file: string) => glob({ pattern: file, base: './src/content/pages' });

// One Markdown file per page in src/content/pages/.
const home = defineCollection({
  loader: page('home.md'),
  schema: z.object({ label: z.string(), headline: z.string(), faqs }),
});

const about = defineCollection({
  loader: page('about.md'),
  schema: ({ image }) => z.object({
    heading: z.string(),
    photo: photo(image),
    photoFocus: focus,
    photoZoom: zoom,
    photoAlt: z.string().default(''),
    placeholderNote: z.string().optional(),
    believeHeading: z.string(),
    pillars: z.object({ Think: z.string(), Move: z.string(), Live: z.string() }),
    peopleHeading: z.string(),
    people: z.array(z.object({ name: z.string(), role: z.string(), photo: photo(image), focus, zoom })),
    note: z.object({ title: z.string(), body: z.string() }),
    strip: z.array(z.object({ src: photo(image), alt: z.string().default(''), focus, zoom })).length(3),
  }),
});

const policy = defineCollection({
  loader: page('policy.md'),
  schema: z.object({ title: z.string(), intro: z.string(), placeholderNote: z.string().optional() }),
});

const signup = defineCollection({
  loader: page('signup.md'),
  schema: z.object({ title: z.string(), body: z.string(), consent: z.string() }),
});

const links = defineCollection({
  loader: page('links.md'),
  schema: z.object({ title: z.string(), affiliateNote: z.string() }),
});

export const collections = { blog, blogTemplate, home, about, policy, signup, links };
