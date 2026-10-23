import { esc, normalise } from './util.mjs';
import { pick } from './content.mjs';

export const THEME_INIT =
  "(function(){var d=document.documentElement;d.classList.add('js');try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}d.dataset.theme=t}catch(e){d.dataset.theme='dark'}})();";

export function createTemplates(ctx) {
  const { site, i18n, assets, wikiIcons } = ctx;

  const T = (lang, key) => i18n[lang][key] ?? i18n.en[key] ?? key;
  const L = (obj, lang) => (obj && (obj[lang] ?? obj.en)) || '';
  const u = (lang, p) => (lang === 'ar' ? `/ar${p}` : p);
  const dir = (lang) => (lang === 'ar' ? 'rtl' : 'ltr');
  const abs = (lang, p) => site.url + u(lang, p);

  const icon = (id, cls = '') =>
    `<svg class="icon ${cls}" aria-hidden="true" focusable="false"><use href="${assets.sprite}#${id}"/></svg>`;

  const fmtDate = (d, lang) =>
    d
      ? new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' }).format(d)
      : '';

  const dateEl = (d, lang) => (d ? `<time datetime="${d.toISOString().slice(0, 10)}">${esc(fmtDate(d, lang))}</time>` : '');

  const brandClass = (id) => `brand-${id}`;

  // ---------------------------------------------------------------- shared bits
  function socials(lang, cls = '') {
    return `<ul class="socials ${cls}" aria-label="${esc(T(lang, 'a11y.socials'))}">${site.socials
      .map(
        (s) =>
          `<li><a class="circle" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(s.label)}" title="${esc(s.label)}">${icon('s-' + s.id)}</a></li>`
      )
      .join('')}</ul>`;
  }

  function searchBox(lang, id) {
    return `<div class="search" data-search>
  <label class="visually-hidden" for="q-${id}">${esc(T(lang, 'search.label'))}</label>
  <span class="search__icon">${icon('i-search')}</span>
  <input id="q-${id}" type="search" autocomplete="off" spellcheck="false" enterkeyhint="search" placeholder="${esc(T(lang, 'search.placeholder'))}" role="combobox" aria-expanded="false" aria-controls="r-${id}" aria-autocomplete="list">
  <button type="button" class="circle circle--sm search__clear" hidden aria-label="${esc(T(lang, 'search.clear'))}">${icon('i-close')}</button>
  <kbd class="search__kbd" aria-hidden="true">/</kbd>
  <ul id="r-${id}" class="search__results" role="listbox" hidden data-none="${esc(T(lang, 'search.none'))}"></ul>
</div>`;
  }

  function drawer(lang, here) {
    const wikiHtml = site.wikis
      .map((w) => {
        const data = ctx.content.wikis[w.id] || { pages: [] };
        const base = `/hub/${w.id}/`;
        const open = here.startsWith(base) ? ' open' : '';
        const items = data.pages
          .map((p) => {
            const v = pick(p, lang);
            const href = `${base}${p.slug}/`;
            return `<li><a href="${u(lang, href)}"${here === href ? ' aria-current="page"' : ''}>${esc(v.data.title)}</a></li>`;
          })
          .join('');
        return `<details class="tree"${open}><summary>${icon('i-' + wikiIcons[w.id])}<span>${esc(L(w.title, lang))}</span>${icon('i-chevron', 'tree__chev')}</summary>
<ul>
<li><a href="${u(lang, base)}"${here === base ? ' aria-current="page"' : ''}>${esc(T(lang, 'hub.overview'))}</a></li>${items}</ul></details>`;
      })
      .join('');
    const group = (key, iconId, base, list) => {
      const open = here.startsWith(base) ? ' open' : '';
      const items = list
        .map((p) => {
          const v = pick(p, lang);
          const href = `${base}${p.slug}/`;
          return `<li><a href="${u(lang, href)}"${here === href ? ' aria-current="page"' : ''}>${esc(v.data.title)}</a></li>`;
        })
        .join('');
      return `<details class="tree"${open}><summary>${icon('i-' + iconId)}<span>${esc(T(lang, key))}</span>${icon('i-chevron', 'tree__chev')}</summary><ul><li><a href="${u(lang, base)}"${here === base ? ' aria-current="page"' : ''}>${esc(T(lang, 'hub.overview'))}</a></li>${items}</ul></details>`;
    };
    return `<div class="scrim" data-scrim></div>
<aside id="hub-drawer" class="drawer" aria-label="${esc(T(lang, 'menu.hub'))}" inert>
  <div class="drawer__head">
    <a class="drawer__title" href="${u(lang, '/hub/')}">${esc(T(lang, 'menu.hub'))}</a>
    <button type="button" class="circle circle--sm" data-drawer-close aria-label="${esc(T(lang, 'a11y.hub.close'))}">${icon('i-close')}</button>
  </div>
  <nav class="drawer__nav" aria-label="${esc(T(lang, 'menu.hub'))}">
    ${wikiHtml}
    ${group('hub.research', 'file', '/hub/research/', ctx.content.research)}
    ${group('hub.journey', 'compass', '/hub/journey/', ctx.content.journey)}
  </nav>
</aside>`;
  }

  function header(lang, here, isHome, switchPath = here) {
    const otherLang = lang === 'ar' ? 'en' : 'ar';
    const nav = site.menu
      .map((k) => {
        const href = k === 'home' ? '/' : `/${k === 'hub' ? 'hub' : k}/`;
        const active = k === 'home' ? here === '/' : here === href || here.startsWith(href);
        return `<li><a href="${u(lang, href)}"${active ? ' aria-current="page"' : ''}>${esc(T(lang, 'menu.' + k))}</a></li>`;
      })
      .join('');
    return `<header class="topbar">
  <div class="topbar__start">
    <button type="button" class="circle" id="hub-toggle" aria-controls="hub-drawer" aria-expanded="false" aria-label="${esc(T(lang, 'a11y.hub'))}">${icon('i-hub', 'flip')}</button>
    <a class="brandlink" href="${u(lang, '/')}" aria-label="${esc(T(lang, 'a11y.home'))}">${icon('logo', 'brandlink__mark')}</a>
  </div>
  <nav class="topnav" aria-label="${esc(T(lang, 'a11y.menu'))}"><ul>${nav}</ul></nav>
  <div class="topbar__end">
    ${isHome ? '' : `<button type="button" class="circle" data-search-open aria-label="${esc(T(lang, 'search.label'))}">${icon('i-search')}</button>`}
    <a class="circle circle--text" href="${u(otherLang, switchPath)}" hreflang="${otherLang}" lang="${otherLang}" aria-label="${esc(T(lang, 'a11y.lang'))}">${esc(T(lang, 'lang.switch') === 'English' ? 'EN' : 'ع')}</a>
    <button type="button" class="circle" data-theme-toggle aria-label="${esc(T(lang, 'a11y.theme'))}">${icon('i-sun', 'theme-sun')}${icon('i-moon', 'theme-moon')}</button>
  </div>
</header>`;
  }

  function footer(lang) {
    return `<footer class="footer">
  <p>&copy; <span data-year>${new Date().getFullYear()}</span> ${esc(L(site.short, lang))} · ${esc(T(lang, 'footer.rights'))}</p>
</footer>`;
  }

  // ---------------------------------------------------------------- layout
  function layout({ lang, path: here, title, description, main, bodyClass = '', isHome = false, ogType = 'website', noindex = false, jsonld = '', switchPath }) {
    const fullTitle = isHome ? `${L(site.short, lang)} — ${L(site.tagline, lang)}` : `${title} · ${L(site.short, lang)}`;
    const desc = description || L(site.intro, lang);
    const other = lang === 'ar' ? 'en' : 'ar';
    const overlay = isHome
      ? ''
      : `<div class="search-overlay" data-search-overlay hidden><div class="search-overlay__panel">${searchBox(lang, 'o')}</div></div>`;
    return `<!doctype html>
<html lang="${lang}" dir="${dir(lang)}" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="${esc(ctx.csp)}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="color-scheme" content="dark light">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
${noindex ? '<meta name="robots" content="noindex">' : ''}
<link rel="canonical" href="${abs(lang, here)}">
<link rel="alternate" hreflang="${lang}" href="${abs(lang, here)}">
<link rel="alternate" hreflang="${other}" href="${abs(other, here)}">
<link rel="alternate" hreflang="x-default" href="${abs('en', here)}">
<meta property="og:site_name" content="${esc(L(site.short, lang))}">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${abs(lang, here)}">
<meta property="og:locale" content="${lang === 'ar' ? 'ar_EG' : 'en_GB'}">
<meta property="og:image" content="${site.url}${assets.og}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${assets.faviconSvg}" type="image/svg+xml">
<link rel="icon" href="${assets.favicon32}" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="${assets.appleIcon}">
<link rel="preload" href="/assets/fonts/tajawal-${lang === 'ar' ? 'arabic' : 'latin'}-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${assets.css}">
<script>${THEME_INIT}</script>
<script src="${assets.js}" defer></script>
${jsonld ? `<script type="application/ld+json">${jsonld}</script>` : ''}
</head>
<body class="${bodyClass}" data-lang="${lang}" data-search-index="${u(lang, '/search-index.json')}" data-i18n-search-hint="${esc(T(lang, 'search.hint'))}">
<a class="skip" href="#main">${esc(T(lang, 'skip'))}</a>
${header(lang, here, isHome, switchPath)}
${drawer(lang, here)}
${overlay}
${main}
</body>
</html>`;
  }

  // ---------------------------------------------------------------- building blocks
  const pageHead = (lang, title, lead, extra = '') =>
    `<header class="pagehead"><h1>${esc(title)}</h1>${lead ? `<p class="lead">${esc(lead)}</p>` : ''}${extra}</header>`;

  const wrap = (inner, cls = '') => `<main id="main" class="page ${cls}"><div class="container">${inner}</div></main>`;

  const withFooter = (main, lang) => main.replace('</main>', `${footer(lang)}</main>`);

  const tagList = (tags = []) =>
    tags.length ? `<ul class="tags">${tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : '';

  const crumbs = (lang, items) =>
    `<nav class="crumbs" aria-label="Breadcrumb"><ol>${items
      .map((c, i) => (c.href ? `<li><a href="${u(lang, c.href)}">${esc(c.label)}</a></li>` : `<li aria-current="page">${esc(c.label)}</li>`))
      .join('')}</ol></nav>`;

  function articlePage({ lang, here, entry, v, kind, crumbList, prev, next, backHref, backLabel, extraMeta = '' }) {
    const d = v.data;
    const notice = v.untranslated ? `<p class="notice" role="note">${esc(T(lang, 'hub.untranslated'))}</p>` : '';
    const draft = d.status === 'draft' ? `<span class="badge">${esc(T(lang, 'hub.draft'))}</span>` : '';
    const toc =
      v.toc.length > 1
        ? `<aside class="toc" aria-label="${esc(T(lang, 'hub.toc'))}"><p class="toc__title">${esc(T(lang, 'hub.toc'))}</p><ul>${v.toc
            .map((h) => `<li class="toc--${h.depth}"><a href="#${h.id}">${esc(h.text)}</a></li>`)
            .join('')}</ul></aside>`
        : '';
    const links = Array.isArray(d.links)
      ? `<ul class="linkrow">${d.links
          .filter((l) => /^https?:/i.test(l.url))
          .map((l) => `<li><a class="btn btn--ghost" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}${icon('i-external')}</a></li>`)
          .join('')}</ul>`
      : '';
    const pn = (p, cls, label) =>
      p ? `<a class="pn ${cls}" href="${u(lang, p.href)}"><span>${esc(label)}</span><strong>${esc(p.title)}</strong></a>` : '<span></span>';
    const content = v.untranslated ? `<div lang="en" dir="ltr">${v.html}</div>` : v.html;
    const inner = `${crumbs(lang, crumbList)}
<div class="article-grid">
<article class="article">
<header class="article__head">
<h1>${esc(d.title)}</h1>
<p class="meta">${[dateEl(entry.date, lang), v.readMin ? `${v.readMin} ${esc(T(lang, 'hub.readtime'))}` : '', draft].filter(Boolean).join(' · ')}${extraMeta}</p>
${tagList(d.tags)}
</header>
${notice}
<div class="prose">${content}</div>
${links}
${prev || next ? `<nav class="prevnext" aria-label="${esc(backLabel)}">${pn(prev, 'pn--prev', T(lang, 'hub.prev'))}${pn(next, 'pn--next', T(lang, 'hub.next'))}</nav>` : ''}
</article>
${toc}
</div>`;
    return layout({
      lang,
      path: here,
      title: d.title,
      description: d.summary,
      ogType: 'article',
      main: withFooter(wrap(inner, 'page--article'), lang),
    });
  }

  const rowList = (lang, items, hrefOf, { showDate = true } = {}) =>
    `<ul class="rows">${items
      .map((e) => {
        const v = pick(e, lang);
        const draft = v.data.status === 'draft' ? ` <span class="badge">${esc(T(lang, 'hub.draft'))}</span>` : '';
        return `<li><a class="row" href="${u(lang, hrefOf(e))}">
<span class="row__main"><strong class="row__title">${esc(v.data.title)}${draft}</strong>${v.data.summary ? `<span class="row__sum">${esc(v.data.summary)}</span>` : ''}</span>
${showDate && e.date ? `<span class="row__meta">${dateEl(e.date, lang)}</span>` : ''}
${icon('i-arrow', 'row__go flip')}</a></li>`;
      })
      .join('')}</ul>`;

  const cardLink = (lang, { href, iconId, title, text, meta, badge, external }) =>
    `<a class="card" href="${external ? esc(href) : u(lang, href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
<span class="card__icon circle circle--lg">${icon(iconId)}</span>
<span class="card__body"><strong class="card__title">${esc(title)}${badge ? ` <span class="badge">${esc(badge)}</span>` : ''}</strong><span class="card__text">${esc(text)}</span>${meta ? `<span class="card__meta">${esc(meta)}</span>` : ''}</span>
${icon(external ? 'i-external' : 'i-arrow', 'card__go' + (external ? '' : ' flip'))}</a>`;

  const countLabel = (lang, n) => `${n} ${T(lang, n === 1 ? 'hub.page' : 'hub.pages')}`;

  // ---------------------------------------------------------------- pages
  const pages = {};

  pages.home = (lang) => {
    const ventures = site.projects
      .map(
        (p) =>
          `<li><a class="venture ${brandClass(p.id)}" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(p.name)}">${icon('m-' + p.mark, 'venture__mark')}<span class="venture__name">${esc(p.name)}</span></a></li>`
      )
      .join('');
    const main = `<main id="main" class="home">
  <section class="home__hero" aria-labelledby="home-name">
    <h1 id="home-name" class="home__name">${esc(L(site.name, lang))}</h1>
    <p class="home__tagline">${esc(L(site.tagline, lang))}</p>
    <p class="home__intro">${esc(L(site.intro, lang))}</p>
    ${searchBox(lang, 'h')}
    ${socials(lang, 'socials--home')}
  </section>
  <section class="ventures" aria-labelledby="ventures-h">
    <div class="ventures__head"><h2 id="ventures-h" class="eyebrow">${esc(T(lang, 'projects.strip'))}</h2><a class="textlink" href="${u(lang, '/projects/')}">${esc(T(lang, 'projects.all'))}${icon('i-arrow', 'flip')}</a></div>
    <ul class="ventures__list">${ventures}</ul>
  </section>
  ${footer(lang)}
</main>`;
    const ld = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: site.name.en,
      url: site.url,
      jobTitle: 'Civil Engineer, Project Controls Engineer, Founder',
      address: { '@type': 'PostalAddress', addressLocality: 'Cairo', addressCountry: 'EG' },
      sameAs: site.socials.map((s) => s.url),
    });
    return [{ path: '/', html: layout({ lang, path: '/', title: '', main, isHome: true, bodyClass: 'is-home', jsonld: ld }) }];
  };

  pages.about = (lang) => {
    const p = ctx.content.pages.about;
    const v = pick(p, lang);
    const inner = `${pageHead(lang, v.data.title, v.data.summary)}${v.untranslated ? `<p class="notice" role="note">${esc(T(lang, 'hub.untranslated'))}</p>` : ''}<div class="prose prose--page">${v.html}</div>${socials(lang, 'socials--page')}`;
    return [{ path: '/about/', html: layout({ lang, path: '/about/', title: v.data.title, description: v.data.summary, main: withFooter(wrap(inner, 'page--narrow'), lang) }) }];
  };

  pages.hub = (lang) => {
    const out = [];
    const { content } = ctx;
    // hub index
    const wikiCards = site.wikis
      .map((w) => {
        const data = content.wikis[w.id] || { pages: [], index: null };
        const draft = data.index?.data.status === 'draft' || data.pages.some((p) => p.data.status === 'draft');
        return cardLink(lang, {
          href: `/hub/${w.id}/`,
          iconId: 'i-' + wikiIcons[w.id],
          title: L(w.title, lang),
          text: L(w.blurb, lang),
          meta: countLabel(lang, data.pages.length),
          badge: data.pages.length === 0 || draft ? T(lang, 'hub.draft') : '',
        });
      })
      .join('');
    const latest = [...content.journey].slice(0, 3);
    const inner = `${pageHead(lang, T(lang, 'hub.title'), T(lang, 'hub.lead'))}
<section aria-labelledby="h-wikis"><h2 id="h-wikis" class="eyebrow">${esc(T(lang, 'hub.wikis'))}</h2><div class="cards">${wikiCards}</div></section>
<section aria-labelledby="h-more"><h2 id="h-more" class="eyebrow">${esc(T(lang, 'hub.research'))} · ${esc(T(lang, 'hub.journey'))}</h2><div class="cards cards--2">
${cardLink(lang, { href: '/hub/research/', iconId: 'i-file', title: T(lang, 'hub.research'), text: T(lang, 'hub.research.lead'), meta: countLabel(lang, content.research.length) })}
${cardLink(lang, { href: '/hub/journey/', iconId: 'i-compass', title: T(lang, 'hub.journey'), text: T(lang, 'hub.journey.lead'), meta: countLabel(lang, content.journey.length) })}
</div></section>
${latest.length ? `<section aria-labelledby="h-latest"><h2 id="h-latest" class="eyebrow">${esc(T(lang, 'hub.journey'))}</h2>${rowList(lang, latest, (e) => `/hub/journey/${e.slug}/`)}</section>` : ''}`;
    out.push({ path: '/hub/', html: layout({ lang, path: '/hub/', title: T(lang, 'hub.title'), description: T(lang, 'hub.lead'), main: withFooter(wrap(inner), lang) }) });

    // wikis
    for (const w of site.wikis) {
      const data = content.wikis[w.id] || { pages: [], index: null };
      const base = `/hub/${w.id}/`;
      const idx = data.index ? pick(data.index, lang) : null;
      const intro = idx ? `<div class="prose prose--intro">${idx.untranslated ? `<div lang="en" dir="ltr">${idx.html}</div>` : idx.html}</div>` : '';
      const list = data.pages.length
        ? rowList(lang, data.pages, (e) => `${base}${e.slug}/`, { showDate: false })
        : `<p class="empty">${esc(T(lang, 'hub.empty'))}</p>`;
      const draftBadge = data.index?.data.status === 'draft' ? `<span class="badge">${esc(T(lang, 'hub.draft'))}</span>` : '';
      const inner2 = `${crumbs(lang, [{ label: T(lang, 'hub.title'), href: '/hub/' }, { label: L(w.title, lang) }])}
<header class="pagehead"><h1>${esc(L(w.title, lang))} ${draftBadge}</h1><p class="lead">${esc(L(w.blurb, lang))}</p></header>${intro}${list}`;
      out.push({ path: base, html: layout({ lang, path: base, title: L(w.title, lang), description: L(w.blurb, lang), main: withFooter(wrap(inner2, 'page--narrow'), lang) }) });

      data.pages.forEach((p, i) => {
        const v = pick(p, lang);
        const mk = (q) => (q ? { href: `${base}${q.slug}/`, title: pick(q, lang).data.title } : null);
        out.push({
          path: `${base}${p.slug}/`,
          html: articlePage({
            lang,
            here: `${base}${p.slug}/`,
            entry: p,
            v,
            kind: 'wiki',
            crumbList: [{ label: T(lang, 'hub.title'), href: '/hub/' }, { label: L(w.title, lang), href: base }, { label: v.data.title }],
            prev: mk(data.pages[i - 1]),
            next: mk(data.pages[i + 1]),
            backHref: base,
            backLabel: L(w.title, lang),
          }),
        });
      });
    }

    // research + journey
    for (const [key, list, iconKey] of [
      ['research', content.research, 'hub.research'],
      ['journey', content.journey, 'hub.journey'],
    ]) {
      const base = `/hub/${key}/`;
      const inner3 = `${crumbs(lang, [{ label: T(lang, 'hub.title'), href: '/hub/' }, { label: T(lang, iconKey) }])}${pageHead(lang, T(lang, iconKey), T(lang, iconKey + '.lead'))}${
        list.length ? rowList(lang, list, (e) => `${base}${e.slug}/`) : `<p class="empty">${esc(T(lang, 'hub.empty'))}</p>`
      }`;
      out.push({ path: base, html: layout({ lang, path: base, title: T(lang, iconKey), description: T(lang, iconKey + '.lead'), main: withFooter(wrap(inner3, 'page--narrow'), lang) }) });
      list.forEach((e, i) => {
        const v = pick(e, lang);
        const mk = (q) => (q ? { href: `${base}${q.slug}/`, title: pick(q, lang).data.title } : null);
        out.push({
          path: `${base}${e.slug}/`,
          html: articlePage({
            lang,
            here: `${base}${e.slug}/`,
            entry: e,
            v,
            kind: key,
            crumbList: [{ label: T(lang, 'hub.title'), href: '/hub/' }, { label: T(lang, iconKey), href: base }, { label: v.data.title }],
            prev: mk(list[i + 1]),
            next: mk(list[i - 1]),
            backHref: base,
            backLabel: T(lang, iconKey),
          }),
        });
      });
    }
    return out;
  };

  pages.resources = (lang) => {
    const out = [];
    const { content } = ctx;
    const dls = content.downloads;
    const guides = content.guides;
    const inner = `${pageHead(lang, T(lang, 'res.title'), T(lang, 'res.lead'))}
<div class="cards cards--2">
${cardLink(lang, { href: '/resources/downloads/', iconId: 'i-gift', title: T(lang, 'res.downloads'), text: T(lang, 'res.downloads.lead'), meta: `${dls.length} ${T(lang, 'dl.count')}` })}
${cardLink(lang, { href: '/resources/guides/', iconId: 'i-book', title: T(lang, 'res.guides'), text: T(lang, 'res.guides.lead'), meta: `${guides.length} ${T(lang, 'dl.count')}` })}
</div>`;
    out.push({ path: '/resources/', html: layout({ lang, path: '/resources/', title: T(lang, 'res.title'), description: T(lang, 'res.lead'), main: withFooter(wrap(inner), lang) }) });

    // guides
    {
      const base = '/resources/guides/';
      const inner2 = `${crumbs(lang, [{ label: T(lang, 'res.title'), href: '/resources/' }, { label: T(lang, 'res.guides') }])}${pageHead(lang, T(lang, 'res.guides'), T(lang, 'res.guides.lead'))}${
        guides.length ? rowList(lang, guides, (e) => `${base}${e.slug}/`) : `<p class="empty">${esc(T(lang, 'hub.empty'))}</p>`
      }`;
      out.push({ path: base, html: layout({ lang, path: base, title: T(lang, 'res.guides'), description: T(lang, 'res.guides.lead'), main: withFooter(wrap(inner2, 'page--narrow'), lang) }) });
      guides.forEach((e, i) => {
        const v = pick(e, lang);
        const mk = (q) => (q ? { href: `${base}${q.slug}/`, title: pick(q, lang).data.title } : null);
        out.push({
          path: `${base}${e.slug}/`,
          html: articlePage({
            lang,
            here: `${base}${e.slug}/`,
            entry: e,
            v,
            kind: 'guide',
            crumbList: [{ label: T(lang, 'res.title'), href: '/resources/' }, { label: T(lang, 'res.guides'), href: base }, { label: v.data.title }],
            prev: mk(guides[i + 1]),
            next: mk(guides[i - 1]),
            backHref: base,
            backLabel: T(lang, 'res.guides'),
          }),
        });
      });
    }

    // downloads
    {
      const base = '/resources/downloads/';
      const catIds = [...new Set(dls.map((d) => d.data.category).filter(Boolean))];
      const typeIds = [...new Set(dls.map((d) => d.data.type).filter(Boolean))];
      const catLabel = (id) => L(site.resourceCategories.find((c) => c.id === id)?.label, lang) || id;
      const typeLabel = (id) => L(site.resourceTypes.find((c) => c.id === id)?.label, lang) || id;
      const chips = (name, ids, labelOf, groupLabel) =>
        ids.length > 1
          ? `<div class="chips" role="group" aria-label="${esc(groupLabel)}" data-chip-group="${name}"><span class="chips__label">${esc(groupLabel)}</span><button type="button" class="chip" data-value="all" aria-pressed="true">${esc(T(lang, 'dl.all'))}</button>${ids
              .map((id) => `<button type="button" class="chip" data-value="${esc(id)}" aria-pressed="false">${esc(labelOf(id))}</button>`)
              .join('')}</div>`
          : '';
      const cards = dls
        .map((e) => {
          const v = pick(e, lang);
          const d = v.data;
          const href = `${base}${e.slug}/`;
          const fmt = d.format || e.fileInfo?.ext || '';
          const getHref = e.fileInfo ? d.file : d.url;
          const hay = normalise([d.title, d.summary, (d.tags || []).join(' '), catLabel(d.category), typeLabel(d.type), fmt].join(' '));
          const draft = d.draft === true ? ` <span class="badge">${esc(T(lang, 'hub.draft'))}</span>` : '';
          return `<li class="dl-card" data-cat="${esc(d.category || '')}" data-type="${esc(d.type || '')}" data-hay="${esc(hay)}">
<div class="dl-card__top"><span class="chip chip--static">${esc(catLabel(d.category))}</span>${d.type ? `<span class="chip chip--static">${esc(typeLabel(d.type))}</span>` : ''}${fmt ? `<span class="dl-card__fmt">${esc(fmt)}</span>` : ''}</div>
<h2 class="dl-card__title"><a href="${u(lang, href)}">${esc(d.title)}</a>${draft}</h2>
<p class="dl-card__sum">${esc(d.summary || '')}</p>
<div class="dl-card__foot"><span class="dl-card__free">${esc(T(lang, 'dl.free'))}${e.fileInfo ? ` · ${esc(e.fileInfo.size)}` : ''}</span>${
            getHref
              ? `<a class="circle" href="${esc(getHref)}" ${e.fileInfo ? 'download' : 'target="_blank" rel="noopener noreferrer"'} aria-label="${esc(T(lang, e.fileInfo ? 'dl.download' : 'dl.external'))}: ${esc(d.title)}">${icon(e.fileInfo ? 'i-download' : 'i-external')}</a>`
              : ''
          }</div></li>`;
        })
        .join('');
      const inner = `${crumbs(lang, [{ label: T(lang, 'res.title'), href: '/resources/' }, { label: T(lang, 'res.downloads') }])}${pageHead(lang, T(lang, 'res.downloads'), T(lang, 'res.downloads.lead'))}
${
  dls.length
    ? `<section class="dl" data-downloads data-view="grid" data-noresults="${esc(T(lang, 'dl.noresults'))}">
<div class="dl__bar">
<div class="field field--search"><span class="field__icon">${icon('i-search')}</span><input type="search" data-dl-q placeholder="${esc(T(lang, 'dl.search'))}" aria-label="${esc(T(lang, 'dl.search'))}" autocomplete="off"></div>
<div class="dl__views" role="group" aria-label="View"><button type="button" class="circle" data-view-btn="grid" aria-pressed="true" aria-label="${esc(T(lang, 'dl.grid'))}">${icon('i-grid')}</button><button type="button" class="circle" data-view-btn="list" aria-pressed="false" aria-label="${esc(T(lang, 'dl.list'))}">${icon('i-list')}</button></div>
</div>
${chips('cat', catIds, catLabel, T(lang, 'dl.category'))}
${chips('type', typeIds, typeLabel, T(lang, 'dl.type'))}
<p class="dl__count" aria-live="polite" data-dl-count data-label="${esc(T(lang, 'dl.count'))}"></p>
<ul class="dl__items">${cards}</ul>
<p class="empty" data-dl-empty hidden>${esc(T(lang, 'dl.noresults'))} <button type="button" class="textlink" data-dl-reset>${esc(T(lang, 'dl.reset'))}</button></p>
</section>`
    : `<p class="empty">${esc(T(lang, 'res.empty'))}</p>`
}`;
      out.push({ path: base, html: layout({ lang, path: base, title: T(lang, 'res.downloads'), description: T(lang, 'res.downloads.lead'), main: withFooter(wrap(inner), lang) }) });

      for (const e of dls) {
        const v = pick(e, lang);
        const d = v.data;
        const fmt = d.format || e.fileInfo?.ext || '';
        const getHref = e.fileInfo ? d.file : d.url;
        const rows = [
          [T(lang, 'dl.category'), catLabel(d.category)],
          d.type ? [T(lang, 'dl.type'), typeLabel(d.type)] : null,
          fmt ? [T(lang, 'dl.format'), fmt] : null,
          e.fileInfo ? [T(lang, 'dl.size'), e.fileInfo.size] : null,
          d.version ? [T(lang, 'dl.version'), String(d.version)] : null,
          e.date ? [T(lang, 'dl.added'), fmtDate(e.date, lang)] : null,
        ].filter(Boolean);
        const inner2 = `${crumbs(lang, [{ label: T(lang, 'res.title'), href: '/resources/' }, { label: T(lang, 'res.downloads'), href: base }, { label: d.title }])}
<div class="article-grid">
<article class="article">
<header class="article__head"><h1>${esc(d.title)}${d.draft === true ? ` <span class="badge">${esc(T(lang, 'hub.draft'))}</span>` : ''}</h1><p class="lead">${esc(d.summary || '')}</p>${tagList(d.tags)}</header>
${v.untranslated ? `<p class="notice" role="note">${esc(T(lang, 'hub.untranslated'))}</p>` : ''}
<div class="prose">${v.untranslated ? `<div lang="en" dir="ltr">${v.html}</div>` : v.html}</div>
</article>
<aside class="getbox" aria-label="${esc(T(lang, 'dl.download'))}">
<dl>${rows.map(([k, val]) => `<div><dt>${esc(k)}</dt><dd>${esc(val)}</dd></div>`).join('')}</dl>
${
  getHref
    ? `<a class="btn btn--primary btn--block" href="${esc(getHref)}" ${e.fileInfo ? 'download' : 'target="_blank" rel="noopener noreferrer"'}>${icon(e.fileInfo ? 'i-download' : 'i-external')}<span>${esc(T(lang, e.fileInfo ? 'dl.download' : 'dl.external'))} · ${esc(T(lang, 'dl.free'))}</span></a>`
    : ''
}
</aside>
</div>`;
        out.push({ path: `${base}${e.slug}/`, html: layout({ lang, path: `${base}${e.slug}/`, title: d.title, description: d.summary, main: withFooter(wrap(inner2), lang) }) });
      }
    }
    return out;
  };

  pages.projects = (lang) => {
    const cards = site.projects
      .map(
        (p) =>
          `<li><a class="project ${brandClass(p.id)}" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">
<span class="project__mark">${icon('m-' + p.mark)}</span>
<span class="project__body"><strong>${esc(p.name)}</strong><span>${esc(L(p.blurb, lang))}</span></span>
<span class="project__visit">${esc(T(lang, 'projects.visit'))}${icon('i-external')}</span></a></li>`
      )
      .join('');
    const inner = `${pageHead(lang, T(lang, 'projects.title'), T(lang, 'projects.lead'))}<ul class="projects">${cards}</ul>`;
    return [{ path: '/projects/', html: layout({ lang, path: '/projects/', title: T(lang, 'projects.title'), description: T(lang, 'projects.lead'), main: withFooter(wrap(inner), lang) }) }];
  };

  pages.contact = (lang) => {
    const inboxEnc = Buffer.from(site.contact.inbox.join('@')).toString('base64');
    const form = `<form class="form" data-contact method="post" action="${esc(site.contact.formEndpoint || '#')}" data-endpoint="${esc(site.contact.formEndpoint || '')}" data-inbox="${inboxEnc}" novalidate
 data-msg-sending="${esc(T(lang, 'contact.sending'))}" data-msg-sent="${esc(T(lang, 'contact.sent'))}" data-msg-error="${esc(T(lang, 'contact.error'))}" data-msg-fallback="${esc(T(lang, 'contact.fallback'))}">
<div class="field"><label for="c-name">${esc(T(lang, 'contact.name'))}</label><input id="c-name" name="name" type="text" required autocomplete="name"></div>
<div class="field"><label for="c-email">${esc(T(lang, 'contact.email'))}</label><input id="c-email" name="email" type="email" required autocomplete="email" dir="ltr"></div>
<div class="field"><label for="c-subject">${esc(T(lang, 'contact.subject'))}</label><input id="c-subject" name="subject" type="text"></div>
<div class="field"><label for="c-message">${esc(T(lang, 'contact.message'))}</label><textarea id="c-message" name="message" rows="6" required></textarea></div>
<div class="visually-hidden" aria-hidden="true"><label>Leave empty<input type="text" name="_gotcha" tabindex="-1" autocomplete="off"></label></div>
<button type="submit" class="btn btn--primary">${icon('i-mail')}<span>${esc(T(lang, 'contact.send'))}</span></button>
<p class="form__status" role="status" aria-live="polite" data-status></p>
</form>
<noscript><p class="notice">${esc(T(lang, 'contact.nojs'))}</p></noscript>`;
    const inner = `${pageHead(lang, T(lang, 'contact.title'), T(lang, 'contact.lead'))}
<div class="contact-grid">
<section>${form}</section>
<aside class="contact-side">
<dl class="facts"><div><dt>${esc(T(lang, 'contact.location'))}</dt><dd>${esc(L(site.contact.location, lang))}</dd></div></dl>
<h2 class="eyebrow">${esc(T(lang, 'contact.socials'))}</h2>
${socials(lang, 'socials--page')}
</aside>
</div>`;
    return [{ path: '/contact/', html: layout({ lang, path: '/contact/', title: T(lang, 'contact.title'), description: T(lang, 'contact.lead'), main: withFooter(wrap(inner), lang) }) }];
  };

  pages.notFound = (lang) => {
    const inner = `<div class="notfound"><h1>${esc(T(lang, '404.title'))}</h1><p class="lead">${esc(T(lang, '404.lead'))}</p><a class="btn btn--primary" href="${u(lang, '/')}">${esc(T(lang, '404.home'))}</a></div>`;
    return [{ path: '/404/', html: layout({ lang, path: '/404/', title: T(lang, '404.title'), main: withFooter(wrap(inner, 'page--narrow'), lang), noindex: true, switchPath: '/' }) }];
  };

  return { pages, T, L, u, pick };
}
