// Every photo the crop editor can adjust, and where its focus/zoom settings live in its Markdown file.
// The save route only accepts these exact places.

import type { CropPlace } from './frontmatter';
import { CONTENT_ROOT } from './content-root';

export type Slot = CropPlace;

const SLUG = /^[a-z0-9][a-z0-9-]*$/;
const ROOT = CONTENT_ROOT.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
const ARTICLE_FILE = new RegExp(`^${ROOT}\\/blog\\/[a-z0-9][\\w-]*\\.md$`);

/** Turn a slot id from the editor (e.g. "hero", "section:mealtime-fun", "strip:2") into its settings place. */
export function slotFor(file: string, id: string): Slot | null {
  const [kind, arg] = id.split(':');
  if (ARTICLE_FILE.test(file)) {
    if (id === 'hero') return { parent: [], focusKey: 'heroFocus', zoomKey: 'heroZoom', anchor: 'heroImage' };
    if (id === 'avatar') return { parent: [], focusKey: 'avatarFocus', zoomKey: 'avatarZoom', anchor: 'avatar' };
    if (kind === 'section' && arg && SLUG.test(arg)) return { section: arg };
    return null;
  }
  if (file === `${CONTENT_ROOT}/pages/about.md`) {
    if (id === 'photo') return { parent: [], focusKey: 'photoFocus', zoomKey: 'photoZoom', anchor: 'photo' };
    const n = Number(arg);
    if (kind === 'person' && Number.isInteger(n) && n >= 0 && n < 20)
      return { parent: ['people', n], focusKey: 'focus', zoomKey: 'zoom', anchor: 'photo' };
    if (kind === 'strip' && Number.isInteger(n) && n >= 0 && n < 3)
      return { parent: ['strip', n], focusKey: 'focus', zoomKey: 'zoom', anchor: 'src' };
  }
  return null;
}

export const ZOOM_MIN = 1;
export const ZOOM_MAX = 3;
export const PERCENT_FOCUS = /^(\d{1,3}(?:\.\d)?)% (\d{1,3}(?:\.\d)?)%$/;
