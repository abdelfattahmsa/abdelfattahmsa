/* Ask AM!: the assistant behind the sticky mascot. It answers from this site's own pages (ask-index.json).
   Without an endpoint it shows the best matching passages with links (no server, nothing leaves the page).
   With site.assistant.endpoint set, it sends the question and those passages to the worker in worker/ and shows its answer. */
(function () {
  'use strict';
  var doc = document, panel = doc.querySelector('[data-ask]');
  if (!panel) return;
  /* @normalise: the build inserts the Arabic-aware normalise() here */
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var S = {};
  try { S = JSON.parse(panel.dataset.i); } catch (e) { /* defaults below */ }
  var log = $('.ask__log', panel), form = $('.ask__form', panel), input = $('input', form), sugg = $('.ask__suggest', panel);
  var endpoint = panel.dataset.endpoint || '', lang = doc.body.dataset.lang || 'en';
  var history = [], idx = null, loading = null, busy = false, greeted = false;

  var STOP = /^(the|and|for|are|was|you|your|what|who|how|why|when|where|with|about|can|does|did|is|am|a|an|of|to|in|on|at|it|me|my|i|do|من|في|على|عن|ما|ماذا|كيف|هل|هو|هي|ان|إن|الى|إلى|مع)$/;

  function load() {
    if (!loading) loading = fetch(panel.dataset.index, { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (j) {
      idx = j.i.map(function (it) { return { t: it.t, u: it.u, k: it.k, nt: normalise(it.t), p: it.p.map(function (x) { return { x: x, n: normalise(x) }; }) }; });
      return idx;
    }).catch(function () { idx = []; return idx; });
    return loading;
  }
  function retrieve(q, max) {
    var tokens = normalise(q).split(/[^\p{L}\p{N}]+/u).filter(function (t) { return t.length > 1 && !STOP.test(t); });
    if (!tokens.length || !idx) return [];
    var N = 0, df = {};
    idx.forEach(function (it) { it.p.forEach(function (p) { N++; tokens.forEach(function (t) { if (p.n.indexOf(t) !== -1) df[t] = (df[t] || 0) + 1; }); }); });
    var out = [];
    idx.forEach(function (it) {
      var best = null;
      it.p.forEach(function (p) {
        var s = 0;
        tokens.forEach(function (t) {
          var w = Math.log(1 + N / (1 + (df[t] || 0)));
          if (p.n.indexOf(t) !== -1) s += w;
          if (it.nt.indexOf(t) !== -1) s += w * 1.5;
        });
        if (s > 0 && (!best || s > best.s)) best = { s: s, x: p.x };
      });
      if (best) out.push({ s: best.s, t: it.t, u: it.u, x: best.x });
    });
    out.sort(function (a, b) { return b.s - a.s; });
    return out.slice(0, max || 4);
  }

  function msg(role, text, sources) {
    var m = doc.createElement('div'); m.className = 'ask__msg ask__msg--' + role;
    var p = doc.createElement('p'); p.textContent = text; m.appendChild(p);
    if (sources && sources.length) {
      var ul = doc.createElement('ul'); ul.className = 'ask__src';
      sources.forEach(function (s) {
        var li = doc.createElement('li'), a = doc.createElement('a');
        a.href = s.u; a.textContent = s.t; a.addEventListener('click', function () { track('ask_source_click', { page: s.u }); });
        li.appendChild(a);
        if (s.x) { var sp = doc.createElement('span'); sp.textContent = s.x.length > 170 ? s.x.slice(0, 167) + '…' : s.x; li.appendChild(sp); }
        ul.appendChild(li);
      });
      m.appendChild(ul);
    }
    log.appendChild(m); log.scrollTop = log.scrollHeight;
    return m;
  }
  function track(name, params) { if (window.amTrack) window.amTrack(name, params); }

  function answer(q) {
    if (busy) return;
    busy = true; msg('user', q);
    var wait = msg('bot', S.thinking || '…'); wait.classList.add('is-wait');
    track('ask_question', { length: q.length, mode: endpoint ? 'ai' : 'search' });
    load().then(function () {
      var hits = retrieve(q, endpoint ? 6 : 3);
      if (!endpoint) return { text: hits.length ? S.found : S.none, sources: hits };
      return fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q: q, lang: lang, history: history.slice(-6), passages: hits.map(function (h) { return { t: h.t, u: h.u, x: h.x }; }) }) })
        .then(function (r) { if (!r.ok) throw new Error('bad'); return r.json(); })
        .then(function (j) { return { text: j.answer || S.none, sources: hits.slice(0, 3).map(function (h) { return { t: h.t, u: h.u }; }) }; })
        .catch(function () { return { text: S.error + ' ' + (hits.length ? S.found : S.none), sources: hits.slice(0, 3) }; });
    }).then(function (r) {
      wait.remove(); msg('bot', r.text, r.sources);
      history.push({ r: 'user', t: q }, { r: 'assistant', t: r.text });
      if (!r.sources.length) track('ask_no_answer', {});
    }).then(function () { busy = false; });
  }

  function open(q) {
    panel.hidden = false;
    doc.documentElement.classList.add('ask-open');
    if (!greeted) { greeted = true; msg('bot', S.hello); load(); }
    track('ask_open', {});
    if (q && q.trim()) { answer(q.trim()); input.value = ''; } else input.focus();
  }
  function close() { panel.hidden = true; doc.documentElement.classList.remove('ask-open'); var fab = $('.contact__fab'); if (fab) fab.focus(); }

  form.addEventListener('submit', function (e) { e.preventDefault(); var q = input.value.trim(); if (!q) return; input.value = ''; answer(q); });
  $('.ask__close', panel).addEventListener('click', close);
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) close(); });
  sugg.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) answer(b.textContent); });
  window.addEventListener('ask-am', function (e) { open(e.detail && e.detail.q); });
})();
