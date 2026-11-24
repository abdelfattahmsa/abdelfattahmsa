import { pick } from './content.mjs';
import { u } from './i18n.mjs';

// Arabic-aware matching: drop diacritics and tatweel, fold alef, yaa and taa marbuta variants.
// The browser gets the same rules: the build inserts clientNormalise() into main.js.
const RULES = [
  [/[ً-ٰٟـ]/g, ''],
  [/[أإآ]/g, 'ا'],
  [/ى/g, 'ي'],
  [/ة/g, 'ه'],
];

export const normalise = (s = '') => RULES.reduce((out, [re, to]) => out.replace(re, to), String(s).toLowerCase());

export const clientNormalise = () =>
  `function normalise(s) {\n    return String(s || '').toLowerCase()\n${RULES.map(([re, to]) => `      .replace(${re}, '${to}')`).join('\n')};\n  }`;

export const NORMALISE_MARKER = /\/\* @normalise[^*]*\*\//;

// The search index for one language: { l: type labels, i: items }. Each item is
// t title, s summary, u URL, k type, and the normalised fields matched against
// (a title, b tags, c summary, d start of the text), in order of weight.
export function searchIndex({ lang, site, content, services, T, L }) {
  const items = [];
  const add = (type, url, v, tags = []) =>
    items.push({
      t: v.data.title,
      s: v.data.summary || '',
      u: u(lang, url),
      k: type,
      a: normalise(v.data.title),
      b: normalise((tags || []).join(' ')),
      c: normalise(v.data.summary || ''),
      d: normalise(v.text.slice(0, 3000)),
    });
  const addAll = (type, list) => {
    for (const e of list) {
      const v = pick(e, lang);
      add(type, e.url, v, v.data.tags);
    }
  };

  for (const w of Object.values(content.wikis)) {
    if (w.index) {
      const v = pick(w.index, lang);
      add('wiki', w.base, { ...v, data: { ...v.data, title: L(w.title, lang), summary: L(w.blurb, lang) } });
    }
    addAll('wiki', w.pages);
  }
  addAll('research', content.research);
  addAll('journey', content.journey);
  addAll('guide', content.guides);
  addAll('work', content.work);
  addAll('download', content.downloads);
  add('page', '/about/', pick(content.pages.about, lang));
  const sv = services && (services[lang] || services.en);
  if (sv) {
    add('page', '/services/', { data: { title: sv.title, summary: sv.lead }, text: sv.services.map((x) => `${x.title}. ${x.for} ${x.items.join('. ')}`).join(' ') }, []);
  }
  for (const e of content.career) {
    const v = pick(e, lang);
    add('page', '/about/#timeline', { ...v, data: { ...v.data, title: `${v.data.title}, ${v.data.org}` } }, []);
  }

  const types = ['wiki', 'research', 'journey', 'guide', 'work', 'download', 'page'];
  return { l: Object.fromEntries(types.map((k) => [k, T(lang, 'type.' + k)])), i: items };
}

// The assistant's passages (ask-index.json): for each page, its text cut into short passages of the original wording.
const passages = (text, max = 12, size = 520) => {
  const out = [];
  for (const para of String(text || '').split(/\n+/)) {
    let cur = '';
    for (const sentence of para.split(/(?<=[.!?؟])\s+/)) {
      if ((cur + ' ' + sentence).trim().length > size && cur) { out.push(cur.trim()); cur = sentence; } else cur = (cur + ' ' + sentence).trim();
    }
    if (cur.trim().length > 25) out.push(cur.trim());
  }
  return out.slice(0, max);
};
export function askIndex({ lang, site, content, services, L }) {
  const items = [];
  const add = (k, url, title, text) => {
    const p = passages(text);
    if (p.length) items.push({ t: title, u: u(lang, url), k, p });
  };
  const addAll = (k, list) => list.forEach((e) => { const v = pick(e, lang); add(k, e.url, v.data.title, `${v.data.summary || ''}\n${v.text}`); });
  add('page', '/', L(site.name, lang), `${L(site.name, lang)}, ${L(site.suffix, lang)}. ${L(site.tagline, lang)}. ${L(site.intro, lang)} ${site.person.locality}, ${site.person.country}.`);
  for (const w of Object.values(content.wikis)) {
    if (w.index) add('wiki', w.base, L(w.title, lang), `${L(w.blurb, lang)}\n${pick(w.index, lang).text}`);
    addAll('wiki', w.pages);
  }
  addAll('research', content.research);
  addAll('journey', content.journey);
  addAll('guide', content.guides);
  addAll('work', content.work);
  addAll('download', content.downloads);
  for (const [slug, e] of Object.entries(content.pages)) { const v = pick(e, lang); add('page', slug === 'about' ? '/about/' : `/${slug}/`, v.data.title || slug, v.text); }
  const sv = services && (services[lang] || services.en);
  if (sv) add('page', '/services/', sv.title, [sv.lead, sv.about, ...sv.services.map((x) => `${x.title}. ${x.for} ${x.items.join('. ')}`), ...sv.why, sv.pricing].join('\n'));
  for (const e of content.career) {
    const v = pick(e, lang);
    add('page', '/about/#timeline', `${v.data.title}, ${v.data.org}`, `${v.data.title} at ${v.data.org} (${v.data.period}). ${v.data.summary || ''}\n${v.text}`);
  }
  return { i: items };
}
