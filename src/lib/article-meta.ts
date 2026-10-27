import { wordCount } from './sections';

// Worked out automatically so there's nothing to type: "Jul 2026" and "15 min read".
export const dateLabel = (date: Date) => date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });
export const readTime = (body = '') => `${Math.max(1, Math.round(wordCount(body) / 230))} min read`;
