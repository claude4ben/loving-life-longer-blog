# Project instructions

- Read the Purpose, Goals and Key features at the top of docs/REQUIREMENTS.md. Before making a change,
  check it against those goals. If a request could work against a goal (readability, discoverability by
  search engines and AI, engagement, trust), say so in plain language and suggest an alternative, then
  follow Ben's decision.
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
- When article settings change (src/content.config.ts), update `src/content/blog/_template.md` to match
  and explain the new setting there.
- Keep the README's "Where to edit things" table accurate when files move.
- Before pushing any change to code, styles or content, run `npm test` and only push if it passes.
  Add or update tests in `tests/` for new or changed behaviour, and set the Test column in
  docs/REQUIREMENTS.md to match.
