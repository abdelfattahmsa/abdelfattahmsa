import { Marked } from 'marked';
import { esc, slugify, stripTags } from './util.mjs';

const SAFE_URL = /^(https?:|mailto:|\/|#|\.{0,2}\/)/i;

// One Marked instance per document so heading ids stay unique and we can collect a TOC.
export function renderMarkdown(src) {
  const toc = [];
  const seen = new Map();
  const marked = new Marked({
    gfm: true,
    breaks: false,
    renderer: {
      // Raw HTML in Markdown is escaped, never passed through.
      html({ text }) {
        return esc(text);
      },
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens);
        const plain = stripTags(inner);
        let id = slugify(plain);
        const n = seen.get(id) || 0;
        seen.set(id, n + 1);
        if (n) id = `${id}-${n + 1}`;
        if (depth === 2 || depth === 3) toc.push({ depth, id, text: plain });
        return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
      },
      link({ href, title, tokens }) {
        const inner = this.parser.parseInline(tokens);
        if (!SAFE_URL.test(href || '')) return inner;
        const external = /^https?:/i.test(href);
        const t = title ? ` title="${esc(title)}"` : '';
        return `<a href="${esc(href)}"${t}${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${inner}</a>`;
      },
      image({ href, title, text }) {
        if (!SAFE_URL.test(href || '')) return '';
        const t = title ? ` title="${esc(title)}"` : '';
        return `<img src="${esc(href)}" alt="${esc(text)}"${t} loading="lazy" decoding="async">`;
      },
    },
  });
  const html = marked.parse(src);
  return { html, toc, text: stripTags(html) };
}
