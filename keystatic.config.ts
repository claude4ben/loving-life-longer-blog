import { config, collection, singleton, fields } from '@keystatic/core';
import { block } from '@keystatic/core/content-components';
import { SOCIAL_PLATFORMS, SOCIAL_PLATFORM_IDS } from './src/lib/social';

// Keystatic: the writing screen at /keystatic. It edits the same files the site is built from
// (src/content/), so these settings must match src/content.config.ts.
// Locally (npm run dev) it saves straight to the files; on the live site it saves to GitHub.

const pillar = fields.select({
  label: 'Pillar',
  options: [
    { label: 'Think', value: 'Think' },
    { label: 'Move', value: 'Move' },
    { label: 'Live', value: 'Live' },
  ],
  defaultValue: 'Think',
});

// Crop settings (focus and zoom) are set in the photo crop editor at /admin/photos/, so they're kept
// but not shown here.
const cropKept = fields.ignored();

const articleImage = (label: string, description?: string, isRequired = false) =>
  fields.image({ label, description, directory: 'src/content/blog', publicPath: './', validation: { isRequired } });

const faqs = fields.array(
  fields.object({ q: fields.text({ label: 'Question' }), a: fields.text({ label: 'Answer', multiline: true }) }),
  { label: 'Common questions', description: 'Questions people might search for or ask an AI, answered in a sentence or two.', itemLabel: (p) => p.fields.q.value || 'New question' },
);

// Text with bold, italic, links, headings and lists.
const pageText = (label: string, description?: string) => fields.markdoc({ label, description, extension: 'md' });

export default config({
  storage: import.meta.env.PROD ? { kind: 'github', repo: 'claude4ben/loving-life-longer-blog' } : { kind: 'local' },
  ui: {
    brand: { name: 'Loving Life Longer' },
    navigation: { Articles: ['blog'], Pages: ['home', 'about', 'policy', 'signup', 'links', 'social'] },
  },
  collections: {
    blog: collection({
      label: 'Articles',
      path: 'src/content/blog/*',
      slugField: 'title',
      entryLayout: 'content',
      format: { contentField: 'content' },
      columns: ['title', 'date'],
      schema: {
        title: fields.slug({
          name: { label: 'Title' },
          slug: { label: 'Web address', description: 'The end of the article’s address, e.g. my-new-article. Avoid changing it once published.' },
        }),
        pillar,
        standfirst: fields.text({ label: 'Standfirst', description: 'One or two sentences summing up the article. Shown under the title and on the home page.', multiline: true }),
        date: fields.date({ label: 'Date', description: 'The newest article shows first.', defaultValue: { kind: 'today' }, validation: { isRequired: true } }),
        author: fields.text({ label: 'Author', defaultValue: 'Ben Parker' }),
        disclosure: fields.text({ label: 'Disclosure', description: 'Shown under your name, e.g. “First-person account.”', defaultValue: 'First-person account.' }),
        avatar: articleImage('Byline photo', 'Small round photo next to your name.', true),
        avatarFocus: cropKept,
        avatarZoom: cropKept,
        featured: fields.checkbox({ label: 'Feature on the home page', description: 'The newest featured article shows at the top of the home page.', defaultValue: true }),
        heroImage: articleImage('Top photo', 'Landscape, at least 2000px wide, with the subject in the middle band.', true),
        heroAlt: fields.text({ label: 'Top photo description', description: 'Describe the photo for people who can’t see it (also helps search engines).' }),
        heroCaption: fields.text({ label: 'Top photo caption', description: 'A few words shown over the bottom left of the photo, e.g. “50 dancers. Blindfolded. In the dark.” Recommended for every photo.' }),
        heroFocus: cropKept,
        heroZoom: cropKept,
        faqs,
        linksTitle: fields.text({ label: 'Links heading (optional)', description: 'Leave empty for “Links from this article”.' }),
        links: fields.array(
          fields.object({
            name: fields.text({ label: 'Name of the person, brand or place' }),
            url: fields.url({ label: 'Web address', validation: { isRequired: true } }),
            type: fields.text({ label: 'Type', description: 'e.g. Website, Instagram, YouTube, Podcast, Shop' }),
            description: fields.text({ label: 'What this link offers the reader', multiline: true }),
            icon: articleImage('Round icon (optional)', 'Without one, the first letter is shown.'),
            affiliate: fields.checkbox({ label: 'Affiliate or paid link', description: 'Labelled “Affiliate” and explained under the links.', defaultValue: false }),
          }),
          { label: 'Links from this article', itemLabel: (p) => p.fields.name.value || 'New link' },
        ),
        content: fields.markdoc({
          label: 'Article',
          description: 'Each “Heading 2” starts a new section and appears in the table of contents.',
          extension: 'md',
          components: {
            photo: block({
              label: 'Photo beside this section',
              description: 'Put it straight after a section heading. Text wraps around it on desktop; on phones it shows after the text.',
              schema: {
                src: fields.image({ label: 'Photo', directory: 'src/content/blog', publicPath: './', validation: { isRequired: true } }),
                alt: fields.text({ label: 'Description', description: 'Describe the photo for people who can’t see it.' }),
                side: fields.select({ label: 'Side (desktop)', options: [{ label: 'Right', value: 'right' }, { label: 'Left', value: 'left' }], defaultValue: 'right' }),
                caption: fields.text({ label: 'Caption', description: 'A few words shown over the bottom left of the photo. Recommended for every photo.' }),
                focus: fields.text({ label: 'Focus', description: 'Set it in the photo crop editor (/admin/photos/).', defaultValue: 'center' }),
                zoom: fields.number({ label: 'Zoom', description: 'Set it in the photo crop editor.', defaultValue: 1 }),
              },
            }),
          },
        }),
      },
    }),
  },
  singletons: {
    home: singleton({
      label: 'Home page',
      path: 'src/content/pages/home',
      format: { contentField: 'content' },
      schema: {
        label: fields.text({ label: 'Small label above the headline' }),
        headline: fields.text({ label: 'Headline', description: 'Write {think}, {move} and {live} to show those words in their pillar colours.', multiline: true }),
        faqs,
        content: pageText('Introduction', 'The short line under the headline.'),
      },
    }),
    about: singleton({
      label: 'About page',
      path: 'src/content/pages/about',
      format: { contentField: 'content' },
      schema: {
        heading: fields.text({ label: 'Heading' }),
        photo: fields.image({ label: 'Main photo', directory: 'src/content/pages/about', publicPath: './about/', validation: { isRequired: true } }),
        photoAlt: fields.text({ label: 'Main photo description' }),
        photoFocus: cropKept,
        photoZoom: cropKept,
        placeholderNote: fields.text({ label: 'Placeholder note (delete when the real text is in)' }),
        believeHeading: fields.text({ label: '“What I believe” heading' }),
        pillars: fields.object(
          { Think: fields.text({ label: 'Think', multiline: true }), Move: fields.text({ label: 'Move', multiline: true }), Live: fields.text({ label: 'Live', multiline: true }) },
          { label: 'Pillar cards' },
        ),
        peopleHeading: fields.text({ label: '“People behind it” heading' }),
        people: fields.array(
          fields.object({
            name: fields.text({ label: 'Name' }),
            role: fields.text({ label: 'Role' }),
            photo: fields.image({ label: 'Photo', directory: 'src/content/pages/about', publicPath: './about/', validation: { isRequired: true } }),
            focus: cropKept,
            zoom: cropKept,
          }),
          { label: 'People', itemLabel: (p) => p.fields.name.value || 'New person' },
        ),
        note: fields.object({ title: fields.text({ label: 'Title' }), body: fields.text({ label: 'Text', multiline: true }) }, { label: 'Note on qualifications' }),
        strip: fields.array(
          fields.object({
            src: fields.image({ label: 'Photo', directory: 'src/content/pages/about', publicPath: './about/', validation: { isRequired: true } }),
            alt: fields.text({ label: 'Description' }),
            focus: cropKept,
            zoom: cropKept,
          }),
          { label: 'Photo strip (exactly 3)', validation: { length: { min: 3, max: 3 } }, itemLabel: (p) => p.fields.alt.value || 'Photo' },
        ),
        content: pageText('Bio'),
      },
    }),
    policy: singleton({
      label: 'Policy page',
      path: 'src/content/pages/policy',
      format: { contentField: 'content' },
      schema: {
        title: fields.text({ label: 'Title' }),
        intro: fields.text({ label: 'Intro line' }),
        placeholderNote: fields.text({ label: 'Placeholder note (delete when the real text is in)' }),
        content: pageText('Policies', 'Each “Heading 2” is a section. The comment form links to the “Comments policy” section.'),
      },
    }),
    signup: singleton({
      label: 'Email signup box',
      path: 'src/content/pages/signup',
      schema: {
        title: fields.text({ label: 'Title' }),
        body: fields.text({ label: 'Text', multiline: true }),
        consent: fields.text({ label: 'Consent tick-box text' }),
      },
    }),
    social: singleton({
      label: 'Social media links',
      path: 'src/content/pages/social',
      schema: {
        links: fields.array(
          fields.object({
            platform: fields.select({
              label: 'Platform',
              options: SOCIAL_PLATFORM_IDS.map((id) => ({ label: SOCIAL_PLATFORMS[id].label, value: id })),
              defaultValue: 'instagram',
            }),
            url: fields.url({ label: 'Web address', description: 'e.g. https://www.instagram.com/yourname. For Email, write mailto:you@example.com', validation: { isRequired: true } }),
          }),
          {
            label: 'Social media links',
            description: 'One round icon per link in the footer of every page, in this order. No links = no icons.',
            itemLabel: (p) => SOCIAL_PLATFORMS[p.fields.platform.value as keyof typeof SOCIAL_PLATFORMS]?.label ?? 'Link',
          },
        ),
      },
    }),
    links: singleton({
      label: 'Article links settings',
      path: 'src/content/pages/links',
      schema: {
        title: fields.text({ label: 'Default heading', description: 'Shown above each article’s links.' }),
        affiliateNote: fields.text({ label: 'Affiliate note', description: 'Shown under the links when any are marked Affiliate.', multiline: true }),
      },
    }),
  },
});
