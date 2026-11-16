// The site's languages. English is the default: its pages live at the root, its content files
// are "name.md", and every other language falls back to it.
const LANG = {
  en: { dir: 'ltr', prefix: '', dateLocale: 'en-GB', ogLocale: 'en_GB', fontSubset: 'latin' },
  ar: { dir: 'rtl', prefix: '/ar', dateLocale: 'ar-EG-u-nu-latn', ogLocale: 'ar_EG', fontSubset: 'arabic' },
};
export const LANGS = Object.keys(LANG);
export const DEFAULT_LANG = 'en';

export const langInfo = (lang) => LANG[lang];
export const otherLang = (lang) => LANGS.find((l) => l !== lang);
export const u = (lang, p) => LANG[lang].prefix + p;

// "name.md" is the default language, "name.<lang>.md" a translation.
export const contentFile = (slug, lang) => `${slug}${lang === DEFAULT_LANG ? '' : '.' + lang}.md`;
const FILE_RE = new RegExp(`^(.+?)(?:\\.(${LANGS.filter((l) => l !== DEFAULT_LANG).join('|')}))?\\.md$`);
export function parseContentFile(name) {
  const m = name.match(FILE_RE);
  return m ? { slug: m[1], lang: m[2] || DEFAULT_LANG } : null;
}

// UI strings (src/data/i18n/<lang>.json) and per-language values in site.json ({ en, ar }).
export function translator(strings) {
  const T = (lang, key) => strings[lang][key] ?? strings[DEFAULT_LANG][key] ?? key;
  const L = (obj, lang) => (obj && (obj[lang] ?? obj[DEFAULT_LANG])) || '';
  return { T, L };
}
