import Markdoc, { type Node } from '@markdoc/markdoc';

// Turns an article's text (Markdoc, the format the Keystatic editor saves) into sections.
// Each "## Heading" starts a section; its id comes from the heading text (e.g. "Mealtime fun" → mealtime-fun).
// A {% photo … /%} block in a section becomes that section's photo (text wraps around it on desktop).

export type SectionPhoto = { src: string; alt: string; side: 'left' | 'right'; caption?: string; focus: string; zoom: number };
export type Section = { id: string; heading: string; html: string; photo?: SectionPhoto };

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const textOf = (node: Node): string =>
  node.type === 'text' ? String(node.attributes.content ?? '') : node.children.map(textOf).join('');

/** Markdoc text → HTML (bold, italic, links, lists, headings). Any {% photo %} blocks are left out. */
export function renderMarkdoc(nodes: Node[]): string {
  const kept = nodes.filter((n) => !(n.type === 'tag' && n.tag === 'photo'));
  return Markdoc.renderers.html(Markdoc.transform(kept));
}

export function splitSections(source: string): Section[] {
  const doc = Markdoc.parse(source);
  const sections: (Omit<Section, 'html'> & { nodes: Node[] })[] = [];
  const used = new Set<string>();
  for (const node of doc.children) {
    if (node.type === 'heading' && node.attributes.level === 2) {
      const heading = textOf(node).trim();
      let id = slugify(heading) || 'section';
      for (let n = 2; used.has(id); n++) id = `${slugify(heading)}-${n}`;
      used.add(id);
      sections.push({ id, heading, nodes: [] });
      continue;
    }
    const current = sections[sections.length - 1];
    if (!current) continue; // text before the first heading isn't part of a section
    if (node.type === 'tag' && node.tag === 'photo' && !current.photo) {
      const a = node.attributes;
      current.photo = {
        src: String(a.src ?? ''),
        alt: String(a.alt ?? ''),
        side: a.side === 'left' ? 'left' : 'right',
        caption: a.caption ? String(a.caption) : undefined,
        focus: String(a.focus || 'center'),
        zoom: Number(a.zoom) >= 1 && Number(a.zoom) <= 3 ? Number(a.zoom) : 1,
      };
    }
    current.nodes.push(node);
  }
  return sections.map(({ nodes, ...s }) => ({ ...s, html: renderMarkdoc(nodes) }));
}

/** Words in the article, for the read time. */
export function wordCount(source: string): number {
  return textOf(Markdoc.parse(source)).split(/\s+/).filter(Boolean).length;
}
