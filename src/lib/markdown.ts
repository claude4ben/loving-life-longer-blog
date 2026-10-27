import { marked } from 'marked';
import Markdoc from '@markdoc/markdoc';
import { renderMarkdoc } from './sections';

// Formatting marks: **bold**, *italic*, [link text](https://...); in main text also "- " bullet lists,
// "1. " numbered lists and "## " headings. Main text is Markdoc (what the Keystatic editor saves).
export const block = (text = '') => renderMarkdoc(Markdoc.parse(text.trim()).children);
// Short text fields (titles, captions, answers).
export const inline = (text = '') => marked.parseInline(text, { async: false });
