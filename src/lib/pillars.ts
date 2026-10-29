import { PILLAR_COLORS, type Pillar } from '../data/site';

// The three pillars and their pages: /think/, /move/, /live/.
export const PILLARS = Object.keys(PILLAR_COLORS) as Pillar[];
export const pillarHref = (p: Pillar) => `/${p.toLowerCase()}/`;
