import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { renderMarkdown } from './markdown.mjs';
import { humanSize } from './util.mjs';
import { contentDir, srcFileFor } from './paths.mjs';
import { DEFAULT_LANG, parseContentFile } from './i18n.mjs';

// A wiki's landing text: src/content/wiki/<id>/_index.md
export const INDEX_SLUG = '_index';

// Every content collection, keyed by the id the admin also uses.
//   dir        folder under src/content
//   base       URL of its pages (collections without one have no pages of their own)
//   dateField  front-matter field that dates an item (default "date")
//   order      "date" (newest first, the default) or "position" (front-matter "order", then title)
//   index      has an _index landing text
export function collections(site) {
  const wikis = site.wikis.map((w) => [
    `wiki-${w.id}`,
    { dir: `wiki/${w.id}`, base: `/hub/${w.id}/`, dateField: 'updated', order: 'position', index: true },
  ]);
  return {
    downloads: { dir: 'downloads', base: '/resources/downloads/' },
    guides: { dir: 'guides', base: '/resources/guides/' },
    journey: { dir: 'journey', base: '/hub/journey/' },
    research: { dir: 'research', base: '/hub/research/' },
    career: { dir: 'career', dateField: 'start' },
    ...Object.fromEntries(wikis),
    pages: { dir: 'pages' },
  };
}

// draft: true hides an item from the published site (npm run dev still shows it).
// status: draft keeps it published but marked as work in progress. Both show a Draft badge.
export const isHidden = (data) => data.draft === true;
export const isDraft = (data) => data.draft === true || data.status === 'draft';

export const dateOf = (v) => {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

function parseFile(file) {
  const { data, content } = matter(fs.readFileSync(file, 'utf8'));
  const { html, toc, text } = renderMarkdown(content);
  const words = text.split(/\s+/).filter(Boolean).length;
  return { data, html, toc, text, readMin: Math.max(1, Math.round(words / 200)) };
}

const byDate = (a, b) => (b.date || 0) - (a.date || 0);
const byPosition = (a, b) => a.order - b.order || String(a.data.title).localeCompare(String(b.data.title));

// Items of one collection, each { slug, url, data, date, order, variants: { <lang>: parsed file } },
// plus its _index entry for collections that have one.
function loadCollection(c, { drafts }) {
  const dir = path.join(contentDir, c.dir);
  const bySlug = new Map();
  for (const f of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
    const name = parseContentFile(f);
    if (!name) continue;
    const entry = bySlug.get(name.slug) || { slug: name.slug, variants: {} };
    entry.variants[name.lang] = parseFile(path.join(dir, f));
    bySlug.set(name.slug, entry);
  }
  const items = [];
  let index = null;
  for (const entry of bySlug.values()) {
    const main = entry.variants[DEFAULT_LANG];
    if (!main) {
      console.warn(`! ${dir}/${entry.slug}: missing English version, skipped`);
      continue;
    }
    entry.data = main.data;
    entry.date = dateOf(main.data[c.dateField || 'date']);
    entry.order = typeof main.data.order === 'number' ? main.data.order : 999;
    if (c.index && entry.slug === INDEX_SLUG) index = entry;
    else if (drafts || !isHidden(entry.data)) {
      entry.url = c.base ? `${c.base}${entry.slug}/` : null;
      items.push(entry);
    }
  }
  items.sort(c.order === 'position' ? byPosition : byDate);
  return { items, index };
}

// The requested language, falling back to English. Fields shared by all languages
// (category, file, draft, order…) live on the English file; a translation overrides what it defines.
export function pick(item, lang) {
  const main = item.variants[DEFAULT_LANG];
  const v = item.variants[lang];
  if (v) return { ...v, data: { ...main.data, ...v.data }, lang, untranslated: false };
  return { ...main, lang: DEFAULT_LANG, untranslated: true };
}

export function loadAll(site, { drafts = false } = {}) {
  const all = collections(site);
  const load = (id) => loadCollection(all[id], { drafts }).items;
  const downloads = load('downloads');
  for (const dl of downloads) {
    const f = dl.data.file;
    dl.fileInfo = null;
    if (!f) continue;
    const p = srcFileFor(f);
    if (fs.existsSync(p)) dl.fileInfo = { size: humanSize(fs.statSync(p).size), ext: path.extname(p).slice(1).toUpperCase() };
    else console.warn(`! download "${dl.slug}" points to a missing file: ${f}`);
  }
  return {
    wikis: Object.fromEntries(site.wikis.map((w) => {
      const { items, index } = loadCollection(all[`wiki-${w.id}`], { drafts });
      return [w.id, { ...w, base: all[`wiki-${w.id}`].base, index, pages: items }];
    })),
    research: load('research'),
    journey: load('journey'),
    guides: load('guides'),
    downloads,
    career: load('career'),
    pages: Object.fromEntries(load('pages').map((p) => [p.slug, p])),
  };
}
