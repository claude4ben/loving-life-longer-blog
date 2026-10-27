---
# ARTICLE TEMPLATE
# To start a new article:
#   1. Copy this file and rename it, e.g. "my-new-article.md". The name becomes the web address:
#      /blog/my-new-article/  (lowercase, words joined with "-").
#   2. Make a folder with the SAME name next to it, e.g. "my-new-article/", and upload your photos there.
#   3. Fill in the settings below, then write the article under the second "---" line.
#   4. Commit. The site checks everything and goes live in about 2 minutes. If something is wrong,
#      the build stops and the live site keeps the previous version.
#
# Text settings: **bold**, *italic* and [links](https://example.com) work. Keep quotes around text.
# Photo "focus" (which part stays in view when cropped): center, top, bottom, left, right,
# two together like "top left", or "50% 30%" (across, then down). Check crops at /admin/photos/.

title: "Your article title"
pillar: Think                     # Think, Move or Live
standfirst: "One or two sentences that sum the article up. Shown under the title and on the home page."
date: 2026-11-01                  # year-month-day; the newest article shows first
dateLabel: "Nov 2026"             # how the date is shown
readTime: "8 min read"
author: "Ben Parker"
disclosure: "First-person account."
avatar: ./_template/ben.jpg       # small round photo next to your name
featured: true                    # true = show at the top of the home page (newest featured wins)

heroImage: ./_template/hero.jpg   # top photo: landscape, 2000px+ wide, subject in the middle band
heroAlt: "Describe the photo for people who can't see it"
heroFocus: center

# Questions people might search for or ask an AI, answered in a sentence or two.
faqs:
  - q: "A question readers ask?"
    a: "A short, direct answer."

# Photos beside a section. The name before ":" is the section's id, written after its heading
# below like {#first-section}. side: left or right. caption is optional.
sectionImages:
  first-section:
    src: ./_template/section-photo.jpg
    alt: "Describe the photo"
    focus: center
    side: right
    caption: "An optional short caption over the photo."

# Links shown after the article: websites, social accounts, people, shops.
# icon is optional (a small round picture; without one, the first letter is shown).
# Mark paid or affiliate links with "affiliate: true" so they're labelled and explained.
# linksTitle: "Where to find out more"    # optional: replaces "Links from this article"
links:
  - name: "Name of the person, brand or place"
    url: "https://example.com"
    type: Website                 # e.g. Website, Instagram, YouTube, Podcast, Shop
    icon: ./_template/link-icon.jpg
    description: "One line on what this link offers the reader."
  - name: "A product you recommend"
    url: "https://example.com/product"
    type: Shop
    affiliate: true
    description: "Why it's useful."
---

## Your first section heading {#first-section}

Write normally. Leave a blank line between paragraphs.

Use **bold** for key phrases. Start lines with "- " for bullet points:

- First point
- Second point

## Another section {#another-section}

Each "## " heading starts a new section and appears in the table of contents.
