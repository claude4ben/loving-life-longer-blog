// Site-wide settings. Page text lives in Markdown files in src/content/pages/.
export const SITE_NAME = 'Loving Life Longer';

// Until launch, ask search engines and AI crawlers not to list the site (every page gets a "noindex"
// tag and robots.txt blocks crawlers). At launch, change this to false.
export const HIDE_FROM_SEARCH = true;

export const PILLAR_COLORS = { Think: '#3d5a76', Move: '#40763d', Live: '#a15c3e' } as const;
export type Pillar = keyof typeof PILLAR_COLORS;
