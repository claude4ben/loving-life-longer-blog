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
| **Comments** with Ben's replies, plus an **admin panel** to reply to and delete comments | G3, G5 | 🕒 comments only in the reader's browser; 🔨 D1 + admin panel |
| **Likes and sharing** (copy link, email, WhatsApp, X, Facebook, Instagram, Snapchat) | G1, G3 | ✅ sharing; 🕒 likes only in the reader's browser |
| **Email signup** for new pieces | G3, G4 | 🕒 not saved yet; 🔨 newsletter service |
| **About page**: who Ben is, why LLL exists, a note on qualifications | G1 (credibility), G5 | ✅ 📝 bio is placeholder |
| **Policies**: comments, privacy, cookies | G5 | 📝 placeholder text |
| **Easy publishing**: articles as simple text files with **bold** and bullet lists | G2 | ✅ |
| **Links to the wider ecosystem** (podcast, social, festival) | G4 | 🔨 later; footer icons are placeholders |
| **Private until launch** | — | 🔨 |

## Open questions

| Question | Notes |
| --- | --- |
| Should desktop article text stretch almost to the edge? | Requested 2026-10-27. Very long lines (about 125 characters) are harder to read (G2). Options under consideration: keep 680px, widen to about 820px, or full width. |
| What is the comment form's email for? | Today it's collected but not used. Options: reply notifications, newsletter opt-in, or remove it. See the recommendation in the 2026-10-27 discussion. |
| Home page Q&A | Currently repeats the ecstatic dance article's questions. For G1 it should answer questions about LLL itself ("What is Loving Life Longer?", "Who writes it?"). |

## How Claude uses this

Before making a change, Claude checks it against the goals above. If a request could work against a
goal (for example, hurting readability, discoverability or trust), Claude says so, explains why in plain
language, and suggests an alternative, then does what Ben decides.

Note: while the site is private behind Cloudflare Access, search engines and AI tools can't see it, so
the discoverability goal (G1) only starts working at launch.

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

## 2. Home (`/`)

| ID | Requirement | Acceptance criteria | Status | Test |
| --- | --- | --- | --- | --- |
| HOME-01 | Purpose introduction | Small label "Welcome to Loving Life Longer"; the page heading (H1) is LLL's purpose, "Helping you get the most out of your human experience, in how you think, move and live.", with think/move/live in their pillar colours (28px mobile / 40px desktop); then a short line about Ben (Inter 16px mobile / 18px desktop, grey). Divider below. Text is edited in `src/data/site.ts`. | ✅ | Auto |
| HOME-02 | Featured article | Labelled "Latest article". The whole block links to the article. Shows a 16:9 photo (max 300px tall, square corners, no zoom), pillar tag, title as a sub-heading (H2; 36px desktop / 28px mobile), standfirst (18px grey) and read time. | ✅ | Auto |
| HOME-03 | Featured choice | Shows the newest article marked `featured: true` (or the newest article if none are). | ✅ | None |
| HOME-04 | Home FAQ | Collapsed "Common questions" section; opening it shows each question (600 15px) and answer (14px grey). | ✅ 📝 answers | Auto |
| HOME-05 | One-article note | With one article: italic note "Only one article published so far…". | ✅ | Auto |
| HOME-06 | Article list | With two or more articles: the note is replaced by a list of the other articles. | ✅ basic version, not designed yet | None |
| HOME-07 | Signup block | Full signup block (see CMP-04). | ✅ | Auto |

## 3. Article page (`/blog/<slug>/`)

### Layout and content

| ID | Requirement | Acceptance criteria | Status | Test |
| --- | --- | --- | --- | --- |
| ART-01 | Article header | Pillar tag; title Source Serif 4 600 (40px desktop / 28px mobile); standfirst 19px grey. Column 680px desktop / 720px mobile. | ✅ 📝 standfirst | Auto |
| ART-02 | Byline | 44px round avatar; name (600 14px) and disclosure (13px grey); read time and date right-aligned. | ✅ 📝 avatar, disclosure | Auto |
| ART-03 | Hero photo | 16:9, max 300px tall, square corners; edge to edge on mobile. | ✅ 📝 photo | Manual |
| ART-04 | Sections | Each `## Heading` in the article file is a section: H2 Source Serif 4 600 24px; paragraphs 19px desktop / 17px mobile, line height 1.65. | ✅ | Auto |
| ART-05 | Text-only sections | Centred column, 680px desktop / 720px mobile. | ✅ | Manual |
| ART-06 | Photo sections, desktop | Two equal columns, 56px gap, max width 1320px, 96px side padding (keeps text clear of the Like/Share rail); photo column 460px tall and **lined up with the top of the section**, not centred. The photo's side (left/right) comes from the article file. | ✅ 📝 photos | Auto |
| ART-07 | Photo sections, mobile | Text first, then the photo (4:3, max 300px tall, edge to edge). | ✅ 📝 photos | Auto |
| ART-08 | Photo captions | Optional caption over the bottom of the photo: white Source Serif 4 600 20px on a dark fade. Example captions: "50 dancers. Blindfolded. In the dark." and "You're welcome… Feel free." | ✅ | Auto |
| ART-09 | Article FAQ | Grey card with a "COMMON QUESTIONS" label and the article's questions and answers. | ✅ 📝 answers | Auto |
| ART-10 | Article text | Uses the author's draft word for word, typos included, until the author approves corrections. | ✅ | None |
| ART-11 | Bold and lists | In an article file, `**words**` show in bold, lines starting `- ` become a bullet list (green bullets) and lines starting `1. ` a numbered list. | ✅ | Auto |
| ART-12 | Rail never covers text | On desktop, the Like/Share rail never overlaps article text. | ✅ | Auto |

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
| ART-27 | Like | Tapping Like turns ♡ into a green ♥ and adds 1 to the count; tapping again undoes it. | ✅ | Auto |
| ART-28 | Likes are shared | Likes are saved for everyone (not just this browser), one per visitor. | 🕒 saved in this browser only; 🔨 move to D1 | None |
| ART-29 | Comments button | Scrolls to the comments section. | ✅ | Auto |
| ART-30 | Share sheet | Share opens a dimmed background with a white sheet rising from the bottom, "Share this article". Clicking the dimmed area closes it. | ✅ | Auto |
| ART-31 | Copy link | Copies the article address; the label reads "Copied!" briefly. | ✅ | Auto |
| ART-32 | Share targets | Email, WhatsApp and X on all screens; Facebook, Instagram and Snapchat on desktop only. Each opens that service's share screen with the article link. Instagram has no web share, so it copies the link. | ✅ | Auto |

### Comments

| ID | Requirement | Acceptance criteria | Status | Test |
| --- | --- | --- | --- | --- |
| ART-40 | Comment form | Name, "Email (optional, not published)" and "Add a comment" (3 rows) fields; "Policy" link on the left and "Post comment" on the right. | ✅ | Auto |
| ART-41 | Validation | Name and comment are required (spaces alone don't count); email is optional. Nothing posts if a required field is empty. | ✅ | Auto |
| ART-42 | New comment | Appears at the top of the list with the first letter of the name as its avatar and "Just now" as the time. The form clears. | ✅ | Auto |
| ART-43 | Comment list | 36px grey initial circle, name and time on one line, text 15px. Replies indented 48px with 32px circles. Comments 24px apart. | ✅ | Auto |
| ART-44 | Comment count | Heading, mobile bar and desktop rail all show the same count of top-level comments. | ✅ | Auto |
| ART-45 | Comments are shared | Comments are saved for every visitor and need approval before appearing. | 🕒 saved in this browser only; 🔨 move to D1 with moderation | None |
| ART-46 | Comment safety | Text people type is shown as plain text, never run as code. | ✅ | Auto |
| ART-47 | Sample comments | Priya, Tom and Ben's reply are sample data, to be removed once real comments exist. | 🕒 | Auto |
| ART-48 | Signup block | Full signup block below the comments (see CMP-04). | ✅ | Auto |

## 4. About (`/about/`)

| ID | Requirement | Acceptance criteria | Status | Test |
| --- | --- | --- | --- | --- |
| ABOUT-01 | Photo | 4:3, max 420px wide on desktop, max 300px tall, centred; edge to edge on mobile; no zoom. | ✅ 📝 photo | Manual |
| ABOUT-02 | Heading and bio | H1 "I started this because I got tired of my own excuses." (32px), then two bio paragraphs (18px). | ✅ 📝 bio | Auto |
| ABOUT-03 | What I believe | Three pillar cards (Think, Move, Live) in a row on desktop, stacked on mobile; label in the pillar colour. | ✅ 📝 card text | Auto |
| ABOUT-04 | People behind it | Ben ("Writes and runs Loving Life Longer") and Emma ("Occasional contributor — separate brand (link pending)") with 56px round photos. | ✅ 📝 photos, Emma's link | Auto |
| ABOUT-05 | Qualifications note | Dark card: "A note on qualifications" and "I'm not a therapist, doctor, or clinician…". | ✅ | Auto |
| ABOUT-06 | Photo strip | Three square photos; 12px gaps on desktop, no gaps and edge to edge on mobile. | ✅ 📝 photos | Auto |
| ABOUT-07 | Compact signup | Smaller signup block: title, email and Subscribe only (no body text, no checkbox). | ✅ | Auto |

## 5. Policy (`/policy/`)

| ID | Requirement | Acceptance criteria | Status | Test |
| --- | --- | --- | --- | --- |
| POL-01 | Policy page | H1 "Policies" and an intro, then three sections: Comments policy, Data & privacy, Cookies. | ✅ 📝 all text | Auto |
| POL-02 | Deep link | The comment form's Policy link opens the Comments policy section. | ✅ | Auto |
| POL-03 | Real policy text | Covers what's collected (comments, emails), Google Fonts, Cloudflare, the newsletter service, and how to ask for data deletion. | 🔨 | None |

## 6. Shared components

| ID | Requirement | Acceptance criteria | Status | Test |
| --- | --- | --- | --- | --- |
| CMP-01 | Pillar tag | White uppercase Rubik 600 12px label, 4px rounded. Think `#3d5a76`, Move `#40763d`, Live `#a15c3e`. | ✅ | Manual |
| CMP-02 | Primary button | Ink background, white bold text, 6px rounded. Inline size 12px 22px / 15px; full-width size 14px / 16px. | ✅ | Manual |
| CMP-03 | Text fields | 16px text (stops iPhones zooming in), 1px `#d8dcdf` border, 6px rounded. | ✅ | None |
| CMP-04 | Signup block | Grey band: "Get new pieces by email", short body text, email field, consent checkbox ("I'd like to receive occasional emails…") and Subscribe. | ✅ | Auto |
| CMP-05 | Signup validation | A valid email and the consent tick are required before submitting. | ✅ | Auto |
| CMP-06 | Signup result | After submitting, the form is replaced by "Thanks — you're on the list." | 🕒 address is **not saved** | Auto |
| CMP-07 | Signup saved | Address sent to the newsletter service with double opt-in and a record of consent (fallback: saved in D1). | 🔨 | None |

## 7. Content and editing

| ID | Requirement | Acceptance criteria | Status | Test |
| --- | --- | --- | --- | --- |
| CON-01 | Articles as files | Each article is one Markdown file in `src/content/blog/`; the file name is its web address. | ✅ | Build |
| CON-02 | Article settings checked | Title, pillar (Think/Move/Live only), standfirst, date, photos and FAQ are checked; a mistake stops the build. | ✅ | Build |
| CON-03 | Section photos | A photo is attached to a section by its `{#id}`, with side and optional caption. | ✅ | None |
| CON-04 | Shared text in one place | Mission line, signup text, pillar cards and colours are edited in `src/data/site.ts`. | ✅ | None |
| CON-05 | Real photos | All picsum.photos placeholders replaced with real photos: Home hero, article hero, three section photos, byline avatar, About photo, Ben and Emma avatars, three strip photos. | 🔨 | None |
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
| OPS-04 | Private until launch | Only allowed email addresses can open the site (main address and previews); everyone else sees a Cloudflare sign-in page. Removed at launch. | 🔨 (steps given; not yet confirmed) | None |
| OPS-03 | Moderation admin | A private view to approve, delete and reply to comments. | 🔨 | None |

---

## Where the build differs from the prototype

Small, deliberate differences; each still meets the handoff's intent.

| Area | Prototype | Built site | Why |
| --- | --- | --- | --- |
| Share buttons | Only "Copy link" did anything | Every option opens a real share screen | So sharing actually works |
| Copy link | Closed the sheet at once | Shows "Copied!", then closes | So the confirmation is visible |
| Likes, comments | Lost on page reload | Kept in the visitor's browser | Closer to the real behaviour until D1 is built |
| Signup | Did nothing | Requires email and consent, then says thanks | Clear feedback; consent captured in the form |
| Home introduction | Mission paragraph in large serif | Purpose as the H1 headline with a "Welcome" label and a short line about Ben | Clearer purpose, especially on mobile (G1, G4) |
| Desktop photo sections | Photo centred beside the text | Photo lined up with the top of the section; wider side padding | Ben's request; the rail was covering text |
| Mobile/desktop switch | JavaScript | CSS | Correct layout before scripts load (ARCHITECTURE decision 6) |

## Testing still to add

1. **Visual snapshot tests:** compare screenshots of each page with an approved version. Worth adding
   once the look and feel settles; until then every design tweak would need new approved screenshots.
2. **Backend tests:** when D1, Turnstile and the newsletter service are built, add tests for saving
   and loading comments and likes, moderation, and signup (with those services faked in tests).
3. **Keyboard tests:** once Esc-to-close and focus handling are added (NFR-04).
