/* Analytics: Google Analytics 4, loaded only after the visitor accepts the cookie notice (Consent Mode: denied until then).
   Beyond page views it records how people use the site: scroll depth, contact and download clicks, outbound links,
   searches, the assistant, the knowledge map, language and theme switches, and page speed (Web Vitals).
   Nothing runs without a measurement ID in site.json (analytics.ga4), and the cookie notice is only shown then. */
(function () {
  'use strict';
  var doc = document, body = doc.body, id = body.dataset.ga;
  if (!id) return;
  var KEY = 'am-consent', loaded = false, started = false, granted = false;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function write(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* private mode: asks again next visit */ } }

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', wait_for_update: 500 });

  window.amTrack = function (name, params) { if (granted && loaded) gtag('event', name, params || {}); };

  function load() {
    granted = true;
    if (!loaded) {
      loaded = true;
      var s = doc.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
      doc.head.appendChild(s);
      gtag('js', new Date());
      gtag('config', id, { page_language: doc.documentElement.lang, content_group: pageGroup(), allow_google_signals: false, allow_ad_personalization_signals: false });
    }
    gtag('consent', 'update', { analytics_storage: 'granted' });
    start();
  }
  function revoke() {
    granted = false;
    window['ga-disable-' + id] = true;
    gtag('consent', 'update', { analytics_storage: 'denied' });
    doc.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (n.indexOf('_ga') === 0) { doc.cookie = n + '=; Max-Age=0; path=/'; doc.cookie = n + '=; Max-Age=0; path=/; domain=' + location.hostname; }
    });
  }
  function pageGroup() {
    var p = location.pathname.replace(/^\/ar\//, '/').split('/')[1] || 'home';
    return p;
  }

  /* ---- the cookie notice */
  var banner = $('[data-consent]');
  function show() { if (banner) { banner.hidden = false; $('[data-consent-accept]', banner).focus({ preventScroll: true }); } }
  function hide() { if (banner) banner.hidden = true; }
  if (banner) {
    $('[data-consent-accept]', banner).addEventListener('click', function () { write('granted'); hide(); load(); });
    $('[data-consent-decline]', banner).addEventListener('click', function () { write('denied'); hide(); revoke(); });
  }
  doc.addEventListener('click', function (e) { if (e.target.closest('[data-consent-open]')) { e.preventDefault(); show(); } });
  var saved = read();
  if (saved === 'granted') load(); else if (saved !== 'denied') show();

  /* ---- what people do (starts once consent is given) */
  function start() {
    if (started) return;
    started = true;
    var t = window.amTrack;

    // scroll depth
    var marks = [25, 50, 75, 100], done = {}, ticking = false;
    function depth() {
      ticking = false;
      var h = doc.documentElement, max = h.scrollHeight - h.clientHeight;
      if (max < 200) return;
      var pct = Math.round(((window.pageYOffset || h.scrollTop) / max) * 100);
      marks.forEach(function (m) { if (pct >= m && !done[m]) { done[m] = 1; t('scroll_depth', { percent: m }); } });
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(depth); } }, { passive: true });

    // clicks: contact, downloads, outbound, language, theme, back to top
    doc.addEventListener('click', function (e) {
      var a = e.target.closest('a,button');
      if (!a) return;
      if (a.dataset.contactKind) return t('contact_click', { kind: a.dataset.contactKind });
      if (a.hasAttribute('data-theme-toggle')) return t('theme_change', {});
      if (a.hasAttribute('data-totop')) return t('back_to_top', {});
      if (a.dataset && a.dataset.suggest !== undefined) return t('suggestion_click', { term: a.dataset.suggest });
      var href = a.getAttribute && a.getAttribute('href');
      if (!href) return;
      if (a.hasAttribute('hreflang') || a.dataset.langSwitch !== undefined) return t('language_switch', { to: a.getAttribute('hreflang') || '' });
      if (/^mailto:/.test(href)) return t('contact_click', { kind: 'mail' });
      if (/^tel:/.test(href)) return t('contact_click', { kind: 'phone' });
      if (/^\/downloads\//.test(href) || /\.(pdf|zip|xlsx?|docx?|pptx?|csv)(\?|$)/i.test(href)) return t('file_download', { file: href.split('/').pop(), page: location.pathname });
      if (/^https?:\/\//.test(href) && a.hostname && a.hostname !== location.hostname) return t('outbound_click', { domain: a.hostname, url: href });
    });

    // searches (after the visitor pauses typing)
    var timer;
    doc.addEventListener('input', function (e) {
      var i = e.target;
      if (!i.matches || !i.matches('[data-search] input, .kmap__search')) return;
      clearTimeout(timer);
      timer = setTimeout(function () { if (i.value.trim().length > 2) t('site_search', { search_term: i.value.trim().slice(0, 80), where: i.closest('.kmap__find') ? 'map' : 'site' }); }, 1200);
    });

    // reading: time with the tab visible, sent when the visitor leaves
    var visible = 0, since = doc.visibilityState === 'visible' ? Date.now() : 0;
    // Web Vitals
    var lcp = 0, cls = 0, inp = 0;
    try { new PerformanceObserver(function (l) { var e = l.getEntries(); lcp = e[e.length - 1].startTime; }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch (e) { /* unsupported */ }
    try { new PerformanceObserver(function (l) { l.getEntries().forEach(function (x) { if (!x.hadRecentInput) cls += x.value; }); }).observe({ type: 'layout-shift', buffered: true }); } catch (e) { /* unsupported */ }
    try { new PerformanceObserver(function (l) { l.getEntries().forEach(function (x) { if (x.interactionId && x.duration > inp) inp = x.duration; }); }).observe({ type: 'event', durationThreshold: 40, buffered: true }); } catch (e) { /* unsupported */ }
    var sent = false;
    function leave() {
      if (since) { visible += Date.now() - since; since = 0; }
      if (sent || !granted) return;
      sent = true;
      t('page_summary', { engaged_seconds: Math.round(visible / 1000), lcp_ms: Math.round(lcp), cls: Math.round(cls * 1000) / 1000, inp_ms: Math.round(inp), width: window.innerWidth });
    }
    doc.addEventListener('visibilitychange', function () {
      if (doc.visibilityState === 'hidden') leave();
      else { since = Date.now(); sent = false; }
    });
    window.addEventListener('pagehide', leave);
  }
})();
