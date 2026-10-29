# Project instructions

- Read the Purpose, Goals and Key features at the top of docs/REQUIREMENTS.md. Before making a change,
  check it against those goals. If a request could work against a goal (readability, discoverability by
  search engines and AI, engagement, trust), say so in plain language and suggest an alternative, then
  follow Ben's decision.
- Ben's design feedback on an article (layout, photos, spacing, order of sections, effects) applies to
  all articles, now and future, unless he says otherwise. Build it into the shared article page, never
  into one article.
- When Ben asks for any text content (articles, standfirsts, Q&A, captions, link descriptions, page text,
  emails, social posts), read `docs/WRITING-STYLE.md` first and write in his voice. Never invent
  experiences, people or quotes; leave gaps like **[Ben: …]**. After a new article is published, update
  the style guide with anything new it shows.
- Whenever an architecture decision changes, update docs/ARCHITECTURE.md in the same commit.
- `docs/ARCHITECTURE.md` records every architecture decision with simple pros and cons. Whenever a change
  affects the architecture (framework, content storage, styling approach, scripts, backends or services,
  hosting, routing, images, fonts, and so on), update the matching entry or add a new one, and add a
  dated line to its Change log in the same commit.
- `docs/REQUIREMENTS.md` lists every requirement with its status and test coverage. When behaviour or
  design changes, or tests are added, update the matching rows in the same commit.
- All page content (articles, page text, Q&A, signup text) lives in Markdown files (`src/content/blog/`
  and `src/content/pages/`), never hard-coded. Short interface labels (buttons, menu items, form
  placeholders such as "Post comment") are still in the code; move them to Markdown when Ben wants to
  edit them. Keep the README's formatting-marks table accurate.
- When content settings change (src/content.config.ts), update `keystatic.config.ts` to match, with a
  plain-language description on any new field.
- When the content format changes, update the sample copy in `tests/fixtures/content/` too.
- Keep the README's "Where to edit things" table accurate when files move.
- Before pushing any change to code, styles or content, run `npm test` and only push if it passes.
  In a sandbox where Playwright's own browser download isn't available, run
  `PW_CHROMIUM=/opt/pw-browsers/chromium npm test`.
  Add or update tests in `tests/` for new or changed behaviour, and set the Test column in
  docs/REQUIREMENTS.md to match.
