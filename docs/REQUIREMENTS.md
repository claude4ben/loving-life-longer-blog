# Requirements

Why the Loving Life Longer blog exists, the key features that serve that purpose, and (in Part 2) the
detailed specification with build status and test coverage.

**Keep this file up to date.** When a goal, feature or requirement is added, changed, built or tested,
update it here in the same commit.

---

# Part 1: Purpose and key features

## Purpose

> **Loving Life Longer (LLL) helps you get the most out of your human experience, in how you think,
> move and live.**

LLL is growing into an **ecosystem of content**: this blog first, then a podcast, social media and a
festival. The blog is the first place LLL content is shared, and the hub the rest will link back to.

Ben writes first-person accounts of things he has actually tried: what worked, what didn't, and why. No
credentials and no prescriptions. Content sits under three pillars: **Think**, **Move** and **Live**.

## Goals

Every feature and design change should move at least one of these forward, and shouldn't set any back.

| # | Goal | What success looks like |
| --- | --- | --- |
| G1 | **Be discovered** | People find LLL through search engines (SEO) and when they ask AI assistants such as ChatGPT, Claude or Perplexity (often called GEO or LLM visibility). |
| G2 | **Be genuinely useful** | Readers finish articles, take something practical away, and come back. Easy to read on any device. |
| G3 | **Build engagement and community** | Readers comment, like, share and join the email list; Ben replies to comments. |
| G4 | **Be the hub of the LLL ecosystem** | A clear, consistent LLL brand that will connect to the podcast, social channels and festival. |
| G5 | **Be trustworthy and safe** | Honest about not being medical advice; respectful comments (moderated); readers' data handled properly. |

## Key features

| Feature | Serves | Status |
| --- | --- | --- |
| **Articles by pillar** (Think, Move, Live), first-person and practical | G2, G4 | ✅ |
| **Purpose-led home page**: LLL's purpose as the headline, then the latest article | G1, G4 | ✅ |
| **Q&A (FAQ)** on articles and the home page, answering the questions people search for and ask AI | G1, G2 | ✅ layout; 📝 answers are placeholders |
| **Discoverability basics**: page titles and descriptions | G1 | ✅ |
| **Discoverability extras**: structured data (Article, FAQ, author), sitemap, share previews (Open Graph), canonical links | G1 | 🔨 not built yet; needed before launch |
| **Comments** saved in a database, with Ben's replies, an **admin panel** (reply, delete, restore, approve), and later **"email me when someone replies"** notifications | G3, G5 | ✅ built and tested (goes live once the database exists); 🔨 reply emails |
| **Likes and sharing** (copy link, email, WhatsApp, X, Facebook, Instagram, Snapchat) | G1, G3 | ✅ (likes saved in the database, one per visitor) |
| **Email signup** for new pieces | G3, G4 | 🕒 not saved yet; 🔨 newsletter service |
| **About page**: who Ben is, why LLL exists, a note on qualifications | G1 (credibility), G5 | ✅ 📝 bio is placeholder |
| **Policies**: comments, privacy, cookies | G5 | 📝 placeholder text |
| **Easy publishing**: all articles and page text in simple Markdown files on GitHub, with **bold** and bullet lists | G2 | ✅ |
| **Links from each article**: cards with round icons for people, brands, social accounts and shops, with clearly labelled affiliate links | G3, G4 (partners and the ecosystem), G5 (honest affiliate disclosure) | ✅ (demo links are placeholders) |
| **Article template** (`_template.md`) explaining every setting, checked on every build | G2 (easy, regular publishing) | ✅ |
| **Links to the wider ecosystem** (podcast, social, festival) | G4 | 🔨 later; footer icons are placeholders |
| **Hidden from search engines until launch** (one switch to flip at launch) | G1 (no half-finished pages in search or AI answers) | ✅ |

## Open questions

| Question | Notes |
| --- | --- |
| ~~Should desktop article text stretch almost to the edge?~~ | **Decided 2026-10-27:** first option B (820px), then Ben chose to line text-only sections up with the text-and-photo rows (about 125 characters per line on wide screens). If readers find long lines tiring, reverting is one line in `src/pages/blog/[slug].astro`. |
| ~~What is the comment form's email for?~~ | **Decided 2026-10-27:** "Email me when someone replies" (see ART-49). Built with the comments database; until then the field stays as it is, with no promise shown. |
| Home page Q&A | Now edited in `src/content/pages/home.md`, but still holds the ecstatic dance questions. For G1 it should answer questions about LLL itself ("What is Loving Life Longer?", "Who writes it?"). |

## How Claude uses this

Before making a change, Claude checks it against the goals above. If a request could work against a
goal (for example, hurting readability, discoverability or trust), Claude says so, explains why in plain
language, and suggests an alternative, then does what Ben decides.

Note: until launch the site asks search engines and AI tools not to list it (`HIDE_FROM_SEARCH` in
`src/data/site.ts`), so the discoverability goal (G1) only starts working at launch.

---

# Part 2: Detailed specification

The detailed design and behaviour, originally from the designer's handoff
(`design_handoff_lll_blog/README.md` and the `LLL Blog.dc.html` prototype), the author's article draft
(`Ecstatic Dance Blog v003.pdf`), and the decisions in [ARCHITECTURE.md](ARCHITECTURE.md). Exact
colours, sizes and spacing are recorded here so changes are deliberate; they can change whenever a
change better serves the goals in Part 1.

### How to read this

**Status**

| Mark | Meaning |
| --- | --- |
| ✅ | Built: in the code on `main` (live once Cloudflare Pages deploys it) |
| 🕒 | Temporary: works, but in a stop-gap way that will be replaced |
| 🔨 | Planned: decided, not built yet |
| 📝 | Built, but the words or photos are placeholders waiting for real content |
| ❓ | Not decided yet |
| ⚠️ | Partly meets the requirement (gap described in the row) |

**Test** (how we know it works)

| Mark | Meaning |
| --- | --- |
| None | Not tested |
| Manual | Checked by hand or by screenshot, not repeatable |
| Build | The build fails if this is broken (content schema check) |
| Auto | Covered by an automated test in `tests/` (runs on GitHub on every code change) |

**Viewports:** desktop is **960px and wider**; mobile is **below 960px**.

### Test coverage today

- **Automated tests** live in `tests/` and run in a real browser at desktop (1280px) and phone (390px)
  sizes. Run them with `npm test`.
- **When they run:** on GitHub (Actions → "Tests") for every push to `main` and every pull request,
  unless only the docs changed. Claude also runs them before pushing code changes.
- **What they cover:** navigation and menus, every article interaction (table of contents, Like, share
  sheet and links, comments, progress bar, photo zoom), signup validation, page content and layout at both
  sizes, an accessibility scan of every page, and a check for JavaScript errors on every page.
- **Build check:** the build checks every article's settings against a schema, so a mistake stops the build.
- **Not automated:** exact visual design (colours, sizes, spacing) is still checked by eye. Screenshot
  comparison tests were left out on purpose while the design is still changing (see ARCHITECTURE
  decision 18).

---

## 1. Global (every page)

| ID | Requirement | Acceptance criteria | Status | Test |
| --- | --- | --- | --- | --- |
| GEN-01 | Page layout | White `#ffffff` background, ink `#1d1d1d` text, Inter body font. Footer sits at the bottom even on short pages. | ✅ | Manual |
| GEN-02 | Sticky header | Stays at the top while scrolling. White, 1px `#f3f5f7` bottom border, padding 16px 20px. | ✅ | Manual |
| GEN-03 | Logo | 52×52 circle cropped from `logo.png`, 10px gap to the wordmark. | ✅ | Manual |
| GEN-04 | Wordmark | "Loving Life Longer", Inter 600 22px. Clicking the logo or wordmark goes to Home. | ✅ | Auto |
| GEN-05 | Desktop nav | Home, Blog, About; 15px, 28px apart. Current page is bold `#40763d` with a 2px green underline; others weight 500 ink. | ✅ | Auto |
| GEN-06 | Mobile menu button | Below 960px the nav is replaced by a 44×44 three-bar menu button. | ✅ | Auto |
| GEN-07 | Mobile menu | Opens a full-screen white overlay with a × close button (44×44) and Home, Blog, About in Source Serif 4 28px with dividers. × closes it. | ✅ | Auto |
| GEN-08 | Policy not in nav | Policy is reached only from the footer and the comment form. | ✅ | Auto |
| GEN-09 | Footer | Dark `#1d1d1d` background; three grey social circles; "© 2026 Loving Life Longer" (13px white); "Policy" link (13px `#90a781`) to `/policy/`. | ✅ | Auto |
| GEN-10 | Footer social links | Real icons linking to real social accounts. | 🔨 placeholder circles | None |
| GEN-11 | Page addresses | `/`, `/blog/<slug>/`, `/about/`, `/policy/`. Each page loads at the top. | ✅ | Auto |
| GEN-12 | "Blog" nav link | Opens the newest article (there is no article list page yet). | ✅ | Auto |
| GEN-13 | Link style | Links are `#40763d` with no underline; on hover, ink with underline. | ✅ | None |
| GEN-14 | Fonts | Source Serif 4 for headings, Inter for body, Rubik for labels (loaded from Google Fonts). | ✅ | None |
| GEN-15 | Page titles | Browser tab shows "<Page> · Loving Life Longer" (Home shows the site name only). | ✅ | Auto |
| GEN-16 | Shared page width | On desktop every page's content uses one width (`.wide`: max 1320px with 96px side padding, so up to 1128px of content and room for the article's Like/Share panel), and left edges line up across Home, About, Policy and every part of an article. Long reading text keeps a comfortable maximum width inside it. Phones: 20px gutters, max 760px. | ✅ | Auto |

## 2. Home (`/`)

| ID | Requirement | Acceptance criteria | Status | Test |
| --- | --- | --- | --- | --- |
| HOME-01 | Purpose introduction | All home content shares one width (max 1120px, same as the photo) so left edges line up. Small label "Welcome to Loving Life Longer"; the page heading (H1) is LLL's purpose with think/move/live in pillar colours (30px phone / 48px desktop, up to 960px wide); then the line about Ben (17px / 20px, grey, up to 760px wide). Divider below. Text in `src/content/pages/home.md`. | ✅ | Auto |
| HOME-02 | Featured article | Labelled "Latest article"; the whole block links to the article. Photo full width (16:9, max 480px tall; edge to edge on phones). Below it on desktop, two columns spanning the photo's width: pillar tag and title (38px) on the left; summary (19px), read time and "Read the article →" on the right. Stacked on phones. | ✅ | Auto |
| HOME-03 | Featured choice | Shows the newest article marked `featured: true` (or the newest article if none are). | ✅ | None |
| HOME-04 | Home FAQ | Questions come from `home.md` (separate from the article's). Collapsed "Common questions" section; opening it shows each question (600 15px) and answer (14px grey). | ✅ 📝 answers | Auto |
| HOME-05 | One-article note | With one article: italic note "Only one article published so far…". | ✅ | Auto |
| HOME-06 | Article list | With two or more articles: the note is replaced by a list of the other articles. | ✅ basic version, not designed yet | None |
| HOME-07 | Signup block | Full signup block (see CMP-04). | ✅ | Auto |

## 3. Article page (`/blog/<slug>/`)

### Layout and content

| ID | Requirement | Acceptance criteria | Status | Test |
| --- | --- | --- | --- | --- |
| ART-01 | Article header | Pillar tag; title Source Serif 4 600 (28px phone / 44px desktop, up to 960px wide); standfirst grey (19px / 21px, up to 820px wide); byline row across the page width. Aligned with the article text. | ✅ 📝 standfirst | Auto |
| ART-02 | Byline | 44px round avatar; name (600 14px) and disclosure (13px grey); read time and date right-aligned. | ✅ 📝 avatar, disclosure | Auto |
| ART-03 | Hero photo | 16:9 on phones (edge to edge); on desktop up to **480px** tall (raised from 300px, 2026-10-27) across the full width. Square corners. Loads first (not lazily). Cropped around its `heroFocus`. | ✅ 📝 photo | Auto |
| ART-04 | Sections | Each `## Heading` in the article file is a section: H2 Source Serif 4 600 24px; paragraphs 19px desktop / 17px mobile, line height 1.65. | ✅ | Auto |
| ART-05 | Text-only sections | On desktop, span the same width as the text-and-photo rows (max 1320px with 96px side padding, so they line up edge to edge); Ben's request 2026-10-27, accepting longer lines. On mobile, the screen width (max 720px). The header, table of contents, Q&A and comments stay at 820px. | ✅ | Auto |
| ART-06 | Photo sections, desktop | The photo (half the row, 460px tall) sits on the left or right as set in the article file, lined up with the section heading. Text **wraps around it, a paragraph at a time**: a paragraph (or bullet point) that starts beside the photo stays in that column to its end, even if it runs past the photo; the next one below the photo runs full width (max 1320px row, 96px side padding, so it lines up with text-only sections). Bullet points wrap the same way, with bullets always visible. | ✅ 📝 photos | Auto |
| ART-07 | Photo sections, mobile | Text first, then the photo (4:3, max 300px tall, edge to edge). | ✅ 📝 photos | Auto |
| ART-08 | Photo captions | Optional caption over the bottom of the photo: white Source Serif 4 600 20px on a dark fade. Example captions: "50 dancers. Blindfolded. In the dark." and "You're welcome… Feel free." | ✅ | Auto |
| ART-09 | Article FAQ | Grey card with a "COMMON QUESTIONS" label and the article's questions and answers, two across on desktop. | ✅ 📝 answers | Auto |
| ART-10 | Article text | Uses the author's draft word for word, typos included, until the author approves corrections. | ✅ | None |
| ART-11 | Bold and lists | In an article file, `**words**` show in bold, lines starting `- ` become a bullet list (green bullets) and lines starting `1. ` a numbered list. | ✅ | Auto |
| ART-12 | Rail never covers text | On desktop, the Like/Share rail never overlaps article text. | ✅ | Auto |
| ART-13 | Links from this article | After the article text and before the Q&A, when the article has `links`: heading (default from `links.md`, or the article's `linksTitle`); a card per link with a 48px round icon (picture, or the first letter if none), name, optional type label, one-line description, and ↗. Three across on desktop, one on phones. Whole card is the link; opens in a new tab. | ✅ 📝 demo links | Auto |
| ART-14 | Affiliate links | Links with `affiliate: true` show an "Affiliate" label, use `rel="sponsored noopener"`, and the affiliate note from `links.md` appears under the list. | ✅ | Auto |

### Interactions

| ID | Requirement | Acceptance criteria | Status | Test |
| --- | --- | --- | --- | --- |
| ART-20 | Reading progress bar | 3px bar fixed at the very top. Green fill grows from 0% to 100% as you scroll through the article body. | ✅ | Auto |
| ART-21 | Photo zoom on scroll | Article photos (hero and sections) start slightly zoomed (108%) and ease to 100% over 1.1s the first time they scroll into view. Photos on Home, About and Policy don't zoom. | ✅ | Auto |
| ART-22 | Reduced motion | If the visitor's device asks for reduced motion, photos don't zoom. | ✅ | None |
| ART-23 | Table of contents | Grey "Table of contents" button with "+"; opens a list of section headings and the glyph changes to "−". | ✅ | Auto |
| ART-24 | TOC jump | Clicking a heading scrolls smoothly to that section (90px below the top, clear of the header) and closes the list. | ✅ | Auto |
| ART-25 | Mobile engagement bar | Below 960px: bar fixed to the bottom with Like (♡ + count), "Comments (n)" and Share. Each tap target at least 44px. | ✅ | Auto |
| ART-26 | Desktop engagement rail | 960px and wider: white rounded panel fixed at the right, vertically centred, with Like, 💬 count and Share stacked. | ✅ | Auto |
| ART-27 | Like | Tapping Like turns ♡ into a green ♥ and adds 1 to the count straight away; tapping again undoes it. The count is the real number of visitors who liked it (starts at 0). | ✅ | Auto |
| ART-28 | Likes are shared | Likes are saved in the database for everyone, one per visitor (each browser has a random visitor id, not linked to who they are). A visitor's like is remembered when they come back. | ✅ | Auto |
| ART-29 | Comments button | Scrolls to the comments section. | ✅ | Auto |
| ART-30 | Share sheet | Share opens a dimmed background with a white sheet rising from the bottom, "Share this article". Clicking the dimmed area closes it. | ✅ | Auto |
| ART-31 | Copy link | Copies the article address; the label reads "Copied!" briefly. | ✅ | Auto |
| ART-32 | Share targets | Email, WhatsApp and X on all screens; Facebook, Instagram and Snapchat on desktop only. Each opens that service's share screen with the article link. Instagram has no web share, so it copies the link. | ✅ | Auto |

### Comments

| ID | Requirement | Acceptance criteria | Status | Test |
| --- | --- | --- | --- | --- |
| ART-40 | Comment form | Name, "Email (optional, not published)" and "Add a comment" (3 rows) fields; "Policy" link on the left and "Post comment" on the right. On desktop the form sits on the left (stays in view while scrolling) with comments on the right; with no comments yet, a "No comments yet. Be the first to share your thoughts." message shows. | ✅ | Auto |
| ART-41 | Validation | Name and comment are required (spaces alone don't count); email is optional. Nothing posts if a required field is empty. | ✅ | Auto |
| ART-42 | New comment | Saved to the database and shown at the top of the list with the first letter of the name as its avatar and "Just now" as the time. The form clears. Times show as "5 minutes ago", "2 days ago", then the date. If saving fails, a red message explains why. | ✅ | Auto |
| ART-43 | Comment list | 36px grey initial circle, name and time on one line, text 15px. Replies indented 48px with 32px circles. Comments 24px apart. | ✅ | Auto |
| ART-44 | Comment count | Heading, mobile bar and desktop rail all show the same count of top-level comments. | ✅ | Auto |
| ART-45 | Comments are shared | Comments are saved in the database and shown to every visitor. By default they appear straight away and Ben deletes bad ones; setting `COMMENTS_NEED_APPROVAL = "true"` in `wrangler.toml` makes them wait for Ben's approval (the commenter is told). | ✅ | Auto |
| ART-49 | Reply notifications | Commenters who leave their email can tick **"Email me when someone replies"** (unticked by default). They then get an email when Ben or another reader replies, with a link back to the comment and a one-click unsubscribe. The email is never published. | 🔨 needs the comments database (D1) and an email-sending service | None |
| ART-50 | Comment rules | Name up to 80 characters, comment up to 5,000, email optional but must look valid. A hidden field catches simple bots (their comments are silently ignored). Commenters' emails are never sent to the article page. | ✅ | Auto |
| ART-51 | Author badge | Ben's replies show under the comment with a green "Author" badge. | ✅ | Auto |
| ART-46 | Comment safety | Text people type is shown as plain text, never run as code. | ✅ | Auto |
| ART-47 | No invented comments or likes | The sample comments (Priya, Tom) and the starting like count of 24 were removed; everything shown is real (G5). | ✅ | Auto |
| ART-48 | Signup block | Full signup block below the comments (see CMP-04). | ✅ | Auto |

## 4. About (`/about/`)

| ID | Requirement | Acceptance criteria | Status | Test |
| --- | --- | --- | --- | --- |
| ABOUT-01 | Photo and introduction | Desktop: photo (4:3) on the left, heading (40px) and bio beside it. Phones: photo edge to edge (max 300px tall), then heading and bio. | ✅ 📝 photo, bio | Auto |
| ABOUT-02 | Heading and bio | H1 "I started this because I got tired of my own excuses." (32px), then two bio paragraphs (18px). | ✅ 📝 bio | Auto |
| ABOUT-03 | What I believe | Three pillar cards (Think, Move, Live) in a row on desktop, stacked on mobile; label in the pillar colour. | ✅ 📝 card text | Auto |
| ABOUT-04 | People behind it | Ben ("Writes and runs Loving Life Longer") and Emma ("Occasional contributor — separate brand (link pending)") with 56px round photos. On desktop, people sit beside the qualifications note. | ✅ 📝 photos, Emma's link | Auto |
| ABOUT-05 | Qualifications note | Dark card: "A note on qualifications" and "I'm not a therapist, doctor, or clinician…". | ✅ | Auto |
| ABOUT-06 | Photo strip | Three photos across the full page width (4:3, 16px gaps) on desktop; square, no gaps and edge to edge on mobile. | ✅ 📝 photos | Auto |
| ABOUT-07 | Compact signup | Smaller signup block: title, email and Subscribe only (no body text, no checkbox). | ✅ | Auto |

## 5. Policy (`/policy/`)

| ID | Requirement | Acceptance criteria | Status | Test |
| --- | --- | --- | --- | --- |
| POL-01 | Policy page | H1 "Policies" and an intro, then three sections: Comments policy, Data & privacy, Cookies. | ✅ 📝 all text | Auto |
| POL-02 | Deep link | The comment form's Policy link opens the Comments policy section. | ✅ | Auto |
| POL-03a | Policy layout | Desktop: title and intro across the page, then an "On this page" list on the left (stays in view while scrolling) beside the policy text (up to 820px wide). Phones: text only. | ✅ | Auto |
| POL-03 | Real policy text | Covers what's collected (comments, emails), Google Fonts, Cloudflare, the newsletter service, and how to ask for data deletion. | 🔨 | None |

## 6. Shared components

| ID | Requirement | Acceptance criteria | Status | Test |
| --- | --- | --- | --- | --- |
| CMP-01 | Pillar tag | White uppercase Rubik 600 12px label, 4px rounded. Think `#3d5a76`, Move `#40763d`, Live `#a15c3e`. | ✅ | Manual |
| CMP-02 | Primary button | Ink background, white bold text, 6px rounded. Inline size 12px 22px / 15px; full-width size 14px / 16px. | ✅ | Manual |
| CMP-03 | Text fields | 16px text (stops iPhones zooming in), 1px `#d8dcdf` border, 6px rounded. | ✅ | None |
| CMP-04 | Signup block | Grey band (on desktop: title and text on the left, email field and Subscribe on one row on the right with the tick box below; on phones, centred and stacked): "Get new pieces by email", short body text, email field, consent checkbox ("I'd like to receive occasional emails…") and Subscribe. | ✅ | Auto |
| CMP-05 | Signup validation | A valid email and the consent tick are required before submitting. | ✅ | Auto |
| CMP-06 | Signup result | After submitting, the form is replaced by "Thanks — you're on the list." | 🕒 address is **not saved** | Auto |
| CMP-07 | Signup saved | Address sent to the newsletter service with double opt-in and a record of consent (fallback: saved in D1). | 🔨 | None |

## 7. Content and editing

| ID | Requirement | Acceptance criteria | Status | Test |
| --- | --- | --- | --- | --- |
| CON-01 | Articles as files | Each article is one Markdown file in `src/content/blog/`; the file name is its web address. | ✅ | Build |
| CON-02 | Article settings checked | Title, pillar (Think/Move/Live only), standfirst, date, photos and FAQ are checked; a mistake stops the build. | ✅ | Build |
| CON-03 | Section photos | A photo is attached to a section by its `{#id}`, with side and optional caption. | ✅ | None |
| CON-04 | Page text in Markdown | All words on Home, About, Policy and the signup box come from Markdown files in `src/content/pages/`, editable on GitHub. A missing or wrong field stops the build. | ✅ | Build + Auto |
| CON-07 | Formatting marks | In any Markdown file: `**bold**`, `*italic*`, `[links](...)`; in main text also `- ` bullets and `1. ` numbered lists. Home headline: `{think}`, `{move}`, `{live}` show in pillar colours. | ✅ | Auto |
| CON-08 | Photos with the content | Photos live next to their Markdown file (`src/content/blog/<article>/`, `src/content/pages/about/`) and are referenced from its settings. The site makes resized WebP copies at build time, and browsers download the size they need; below-the-fold photos load lazily. Web links still work (not resized). | ✅ | Auto + Build |
| CON-09 | Photo focus | Every photo has a `focus` (`center` by default): `center`, `top`, `bottom`, `left`, `right`, two together, or `"X% Y%"`. It sets which part stays in view when cropped. Anything else stops the build with a helpful message. | ✅ | Auto |
| CON-10 | Crop preview | `/admin/photos/` shows each photo in every frame it appears in (article top desktop/phone, home "Latest article", beside-text desktop, under-text phone, About), with captions, a red dot on the focus point, Ben's file name, and a warning if alt text is missing. Hidden from search engines. Linked from `/admin`. | ✅ | Auto |
| CON-11 | Article template | `src/content/blog/_template.md` shows and explains every setting (with example photos in `_template/`). It's checked against the same rules as real articles on every build, and files starting with `_` are never published. | ✅ | Build + Auto |
| CON-05 | Real photos | Placeholder photos (downloaded into the article and About folders with descriptive names) replaced with Ben's real photos by uploading files with the same names. | 🔨 | None |
| CON-06 | No-code editing | The author can publish articles without editing files. | 🔨 (CMS not chosen) | None |

## 8. Quality (non-functional)

| ID | Requirement | Acceptance criteria | Status | Test |
| --- | --- | --- | --- | --- |
| NFR-01 | Responsive | Correct layout on both sides of 960px; no sideways scrolling on a 390px-wide phone. | ✅ | Auto |
| NFR-02 | Tap targets | Every button and link control is at least 44px in both directions. | ⚠️ partly: main buttons yes; nav links, TOC items, footer and comment-form "Policy" links are smaller | None |
| NFR-03 | Images have descriptions | Every meaningful image has alt text; decorative ones are hidden from screen readers. | ✅ | Auto |
| NFR-04 | Keyboard use | Menu, TOC, Like, Share, forms and FAQ all work with the keyboard. | ⚠️ partly: all are real buttons/links, but Esc doesn't close the menu or share sheet, and focus isn't kept inside them while open | None |
| NFR-05 | Works without JavaScript | All pages and article text show and are laid out correctly without JavaScript; only the interactive extras need it. | ⚠️ partly: pages and article are fine; the mobile menu and the comment list need JavaScript | None |
| NFR-06 | Fast | Pages are pre-built static files with only a small script on the article page. | ✅ | None |
| NFR-07 | No browser errors | No JavaScript errors on any page. | ✅ | Auto |
| NFR-08 | Spam protection | Comment and signup forms are checked by Cloudflare Turnstile before anything is saved. | 🔨 | None |
| NFR-10 | Accessibility scan | No WCAG 2.1 A/AA problems found by the automated scan (contrast, labels, alt text, headings) on any page at either size. Temporary "placeholder copy" notes are excluded. | ✅ | Auto |
| NFR-09 | Cookie banner | Shown only if analytics or other tracking cookies are added. | ❓ (no analytics yet) | None |

## 9. Hosting and operations

| ID | Requirement | Acceptance criteria | Status | Test |
| --- | --- | --- | --- | --- |
| OPS-01 | Hosting | Site served by Cloudflare Pages (project `loving-life-longer-blog`, https://loving-life-longer-blog.pages.dev) from `claude4ben/loving-life-longer-blog`. | ✅ | Manual (Cloudflare check passed on GitHub, 2026-10-27) |
| OPS-02 | Auto deploy | Every push to `main` goes live; other branches get preview links. | ✅ | Manual (each commit shows a "Cloudflare Pages" check on GitHub) |
| OPS-04 | Hidden from search until launch | While `HIDE_FROM_SEARCH` is `true`: every page has exactly one `noindex, nofollow` tag and `/robots.txt` blocks all crawlers. After launch, robots.txt only blocks `/admin` and `/api/`, and `/admin` stays noindex. | ✅ | Auto |
| OPS-05 | Database | Cloudflare D1 database `lll-blog` (id `0bc01f85-fd80-48ed-b0b8-633fad218774`), connected through `wrangler.toml`. Tables are created automatically on first use. | ✅ | Auto (local copy in tests) |
| OPS-03 | Comment admin | `/admin` lists every comment (with commenters' emails), grouped by article: reply as Ben, delete (with confirmation), restore, approve. Hidden from search engines. | ✅ built; 🔨 Ben to set the `ADMIN_PASSWORD` secret | Auto |
| OPS-06 | Admin sign-in | Password sign-in (Cloudflare secret `ADMIN_PASSWORD`, 12+ characters; admin is off without it). Stays signed in for 30 days; Sign out button; changing the password signs out every device. 5 wrong passwords from one address → 15-minute wait. Admin changes only accepted from the site itself. | ✅ | Auto |

---

## Where the build differs from the prototype

Small, deliberate differences; each still meets the handoff's intent.

| Area | Prototype | Built site | Why |
| --- | --- | --- | --- |
| Share buttons | Only "Copy link" did anything | Every option opens a real share screen | So sharing actually works |
| Copy link | Closed the sheet at once | Shows "Copied!", then closes | So the confirmation is visible |
| Likes, comments | Lost on page reload | Saved in the Cloudflare D1 database | Real, shared comments and likes |
| Signup | Did nothing | Requires email and consent, then says thanks | Clear feedback; consent captured in the form |
| Home introduction | Mission paragraph in large serif | Purpose as the H1 headline with a "Welcome" label and a short line about Ben | Clearer purpose, especially on mobile (G1, G4) |
| Article text width | 680px | Text-only sections as wide as the text-and-photo rows; header, contents, Q&A and comments 820px | Ben's choice: sections line up edge to edge |
| Desktop photo sections | Photo centred beside the text in a fixed column | Photo at the top of the section with text wrapping around it, then full width below it | Ben's request; also fixed the rail covering text |
| Mobile/desktop switch | JavaScript | CSS | Correct layout before scripts load (ARCHITECTURE decision 6) |

## Testing still to add

1. **Visual snapshot tests:** compare screenshots of each page with an approved version. Worth adding
   once the look and feel settles; until then every design tweak would need new approved screenshots.
2. **Backend tests:** when D1, Turnstile and the newsletter service are built, add tests for saving
   and loading comments and likes, moderation, and signup (with those services faked in tests).
3. **Keyboard tests:** once Esc-to-close and focus handling are added (NFR-04).
