import { marked } from 'marked';

export type Section = { id: string; heading: string; html: string };

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Each "## Heading {#id}" in an article's Markdown starts a new section.
// Section text supports normal Markdown: **bold**, *italic*, "- " bullet lists, "1. " numbered lists, links.
export function splitSections(markdown: string): Section[] {
  return markdown
    .split(/^## /m)
    .slice(1)
    .map((chunk) => {
      const [first, ...rest] = chunk.split('\n');
      const m = first.match(/^(.*?)\s*\{#([\w-]+)\}\s*$/);
      const heading = (m ? m[1] : first).trim();
      const id = m ? m[2] : slugify(heading);
      return { id, heading, html: marked.parse(rest.join('\n').trim(), { async: false }) };
    });
}
