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
export function searchIndex({ lang, site, content, T, L }) {
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
  addAll('download', content.downloads);
  add('page', '/about/', pick(content.pages.about, lang));
  for (const e of content.career) {
    const v = pick(e, lang);
    add('page', '/about/#timeline', { ...v, data: { ...v.data, title: `${v.data.title}, ${v.data.org}` } }, []);
  }

  const types = ['wiki', 'research', 'journey', 'guide', 'download', 'page'];
  return { l: Object.fromEntries(types.map((k) => [k, T(lang, 'type.' + k)])), i: items };
}
