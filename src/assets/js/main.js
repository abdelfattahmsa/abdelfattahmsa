/* Abdelfattah M. — site behaviour. No dependencies, no inline handlers (CSP-safe). */
(function () {
  'use strict';

  var doc = document;
  var body = doc.body;
  var root = doc.documentElement;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };

  // Same normalisation as the build (Arabic-aware).
  function normalise(s) {
    return String(s || '').toLowerCase()
      .replace(/[ً-ٰٟـ]/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه');
  }

  /* ------------------------------------------------------------ theme */
  $$('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = root.dataset.theme === 'light' ? 'dark' : 'light';
      root.dataset.theme = next;
      store.set('theme', next);
    });
  });

  /* ------------------------------------------------------------ year */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ------------------------------------------------------------ hub drawer */
  (function () {
    var toggle = $('#hub-toggle');
    var drawer = $('#hub-drawer');
    var scrim = $('[data-scrim]');
    if (!toggle || !drawer) return;
    var lastFocus = null;

    function focusables() {
      // skip anything inside a collapsed <details> (except its own summary): the browser skips it too
      return $$('a[href],button:not([disabled]),summary', drawer).filter(function (el) {
        var d = el.closest('details');
        return !d || d.open || (el.tagName === 'SUMMARY' && el.parentElement === d);
      });
    }
    function open() {
      lastFocus = doc.activeElement;
      drawer.removeAttribute('inert');
      drawer.classList.add('is-open');
      scrim.classList.add('is-open');
      body.classList.add('has-drawer');
      toggle.setAttribute('aria-expanded', 'true');
      var cur = $('[aria-current="page"]', drawer);
      var first = cur || focusables()[0];
      if (first) { if (cur) { var d = cur.closest('details'); if (d) d.open = true; } first.focus({ preventScroll: true }); }
    }
    function close(restore) {
      drawer.classList.remove('is-open');
      scrim.classList.remove('is-open');
      body.classList.remove('has-drawer');
      toggle.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('inert', '');
      if (restore !== false && lastFocus) lastFocus.focus({ preventScroll: true });
    }
    function isOpen() { return drawer.classList.contains('is-open'); }

    toggle.addEventListener('click', function () { isOpen() ? close() : open(); });
    scrim.addEventListener('click', function () { close(); });
    $$('[data-drawer-close]', drawer).forEach(function (b) { b.addEventListener('click', function () { close(); }); });
    doc.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'Tab') {
        var f = focusables();
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  })();

  /* ------------------------------------------------------------ phone menu (hamburger) */
  (function () {
    var btn = $('#nav-toggle');
    var panel = $('#nav-panel');
    if (!btn || !panel) return;
    function set(open) {
      panel.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    btn.addEventListener('click', function (e) { e.stopPropagation(); set(!panel.classList.contains('is-open')); });
    doc.addEventListener('click', function (e) {
      if (panel.classList.contains('is-open') && !panel.contains(e.target)) set(false);
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) { set(false); btn.focus(); }
    });
    window.matchMedia('(min-width:821px)').addEventListener('change', function () { set(false); });
  })();

  /* ------------------------------------------------------------ search */
  var indexPromise = null;
  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch(body.dataset.searchIndex, { credentials: 'same-origin' })
        .then(function (r) { return r.json(); })
        .catch(function () { return { l: {}, i: [] }; });
    }
    return indexPromise;
  }

  function runSearch(items, q) {
    var tokens = normalise(q).split(/\s+/).filter(Boolean);
    if (!tokens.length) return [];
    var out = [];
    items.forEach(function (it) {
      var score = 0;
      for (var i = 0; i < tokens.length; i++) {
        var t = tokens[i], s = 0;
        if (it.a.indexOf(t) !== -1) s += it.a.indexOf(t) === 0 ? 12 : 8;
        if (it.b.indexOf(t) !== -1) s += 5;
        if (it.c.indexOf(t) !== -1) s += 3;
        if (it.d.indexOf(t) !== -1) s += 1;
        if (!s) return; // every token must match somewhere
        score += s;
      }
      out.push({ it: it, score: score });
    });
    out.sort(function (a, b) { return b.score - a.score; });
    return out.slice(0, 8).map(function (o) { return o.it; });
  }

  function initSearch(box, hooks) {
    var input = $('input', box);
    var list = $('.search__results', box);
    var clear = $('.search__clear', box);
    var active = -1;
    var labels = {};

    function setActive(i) {
      var opts = $$('li', list);
      opts.forEach(function (li, n) { li.setAttribute('aria-selected', n === i ? 'true' : 'false'); });
      active = i;
      if (opts[i]) { input.setAttribute('aria-activedescendant', opts[i].id); opts[i].scrollIntoView({ block: 'nearest' }); }
      else input.removeAttribute('aria-activedescendant');
    }
    function hide() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); active = -1; }
    function render(results, q) {
      list.textContent = '';
      if (!q.trim()) { hide(); return; }
      if (!results.length) {
        var none = doc.createElement('li');
        none.className = 'search__none';
        none.textContent = list.dataset.none + ' “' + q.trim() + '”';
        list.appendChild(none);
      }
      results.forEach(function (r, n) {
        var li = doc.createElement('li');
        li.id = list.id + '-' + n;
        li.setAttribute('role', 'option');
        var a = doc.createElement('a');
        a.href = r.u;
        var t = doc.createElement('span'); t.className = 'search__title';
        var name = doc.createElement('span'); name.textContent = r.t;
        var type = doc.createElement('span'); type.className = 'search__type'; type.textContent = labels[r.k] || r.k;
        t.appendChild(name); t.appendChild(type); a.appendChild(t);
        if (r.s) { var s = doc.createElement('span'); s.className = 'search__sum'; s.textContent = r.s; a.appendChild(s); }
        li.appendChild(a); list.appendChild(li);
      });
      list.hidden = false;
      // keep the dropdown inside the viewport; CSSOM writes are CSP-safe
      list.style.maxBlockSize = Math.max(180, Math.floor(innerHeight - box.getBoundingClientRect().bottom - 28)) + 'px';
      input.setAttribute('aria-expanded', 'true');
      setActive(-1);
    }
    function update() {
      var q = input.value;
      clear.hidden = !q;
      loadIndex().then(function (idx) {
        labels = idx.l || {};
        render(runSearch(idx.i || [], q), q);
      });
    }

    input.addEventListener('input', update);
    input.addEventListener('focus', function () { loadIndex(); if (input.value) update(); });
    clear.addEventListener('click', function () { input.value = ''; clear.hidden = true; hide(); input.focus(); });
    input.addEventListener('keydown', function (e) {
      var opts = $$('li[role="option"]', list);
      if (e.key === 'ArrowDown') { e.preventDefault(); if (opts.length) setActive((active + 1) % opts.length); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (opts.length) setActive((active - 1 + opts.length) % opts.length); }
      else if (e.key === 'Enter') {
        var target = opts[active] || opts[0];
        if (target) { e.preventDefault(); location.href = $('a', target).href; }
      } else if (e.key === 'Escape') {
        if (!list.hidden) { e.preventDefault(); e.stopPropagation(); hide(); }
        else if (hooks && hooks.onEscape) hooks.onEscape();
      }
    });
    doc.addEventListener('click', function (e) { if (!box.contains(e.target)) hide(); });
    return { focus: function () { input.focus(); input.select(); } };
  }

  var searchBoxes = $$('[data-search]').map(function (box) {
    var inOverlay = !!box.closest('[data-search-overlay]');
    return { box: box, overlay: inOverlay, api: initSearch(box, inOverlay ? { onEscape: closeOverlay } : null) };
  });
  // suggestion chips under the home search: fill the box and run it
  $$('[data-suggest]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var hero = searchBoxes.filter(function (b) { return !b.overlay; })[0];
      if (!hero) return;
      var input = $('input', hero.box);
      input.value = chip.dataset.suggest;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();
    });
  });
  var overlay = $('[data-search-overlay]');
  var opener = null;
  function openOverlay() {
    if (!overlay) return;
    opener = doc.activeElement;
    overlay.hidden = false;
    var s = searchBoxes.filter(function (b) { return b.overlay; })[0];
    if (s) s.api.focus();
  }
  function closeOverlay() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    if (opener) opener.focus({ preventScroll: true });
  }
  $$('[data-search-open]').forEach(function (b) { b.addEventListener('click', openOverlay); });
  if (overlay) overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) closeOverlay(); });
  doc.addEventListener('keydown', function (e) {
    var tag = (doc.activeElement && doc.activeElement.tagName) || '';
    var typing = /INPUT|TEXTAREA|SELECT/.test(tag) || (doc.activeElement && doc.activeElement.isContentEditable);
    if ((e.key === '/' && !typing && !e.ctrlKey && !e.metaKey) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
      e.preventDefault();
      var hero = searchBoxes.filter(function (b) { return !b.overlay; })[0];
      if (hero) hero.api.focus(); else openOverlay();
    } else if (e.key === 'Escape' && overlay && !overlay.hidden) {
      closeOverlay();
    }
  });

  /* ------------------------------------------------------------ downloads filter */
  (function () {
    var wrap = $('[data-downloads]');
    if (!wrap) return;
    var cards = $$('.dl-card', wrap);
    var q = $('[data-dl-q]', wrap);
    var count = $('[data-dl-count]', wrap);
    var empty = $('[data-dl-empty]', wrap);
    var state = { cat: 'all', type: 'all', q: '' };

    var saved = store.get('dl-view');
    if (saved === 'list' || saved === 'grid') setView(saved);

    function setView(v) {
      wrap.dataset.view = v;
      $$('[data-view-btn]', wrap).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.viewBtn === v)); });
    }
    $$('[data-view-btn]', wrap).forEach(function (b) {
      b.addEventListener('click', function () { setView(b.dataset.viewBtn); store.set('dl-view', b.dataset.viewBtn); });
    });
    $$('[data-chip-group]', wrap).forEach(function (g) {
      $$('.chip', g).forEach(function (chip) {
        chip.addEventListener('click', function () {
          state[g.dataset.chipGroup] = chip.dataset.value;
          $$('.chip', g).forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
          apply();
        });
      });
    });
    function apply() {
      var terms = normalise(state.q).split(/\s+/).filter(Boolean);
      var shown = 0;
      cards.forEach(function (c) {
        var ok = (state.cat === 'all' || c.dataset.cat === state.cat) &&
                 (state.type === 'all' || c.dataset.type === state.type) &&
                 terms.every(function (t) { return c.dataset.hay.indexOf(t) !== -1; });
        c.hidden = !ok;
        if (ok) shown++;
      });
      count.textContent = shown + ' ' + count.dataset.label;
      empty.hidden = shown !== 0;
    }
    q.addEventListener('input', function () { state.q = q.value; apply(); });
    var reset = $('[data-dl-reset]', wrap);
    if (reset) reset.addEventListener('click', function () {
      state = { cat: 'all', type: 'all', q: '' }; q.value = '';
      $$('[data-chip-group]', wrap).forEach(function (g) { $$('.chip', g).forEach(function (c, i) { c.setAttribute('aria-pressed', String(i === 0)); }); });
      apply();
    });
    apply();
  })();

  /* ------------------------------------------------------------ contact form */
  (function () {
    var form = $('[data-contact]');
    if (!form) return;
    var status = $('[data-status]', form);
    var btn = $('button[type="submit"]', form);
    var d = form.dataset;

    function say(msg, state) { status.textContent = msg; status.dataset.state = state || ''; }
    function inbox() { try { return atob(d.inbox); } catch (e) { return ''; } }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = new FormData(form);
      if (data.get('_gotcha')) { say(d.msgSent, 'ok'); form.reset(); return; } // bot: pretend success
      if (d.endpoint) {
        btn.disabled = true; say(d.msgSending, '');
        fetch(d.endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
          .then(function (r) { if (!r.ok) throw new Error('bad status'); say(d.msgSent, 'ok'); form.reset(); })
          .catch(function () { say(d.msgError, 'error'); })
          .then(function () { btn.disabled = false; });
      } else {
        // No form service configured yet: open the visitor's mail app, pre-filled.
        var subject = (data.get('subject') || '').toString().trim() || 'Message from abdelfattah.site';
        var text = (data.get('message') || '') + '\n\n— ' + data.get('name') + ' <' + data.get('email') + '>';
        say(d.msgFallback, '');
        location.href = 'mailto:' + inbox() + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
      }
    });
  })();
})();
