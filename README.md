# Loving Life Longer

The blog site, built with [Astro](https://astro.build) from the `design_handoff_lll_blog` designs.

## Run it

```bash
npm install
npm run dev      # opens http://localhost:4321 and reloads as you edit
npm run build    # makes the finished site in dist/
npm test         # builds the site and runs the automated tests
```

The first time you run tests on a new computer, also run `npx playwright install chromium`.
Tests live in `tests/` and run automatically on GitHub for every code change (see the **Actions** tab).

## Where to edit things

| To change… | Edit this file |
| --- | --- |
| An article's text, title, photos or FAQ | `src/content/blog/<article>.md` |
| Home page introduction, signup text, pillar cards, sample comments | `src/data/site.ts` |
| About page | `src/pages/about.astro` |
| Policy page | `src/pages/policy.astro` |
| Header, menu, footer | `src/layouts/Base.astro` |
| Colours and fonts | top of `src/styles/global.css` |
| Logo | replace `public/logo.png` |

### Writing an article

Each article is one Markdown file in `src/content/blog/`. The file name becomes the web address
(`blindfolded-with-50-strangers.md` → `/blog/blindfolded-with-50-strangers/`).

- The settings at the top (between the `---` lines) hold the title, pillar (`Think`, `Move` or `Live`),
  standfirst, date, photos and FAQ.
- Each `## Heading {#some-id}` starts a new section and appears in the table of contents.
- Inside a section: `**words**` makes them **bold**, lines starting `- ` become a bullet list, and
  lines starting `1. ` a numbered list. Leave a blank line before and after a list.
- To put a photo beside a section, add its id under `sectionImages:` with `src`, `side` (`left`/`right`)
  and an optional `caption`.

To add a new article, copy the existing file, rename it and change the text. Set `featured: true` on the
one you want at the top of the home page. Once there are two or more articles, the home page lists them.

### Photos

All photos are placeholders from picsum.photos. Put real photos in `public/images/` and point to them
as `/images/your-photo.jpg`.

## Not built yet

These need a backend or a third-party service (see `docs/ARCHITECTURE.md`):

- **Comments and likes** only work in the visitor's own browser for now. Planned: Cloudflare D1 with moderation.
- **Email signup** shows a thank-you message but doesn't save the address yet. Planned: a newsletter service with double opt-in, and Turnstile spam protection on both forms.
- **Footer social icons** are grey placeholder circles.
- A CMS for publishing without editing files, and a cookie banner if analytics are added.
