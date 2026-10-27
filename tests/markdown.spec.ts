import { test, expect } from '@playwright/test';
import { block, inline } from '../src/lib/markdown';

// Formatting marks Ben can use in any Markdown file.
test.describe('Formatting marks', () => {
  test('**bold**, *italic* and links work in short text fields', () => {
    expect(inline('A **big** and *small* [link](https://example.com)')).toBe(
      'A <strong>big</strong> and <em>small</em> <a href="https://example.com">link</a>',
    );
  });

  test('main text: paragraphs, bullets and numbered lists', () => {
    const html = block('First para.\n\n- One\n- Two\n\n1. A\n2. B');
    expect(html).toContain('<p>First para.</p>');
    expect(html).toMatch(/<ul>\s*<li>One<\/li>\s*<li>Two<\/li>\s*<\/ul>/);
    expect(html).toMatch(/<ol>\s*<li>A<\/li>\s*<li>B<\/li>\s*<\/ol>/);
  });
});
