import { test, expect } from '@playwright/test';
import { splitSections, slugify } from '../src/lib/sections';

// How article text (Markdoc, as saved by the Keystatic editor) is turned into sections.
test.describe('Article text', () => {
  test('each "## Heading" starts a section with an id made from the heading', () => {
    const s = splitSections('intro ignored\n\n## Mealtime fun\n\nHello\n\n## Sharing is Caring\n\nWorld');
    expect(s.map((x) => [x.id, x.heading])).toEqual([['mealtime-fun', 'Mealtime fun'], ['sharing-is-caring', 'Sharing is Caring']]);
    expect(slugify('Using Grass to do Yoga – Final day')).toBe('using-grass-to-do-yoga-final-day');
  });

  test('two headings with the same text get different ids', () => {
    expect(splitSections('## Notes\n\na\n\n## Notes\n\nb').map((x) => x.id)).toEqual(['notes', 'notes-2']);
  });

  test('**bold** becomes bold text; "- " lines become bullets; "1. " lines a numbered list', () => {
    const html = splitSections('## A\n\nThe **main event** began.\n\n- Breathe\n- Shake\n\n1. One\n2. Two')[0].html;
    expect(html).toContain('<strong>main event</strong>');
    expect(html).toMatch(/<ul>\s*<li>Breathe<\/li>\s*<li>Shake<\/li>\s*<\/ul>/);
    expect(html).toMatch(/<ol>\s*<li>One<\/li>\s*<li>Two<\/li>\s*<\/ol>/);
    expect(html).not.toContain('<article>');
  });

  test('a {% photo %} block becomes the section photo and is not shown as text', () => {
    const [s] = splitSections('## Dancing\n\n{% photo src="./a/b.jpg" alt="Dancers" side="left" caption="In the dark." focus="50% 30%" zoom=1.5 /%}\n\nText.');
    expect(s.photo).toEqual({ src: './a/b.jpg', alt: 'Dancers', side: 'left', caption: 'In the dark.', focus: '50% 30%', zoom: 1.5 });
    expect(s.html).toBe('<p>Text.</p>');
  });

  test('photo blocks fall back to sensible defaults', () => {
    const [s] = splitSections('## A\n\n{% photo src="./x.jpg" /%}');
    expect(s.photo).toEqual({ src: './x.jpg', alt: '', side: 'right', caption: undefined, focus: 'center', zoom: 1 });
  });

  test('raw HTML typed into the text is shown as text, not run', () => {
    expect(splitSections('## A\n\n<script>alert(1)</script>')[0].html).not.toContain('<script>');
  });
});
