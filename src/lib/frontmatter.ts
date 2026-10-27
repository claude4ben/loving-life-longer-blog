// Small, exact edits to the settings at the top of a Markdown file (used by the photo crop editor).
// Only the value being changed is rewritten (or one new line added), so Ben's comments, quotes and
// layout are left exactly as they were.

import { isMap, isScalar, parseDocument, type YAMLMap } from 'yaml';

type Path = (string | number)[];

const split = (markdown: string) => {
  const m = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) throw new Error('This file has no settings block.');
  return { fm: m[1], rest: markdown.slice(m[0].length) };
};

/** Set one setting in `parent` to `text` (already formatted), adding a line after `anchor` if it's missing. */
function setValue(fm: string, parent: Path, key: string, text: string, anchor: string): string {
  const doc = parseDocument(fm, { keepSourceTokens: true });
  const map = (parent.length ? doc.getIn(parent, true) : doc.contents) as YAMLMap | null;
  if (!isMap(map)) throw new Error(`Couldn't find ${parent.join(' → ') || 'the settings'} in this file.`);
  const keyOf = (p: { key: unknown }) => (isScalar(p.key) ? p.key.value : p.key);

  const pair = map.items.find((p) => keyOf(p) === key);
  if (pair && isScalar(pair.value) && pair.value.range) {
    const [start, end] = pair.value.range;
    return fm.slice(0, start) + text + fm.slice(end);
  }
  const before = map.items.find((p) => keyOf(p) === anchor);
  if (!before || !isScalar(before.key) || !before.key.range || !isScalar(before.value) || !before.value.range)
    throw new Error(`Couldn't find "${anchor}" to place the new "${key}" setting next to.`);
  const keyStart = before.key.range[0];
  const indent = keyStart - (fm.lastIndexOf('\n', keyStart - 1) + 1);
  const lineEnd = fm.indexOf('\n', before.value.range[1]);
  const at = lineEnd === -1 ? fm.length : lineEnd;
  return `${fm.slice(0, at)}\n${' '.repeat(indent)}${key}: ${text}${fm.slice(at)}`;
}

export type CropEdit = {
  parent: Path; // where the photo's settings live, e.g. [] or ['sectionImages', 'mealtime-fun']
  focusKey: string; // e.g. 'heroFocus' or 'focus'
  zoomKey: string; // e.g. 'heroZoom' or 'zoom'
  anchor: string; // the photo's own setting, e.g. 'heroImage' or 'src'
  focus: string; // "50% 30%"
  zoom: number; // 1 to 3
};

export function applyCropEdits(markdown: string, edits: CropEdit[]): string {
  let { fm, rest } = split(markdown);
  for (const e of edits) {
    fm = setValue(fm, e.parent, e.focusKey, `"${e.focus}"`, e.anchor);
    fm = setValue(fm, e.parent, e.zoomKey, String(e.zoom), e.focusKey);
  }
  return `---\n${fm}\n---\n${rest}`;
}
