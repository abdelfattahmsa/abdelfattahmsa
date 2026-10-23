import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { renderMarkdown } from './markdown.mjs';
import { humanSize } from './util.mjs';

const LANGS = ['en', 'ar'];

// "name.md" is English, "name.ar.md" is Arabic.
function parseFile(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  const { html, toc, text } = renderMarkdown(content);
  const words = text.split(/\s+/).filter(Boolean).length;
  return { data, html, toc, text, readMin: Math.max(1, Math.round(words / 200)) };
}

function dateOf(v) {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function loadCollection(dir, { drafts = false } = {}) {
  if (!fs.existsSync(dir)) return [];
  const bySlug = new Map();
  for (const f of fs.readdirSync(dir)) {
    const m = f.match(/^(.+?)(?:\.(ar))?\.md$/);
    if (!m) continue;
    const [, slug, ar] = m;
    const lang = ar || 'en';
    const entry = bySlug.get(slug) || { slug, variants: {} };
    entry.variants[lang] = parseFile(path.join(dir, f));
    bySlug.set(slug, entry);
  }
  const items = [];
  for (const entry of bySlug.values()) {
    const en = entry.variants.en;
    if (!en) {
      console.warn(`! ${dir}/${entry.slug}: missing English version, skipped`);
      continue;
    }
    const d = en.data;
    if (d.draft === true && !drafts) continue;
    entry.data = d;
    entry.date = dateOf(d.date) || dateOf(d.start) || dateOf(d.updated);
    entry.order = typeof d.order === 'number' ? d.order : 999;
    items.push(entry);
  }
  return items;
}

// Pick the requested language, falling back to English.
// Shared fields (category, file, draft, order…) live on the English file; Arabic overrides what it defines.
export function pick(item, lang) {
  const en = item.variants.en;
  const v = item.variants[lang];
  if (v) return { ...v, data: { ...en.data, ...v.data }, lang, untranslated: false };
  return { ...en, lang: 'en', untranslated: true };
}

export function loadAll(root, { drafts = false } = {}) {
  const c = path.join(root, 'src/content');
  const wikiDir = path.join(c, 'wiki');
  const wikis = {};
  for (const id of fs.existsSync(wikiDir) ? fs.readdirSync(wikiDir) : []) {
    const dir = path.join(wikiDir, id);
    if (!fs.statSync(dir).isDirectory()) continue;
    const all = loadCollection(dir, { drafts: true });
    const index = all.find((p) => p.slug === '_index') || null;
    const pages = all
      .filter((p) => p.slug !== '_index')
      .filter((p) => drafts || p.data.draft !== true)
      .sort((a, b) => a.order - b.order || String(a.data.title).localeCompare(String(b.data.title)));
    wikis[id] = { index, pages };
  }
  const downloads = loadCollection(path.join(c, 'downloads'), { drafts }).sort((a, b) => (b.date || 0) - (a.date || 0));
  for (const dl of downloads) {
    const f = dl.data.file;
    dl.fileInfo = null;
    if (f) {
      const p = path.join(root, 'src', String(f).replace(/^\//, ''));
      if (fs.existsSync(p)) dl.fileInfo = { size: humanSize(fs.statSync(p).size), ext: path.extname(p).slice(1).toUpperCase() };
      else console.warn(`! download "${dl.slug}" points to a missing file: ${f}`);
    }
  }
  return {
    wikis,
    research: loadCollection(path.join(c, 'research'), { drafts }).sort((a, b) => (b.date || 0) - (a.date || 0)),
    journey: loadCollection(path.join(c, 'journey'), { drafts }).sort((a, b) => (b.date || 0) - (a.date || 0)),
    guides: loadCollection(path.join(c, 'guides'), { drafts }).sort((a, b) => (b.date || 0) - (a.date || 0)),
    downloads,
    career: loadCollection(path.join(c, 'career'), { drafts }).sort((a, b) => (b.date || 0) - (a.date || 0)),
    pages: Object.fromEntries(loadCollection(path.join(c, 'pages'), { drafts }).map((p) => [p.slug, p])),
  };
}

export { LANGS };
