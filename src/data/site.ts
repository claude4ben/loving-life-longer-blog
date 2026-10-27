// Site-wide settings. Page text lives in Markdown files in src/content/pages/.
export const SITE_NAME = 'Loving Life Longer';

export const PILLAR_COLORS = { Think: '#3d5a76', Move: '#40763d', Live: '#a15c3e' } as const;
export type Pillar = keyof typeof PILLAR_COLORS;
