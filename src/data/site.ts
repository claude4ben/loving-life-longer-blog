// Site-wide settings. Page text lives in Markdown files in src/content/pages/.
export const SITE_NAME = 'Loving Life Longer';

export const PILLAR_COLORS = { Think: '#3d5a76', Move: '#40763d', Live: '#a15c3e' } as const;
export type Pillar = keyof typeof PILLAR_COLORS;

// Sample comments shown until a real comments backend exists.
export const SEED_COMMENTS = [
  { id: 1, name: 'Priya', initials: 'P', time: '2 days ago', text: 'This matches almost exactly what I felt after my first retreat. The hard parts are the part everyone skips over.', replies: [
    { id: 11, name: 'Ben', initials: 'B', time: '2 days ago', text: 'Completely agree — that was the bit I almost cut from the piece.' },
  ]},
  { id: 2, name: 'Tom', initials: 'T', time: '5 days ago', text: 'Which retreat was this? Trying to find something similar closer to home.', replies: [] },
];
