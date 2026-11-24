// RSS 2.0 feed per language: notes (journey), guides, research and case studies, newest first.
import { pick } from './content.mjs';
import { u } from './i18n.mjs';
import { esc } from './util.mjs';

export function feedXml({ lang, site, content, L }) {
  const entries = [...content.journey, ...content.guides, ...content.research, ...content.work].filter((e) => e.date);
  entries.sort((a, b) => b.date - a.date);
  const items = entries.slice(0, 30).map((e) => {
    const v = pick(e, lang);
    const link = site.url + u(lang, e.url);
    return `<item><title>${esc(v.data.title)}</title><link>${link}</link><guid isPermaLink="true">${link}</guid><pubDate>${e.date.toUTCString()}</pubDate><description>${esc(v.data.summary || '')}</description></item>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${esc(L(site.short, lang))}</title><link>${site.url}${u(lang, '/')}</link><description>${esc(L(site.intro, lang))}</description><language>${lang}</language>${items.join('')}</channel></rss>\n`;
}
