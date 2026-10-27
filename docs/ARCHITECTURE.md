# Architecture

How the Loving Life Longer site is built, and why. Each decision has a short "why" and simple pros and cons.

**Keep this file up to date.** When an architecture decision changes, edit its entry (or add a new one)
and add a line to the [Change log](#change-log) at the bottom.

Status key: ✅ decided · 🕒 temporary (to be replaced) · ❓ not decided yet

---

## Overview

```
src/content/blog/*.md  ──┐
src/data/site.ts       ──┼──▶  Astro build  ──▶  dist/ (plain HTML, CSS, a little JS)  ──▶  any static host
src/pages, layouts     ──┘
```

The site is a **static website**: all pages are built once into plain files. There is no server or database yet.

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

### 3. Article sections come from `## Heading {#id}` ✅

**Why:** the design needs per-section layouts (text only, or text beside a photo) and a table of
contents. The article page splits the Markdown at each `## ` heading. Section photos are listed under
`sectionImages:` at the top of the file and matched by the `{#id}`.

| Pros | Cons |
| --- | --- |
| Writing stays plain Markdown | A typo in an id means the photo silently doesn't show |
| Table of contents builds itself from the headings | Only one heading level (`##`) creates sections |

### 4. Site-wide text in one file (`src/data/site.ts`) ✅

**Why:** the mission line, signup text, pillar colours and pillar cards are used on several pages.
Keeping them in one place means one edit updates every page.

| Pros | Cons |
| --- | --- |
| One place to change shared copy | It's a code file, so the syntax (quotes, commas) has to stay intact |

### 5. Styling: plain CSS with design tokens ✅

**Why:** colours, fonts and widths from the handoff's tokens are CSS variables at the top of
`src/styles/global.css`. Each page keeps its own styles in a `<style>` block that only affects that page.

| Pros | Cons |
| --- | --- |
| Change a colour once and it updates everywhere | More CSS to write by hand than a utility framework like Tailwind |
| No build tools or libraries to learn | |
| Easy to match the design pixel for pixel | |

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

### 8. Comments and likes: stored in the visitor's browser 🕒

**Why:** there is no backend yet. Likes and new comments are saved in `localStorage`, and the sample
comments come from `SEED_COMMENTS` in `src/data/site.ts`.

| Pros | Cons |
| --- | --- |
| Works now with no server or cost | **Other visitors can't see your comments or likes** |
| Easy to swap out later | No moderation, no spam protection |

*To replace with:* a hosted comments service, or a small database (e.g. Supabase) with moderation
and an admin view to reply.

### 9. Email signup: front-end only 🕒

**Why:** no email provider has been chosen. The form shows a thank-you message but doesn't save the address.

| Pros | Cons |
| --- | --- |
| Design is finished and ready to connect | **Sign-ups are currently lost** |

*To replace with:* an email provider (e.g. Buttondown, MailerLite, ConvertKit) with double opt-in and
a record of consent.

### 10. "Blog" nav link goes to the newest article ✅

**Why:** the design has only one article, so "Blog" opens it directly. The home page shows a note now
and switches to an article list once there are two or more articles.

| Pros | Cons |
| --- | --- |
| Matches the design | Will need a real `/blog/` index page as articles grow |

### 11. Images: placeholders loaded from picsum.photos 🕒

**Why:** real photos haven't been supplied. The logo is stored in the repo (`public/logo.png`).

| Pros | Cons |
| --- | --- |
| Layout can be checked now | Random stock photos, and they depend on an outside website |

*To replace with:* real photos in `public/images/`, ideally run through Astro's image optimisation
for smaller files.

### 12. Fonts: Google Fonts ✅

**Why:** Source Serif 4, Inter and Rubik, as specified in the handoff.

| Pros | Cons |
| --- | --- |
| One line to load them | Visitors' browsers contact Google (worth mentioning in the privacy policy) |
| | Could be self-hosted later for speed and privacy |

### 13. Sharing: plain share links ✅

**Why:** Email, WhatsApp, X, Facebook and Snapchat use their standard "share this link" addresses.
Instagram has no web share link, so it copies the article link.

| Pros | Cons |
| --- | --- |
| No tracking scripts from social networks | Instagram can't be shared to directly from a website |

### 14. Hosting ❓

**Not decided.** Netlify, Vercel and Cloudflare Pages all host Astro sites for free and rebuild
automatically when GitHub changes.

| Pros (any of them) | Cons |
| --- | --- |
| Free for a site this size; updates on every push | Another account to manage |

### 15. Code storage: private GitHub repository ✅

**Why:** `claude4ben/loving-life-longer-blog`, `main` branch. It gives full history, editing on
github.com, and easy connection to hosting.

| Pros | Cons |
| --- | --- |
| Every change is tracked and reversible | Requires a GitHub account to edit |

---

## Change log

| Date | Change |
| --- | --- |
| 2026-10-27 | First version: documents the initial build from the design handoff. |
