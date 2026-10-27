import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    pillar: z.enum(['Think', 'Move', 'Live']),
    standfirst: z.string(),
    date: z.coerce.date(),
    dateLabel: z.string(),
    readTime: z.string(),
    author: z.string(),
    disclosure: z.string(),
    avatar: z.string(),
    heroImage: z.string(),
    heroAlt: z.string().default(''),
    featured: z.boolean().default(false),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    sectionImages: z
      .record(
        z.object({
          src: z.string(),
          alt: z.string().default(''),
          side: z.enum(['left', 'right']).default('right'),
          caption: z.string().optional(),
        }),
      )
      .default({}),
  }),
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
  schema: z.object({
    heading: z.string(),
    photo: z.string(),
    photoAlt: z.string().default(''),
    placeholderNote: z.string().optional(),
    believeHeading: z.string(),
    pillars: z.object({ Think: z.string(), Move: z.string(), Live: z.string() }),
    peopleHeading: z.string(),
    people: z.array(z.object({ name: z.string(), role: z.string(), photo: z.string() })),
    note: z.object({ title: z.string(), body: z.string() }),
    strip: z.array(z.string()).length(3),
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

export const collections = { blog, home, about, policy, signup };
