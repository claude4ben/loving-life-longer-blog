import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { FOCUS_HELP, FOCUS_PATTERN } from './lib/photos';
import { CONTENT_ROOT } from './lib/content-root';

// A photo is either a file stored next to the Markdown file (e.g. ./my-article/hero.jpg) or a web link.
const photo = (image: () => z.ZodTypeAny) => z.union([z.string().url(), image()]);
// The Keystatic editor saves empty fields as "" or null; treat those as "not set".
const blank = (v: unknown) => (v === '' || v === null ? undefined : v);
const optionalText = z.preprocess(blank, z.string().optional());
const focus = z.preprocess(blank, z.string().regex(FOCUS_PATTERN, FOCUS_HELP).default('center'));
// How far a photo is zoomed in inside its frame: 1 = not zoomed, up to 3. Set it with the crop editor.
const zoom = z.preprocess(blank, z.number().min(1).max(3).default(1));

// Settings every article must have. These must match the article form in keystatic.config.ts.
const article = ({ image }: { image: () => z.ZodTypeAny }) => z.object({
    title: z.string(),
    pillar: z.enum(['Think', 'Move', 'Live']),
    standfirst: z.string(),
    date: z.coerce.date(), // the date label ("Jul 2026") and read time are worked out from the date and text
    author: z.string(),
    disclosure: z.string(),
    avatar: photo(image),
    avatarFocus: focus,
    avatarZoom: zoom,
    heroImage: photo(image),
    heroAlt: z.preprocess(blank, z.string().default('')),
    heroCaption: optionalText, // short text over the bottom left of the top photo
    heroFocus: focus,
    heroZoom: zoom,
    featured: z.boolean().default(false),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    // "Links from this article": websites, social accounts, shops, people, with a small round icon each.
    linksTitle: optionalText,
    links: z
      .array(
        z.object({
          name: z.string(),
          url: z.string().url(),
          description: z.string(),
          type: optionalText, // e.g. Website, Instagram, Podcast, Shop
          icon: z.preprocess(blank, photo(image).optional()), // round picture; without one, the first letter is shown
          affiliate: z.boolean().default(false), // paid/affiliate link: labelled and disclosed
        }),
      )
      .default([]),
  });

// Articles: every .md file in src/content/blog. Photos inside the text ({% photo %} blocks) are
// checked when the article page is built.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: `./${CONTENT_ROOT}/blog` }),
  schema: article,
});

const faqs = z.array(z.object({ q: z.string(), a: z.string() })).default([]);
const page = (file: string) => glob({ pattern: file, base: `./${CONTENT_ROOT}/pages` });

// One file per page in src/content/pages/ (edited in Keystatic under "Pages").
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
    photoAlt: z.preprocess(blank, z.string().default('')),
    placeholderNote: optionalText,
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
  schema: z.object({ title: z.string(), intro: z.string(), placeholderNote: optionalText }),
});

const signup = defineCollection({
  loader: page('signup.yaml'),
  schema: z.object({ title: z.string(), body: z.string(), consent: z.string() }),
});

const links = defineCollection({
  loader: page('links.yaml'),
  schema: z.object({ title: z.string(), affiliateNote: z.string() }),
});

export const collections = { blog, home, about, policy, signup, links };
