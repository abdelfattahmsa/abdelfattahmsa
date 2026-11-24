import { esc } from './util.mjs';
import { pick, isDraft, isoDate, collections } from './content.mjs';
import { normalise } from './search.mjs';
import { DEFAULT_LANG, langInfo, otherLang, translator, u } from './i18n.mjs';
import { TAG, connectionsOf } from './graph.mjs';

// HTML for every page. Each pages.<name>(lang) returns [{ path, html }].
export function createTemplates(ctx) {
  const { site, assets, content, graph } = ctx;
  const { T, L } = translator(ctx.i18n);
  const abs = (lang, p) => site.url + u(lang, p);
  const C = collections(site);

  const icon = (id, cls = '') =>
    `<svg class="icon ${cls}" aria-hidden="true" focusable="false"><use href="${assets.sprite}#${id}"/></svg>`;
  // the mascot has a light-background variant (thin grey edge); CSS shows the one that fits the theme
  // each part of the site has its own reaction of the mascot (poses are drawn in brand/poses.mjs)
  const POSE_FOR = { home: 'happy', about: 'calm', hub: 'search', research: 'sketching', journey: 'sunglasses', resources: 'idea', guides: 'coding', downloads: 'launch', contact: 'wink', services: 'builder', notFound: 'surprised' };
  const mascotIcon = (id, cls = '') => `${icon('mascot-' + id, cls + ' for-dark')}${icon('mascot-' + id + 'Light', cls + ' for-light')}`;

  const fmtDate = (d, lang) =>
    d ? new Intl.DateTimeFormat(langInfo(lang).dateLocale, { year: 'numeric', month: 'long', day: 'numeric' }).format(d) : '';
  const dateEl = (d, lang) => (d ? `<time datetime="${isoDate(d)}">${esc(fmtDate(d, lang))}</time>` : '');

  const draftBadge = (lang, data) => (isDraft(data) ? `<span class="badge">${esc(T(lang, 'hub.draft'))}</span>` : '');
  const untranslatedNotice = (lang, v) => (v.untranslated ? `<p class="notice" role="note">${esc(T(lang, 'hub.untranslated'))}</p>` : '');
  // an English fallback inside a page in another language is marked as English
  const proseHtml = (v) => (v.untranslated ? `<div lang="${DEFAULT_LANG}" dir="${langInfo(DEFAULT_LANG).dir}">${v.html}</div>` : v.html);
  const emptyNote = (lang, key = 'hub.empty') => `<p class="empty">${esc(T(lang, key))}</p>`;

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
    const current = (href) => (here === href ? ' aria-current="page"' : '');
    const tree = (iconId, label, base, list) => {
      const open = here.startsWith(base) ? ' open' : '';
      const items = list.map((p) => `<li><a href="${u(lang, p.url)}"${current(p.url)}>${esc(pick(p, lang).data.title)}</a></li>`).join('');
      return `<details class="tree"${open}><summary>${icon('i-' + iconId)}<span>${esc(label)}</span>${icon('i-chevron', 'tree__chev')}</summary><ul><li><a href="${u(lang, base)}"${current(base)}>${esc(T(lang, 'hub.overview'))}</a></li>${items}</ul></details>`;
    };
    const wikis = Object.values(content.wikis).map((w) => tree(w.icon, L(w.title, lang), w.base, w.pages)).join('');
    return `<div class="scrim" data-scrim></div>
<aside id="hub-drawer" class="drawer" aria-label="${esc(T(lang, 'menu.hub'))}" inert>
  <div class="drawer__head">
    <a class="drawer__title" href="${u(lang, '/hub/')}">${esc(T(lang, 'menu.hub'))}</a>
    <button type="button" class="circle circle--sm" data-drawer-close aria-label="${esc(T(lang, 'a11y.hub.close'))}">${icon('i-close')}</button>
  </div>
  <nav class="drawer__nav" aria-label="${esc(T(lang, 'menu.hub'))}">
    ${wikis}
    ${tree('file', T(lang, 'hub.research'), C.research.base, content.research)}
    ${tree('compass', T(lang, 'hub.journey'), C.journey.base, content.journey)}
  </nav>
</aside>`;
  }

  function header(lang, here, isHome, switchPath = here) {
    const other = otherLang(lang);
    const nav = site.menu
      .map((k) => {
        const href = k === 'home' ? '/' : `/${k}/`;
        const active = k === 'home' ? here === '/' : here.startsWith(href);
        return `<li><a href="${u(lang, href)}"${active ? ' aria-current="page"' : ''}>${esc(T(lang, 'menu.' + k))}</a></li>`;
      })
      .join('');
    const cvBtn = ctx.cv ? `<a class="btn btn--sm btn--cv" href="${esc(ctx.cv.href)}" download aria-label="${esc(T(lang, 'a11y.cv'))}">${icon('i-download')}<span class="btn__label">${esc(T(lang, 'cv.download'))}</span></a>` : '';
    const langBtn = `<a class="circle circle--text" href="${u(other, switchPath)}" hreflang="${other}" lang="${other}" aria-label="${esc(T(lang, 'a11y.lang'))}">${esc(T(other, 'lang.short'))}</a>`;
    const themeBtn = `<button type="button" class="circle" data-theme-toggle aria-label="${esc(T(lang, 'a11y.theme'))}">${icon('i-sun', 'theme-sun')}${icon('i-moon', 'theme-moon')}</button>`;
    // the name in the mascot's lettering; CSS shows the offset that suits the theme (white on dark, black on light)
    const logoId = lang === 'ar' ? 'logo-ar' : 'logo';
    const logoCls = lang === 'ar' ? 'brandlink__mark brandlink__mark--ar' : 'brandlink__mark';
    const logo = `${icon(logoId + '-dark', logoCls + ' for-dark')}${icon(logoId + '-light', logoCls + ' for-light')}`;
    return `<header class="topbar">
  <div class="topbar__start">
    <button type="button" class="circle" id="hub-toggle" aria-controls="hub-drawer" aria-expanded="false" aria-label="${esc(T(lang, 'a11y.hub'))}">${icon('i-hub', 'flip')}</button>
    <a class="brandlink" href="${u(lang, '/')}" aria-label="${esc(T(lang, 'a11y.home'))}">${mascotIcon('head', 'brandlink__face')}${logo}</a>
  </div>
  <nav class="topnav" id="nav-panel" aria-label="${esc(T(lang, 'a11y.menu'))}"><ul>${nav}</ul>
    <div class="topnav__tools">
      ${cvBtn}
      ${langBtn}
      ${themeBtn}
    </div>
  </nav>
  <div class="topbar__end">
    <span class="tools-wide">${cvBtn}</span>
    ${isHome ? '' : `<button type="button" class="circle" data-search-open aria-label="${esc(T(lang, 'search.label'))}">${icon('i-search')}</button>`}
    <span class="tools-wide">${langBtn}${themeBtn}</span>
    <button type="button" class="circle burger" id="nav-toggle" aria-controls="nav-panel" aria-expanded="false" aria-label="${esc(T(lang, 'a11y.nav'))}">${icon('i-menu', 'burger__open')}${icon('i-close', 'burger__close')}</button>
  </div>
</header>`;
  }


  // the sticky mascot on the left: message (WhatsApp), call (Calendly) and email. The links are put together
  // by main.js from this one encoded value, the same way the contact form hides the inbox.
  function contactWidget(lang) {
    const c = site.contact;
    const payload = Buffer.from(JSON.stringify({ w: c.whatsapp || '', m: (c.inbox || []).join('@').toLowerCase(), c: c.calendly || '' })).toString('base64');
    // icons only: the name of each is its tooltip (data-tip) and its accessible label
    const item = (kind, key, id, extra = '') =>
      `<li><a class="contact__item" data-contact-kind="${kind}" data-tip="${esc(T(lang, key))}" aria-label="${esc(T(lang, key))}" href="#"${extra}>${mascotIcon('mk-' + id, 'contact__icon')}</a></li>`;
    return `<div class="contact" data-contact-widget data-c="${payload}">
<button type="button" class="contact__fab" aria-expanded="false" aria-controls="contact-menu" aria-label="${esc(T(lang, 'widget.open'))}" title="${esc(T(lang, 'widget.open'))}">${mascotIcon('head', 'contact__face')}</button>
<ul class="contact__menu" id="contact-menu" aria-label="${esc(T(lang, 'widget.label'))}" hidden>
${item('chat', 'widget.message', 'chat', ' target="_blank" rel="noopener noreferrer"')}
${c.calendly ? item('call', 'widget.call', 'call', ' target="_blank" rel="noopener noreferrer"') : ''}
${item('mail', 'widget.email', 'mail')}
</ul>
</div>`;
  }

  function footer(lang) {
    return `<footer class="footer">
  <p>&copy; <span data-year>${new Date().getFullYear()}</span> ${esc(L(site.short, lang))} · ${esc(T(lang, 'footer.rights'))}</p>
</footer>`;
  }

  // ---------------------------------------------------------------- layout
  function layout({ lang, path: here, title, description, main, bodyClass = '', isHome = false, ogType = 'website', noindex = false, jsonld = '', switchPath, mapPage = false }) {
    const fullTitle = isHome ? `${L(site.short, lang)} — ${L(site.tagline, lang)}` : `${title} · ${L(site.short, lang)}`;
    const desc = description || L(site.intro, lang);
    const other = otherLang(lang);
    const overlay = isHome
      ? ''
      : `<div class="search-overlay" data-search-overlay hidden><div class="search-overlay__panel">${searchBox(lang, 'o')}</div></div>`;
    return `<!doctype html>
<html lang="${lang}" dir="${langInfo(lang).dir}" data-theme="dark">
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
<link rel="alternate" hreflang="x-default" href="${abs(DEFAULT_LANG, here)}">
<meta property="og:site_name" content="${esc(L(site.short, lang))}">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${abs(lang, here)}">
<meta property="og:locale" content="${langInfo(lang).ogLocale}">
<meta property="og:image" content="${site.url}${assets.og}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${assets.faviconSvg}" type="image/svg+xml">
<link rel="icon" href="${assets.favicon16}" sizes="16x16" type="image/png">
<link rel="icon" href="${assets.favicon32}" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="${assets.appleIcon}">
<link rel="manifest" href="${assets.manifest}">
<link rel="preload" href="/assets/fonts/tajawal-${langInfo(lang).fontSubset}-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${assets.css}">
<script>${ctx.themeInit}</script>
<script src="${assets.js}" defer></script>
${mapPage ? `<script src="${assets.mapJs}" defer></script>` : ''}
${jsonld ? `<script type="application/ld+json">${jsonld}</script>` : ''}
</head>
<body class="${bodyClass}" data-lang="${lang}" data-search-index="${u(lang, '/search-index.json')}" data-i18n-search-hint="${esc(T(lang, 'search.hint'))}">
<a class="skip" href="#main">${esc(T(lang, 'skip'))}</a>
${header(lang, here, isHome, switchPath)}
${drawer(lang, here)}
${overlay}
${main}
${contactWidget(lang)}
<button type="button" class="totop" data-totop hidden aria-label="${esc(T(lang, 'totop'))}" title="${esc(T(lang, 'totop'))}">${icon('i-up')}</button>
</body>
</html>`;
  }

  // ---------------------------------------------------------------- building blocks
  const pageHead = (lang, title, lead, extra = '') =>
    `<header class="pagehead"><h1>${esc(title)}</h1>${lead ? `<p class="lead">${esc(lead)}</p>` : ''}${extra}</header>`;

  const poseIcon = (part) => mascotIcon('pose-' + POSE_FOR[part], 'pagehead__mascot');

  const main = (lang, inner, cls = '') => `<main id="main" class="page ${cls}"><div class="container">${inner}</div>${footer(lang)}</main>`;

  const tagList = (tags = []) =>
    tags.length ? `<ul class="tags">${tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : '';

  const crumbs = (lang, items) =>
    `<nav class="crumbs" aria-label="Breadcrumb"><ol>${items
      .map((c) => (c.href ? `<li><a href="${u(lang, c.href)}">${esc(c.label)}</a></li>` : `<li aria-current="page">${esc(c.label)}</li>`))
      .join('')}</ol></nav>`;


  // ---------------------------------------------------------------- knowledge map pieces
  const CAP = 30; // pages listed before "Show more" (the rest come from the graph file)
  const chipOrText = (lang) => (c) => (c.url ? `<li><a href="${u(lang, c.url)}">${esc(c.label)}</a></li>` : `<li>${esc(c.label)}</li>`);
  // "Connected": the topics a page has and the pages it is bonded to
  function connected(lang, nodeId) {
    if (!graph || !nodeId) return '';
    const all = connectionsOf(graph, nodeId, lang).filter((c) => c.type !== 0);
    if (!all.length) return '';
    const topics = all.filter((c) => c.type === TAG);
    const pages = all.filter((c) => c.type !== TAG);
    const group = (title, list) => (list.length ? `<h2 class="eyebrow">${esc(title)}</h2><ul class="tags tags--links">${list.slice(0, 60).map(chipOrText(lang)).join('')}${list.length > 60 ? `<li>+${list.length - 60}</li>` : ''}</ul>` : '');
    return `<section class="connected" aria-label="${esc(T(lang, 'connected.title'))}">${group(T(lang, 'connected.topics'), topics)}${group(T(lang, 'connected.pages'), pages)}</section>`;
  }

  const viewSwitcher = (lang) =>
    `<div class="viewswitch" role="radiogroup" aria-label="${esc(T(lang, 'view.label'))}">${[['map', 'network'], ['grid', 'grid'], ['list', 'list']]
      .map(([v, ic]) => `<button type="button" role="radio" aria-checked="${v === 'map'}" data-view-btn="${v}" class="viewswitch__btn">${icon('i-' + ic)}<span>${esc(T(lang, 'view.' + v))}</span></button>`)
      .join('')}</div>`;

  const MAP_KEYS = ['map.search', 'map.open', 'map.type.area', 'map.type.tag', 'map.type.post', 'map.connections', 'map.none', 'map.loading', 'map.nowebgl', 'map.error', 'map.close', 'map.empty', 'map.noresult'];
  function mapBox(lang, { area = '', chips = false } = {}) {
    const tt = Object.fromEntries(MAP_KEYS.map((k) => [k, T(lang, k)]));
    const wikis = Object.values(content.wikis);
    const chipRow = chips
      ? `<div class="kmap__areas" role="group" aria-label="${esc(T(lang, 'map.type.area'))}"><button type="button" class="chip" data-area-chip="-1" aria-pressed="true">${esc(T(lang, 'map.all'))}</button>${wikis
          .map((w, i) => `<button type="button" class="chip" data-area-chip="${i}" aria-pressed="false">${esc(L(w.title, lang))}</button>`)
          .join('')}</div>`
      : '';
    return `<div class="kmap" data-kmap data-src="${assets.graph}" data-area="${esc(area)}" data-lang="${lang}" data-prefix="${u(lang, '')}" data-t="${esc(JSON.stringify(tt))}">
<div class="kmap__bar">
<div class="kmap__find"><span class="search__icon">${icon('i-search')}</span><input class="kmap__search" type="search" autocomplete="off" spellcheck="false" aria-label="${esc(T(lang, 'map.search'))}" placeholder="${esc(T(lang, 'map.search'))}"><ul class="kmap__results" hidden></ul></div>
${chipRow}
<button type="button" class="btn btn--ghost btn--sm kmap__reset">${esc(T(lang, 'map.reset'))}</button>
</div>
<div class="kmap__stage"><canvas class="kmap__gl" aria-hidden="true"></canvas><canvas class="kmap__lbl" tabindex="0" role="application" aria-label="${esc(T(lang, 'map.label'))}. ${esc(T(lang, 'map.help'))}"></canvas><p class="kmap__status" role="status">${esc(T(lang, 'map.loading'))}</p><aside class="kmap__panel" hidden></aside></div>
<p class="kmap__help">${esc(T(lang, 'map.help'))}</p>
</div>`;
  }

  // the pages of one wiki as list or grid items (the same markup, shown either way by CSS)
  function itemList(lang, w, areaIdx) {
    const posts = w.pages.filter((p) => p.data.node !== 'tag');
    if (!posts.length) return emptyNote(lang);
    const li = posts
      .slice(0, CAP)
      .map((e) => {
        const v = pick(e, lang);
        const badge = draftBadge(lang, v.data);
        return `<li><a class="item" href="${u(lang, e.url)}"><span class="item__main"><strong class="item__title">${esc(v.data.title)}${badge ? ' ' + badge : ''}</strong>${v.data.summary ? `<span class="item__sum">${esc(v.data.summary)}</span>` : ''}</span>${icon('i-arrow', 'item__go flip')}</a></li>`;
      })
      .join('');
    const more =
      posts.length > CAP
        ? `<button type="button" class="btn btn--ghost btn--sm" data-more="${areaIdx}" data-shown="${CAP}" data-total="${posts.length}" data-src="${assets.graph}" data-prefix="${u(lang, '')}" data-lang="${lang}">${esc(T(lang, 'list.more'))}</button>`
        : '';
    return `<ul class="items">${li}</ul>${more}`;
  }

  function articlePage({ lang, entry, v, crumbList, prev, next, backLabel, nodeId }) {
    const d = v.data;
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
    const inner = `${crumbs(lang, crumbList)}
<div class="article-grid">
<article class="article">
<header class="article__head">
<h1>${esc(d.title)}</h1>
<p class="meta">${[dateEl(entry.date, lang), v.readMin ? `${v.readMin} ${esc(T(lang, 'hub.readtime'))}` : '', draftBadge(lang, d)].filter(Boolean).join(' · ')}</p>
${tagList(d.tags)}
</header>
${untranslatedNotice(lang, v)}
<div class="prose">${proseHtml(v)}</div>
${links}
${connected(lang, nodeId)}
${prev || next ? `<nav class="prevnext" aria-label="${esc(backLabel)}">${pn(prev, 'pn--prev', T(lang, 'hub.prev'))}${pn(next, 'pn--next', T(lang, 'hub.next'))}</nav>` : ''}
</article>
${toc}
</div>`;
    return layout({ lang, path: entry.url, title: d.title, description: d.summary, ogType: 'article', main: main(lang, inner, 'page--article') });
  }

  // One article page per item. Lists in reading order ("position") link forwards;
  // dated lists are newest first, so their "previous" is the next item down.
  function articles(lang, list, { parents, backLabel, byPosition = false, wikiId = '' }) {
    const step = byPosition ? 1 : -1;
    const link = (q) => (q ? { href: q.url, title: pick(q, lang).data.title } : null);
    return list.map((e, i) => {
      const v = pick(e, lang);
      return {
        path: e.url,
        html: articlePage({ lang, entry: e, v, crumbList: [...parents, { label: v.data.title }], prev: link(list[i - step]), next: link(list[i + step]), backLabel, nodeId: wikiId ? `${wikiId}/${e.slug}` : '' }),
      };
    });
  }

  const rowList = (lang, items, { showDate = true } = {}) =>
    `<ul class="rows">${items
      .map((e) => {
        const v = pick(e, lang);
        const badge = draftBadge(lang, v.data);
        return `<li><a class="row" href="${u(lang, e.url)}">
<span class="row__main"><strong class="row__title">${esc(v.data.title)}${badge ? ' ' + badge : ''}</strong>${v.data.summary ? `<span class="row__sum">${esc(v.data.summary)}</span>` : ''}</span>
${showDate && e.date ? `<span class="row__meta">${dateEl(e.date, lang)}</span>` : ''}
${icon('i-arrow', 'row__go flip')}</a></li>`;
      })
      .join('')}</ul>`;

  // the list page of a dated section (research, journey, guides) followed by its articles
  function datedSection(lang, { base, key, list, parent, pose }) {
    const inner = `${crumbs(lang, [parent, { label: T(lang, key) }])}${pageHead(lang, T(lang, key), T(lang, key + '.lead'), poseIcon(pose))}${list.length ? rowList(lang, list) : emptyNote(lang)}`;
    return [
      { path: base, html: layout({ lang, path: base, title: T(lang, key), description: T(lang, key + '.lead'), main: main(lang, inner, 'page--narrow') }) },
      ...articles(lang, list, { parents: [parent, { label: T(lang, key), href: base }], backLabel: T(lang, key) }),
    ];
  }

  const cardLink = (lang, { href, iconId, title, text, meta, badge }) =>
    `<a class="card" href="${u(lang, href)}">
<span class="card__icon circle circle--lg">${icon(iconId)}</span>
<span class="card__body"><strong class="card__title">${esc(title)}${badge ? ` <span class="badge">${esc(badge)}</span>` : ''}</strong><span class="card__text">${esc(text)}</span>${meta ? `<span class="card__meta">${esc(meta)}</span>` : ''}</span>
${icon('i-arrow', 'card__go flip')}</a>`;

  const countLabel = (lang, n) => `${n} ${T(lang, n === 1 ? 'hub.page' : 'hub.pages')}`;

  // ---------------------------------------------------------------- pages
  const pages = {};

  pages.home = (lang) => {
    const chips = site.suggestions[lang]
      .map((t) => `<li><button type="button" class="chip" data-suggest="${esc(t)}">${esc(t)}</button></li>`)
      .join('');
    const html = `<main id="main" class="home">
  <section class="home__hero" aria-labelledby="home-name">
    ${mascotIcon('pose-' + POSE_FOR.home, 'home__mascot')}
    <a class="status" href="${u(lang, '/services/')}"><span class="status__dot" aria-hidden="true"></span>${esc(T(lang, 'status.open'))}</a>
    <h1 id="home-name" class="home__name">${esc(L(site.name, lang))}</h1>
    <p class="home__suffix" dir="ltr">${esc(L(site.suffix, lang))}</p>
    <p class="home__tagline">${esc(L(site.tagline, lang))}</p>
    <p class="home__intro">${esc(L(site.intro, lang))}</p>
    ${socials(lang, 'socials--home')}
    ${searchBox(lang, 'h')}
    <ul class="suggest" aria-label="${esc(T(lang, 'home.try'))}">${chips}</ul>
  </section>
  ${footer(lang)}
</main>`;
    const ld = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: site.name.en,
      url: site.url,
      jobTitle: site.person.jobTitle,
      address: { '@type': 'PostalAddress', addressLocality: site.person.locality, addressCountry: site.person.country },
      sameAs: site.socials.map((s) => s.url),
    });
    return [{ path: '/', html: layout({ lang, path: '/', title: '', main: html, isHome: true, bodyClass: 'is-home', jsonld: ld }) }];
  };

  pages.about = (lang) => {
    const v = pick(content.pages.about, lang);
    const cred = content.pages['about-credentials'] ? pick(content.pages['about-credentials'], lang) : null;
    const timeline = content.career
      .map((e, i) => {
        const c = pick(e, lang).data;
        return `<li class="tl${i === 0 ? ' tl--now' : ''}"><span class="tl__dot" aria-hidden="true"></span><div class="tl__body"><p class="tl__period">${esc(c.period)}</p><h3 class="tl__role">${esc(c.title)}</h3><p class="tl__org">${esc(c.org)}</p><p class="tl__line">${esc(c.summary)}</p></div></li>`;
      })
      .join('');
    const ventures = site.ventures
      .map((x) => {
        const k = ctx.kyberia[x.id];
        const logo = k
          ? `<svg class="venture__logo" viewBox="0 0 ${k.w} ${k.h}" dir="ltr" aria-hidden="true" focusable="false"><use class="k-mark" href="${assets.sprite}#k-${x.id}-mark"/><use class="k-word" href="${assets.sprite}#k-${x.id}-word"/><use class="k-suffix" href="${assets.sprite}#k-${x.id}-suffix"/></svg><span class="visually-hidden">${esc(x.name)}</span>`
          : `<span class="venture__text" dir="ltr">${esc(x.name)}</span>`;
        return `<li><a class="venture brand-${x.id}" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer"><span class="venture__top">${logo}${icon('i-external', 'venture__go')}</span><span class="venture__blurb">${esc(L(x.blurb, lang))}</span></a></li>`;
      })
      .join('');
    const inner = `${pageHead(lang, v.data.title, v.data.summary, mascotIcon('pose-' + POSE_FOR.about, 'pagehead__mascot'))}${untranslatedNotice(lang, v)}
<div class="prose prose--page">${proseHtml(v)}</div>
<section id="timeline" aria-labelledby="tl-h"><h2 id="tl-h">${esc(T(lang, 'about.timeline'))}</h2><p class="lead">${esc(T(lang, 'about.timeline.lead'))}</p><ol class="timeline">${timeline}</ol></section>
<section id="ventures" aria-labelledby="vn-h"><h2 id="vn-h">${esc(T(lang, 'about.ventures'))}</h2><p class="lead">${esc(T(lang, 'about.ventures.lead'))}</p><ul class="ventures">${ventures}</ul></section>
${cred ? `<section id="credentials"><div class="prose prose--page">${proseHtml(cred)}</div></section>` : ''}
${socials(lang, 'socials--page')}`;
    return [{ path: '/about/', html: layout({ lang, path: '/about/', title: v.data.title, description: v.data.summary, main: main(lang, inner, 'page--narrow') }) }];
  };

  // ---- services: what I offer, how to engage, pricing agreed on contact
  pages.services = (lang) => {
    const S = ctx.services[lang] || ctx.services.en;
    const cards = S.services
      .map(
        (x) => `<li class="svc"><span class="svc__n">${esc(x.n)}</span><h3>${esc(x.title)}</h3><p class="svc__for">${esc(x.for)}</p><ul class="checks">${x.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></li>`
      )
      .join('');
    const inner = `${pageHead(lang, S.title, S.lead, poseIcon('services'))}
<div class="prose prose--page"><p>${esc(S.about)}</p></div>
<section aria-labelledby="sv-h"><h2 id="sv-h" class="eyebrow">${esc(S.servicesTitle)}</h2><ul class="svc-grid">${cards}</ul></section>
<section aria-labelledby="why-h"><h2 id="why-h" class="eyebrow">${esc(S.whyTitle)}</h2><ul class="checks checks--wide">${S.why.map((w) => `<li>${esc(w)}</li>`).join('')}</ul></section>
<section aria-labelledby="eng-h"><h2 id="eng-h" class="eyebrow">${esc(S.engageTitle)}</h2>
<ul class="tags tags--big">${S.types.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
<ul class="checks checks--wide">${S.terms.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></section>
<section class="svc-cta" aria-labelledby="pr-h"><h2 id="pr-h" class="eyebrow">${esc(S.pricingTitle)}</h2><p>${esc(S.pricing)}</p><p class="svc-cta__row"><a class="btn btn--primary" href="${u(lang, '/contact/')}">${esc(S.button)}${icon('i-arrow', 'flip')}</a></p></section>`;
    return [{ path: '/services/', html: layout({ lang, path: '/services/', title: S.title, description: S.lead, main: main(lang, inner, 'page--services') }) }];
  };

  pages.hub = (lang) => {
    const hub = { label: T(lang, 'hub.title'), href: '/hub/' };
    const wikis = Object.values(content.wikis);
    const wikiCards = wikis
      .map((w) => {
        const draft = (w.index && isDraft(w.index.data)) || w.pages.some((p) => isDraft(p.data));
        return cardLink(lang, {
          href: w.base,
          iconId: 'i-' + w.icon,
          title: L(w.title, lang),
          text: L(w.blurb, lang),
          meta: countLabel(lang, w.pages.length),
          badge: w.pages.length === 0 || draft ? T(lang, 'hub.draft') : '',
        });
      })
      .join('');
    const latest = content.journey.slice(0, 3);
    const itemsByArea = wikis
      .map((w, i) => `<section class="views__area" aria-labelledby="va-${w.id}"><h2 id="va-${w.id}" class="eyebrow"><a href="${u(lang, w.base)}">${esc(L(w.title, lang))}</a> · ${esc(countLabel(lang, w.pages.length))}</h2>${itemList(lang, w, i)}</section>`)
      .join('');
    const inner = `${pageHead(lang, T(lang, 'hub.title'), T(lang, 'hub.lead'), poseIcon('hub'))}
<div class="views" data-views data-default="map" data-view="map">
<div class="views__bar">${viewSwitcher(lang)}</div>
<div data-view-panel="map">${mapBox(lang, { chips: true })}</div>
<div data-view-panel="items">${itemsByArea}</div>
</div>
<section aria-labelledby="h-wikis"><h2 id="h-wikis" class="eyebrow">${esc(T(lang, 'hub.wikis'))}</h2><div class="cards">${wikiCards}</div></section>
<section aria-labelledby="h-more"><h2 id="h-more" class="eyebrow">${esc(T(lang, 'hub.research'))} · ${esc(T(lang, 'hub.journey'))}</h2><div class="cards cards--2">
${cardLink(lang, { href: C.research.base, iconId: 'i-file', title: T(lang, 'hub.research'), text: T(lang, 'hub.research.lead'), meta: countLabel(lang, content.research.length) })}
${cardLink(lang, { href: C.journey.base, iconId: 'i-compass', title: T(lang, 'hub.journey'), text: T(lang, 'hub.journey.lead'), meta: countLabel(lang, content.journey.length) })}
</div></section>
${latest.length ? `<section aria-labelledby="h-latest"><h2 id="h-latest" class="eyebrow">${esc(T(lang, 'hub.journey'))}</h2>${rowList(lang, latest)}</section>` : ''}`;
    const out = [{ path: '/hub/', html: layout({ lang, path: '/hub/', title: T(lang, 'hub.title'), description: T(lang, 'hub.lead'), main: main(lang, inner, 'page--map'), mapPage: true }) }];

    for (const [wi, w] of wikis.entries()) {
      const title = L(w.title, lang);
      const idx = w.index ? pick(w.index, lang) : null;
      const intro = idx ? `<div class="prose prose--intro">${proseHtml(idx)}</div>` : '';
      const topics = w.pages.filter((p) => p.data.node === 'tag');
      const topicRow = topics.length
        ? `<ul class="tags tags--links" aria-label="${esc(T(lang, 'list.topics'))}">${topics.map((p) => `<li><a href="${u(lang, p.url)}">${esc(pick(p, lang).data.title)}</a></li>`).join('')}</ul>`
        : '';
      const badge = w.index ? draftBadge(lang, w.index.data) : '';
      const inner2 = `${crumbs(lang, [hub, { label: title }])}
<header class="pagehead"><h1>${esc(title)} ${badge}</h1><p class="lead">${esc(L(w.blurb, lang))}</p></header>${intro}
<div class="views" data-views data-default="map" data-view="map">
<div class="views__bar">${viewSwitcher(lang)}</div>
<div data-view-panel="map">${mapBox(lang, { area: w.id })}</div>
<div data-view-panel="items">${topicRow}${itemList(lang, w, wi)}</div>
</div>`;
      out.push({ path: w.base, html: layout({ lang, path: w.base, title, description: L(w.blurb, lang), main: main(lang, inner2, 'page--map'), mapPage: true }) });
      out.push(...articles(lang, w.pages, { parents: [hub, { label: title, href: w.base }], backLabel: title, byPosition: true, wikiId: w.id }));
    }

    out.push(...datedSection(lang, { base: C.research.base, key: 'hub.research', list: content.research, parent: hub, pose: 'research' }));
    out.push(...datedSection(lang, { base: C.journey.base, key: 'hub.journey', list: content.journey, parent: hub, pose: 'journey' }));
    return out;
  };

  pages.resources = (lang) => {
    const resources = { label: T(lang, 'res.title'), href: '/resources/' };
    const dls = content.downloads;
    const guides = content.guides;
    const inner = `${pageHead(lang, T(lang, 'res.title'), T(lang, 'res.lead'), poseIcon('resources'))}
<div class="cards cards--2">
${cardLink(lang, { href: C.downloads.base, iconId: 'i-gift', title: T(lang, 'res.downloads'), text: T(lang, 'res.downloads.lead'), meta: `${dls.length} ${T(lang, 'dl.count')}` })}
${cardLink(lang, { href: C.guides.base, iconId: 'i-book', title: T(lang, 'res.guides'), text: T(lang, 'res.guides.lead'), meta: `${guides.length} ${T(lang, 'dl.count')}` })}
</div>`;
    const out = [{ path: '/resources/', html: layout({ lang, path: '/resources/', title: T(lang, 'res.title'), description: T(lang, 'res.lead'), main: main(lang, inner) }) }];
    out.push(...datedSection(lang, { base: C.guides.base, key: 'res.guides', list: guides, parent: resources, pose: 'guides' }));

    // downloads
    const base = C.downloads.base;
    const catIds = [...new Set(dls.map((d) => d.data.category).filter(Boolean))];
    const typeIds = [...new Set(dls.map((d) => d.data.type).filter(Boolean))];
    const catLabel = (id) => L(site.resourceCategories.find((c) => c.id === id)?.label, lang) || id;
    const typeLabel = (id) => L(site.resourceTypes.find((c) => c.id === id)?.label, lang) || id;
    // an uploaded file is downloaded; otherwise the item links out to where it is hosted
    const getLink = (e, d) => {
      const local = !!e.fileInfo;
      return {
        local,
        href: local ? d.file : d.url,
        fmt: d.format || e.fileInfo?.ext || '',
        attrs: local ? 'download' : 'target="_blank" rel="noopener noreferrer"',
        iconId: local ? 'i-download' : 'i-external',
        label: T(lang, local ? 'dl.download' : 'dl.external'),
      };
    };
    const chips = (name, ids, labelOf, groupLabel) =>
      ids.length > 1
        ? `<div class="chips" role="group" aria-label="${esc(groupLabel)}" data-chip-group="${name}"><span class="chips__label">${esc(groupLabel)}</span><button type="button" class="chip" data-value="all" aria-pressed="true">${esc(T(lang, 'dl.all'))}</button>${ids
            .map((id) => `<button type="button" class="chip" data-value="${esc(id)}" aria-pressed="false">${esc(labelOf(id))}</button>`)
            .join('')}</div>`
        : '';
    const cards = dls
      .map((e) => {
        const d = pick(e, lang).data;
        const get = getLink(e, d);
        const hay = normalise([d.title, d.summary, (d.tags || []).join(' '), catLabel(d.category), typeLabel(d.type), get.fmt].join(' '));
        const badge = draftBadge(lang, d);
        return `<li class="dl-card" data-cat="${esc(d.category || '')}" data-type="${esc(d.type || '')}" data-hay="${esc(hay)}">
<div class="dl-card__top"><span class="chip chip--static">${esc(catLabel(d.category))}</span>${d.type ? `<span class="chip chip--static">${esc(typeLabel(d.type))}</span>` : ''}${get.fmt ? `<span class="dl-card__fmt">${esc(get.fmt)}</span>` : ''}</div>
<h2 class="dl-card__title"><a href="${u(lang, e.url)}">${esc(d.title)}</a>${badge ? ' ' + badge : ''}</h2>
<p class="dl-card__sum">${esc(d.summary || '')}</p>
<div class="dl-card__foot"><span class="dl-card__free">${esc(T(lang, 'dl.free'))}${e.fileInfo ? ` · ${esc(e.fileInfo.size)}` : ''}</span>${
          get.href ? `<a class="circle" href="${esc(get.href)}" ${get.attrs} aria-label="${esc(get.label)}: ${esc(d.title)}">${icon(get.iconId)}</a>` : ''
        }</div></li>`;
      })
      .join('');
    const listInner = `${crumbs(lang, [resources, { label: T(lang, 'res.downloads') }])}${pageHead(lang, T(lang, 'res.downloads'), T(lang, 'res.downloads.lead'), poseIcon('downloads'))}
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
    : emptyNote(lang, 'res.empty')
}`;
    out.push({ path: base, html: layout({ lang, path: base, title: T(lang, 'res.downloads'), description: T(lang, 'res.downloads.lead'), main: main(lang, listInner) }) });

    for (const e of dls) {
      const v = pick(e, lang);
      const d = v.data;
      const get = getLink(e, d);
      const badge = draftBadge(lang, d);
      const rows = [
        [T(lang, 'dl.category'), catLabel(d.category)],
        d.type ? [T(lang, 'dl.type'), typeLabel(d.type)] : null,
        get.fmt ? [T(lang, 'dl.format'), get.fmt] : null,
        e.fileInfo ? [T(lang, 'dl.size'), e.fileInfo.size] : null,
        d.version ? [T(lang, 'dl.version'), String(d.version)] : null,
        e.date ? [T(lang, 'dl.added'), fmtDate(e.date, lang)] : null,
      ].filter(Boolean);
      const inner2 = `${crumbs(lang, [resources, { label: T(lang, 'res.downloads'), href: base }, { label: d.title }])}
<div class="article-grid">
<article class="article">
<header class="article__head"><h1>${esc(d.title)}${badge ? ' ' + badge : ''}</h1><p class="lead">${esc(d.summary || '')}</p>${tagList(d.tags)}</header>
${untranslatedNotice(lang, v)}
<div class="prose">${proseHtml(v)}</div>
</article>
<aside class="getbox" aria-label="${esc(T(lang, 'dl.download'))}">
<dl>${rows.map(([k, val]) => `<div><dt>${esc(k)}</dt><dd>${esc(val)}</dd></div>`).join('')}</dl>
${get.href ? `<a class="btn btn--primary btn--block" href="${esc(get.href)}" ${get.attrs}>${icon(get.iconId)}<span>${esc(get.label)} · ${esc(T(lang, 'dl.free'))}</span></a>` : ''}
</aside>
</div>`;
      out.push({ path: e.url, html: layout({ lang, path: e.url, title: d.title, description: d.summary, main: main(lang, inner2) }) });
    }
    return out;
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
    const inner = `${pageHead(lang, T(lang, 'contact.title'), T(lang, 'contact.lead'), poseIcon('contact'))}
<div class="contact-grid">
<section>${form}</section>
<aside class="contact-side">
<dl class="facts"><div><dt>${esc(T(lang, 'contact.location'))}</dt><dd>${esc(L(site.contact.location, lang))}</dd></div></dl>
<h2 class="eyebrow">${esc(T(lang, 'contact.socials'))}</h2>
${socials(lang, 'socials--page')}
</aside>
</div>`;
    return [{ path: '/contact/', html: layout({ lang, path: '/contact/', title: T(lang, 'contact.title'), description: T(lang, 'contact.lead'), main: main(lang, inner) }) }];
  };

  pages.notFound = (lang) => {
    const inner = `<div class="notfound">${mascotIcon('pose-' + POSE_FOR.notFound, 'notfound__mascot')}<h1>${esc(T(lang, '404.title'))}</h1><p class="lead">${esc(T(lang, '404.lead'))}</p><a class="btn btn--primary" href="${u(lang, '/')}">${esc(T(lang, '404.home'))}</a></div>`;
    return [{ path: '/404/', html: layout({ lang, path: '/404/', title: T(lang, '404.title'), main: main(lang, inner, 'page--narrow'), noindex: true, switchPath: '/' }) }];
  };

  return { pages, T, L };
}
