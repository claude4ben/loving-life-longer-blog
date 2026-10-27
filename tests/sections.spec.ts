import { test, expect } from '@playwright/test';
import { splitSections } from '../src/lib/sections';

// Checks how article Markdown is turned into sections (no browser needed).
test.describe('Article Markdown', () => {
  test('splits on ## headings and reads {#id}', () => {
    const s = splitSections('intro ignored\n\n## First {#one}\n\nHello\n\n## Second heading\n\nWorld');
    expect(s.map((x) => [x.id, x.heading])).toEqual([['one', 'First'], ['second-heading', 'Second heading']]);
  });

  test('**bold** becomes bold text', () => {
    expect(splitSections('## A\n\nThe **main event** began.')[0].html).toContain('<strong>main event</strong>');
  });

  test('"- " lines become a bullet list and "1. " lines a numbered list', () => {
    const html = splitSections('## A\n\nPrep:\n\n- Breathe\n- Shake\n\n1. One\n2. Two')[0].html;
    expect(html).toMatch(/<ul>\s*<li>Breathe<\/li>\s*<li>Shake<\/li>\s*<\/ul>/);
    expect(html).toMatch(/<ol>\s*<li>One<\/li>\s*<li>Two<\/li>\s*<\/ol>/);
  });
});
