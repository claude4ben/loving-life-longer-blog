import { wordCount } from './sections';

// Worked out automatically so there's nothing to type: "1 Jul 2026" and "15 min read".
export const dateLabel = (date: Date) => date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
export const readTime = (body = '') => `${Math.max(1, Math.round(wordCount(body) / 230))} min read`;
