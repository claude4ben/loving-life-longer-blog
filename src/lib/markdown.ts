import { marked } from 'marked';

// Text from Ben's Markdown files. Formatting marks:
//   **bold**   *italic*   [link text](https://...)
//   "- " at the start of a line = bullet list; "1. " = numbered list (main text only)
export const block = (text = '') => marked.parse(text.trim(), { async: false });
export const inline = (text = '') => marked.parseInline(text, { async: false });
