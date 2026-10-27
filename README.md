# Loving Life Longer

The blog site, built with [Astro](https://astro.build) from the `design_handoff_lll_blog` designs.

## Run it

```bash
npm install
npm run dev      # opens http://localhost:4321 and reloads as you edit
npm run build    # makes the finished site in dist/
npm test         # builds the site and runs the automated tests (with a local, throwaway database)
```

The first time you run tests on a new computer, also run `npx playwright install chromium`.
Tests live in `tests/` and run automatically on GitHub for every code change (see the **Actions** tab).

## Where to edit things

| To change… | Edit this file |
| --- | --- |
| An article's text, title, photos, FAQ or links | `src/content/blog/<article>.md` (start from `_template.md`) |
| "Links from this article" heading and affiliate note | `src/content/pages/links.md` |
| Home page introduction and home Q&A | `src/content/pages/home.md` |
| About page | `src/content/pages/about.md` |
| Policy page | `src/content/pages/policy.md` |
| Email signup box text | `src/content/pages/signup.md` |
| Header, menu, footer | `src/layouts/Base.astro` |
| Comment approval on/off | `wrangler.toml` |
| Hide from search engines (until launch) | `HIDE_FROM_SEARCH` in `src/data/site.ts` |
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

To add a new article, **copy `src/content/blog/_template.md`**: it lists every setting with an explanation. Rename it (the name becomes the web address), make a folder with the same name for its photos, and fill it in. Files starting with `_` are never published. Set `featured: true` on the
one you want at the top of the home page. Once there are two or more articles, the home page lists them.

### Photos

Each article's photos live in a folder with **the same name as the article file**:

```
src/content/blog/my-new-article.md
src/content/blog/my-new-article/hero.jpg
src/content/blog/my-new-article/sunrise.jpg
```

On github.com: open `src/content/blog/my-new-article/` (or type the folder name when uploading),
click **Add file → Upload files**, and drag your photos in. To replace a photo, upload one with the
same name. Then point to them in the article's settings:

```yaml
heroImage: ./my-new-article/hero.jpg
heroAlt: "Ben dancing barefoot in the marquee at sunrise"   # describe the photo
heroFocus: top                                               # which part to keep in view
sectionImages:
  final-sharing:
    src: ./my-new-article/sunrise.jpg
    alt: "The closing circle at sunrise"
    focus: center
    side: right
    caption: "You're welcome… Feel free."   # optional
```

**Focus** says which part of the photo stays in view when a frame crops it: `center`, `top`,
`bottom`, `left`, `right`, two together (`top left`), or exact percentages across then down
(`"50% 30%"`). A typo stops the build, so the live site is never affected.

**Check the crops** at **/admin/photos/**: every photo in every frame shape it appears in (desktop
and phone), with a red dot on the focus point.

You don't need to resize photos: the site makes small, fast copies automatically. Phone photos are fine.

**Tips:** top photo: landscape, at least 2000px wide, subject in the middle band. Photos beside
text: portrait or square, at least 1200px. Keep important detail out of the bottom fifth if there's a
caption. Ask permission from anyone recognisable. About page photos work the same way, in
`src/content/pages/about/`.

### Links from an article

Under `links:` in an article's settings, add websites, social accounts, people or shops you mention.
Each shows as a card after the article with a small round icon (`icon:`, a photo in the article's
folder; without one, the first letter is shown), its `name`, a `type` label (Website, Instagram,
Shop…) and a one-line `description` of what the reader gets. **Mark paid or affiliate links with
`affiliate: true`**: they're labelled "Affiliate", explained underneath (UK advertising rules require
this), and tagged for search engines as sponsored. See `_template.md` for an example.

## Managing comments

**One-time setup: choose your admin password**
1. Make a long password (at least 12 characters; a password manager can generate one).
2. In Cloudflare go to **Workers & Pages → loving-life-longer-blog → Settings → Variables and Secrets**.
3. Click **Add**, choose type **Secret**, name it `ADMIN_PASSWORD`, paste the password, and save (for Production).
4. Go to **Deployments**, open the latest one's **⋯** menu and click **Retry deployment**, so the new
   secret takes effect. (Any later push does this too.)

**Day to day:** go to **/admin** on the site (for example
`https://loving-life-longer-blog.pages.dev/admin/`) and sign in with that password. You stay signed in
for 30 days on that device. You can reply as Ben, delete comments (they can be restored), and approve
comments if approval is switched on (`COMMENTS_NEED_APPROVAL` in `wrangler.toml`). To sign out every
device, change the password.

## Launch checklist

- Set `HIDE_FROM_SEARCH` to `false` in `src/data/site.ts`, so search engines and AI tools can list the site.

## Not built yet

These need a backend or a third-party service (see `docs/ARCHITECTURE.md`):

- **Email signup** shows a thank-you message but doesn't save the address yet. Planned: a newsletter service with double opt-in, and Turnstile spam protection on both forms.
- **Footer social icons** are grey placeholder circles.
- A CMS for publishing without editing files, and a cookie banner if analytics are added.
