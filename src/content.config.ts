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
    likes: z.number().default(24),
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

export const collections = { blog };
