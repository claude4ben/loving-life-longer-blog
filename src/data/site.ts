// Site-wide copy and settings. Edit text here.
export const SITE_NAME = 'Loving Life Longer';

export const PILLAR_COLORS = { Think: '#3d5a76', Move: '#40763d', Live: '#a15c3e' } as const;
export type Pillar = keyof typeof PILLAR_COLORS;

export const MISSION =
  "Loving Life Longer is written by Ben — first-person accounts of things he's actually tried in order to think, move, and live better. No credentials, no prescriptions: just what worked, what didn't, and why.";

export const SIGNUP = {
  title: 'Get new pieces by email',
  body: 'Practical, no-noise updates when something new is published. No spam, unsubscribe any time.',
  consent: "I'd like to receive occasional emails. I can unsubscribe any time.",
};

// Placeholder — pending final copy from Ben.
export const PILLARS: { name: Pillar; text: string }[] = [
  { name: 'Think', text: 'Placeholder — how this maps to Think.' },
  { name: 'Move', text: 'Placeholder — how this maps to Move.' },
  { name: 'Live', text: 'Placeholder — how this maps to Live.' },
];

// Sample comments shown until a real comments backend exists.
export const SEED_COMMENTS = [
  { id: 1, name: 'Priya', initials: 'P', time: '2 days ago', text: 'This matches almost exactly what I felt after my first retreat. The hard parts are the part everyone skips over.', replies: [
    { id: 11, name: 'Ben', initials: 'B', time: '2 days ago', text: 'Completely agree — that was the bit I almost cut from the piece.' },
  ]},
  { id: 2, name: 'Tom', initials: 'T', time: '5 days ago', text: 'Which retreat was this? Trying to find something similar closer to home.', replies: [] },
];
