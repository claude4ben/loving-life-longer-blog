# Architecture

How the Loving Life Longer site is built, and why. Each decision has a short "why" and simple pros and cons.

**Keep this file up to date.** When an architecture decision changes, edit its entry (or add a new one)
and add a line to the [Change log](#change-log) at the bottom.

Status key: ✅ decided and built · 🔨 decided, not built yet · 🕒 temporary (to be replaced) · ❓ not decided yet

---

## Overview

```
src/content/blog/*.md  ──┐                                                    ┌─ static pages (HTML, CSS, a little JS)
src/data/site.ts       ──┼──▶  Astro build  ──▶  Cloudflare Pages  ──────────┤
src/pages, layouts     ──┘    (on every push)                                 └─ Pages Functions (form endpoints)
                                                                                     ├─ Cloudflare D1 (comments, likes)
                                                                                     ├─ Turnstile (spam check)
                                                                                     └─ newsletter service (signups)
```

The site is a **static website**: all pages are built once into plain files. Only the form endpoints
(comments, likes, signup) will run as small server functions. Today the functions, database, Turnstile
and newsletter service are decided but not built yet (🔨), so the live site is fully static.

*Update 2026-10-27:* Pages Functions and the D1 database are now built (decisions 8, 16, 19); they are
live: database `lll-blog` was created and its id added to `wrangler.toml`.

| Page | Address | File |
| --- | --- | --- |
| Home | `/` | `src/pages/index.astro` |
| Article | `/blog/<slug>/` | `src/pages/blog/[slug].astro` |
| About | `/about/` | `src/pages/about.astro` |
| Policy | `/policy/` | `src/pages/policy.astro` |

---

## Decisions

### 1. Framework: Astro ✅

**Why:** the design handoff suggested Next.js or Astro. A blog is mostly text that rarely changes,
which is what Astro is built for.

| Pros | Cons |
| --- | --- |
| Pages are plain HTML, so they're fast and cheap to host | Fewer ready-made plugins than Next.js |
| Ships almost no JavaScript by default | A busy app with logins and dashboards would suit Next.js better |
| Built-in support for Markdown content | |

*Alternatives considered:* Next.js (heavier, more than a blog needs); plain HTML files (no reusable
header/footer, every page edited by hand); WordPress (needs a server and updates, and you'd have to
rebuild the design as a theme).

### 2. Content: Markdown files in the repo ✅

**Why:** articles live in `src/content/blog/` as Markdown files. A schema in `src/content.config.ts`
checks that each article has a title, pillar, photos and so on.

| Pros | Cons |
| --- | --- |
| Free, with no extra service to run | Editing means touching files (on GitHub or via Claude), not a friendly editor |
| Every change is saved in git history and can be undone | No preview-before-publish screen for non-technical editors |
| A missing or misspelt field stops the build instead of breaking the page | |

*Later:* the handoff asks for a no-code CMS. A Git-based CMS (such as Decap or TinaCMS) could sit on
top of these same Markdown files, so moving to one won't require rewriting the site.

*Editing:* since 2026-10-27 the files are edited through Keystatic (decision 21), which saves to the
same files; the old `_template.md` was removed because Keystatic's "Create" form does its job.

*Links per article:* a `links` list in the settings (name, url, description, optional type, icon and
`affiliate`) renders as cards after the article (`src/components/ArticleLinks.astro`). Affiliate links
are labelled, explained (text in `src/content/pages/links.md`) and marked `rel="sponsored"`, as
search engines require for paid links.

### 3. Article sections: "## Heading" in Markdoc text, photos as blocks ✅

**Why:** the article text is Markdoc (standard Markdown plus `{% … %}` blocks), which is what the Keystatic
editor saves. `src/lib/sections.ts` starts a new section at each `## ` heading and makes its id from the
heading text (e.g. "Mealtime fun" → `mealtime-fun`). A `{% photo src=… alt=… side=… caption=… focus=…
zoom=… /%}` block in a section becomes that section's photo. Photos in the text are found by
`src/lib/images.ts` and resized like any other.

| Pros | Cons |
| --- | --- |
| Photos sit where they belong in the text, which is natural in an editor | Renaming a heading changes its section id (and any link to it) |
| Table of contents builds itself from the headings | Only one heading level (`##`) creates sections |
| Raw HTML typed into the text is shown as text, never run | |

*Earlier:* section ids were written by hand (`{#id}`) and section photos were listed in the settings;
changed for Keystatic.

### 4. Page text in files, edited in Keystatic ✅

**Why:** Ben edits all the words himself. Home, About and Policy are Markdown files with settings
(`src/content/pages/`); the email signup box and the article-links heading are small YAML files
(`signup.yaml`, `links.yaml`, and `social.yaml` for the footer social links). All appear under **Pages** in Keystatic. Each is checked against a
schema, so a missing field stops the build. Only design settings (pillar colours, the
hide-from-search switch) stay in `src/data/site.ts`.

| Pros | Cons |
| --- | --- |
| All words editable in a friendly editor, with history and undo in git | Short interface labels (buttons, menu) are still in code |
| Same formatting everywhere (bold, italic, links, lists) | |

### 5. Styling: plain CSS with design tokens ✅

**Why:** colours, fonts and widths from the handoff's tokens are CSS variables at the top of
`src/styles/global.css`. Each page keeps its own styles in a `<style>` block that only affects that page.

| Pros | Cons |
| --- | --- |
| Change a colour once and it updates everywhere | More CSS to write by hand than a utility framework like Tailwind |
| No build tools or libraries to learn | |
| Easy to match the design pixel for pixel | |

*Shared page width:* one class, `.wide` in `src/styles/global.css`, sets the content width for every
page on desktop (up to 1128px, matching the article text and leaving room for the Like/Share panel), so
left edges line up everywhere. Pages use the extra space with side-by-side layouts (About, Policy,
comments, signup) rather than very long lines.

### 6. Mobile vs desktop via CSS (breakpoint 960px) ✅

**Why:** the prototype switched layouts with JavaScript. Here CSS media queries do it, and
edge-to-edge mobile photos use a CSS "breakout" (`.breakout`) instead of measuring in JavaScript.

| Pros | Cons |
| --- | --- |
| Correct layout before any JavaScript loads, with no flicker | Desktop-only and mobile-only items (share bar, side rail) are both in the HTML and one is hidden |
| Works if JavaScript fails | |

### 7. Interactivity: small vanilla TypeScript script ✅

**Why:** the article page's like button, share sheet, table of contents, comments, progress bar and
photo zoom are in `src/scripts/article.ts`, with no React or other UI library.

| Pros | Cons |
| --- | --- |
| Tiny download and fast | Harder to grow into complex features than a component library |
| Nothing extra to update or keep secure | Comment HTML is built from strings (user text is escaped) |

### 8. Comments and likes: Cloudflare D1 ✅

**Why:** comments and likes have to be shared by every visitor, so they need a database. D1 is
Cloudflare's built-in SQL database, so it sits in the same account as the hosting (decision 14).
This replaces the temporary in-browser storage (`localStorage`) used in the first build.

| Pros | Cons |
| --- | --- |
| Free and built into Cloudflare, no extra account | We write the SQL tables and the moderation ourselves |
| Same place as hosting and server code | Free plan has daily read/write limits (far above what a personal blog needs) |

*Reply notifications:* commenters can choose "Email me when someone replies". This needs an
**email-sending service** ❓ to choose. Options: Cloudflare's own email sending (if available on the
account; keeps everything in one place), or a dedicated service such as Resend or Postmark (generous
free tiers). Each email must include an unsubscribe link, and we only send to people who ticked the box.

*Still to build:* tables for comments and likes, one like per visitor, a moderation queue, and an admin
view to approve, delete and reply to comments.

*How it's built:*
- **Tables** live in `src/lib/db.ts` as numbered migrations. The site applies any new ones automatically
  the first time it talks to the database, so nobody has to run database commands. To change the
  tables, add a new migration; never edit an old one.
- **Server routes:** `/api/comments` (load, post), `/api/likes` (load, like/unlike) and
  `/api/admin/comments` (admin only).
- **Moderation:** comments appear straight away and Ben deletes bad ones (*post-moderation*), because
  that keeps conversation flowing. Switch to approve-first with `COMMENTS_NEED_APPROVAL = "true"` in
  `wrangler.toml`. Deleted comments are hidden, not erased, so they can be restored.
- **Likes:** one per visitor, using a random id stored in the visitor's browser (not linked to who they are).
- **Basic spam guard:** a hidden form field that bots fill in; Turnstile (17) comes next.
- **No invented data:** the sample comments and the starting like count of 24 were removed.

| Pros of these choices | Cons |
| --- | --- |
| Zero manual database steps, now and for future changes | A table change ships with code, so it must be tested first (the tests use a fresh local database) |
| Comments flow without waiting for approval | A bad comment is visible until Ben deletes it (approval mode fixes this) |
| Deleted comments can be restored | Deleted comments stay in the database (fine for now; the privacy policy should say so) |

### 9. Email signup: a newsletter service 🔨

**Why:** a newsletter service handles the parts that are easy to get wrong: double opt-in, unsubscribe
links, GDPR consent records and actually sending the emails. Which service (Buttondown, MailerLite or
Kit) is ❓ still to choose. This replaces the temporary front-end-only form.

| Pros | Cons |
| --- | --- |
| Handles double opt-in, unsubscribe and GDPR consent | Another account to manage |
| Sends the emails for us | Paid once the list grows |

*Fallback:* if we only want to collect addresses for now, store them in D1 (with the consent tick and
date), then import them into a newsletter service later.

*Until then* 🕒: the form shows a thank-you message but **doesn't save the address**.

### 10. "Blog" nav link goes to the newest article ✅

**Why:** the design has only one article, so "Blog" opens it directly. The home page shows a note now
and switches to an article list once there are two or more articles.

| Pros | Cons |
| --- | --- |
| Matches the design | Will need a real `/blog/` index page as articles grow |

### 11. Photos: stored with the content, resized automatically, with a focus point ✅

**Why:** each article's photos live in a folder named after the article (`src/content/blog/<article>/`;
About page photos in `src/content/pages/about/`), referenced from the Markdown settings. When the site is
built, Astro's image tools (using `sharp`) make several sizes of each photo in the WebP format, and
each browser downloads the size it needs (`src/components/Photo.astro`). A **focus** setting per photo
(`center`, `top`, `top left`, `"50% 30%"`…) controls which part stays in view when a frame crops it
(`src/lib/photos.ts`), and a **zoom** (1–3) zooms in around it. An admin-only page, `/admin/photos/`, shows every photo in every frame shape. It's built on request (not pre-built) so it can check the admin sign-in first; signed-out visitors are sent to the `/admin` sign-in and back.
Web links (`https://…`) still work for photos stored elsewhere, but aren't resized.

| Pros | Cons |
| --- | --- |
| Ben uploads phone photos as they are; pages stay fast (good for readers and search ranking) | Photos add to the repository size (fine for a blog; GitHub warns above 50MB per file) |
| Focus keeps faces and key moments in view in every frame shape | Builds take a few seconds longer as photos are resized |
| Crop preview catches bad crops before readers see them | |
| A wrong file name or focus word stops the build, so the live site is never broken | |

The placeholder photos were downloaded into these folders with descriptive names (`hero.jpg`,
`cacao-circle.jpg`…), so replacing them is just uploading a file with the same name. The top photo
was made taller on desktop (up to 480px, from 300px) so it has more impact.

### 12. Fonts: Google Fonts ✅

**Why:** Source Serif 4, Inter and Rubik, as specified in the handoff. The wordmark next to the logo uses
**Fraunces** (soft, warm serif), loaded with `text=` so only the letters of "Loving Life Longer" are downloaded (a
few KB).

| Pros | Cons |
| --- | --- |
| One line to load them | Visitors' browsers contact Google (worth mentioning in the privacy policy) |
| | Could be self-hosted later for speed and privacy |

### 13. Sharing: plain share links ✅

**Why:** Each service (WhatsApp, Facebook, X, LinkedIn, Email, Threads, Bluesky, Reddit, Pinterest,
Telegram, Snapchat, and on phones Messenger and Messages) is opened with its standard "share this link"
address. Instagram has no web share link, so it copies the article link. Phones also get "More", the
phone's own share menu (Web Share API). Icons are genuine brand logos from the free Simple Icons package
(LinkedIn from Bootstrap Icons, MIT), drawn at build time; the list is in `src/lib/share.ts`.

| Pros | Cons |
| --- | --- |
| No tracking scripts or widgets from social networks | Instagram can't be shared to directly from a website |
| Genuine, recognisable logos and colours | Services occasionally change their share addresses (tests check each one) |
| Adding or removing a service is one line in `src/lib/share.ts` | Messenger and Messages only work on phones with the app |

### 14. Hosting: Cloudflare Pages ✅

**Why:** Cloudflare Pages (project `loving-life-longer-blog`, https://loving-life-longer-blog.pages.dev) is
connected to `claude4ben/loving-life-longer-blog` and rebuilds the site on
every push to `main`. Hosting, database (D1), server code (Pages Functions) and spam protection
(Turnstile) are all in one Cloudflare account.

| Pros | Cons |
| --- | --- |
| Free, with unlimited bandwidth for the static site | A few more setup screens than some other hosts |
| Commercial use allowed on the free plan | Free plan limits builds per month and function requests per day (fine for this site) |
| Everything in one account | |
| Every branch/pull request gets its own preview link | |

*Hidden from search until launch:* every page carries a "noindex" tag and `/robots.txt` asks all
crawlers (search engines and AI) to stay away, controlled by one switch: `HIDE_FROM_SEARCH` in
`src/data/site.ts`. At launch, set it to `false`. The site is still viewable by anyone with the link.
(We first planned to lock the whole site with Cloudflare Access, but its Zero Trust plan asks for a
payment method even when free, so we chose this instead.)

| Pros | Cons |
| --- | --- |
| Free, no extra accounts or payment details | Anyone who has the link can still view the site |
| Keeps half-finished pages out of Google and AI answers, protecting discoverability at launch | Relies on crawlers obeying the rules (all major ones do) |
| One switch to flip at launch | |

*Alternatives considered:*
- **Vercel:** no built-in database, so we'd need a separate service such as Supabase or Neon. Its free
  plan is for non-commercial use only, and bandwidth is capped.
- **Netlify:** free form capture is handy, but there's no proper database and bandwidth is capped.

### 15. Code storage: private GitHub repository ✅

**Why:** `claude4ben/loving-life-longer-blog`, `main` branch. It gives full history, editing on
github.com, and automatic deploys to Cloudflare Pages.

| Pros | Cons |
| --- | --- |
| Every change is tracked and reversible | Requires a GitHub account to edit |
| Cloudflare Pages deploys straight from it | |

### 16. Server code: Pages Functions via `@astrojs/cloudflare` ✅

**Why:** the comment, like and signup forms need a little code running on a server to talk to D1,
Turnstile and the newsletter service. The `@astrojs/cloudflare` add-on runs those endpoints as Pages
Functions. Every page stays static (pre-built); only the form endpoints run as functions.

| Pros | Cons |
| --- | --- |
| Pages stay fast and cheap, as now | Adds an adapter and a little server code to maintain |
| Server code lives in the same repo and deploys with it | Functions count towards Cloudflare's daily free request limit |
| Secrets (API keys) stay on the server, never in the browser | Local testing needs Cloudflare's dev tools (Wrangler) |

### 17. Spam protection: Cloudflare Turnstile 🔨

**Why:** public comment and signup forms attract bots. Turnstile checks each submission, and the
server function verifies the result before saving anything.

| Pros | Cons |
| --- | --- |
| Free | Adds a small script to the pages with forms |
| Mostly invisible to readers (no picture puzzles) | |
| Same Cloudflare account | |

### 18. Automated testing: Playwright + axe, run by GitHub Actions ✅

*Update 2026-10-27:* tests build the site from a frozen **sample copy of the content**
(`tests/fixtures/content/`, chosen with `LLL_CONTENT`), so Ben's edits in Keystatic never break them.
GitHub separately checks that the real content builds. Test builds use their own cache folder so they
can never leak into a normal build.


**Why:** the site should be checked automatically whenever the code changes. Playwright opens the real
site in a browser at desktop (1280px) and phone (390px) sizes and clicks through it like a reader would.
axe scans each page for accessibility problems. GitHub Actions (`.github/workflows/test.yml`) runs
everything on every push to `main` and every pull request, skipping changes that only touch docs.

| Pros | Cons |
| --- | --- |
| Catches broken features before readers notice | Tests need updating when behaviour changes on purpose |
| Tests the built site, exactly as visitors get it | Adds about 2 minutes per push on GitHub (free for this size) |
| Free on GitHub; failing runs keep a report showing what broke | Doesn't check the exact look; that's still checked by eye |

*Choices within this:*
- **Outside photos and fonts are blocked in tests,** so tests don't depend on other websites and give
  the same result every time.
- **No screenshot-comparison tests yet,** because the design is still changing and every tweak would need
  new approved screenshots. Add them once the look settles.
- **Tests don't block deploys yet:** Cloudflare Pages deploys each push even if tests fail. A failing run
  shows a red ✗ on GitHub. To make tests block deploys, Cloudflare could deploy from GitHub Actions
  after tests pass (a later decision).

*Alternatives considered:* Cypress (similar, but slower and heavier); unit tests only, e.g. Vitest
(this site has little logic; most risk is in what readers see and click).

### 19. Cloudflare settings in `wrangler.toml`; admin sign-in with a password ✅

**Why:** `wrangler.toml` (in the repository) tells Cloudflare which database the site uses and holds
the comment settings, so the setup is saved in git history, not only in the dashboard. Once this file
exists, Cloudflare uses it instead of the dashboard for bindings and settings. It also turns on
`nodejs_compat`, which the Astro add-on needs.

`/admin` asks for a password. The password is a Cloudflare **secret** called `ADMIN_PASSWORD`, set in
the dashboard and never stored in GitHub (`src/lib/admin-auth.ts`):
- Admin stays switched off until a password of at least 12 characters is set.
- Signing in sets a cookie for 30 days that only the site can read (HttpOnly, Secure, SameSite=Strict).
  It's signed with the password, so changing the password signs out every device.
- After 5 wrong passwords from one address, that address must wait 15 minutes. Addresses are stored
  only as one-way hashes.
- Admin changes are only accepted from the site itself, a check that Astro also enforces.

We first planned Cloudflare Access (emailed sign-in codes), but its Zero Trust plan asks for a payment
method even when free.

| Pros | Cons |
| --- | --- |
| Free, with no payment details needed | A password is weaker than emailed codes: use a long, unique one from a password manager |
| Settings are versioned and reviewed like code | Bindings can no longer be edited in the Cloudflare dashboard |
| Changing the password instantly signs out every device | Forgetting the password means setting a new one in the dashboard |

**Local testing:** tests run the built site with `wrangler pages dev`, a fresh, throwaway database and
a test-only admin password passed on the command line (the real password exists only in Cloudflare).

### 20. Photo crop editor saves to GitHub ✅

*Update 2026-10-27:* section photos are now `{% photo %}` blocks in the text, so Save edits that block's
`focus` and `zoom` (`src/lib/frontmatter.ts`); other photos still use their settings lines.


**Why:** Ben wants to drag and zoom photos into place visually. The editor (`/admin/photos/`,
`src/scripts/crop-editor.ts`) shows each photo whole beside every frame it appears in. Save sends the new
focus and zoom to `/api/admin/photos`, which uses the GitHub API (`src/lib/github.ts`) to edit just those
lines in the photo's Markdown file (`src/lib/frontmatter.ts`) and commit it. Cloudflare rebuilds as for
any other change. Keeping the crop in the Markdown file means pages stay pre-built and fast, and there's
one place where every setting lives.

| Pros | Cons |
| --- | --- |
| Visual: drag, zoom, see every frame at once | Needs a GitHub key saved in Cloudflare (`GITHUB_TOKEN`), renewed when it expires |
| Pages stay pre-built (fast); no flicker or layout jump for readers | Changes take about 2 minutes to go live (a rebuild) |
| Every crop change is in git history and can be undone | Each Save is a commit and a rebuild (fine within free limits) |
| Only exact photo settings can be changed; everything else in the file is untouched | |

*Safety:* only admins can save; only known photo settings in article and About files are accepted
(`src/lib/photo-slots.ts`); the key is limited to this repository's contents. Tests use a pretend GitHub
(`tests/mock-github.mjs`), so they never touch the real repository.

*Alternatives considered:* storing crops in the D1 database and applying them in the browser (live
instantly, but the photo would jump after the page loads, and crop settings would live in two places);
building article pages on request (slower pages, more server cost).

### 21. Writing and editing with Keystatic ✅

**Why:** editing Markdown files on github.com was slow and error-prone (settings formatting, separate
photo uploads, no preview), which works against publishing regularly (goals G1, G2). Keystatic is a free,
open-source editor made for Astro that edits the **same files** in the repository: a form for the
settings, a rich-text editor (paste from Google Docs or Word keeps bold and lists), photo upload, and a
"Photo beside this section" block. On the live site it saves to GitHub (Ben signs in with GitHub; a
small GitHub App limits it to this repository); locally (`npm run dev`) it saves straight to the files.
Config: `keystatic.config.ts`, which must match `src/content.config.ts`.

| Pros | Cons |
| --- | --- |
| Friendly writing and photo upload; no settings formatting to get right | Signing in uses GitHub, separate from the admin password |
| Same files and git history as before; nothing locked into a service | One-time GitHub App setup (about 10 minutes) and three Cloudflare secrets |
| Required fields and photos are checked before saving | Keystatic tidies files when saving (rewraps settings, renames photos to standard names) |
| Free, no extra hosting; adds about 0.5MB to the server code (well within limits) | Each save is a commit and rebuild (about 2 minutes to go live) |

*Content changes made for it:* section photos became `{% photo %}` blocks in the text (3); section ids
come from headings; the date label and read time are worked out automatically; the signup and links
settings became YAML; the article template was removed.

*Version note:* uses `@keystatic/astro` 5.2 (6.0 needs a newer Astro); it reads its secrets
(`KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`) from Cloudflare.

*Alternatives considered:* a custom "New article" page in our admin (a lot to build and maintain well);
Pages CMS (hosted service, simpler but less flexible); sending drafts to Claude (not self-serve).

---

### 22. Discoverability: hand-built search and AI labels ✅

**Why:** G1 (be found on Google and in AI answers). Structured data (JSON-LD), share previews (Open Graph and
X cards), canonical links, `/sitemap.xml` and `/llms.txt` are generated from the content at build time by
`src/lib/seo.ts` and two small endpoints (`src/pages/sitemap.xml.ts`, `src/pages/llms.txt.ts`), so every new
article gets them automatically. The site address lives once, in `astro.config.mjs` (`site`).

| Pros | Cons |
| --- | --- |
| No extra packages; easy to read and test | We maintain it ourselves (a sitemap plugin would do part of it) |
| Article, FAQ, author and organisation labels that search engines and AI tools understand | Google shows FAQ rich results for few sites now; the labels still help AI answers |
| Share pictures are resized automatically to 1200px | Moving domains means changing one setting and redeploying |

### 23. Own web address: www.lovinglifelonger.com 🔨 (later)

**Plan:** Ben owns `lovinglifelonger.com` and `lovinglifelonger.co.uk` at IONOS. Add `www.lovinglifelonger.com`
as a custom domain on the Cloudflare Pages project, redirect the bare domain and the `.co.uk` to it, change
`site` in `astro.config.mjs`, add the new callback address to the Keystatic GitHub App, then launch. Two ways
to point the domain at Cloudflare:

| Option | Pros | Cons |
| --- | --- | --- |
| **Move the domain's DNS to Cloudflare** (change nameservers at IONOS; recommended) | Free; the bare domain works; easy redirects; email-sending records (SPF, DKIM, DMARC) all in one place | Any existing IONOS email or other records must be copied across first |
| Keep DNS at IONOS and add a CNAME for `www` | No nameserver change | The bare domain can't point at Pages easily; redirects and email records split across two places |

The own domain is also what lets newsletter and reply emails come from an `@lovinglifelonger.com` address that
inboxes trust (see 9).

## Change log

| Date | Change |
| --- | --- |
| 2026-10-27 | First version: documents the initial build from the design handoff. |
| 2026-10-27 | Hosting decided: Cloudflare Pages (14). Comments and likes move to Cloudflare D1 (8); signup moves to a newsletter service, D1 as fallback (9). Added Pages Functions (16) and Turnstile (17). Vercel and Netlify ruled out. |
| 2026-10-27 | Added automated testing (18): Playwright behaviour tests and axe accessibility scans at desktop and phone sizes, run by GitHub Actions on every code change. |
| 2026-10-27 | Hosting (14): site stays private behind Cloudflare Access until launch. |
| 2026-10-27 | Hosting (14) live: Cloudflare Pages project `loving-life-longer-blog` connected and deploying from `main`. |
| 2026-10-27 | Article section parsing moved to `src/lib/sections.ts` (3) so it can be tested directly; supports bold and lists. |
| 2026-10-27 | Page text (4) moved from `src/data/site.ts` into Markdown files in `src/content/pages/`; formatting marks work in all of them. |
| 2026-10-27 | Comments (8): added "email me when someone replies" notifications; email-sending service still to choose. Article reading column widened to 820px on desktop (styling only). |
| 2026-10-27 | Built comments and likes on D1 (8) via Pages Functions (16); added `wrangler.toml` config and Access-protected admin (19); removed sample comments and fake like count. Goes live once the database id is added. |
| 2026-10-27 | D1 database `lll-blog` created and connected; comments and likes live. |
| 2026-10-27 | Replaced Cloudflare Access (needs a payment method) with: admin password sign-in (19), and hiding the site from search engines until launch (14). Removed the `jose` library. |
| 2026-10-27 | Photos (11): stored next to the content, resized to WebP at build, focus setting per photo, crop preview at `/admin/photos/`; top photo up to 480px tall on desktop. |
| 2026-10-27 | Content (2): article template checked on every build; per-article links with icons and affiliate disclosure. |
| 2026-10-27 | Styling (5): one shared page width (`.wide`) across all pages; wider desktop layouts for About, Policy, signup, article header, links, Q&A and comments. |
| 2026-10-27 | Photo crop preview (11) now admin-only: checks the admin sign-in on the server. |
| 2026-10-27 | Photo zoom setting (11) and a drag-and-zoom crop editor that saves to GitHub (20). |
| 2026-10-27 | Keystatic editor (21) on a trial branch: articles and pages editable at /keystatic; section photos as `{% photo %}` blocks (3); pages in Keystatic (4); tests use a frozen sample of the content (18); crop editor edits photo blocks (20). |
| 2026-10-28 | Logo (11, images): the header logo and browser tab icon are now the three-stone mark in `public/logo.svg` (vector, so sharp at every size) instead of `logo.png`. |
| 2026-10-28 | Keystatic (21) merged into `main` and live; the GitHub sign-in still needs setting up. |
| 2026-10-28 | Keystatic (21) GitHub sign-in set up and working on the live site (GitHub App "Loving Life Longer editor"; secrets in Cloudflare). `KEYSTATIC_SECRET` must be 32+ characters. |
| 2026-10-28 | Fonts (12): Fraunces added for the wordmark only (tiny, letters-only download). Logo (11) fills its space with no background. |
| 2026-10-28 | Footer social links (4) stored in `src/content/pages/social.yaml`, edited in Keystatic; brand icons from the free Simple Icons package, drawn at build time (no extra code for visitors). Separate browser-tab icon on a white tile (11). Like id only created on tapping Like (7), so readers get nothing stored. |
| 2026-10-29 | Discoverability (22): structured data, share previews, canonical links, sitemap and llms.txt, generated from the content. Own domain plan (23) recorded for later. |
| 2026-10-29 | Sharing (13): 14 services with genuine brand icons in a grid, plus the phone's own share menu. Footer LinkedIn icon now the genuine logo. |
