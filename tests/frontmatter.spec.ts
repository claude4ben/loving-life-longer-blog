import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { applyCropEdits } from '../src/lib/frontmatter';
import { slotFor } from '../src/lib/photo-slots';

const ARTICLE = 'src/content/blog/blindfolded-with-50-strangers.md';
// Reads the frozen sample content (the real content changes whenever Ben edits it).
const read = (f: string) => fs.readFileSync(f.replace(/^src\/content\//, 'tests/fixtures/content/'), 'utf8');
const diff = (a: string, b: string) => {
  const x = a.split('\n'), y = b.split('\n');
  return { removed: x.filter((l) => !y.includes(l)), added: y.filter((l) => !x.includes(l)) };
};

// The crop editor's file edits: only the photo's own settings change; everything else stays identical.
test.describe('Saving a photo crop into a Markdown file', () => {
  test('changes an existing focus and adds a zoom line right after it', () => {
    const before = read(ARTICLE);
    const after = applyCropEdits(before, [{ ...slotFor(ARTICLE, 'hero')!, focus: '40% 25%', zoom: 1.5 }]);
    expect(diff(before, after)).toEqual({ removed: ['heroFocus: center'], added: ['heroFocus: "40% 25%"', 'heroZoom: 1.5'] });
    expect(after).toContain('heroFocus: "40% 25%"\nheroZoom: 1.5\n');
  });

  test('section photos: edits only that photo block in the text', () => {
    const before = read(ARTICLE);
    const after = applyCropEdits(before, [{ ...slotFor(ARTICLE, 'section:dancing-in-the-dark')!, focus: '50% 80%', zoom: 2 }]);
    const changed = diff(before, after);
    expect(changed.removed).toHaveLength(1);
    expect(changed.removed[0]).toContain('trance-dance.jpg');
    expect(changed.added).toEqual([changed.removed[0].replace('focus="center"', 'focus="50% 80%"').replace('zoom=1 ', 'zoom=2 ')]);
  });

  test('adds focus and zoom to a photo block that has neither', () => {
    const md = '---\ntitle: x\n---\n## A\n\n{% photo src="./a.jpg" alt="b" /%}\n\nText.\n';
    const after = applyCropEdits(md, [{ section: 'a', focus: '10% 20%', zoom: 1.3 }]);
    expect(after).toContain('{% photo src="./a.jpg" alt="b" focus="10% 20%" zoom=1.3 /%}');
  });

  test('adds focus and zoom when a photo has neither (byline photo)', () => {
    const before = read(ARTICLE);
    const after = applyCropEdits(before, [{ ...slotFor(ARTICLE, 'avatar')!, focus: '50% 20%', zoom: 1.2 }]);
    expect(after).toMatch(/avatar: \.\/blindfolded-with-50-strangers\/ben-byline\.jpg\navatarFocus: "50% 20%"\navatarZoom: 1\.2\n/);
  });

  test('About page: list items keep their indentation', () => {
    const file = 'src/content/pages/about.md';
    const after = applyCropEdits(read(file), [{ ...slotFor(file, 'strip:1')!, focus: '10% 90%', zoom: 1.25 }]);
    expect(after).toContain('  - src: ./about/strip-2.jpg\n    alt: ""\n    focus: "10% 90%"\n    zoom: 1.25\n');
  });

  test('saving twice updates in place instead of adding duplicate lines', () => {
    const slot = slotFor(ARTICLE, 'hero')!;
    const once = applyCropEdits(read(ARTICLE), [{ ...slot, focus: '40% 25%', zoom: 1.5 }]);
    const twice = applyCropEdits(once, [{ ...slot, focus: '60% 35%', zoom: 1.1 }]);
    expect(twice.match(/heroZoom/g)).toHaveLength(1);
    expect(twice).toContain('heroFocus: "60% 35%"\nheroZoom: 1.1\n');
  });

  test('only known photo places in content files are allowed', () => {
    expect(slotFor(ARTICLE, 'hero')).not.toBeNull();
    expect(slotFor('src/content/pages/about.md', 'person:0')).not.toBeNull();
    expect(slotFor('src/content/blog/../../../wrangler.toml', 'hero')).toBeNull();
    expect(slotFor('package.json', 'hero')).toBeNull();
    expect(slotFor(ARTICLE, 'title')).toBeNull();
    expect(slotFor(ARTICLE, 'section:../x')).toBeNull();
    expect(slotFor(ARTICLE, 'section:mealtime-fun')).toEqual({ section: 'mealtime-fun' });
    expect(slotFor('src/content/pages/about.md', 'strip:7')).toBeNull();
  });
});
