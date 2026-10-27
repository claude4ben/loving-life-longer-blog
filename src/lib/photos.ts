// Photo "focus": which part of a photo stays in view when a frame crops it.
// Ben writes plain words in the article settings: center, top, bottom, left, right, or two of them
// ("top left"), or exact percentages across and down ("50% 30%").

const WORDS: Record<string, [x?: string, y?: string]> = {
  center: [], centre: [], middle: [],
  top: [undefined, '0%'], bottom: [undefined, '100%'],
  left: ['0%'], right: ['100%'],
};

export const FOCUS_PATTERN = /^\s*(?:(?:center|centre|middle|top|bottom|left|right)(?:\s+(?:center|centre|middle|top|bottom|left|right))?|\d{1,3}%\s+\d{1,3}%)\s*$/i;
export const FOCUS_HELP = 'Use center, top, bottom, left, right, two of those (e.g. "top left"), or percentages like "50% 30%".';

/** Turn Ben's focus words into a CSS object-position value. */
export function focusPosition(focus = 'center'): string {
  const f = focus.trim().toLowerCase();
  if (/^\d{1,3}%\s+\d{1,3}%$/.test(f)) return f.replace(/\s+/, ' ');
  let x = '50%', y = '50%';
  for (const w of f.split(/\s+/)) {
    const [wx, wy] = WORDS[w] ?? [];
    if (wx) x = wx;
    if (wy) y = wy;
  }
  return `${x} ${y}`;
}
