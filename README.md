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

## Writing and editing: Keystatic

Go to **/keystatic** on the site (for example `https://loving-life-longer-blog.pages.dev/keystatic`) and
sign in with GitHub (as claude4ben). Everything you save there is saved to this repository on GitHub, and
the site updates about 2 minutes later.

- **Articles → Create**: title, pillar, standfirst, date, photos, common questions and links in the panel
  on the right; the article itself in the editor on the left.
- **Pages**: the Home page introduction and questions, About page, Policy page, email signup box, and
  the heading and affiliate note for article links.

### Writing an article

- Use the toolbar for **bold**, *italic*, links and bullet or numbered lists. You can paste from
  Google Docs or Word and keep the formatting.
- Each **Heading 2** starts a new section and appears in the table of contents.
- To put a photo beside a section, click **+** (Insert) → **Photo beside this section**, straight after
  the section's heading. Choose the photo, write a short description, pick left or right, and add a
  caption. On desktop the text wraps around it; on phones it shows under the heading, before the text.
- **Captions:** every photo (the top photo and section photos) has a **Caption** box. A few words there
  appear over the bottom left of the photo in white on a soft dark fade, so they're readable on any photo.
  Leave it empty for no caption.
- The date label ("Jul 2026") and read time ("15 min read") are worked out automatically.
- **Feature on the home page** puts the article at the top of the home page (the newest featured one).
- **Links from this article**: add websites, social accounts, people or shops, each with an optional
  round icon. Tick **Affiliate or paid link** for affiliate links: they're labelled, explained
  underneath (UK advertising rules require this), and marked for search engines as sponsored.
- If something is wrong (for example a required photo is missing), Keystatic tells you before saving,
  and the live site always keeps the previous version until a new one builds successfully.

### Photos

Upload photos straight from your phone or computer in Keystatic; you don't need to resize them. The site
makes small, fast copies automatically. Keystatic stores each article's photos in a folder named after
the article (`src/content/blog/<article>/`).

**Adjust the crops** at **/admin/photos/** (admin password). Every photo is shown whole next to each
frame it appears in (desktop and phone). **Drag inside a frame** (or move the red dot on the whole
photo) to choose what stays in view, and use the **Zoom** slider to zoom in. Press **Save**: the change
is saved to GitHub and the site updates in about 2 minutes.

**Tips:** top photo: landscape, at least 2000px wide, subject in the middle band. Photos beside text:
portrait or square, at least 1200px. Keep important detail out of the bottom fifth if there's a
caption. Ask permission from anyone recognisable.

### Where things live (for reference)

| What | File |
| --- | --- |
| Articles | `src/content/blog/<article>.md` and its photo folder |
| Pillar pages (`/think/`, `/move/`, `/live/`) | Built automatically; the description at the top is the matching card in About → **Pillar cards** |
| Home, About, Policy pages | `src/content/pages/home.md`, `about.md`, `policy.md` (About photos in `about/`) |
| Email signup box, links heading and affiliate note | `src/content/pages/signup.yaml`, `links.yaml` |
| Ben's writing style (used when drafting text) | `docs/WRITING-STYLE.md` |
| Site web address (for search, share previews, sitemap) | `site` in `astro.config.mjs` |
| Security headers (what browsers may load) | `src/lib/security-headers.mjs` |
| Search, share and AI labels | `src/lib/seo.ts`, `src/pages/sitemap.xml.ts`, `src/pages/llms.txt.ts` |
| Footer social media links | Keystatic → Pages → Social media links (`src/content/pages/social.yaml`) |
| Which fields the editor shows | `keystatic.config.ts` (must match `src/content.config.ts`) |
| Header, menu, footer | `src/layouts/Base.astro` |
| Colours and fonts | top of `src/styles/global.css` |
| Logo | `public/logo.svg` (header); `public/favicon.svg` (browser tab, on a white tile) and `public/apple-touch-icon.png` (phone home screen) |
| Comment approval on/off | `wrangler.toml` |
| Hide from search engines (until launch) | `HIDE_FROM_SEARCH` in `src/data/site.ts` |

Articles are Markdown files with [Markdoc](https://markdoc.dev) blocks for photos
(`{% photo src="./my-article/x.jpg" alt="…" side="right" /%}`), so they can still be edited by hand on
github.com if needed.

### Automated tests use a sample copy of the content

The tests build the site from a frozen sample of the content in `tests/fixtures/content/`, so your edits
never break them. GitHub separately checks that your real content builds. If the content format changes
(new fields), update the sample copy too.

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

**One-time setup: let the photo editor save (GitHub key)**
1. On github.com (signed in as claude4ben): profile picture → **Settings → Developer settings →
   Personal access tokens → Fine-grained tokens → Generate new token**.
2. Name: `LLL photo editor`. Expiration: up to 1 year (put a reminder in your calendar to renew it).
3. **Repository access → Only select repositories →** `loving-life-longer-blog`.
4. **Permissions → Repository permissions → Contents → Read and write.** Leave everything else as is.
5. Click **Generate token** and copy it (it's only shown once).
6. In Cloudflare: **Workers & Pages → loving-life-longer-blog → Settings → Variables and Secrets → Add**,
   type **Secret**, name `GITHUB_TOKEN`, paste the token, save. Then **Deployments → ⋯ → Retry deployment**.

The key can only change files in this one repository. If it expires or is removed, Save says so and
nothing else on the site is affected.

**One-time setup: only publish changes that pass the tests**

GitHub tests every change (including Keystatic saves) and then tells Cloudflare to publish. Do these in this
order, so the site never stops updating:
1. In Cloudflare: **Workers & Pages → loving-life-longer-blog → Settings → Builds → Deploy hooks → Add deploy
   hook**. Name: `GitHub after tests`. Branch: `main`. Save, and copy the web address it shows.
2. On GitHub: repository **Settings → Secrets and variables → Actions → New repository secret**. Name:
   `CLOUDFLARE_DEPLOY_HOOK`. Paste the web address. Save.
3. Back in Cloudflare: **Settings → Builds → Branch control** → untick **Enable automatic production branch
   deployments** (leave preview deployments on). Save.

From then on a Keystatic save appears about 3–4 minutes after it's saved (code changes about 6), and only if every check passed. If you save several times in a row, only the latest is checked and published. To see
why something didn't go live, open the repository's **Actions** tab.

**One-time setup: let Keystatic sign you in with GitHub**

Keystatic uses a small GitHub App so that only people with access to this repository can edit.
1. On github.com (as claude4ben): profile picture → **Settings → Developer settings → GitHub Apps →
   New GitHub App**.
2. **GitHub App name:** `Loving Life Longer editor` (it must be unique on GitHub; add something if it's
   taken). **Homepage URL:** `https://loving-life-longer-blog.pages.dev`.
3. **Redirect URI** (GitHub used to call it "Callback URL"; add both):
   `https://loving-life-longer-blog.pages.dev/api/keystatic/github/oauth/callback` and
   `https://keystatic-trial.loving-life-longer-blog.pages.dev/api/keystatic/github/oauth/callback`.
   Tick **Request user authorization (OAuth) during installation**.
4. **Webhook:** untick **Active**.
5. **Permissions → Repository permissions:** Contents **Read and write**, Metadata **Read-only**,
   Pull requests **Read-only**.
6. **Where can this GitHub App be installed?** Only on this account. Click **Create GitHub App**.
7. On the app's page: copy the **Client ID**; click **Generate a new client secret** and copy it.
   Note the app's short name in the address bar (`github.com/apps/<this-part>`).
8. Click **Install App** (left menu) → install on **Only select repositories** → `loving-life-longer-blog`.
9. In Cloudflare: **Workers & Pages → loving-life-longer-blog → Settings → Variables and Secrets**. Add
   three **Secrets**, for both **Production** and **Preview**: `KEYSTATIC_GITHUB_CLIENT_ID` (the Client
   ID), `KEYSTATIC_GITHUB_CLIENT_SECRET` (the client secret), and `KEYSTATIC_SECRET` (a long random
   password of 40+ characters from your password manager; it's never typed anywhere else. It **must be at least
   32 characters**, or sign-in fails with an error page).
   Also add one plain **Text** variable: `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` = the app's short name from
   step 7 (lets Keystatic show an "install the app" link if access is ever missing).
10. Redeploy (**Deployments → ⋯ → Retry deployment**), then open `/keystatic` and sign in with GitHub.

## Launch checklist

- Move to the own web address (see `docs/ARCHITECTURE.md`, decision 23): add `www.lovinglifelonger.com` as a
  custom domain in Cloudflare Pages, redirect `lovinglifelonger.com` and `.co.uk` to it, change `site` in
  `astro.config.mjs`, and add the new callback address to the Keystatic GitHub App.
- Set `HIDE_FROM_SEARCH` to `false` in `src/data/site.ts`, so search engines and AI tools can list the site.
- Submit `https://www.lovinglifelonger.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
- Check an article's share preview (e.g. paste its link into WhatsApp) and its search labels with Google's
  Rich Results Test.

## Not built yet

These need a backend or a third-party service (see `docs/ARCHITECTURE.md`):

- **Email signup** shows a thank-you message but doesn't save the address yet. Planned: a newsletter service with double opt-in, and Turnstile spam protection on both forms.
- A CMS for publishing without editing files, and a cookie banner if analytics are added.
