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
| Home page introduction and home Q&A | `src/content/pages/home.md` |
| About page | `src/content/pages/about.md` |
| Policy page | `src/content/pages/policy.md` |
| Email signup box text | `src/content/pages/signup.md` |
| Header, menu, footer | `src/layouts/Base.astro` |
| Colours and fonts | top of `src/styles/global.css` |
| Logo | replace `public/logo.png` |

Every Markdown (`.md`) file has two parts: **settings** at the top between the two `---` lines (short
text fields like titles, photos and Q&A), and the **main text** below. You can edit them directly on
github.com: open the file, click the pencil icon, change the words, and click **Commit changes**. The
site updates about 2 minutes later.

### Formatting marks

| You type | You get | Where it works |
| --- | --- | --- |
| `**words**` | **bold** | everywhere |
| `*words*` | *italic* | everywhere |
| `[link text](https://example.com)` | a link | everywhere |
| a line starting with `- ` | • bullet point | main text |
| a line starting with `1. ` | 1. numbered point | main text |
| a blank line | new paragraph | main text |
| `## Heading {#some-id}` | a new section (articles and Policy) | main text |
| `{think}`, `{move}`, `{live}` | the word in its pillar colour | home headline |

Leave a blank line before and after a list. If a settings value contains a `:` or starts with a
special character, keep it inside quotes, like the existing ones.

### Writing an article

Each article is one Markdown file in `src/content/blog/`. The file name becomes the web address
(`blindfolded-with-50-strangers.md` → `/blog/blindfolded-with-50-strangers/`).

- The settings at the top (between the `---` lines) hold the title, pillar (`Think`, `Move` or `Live`),
  standfirst, date, photos and FAQ.
- Each `## Heading {#some-id}` starts a new section and appears in the table of contents.
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
