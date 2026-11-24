/* Ask AM!: a search that answers in chat form. It runs entirely in the browser over this site's own text
   (ask-index.json: the wikis plus the about, services and career pages). There is no server and no AI service:
   every reply is a passage from the wikis, put into a short chat message with a link to the full page. */
(function () {
  'use strict';
  var doc = document, panel = doc.querySelector('[data-ask]');
  if (!panel) return;
  /* @normalise: the build inserts the Arabic-aware normalise() here */
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var S = {};
  try { S = JSON.parse(panel.dataset.i); } catch (e) { return; }
  var log = $('.ask__log', panel), form = $('.ask__form', panel), input = $('input', form), sugg = $('.ask__suggest', panel);
  var idx = null, loading = null, greeted = false, queue = [];

  var STOP = /^(the|and|for|are|was|you|your|what|who|how|why|when|where|with|about|can|does|did|is|am|a|an|of|to|in|on|at|it|me|my|i|do|tell|please|من|في|على|عن|ما|ماذا|كيف|هل|هو|هي|ان|الى|مع)$/;
  var RX = {
    greet: /^(hi|hello|hey|hola|salam|good (morning|evening|afternoon)|مرحبا|اهلا|السلام|صباح|مساء)/,
    thanks: /(thank|thanks|cheers|شكرا)/,
    more: /^(more|next|continue|go on|tell me more|المزيد|كمل|تابع|زيدني)/,
    who: /(who are you|who is abdel|about you|about him|about abdel|tell me about yourself|من انت|من هو|عن نفسك|تعريف)/,
    contact: /(contact|e-?mail|reach you|call you|whatsapp|talk to you|تواصل|اتصل|ايميل|بريد|واتساب)/,
    services: /(services?|pricing|price|rates|hire you|work with you|خدمات|خدمه|سعر|اسعار|تكلف)/,
  };

  function track(name, params) { if (window.amTrack) window.amTrack(name, params); }
  function load() {
    if (!loading) loading = fetch(panel.dataset.index, { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (j) {
      idx = j.i.map(function (it) { return { t: it.t, u: it.u, k: it.k, nt: normalise(it.t), p: it.p.map(function (x) { return { x: x, n: normalise(x) }; }) }; });
      return idx;
    }).catch(function () { idx = []; return idx; });
    return loading;
  }

  // the best passages for a question, at most one per page, best first
  function retrieve(q, max) {
    var tokens = normalise(q).split(/[^\p{L}\p{N}]+/u).filter(function (t) { return t.length > 1 && !STOP.test(t); });
    if (!tokens.length || !idx) return [];
    var N = 0, df = {};
    idx.forEach(function (it) { it.p.forEach(function (p) { N++; tokens.forEach(function (t) { if (p.n.indexOf(t) !== -1) df[t] = (df[t] || 0) + 1; }); }); });
    var out = [];
    idx.forEach(function (it) {
      var best = null;
      it.p.forEach(function (p) {
        var s = 0, hit = 0;
        tokens.forEach(function (t) {
          var w = Math.log(1 + N / (1 + (df[t] || 0)));
          if (p.n.indexOf(t) !== -1) { s += w; hit++; }
          if (it.nt.indexOf(t) !== -1) { s += w * 1.5; hit++; }
        });
        s *= 1 + hit / (2 * tokens.length); // passages that match more of the question rank higher
        if (s > 0 && (!best || s > best.s)) best = { s: s, x: p.x };
      });
      if (best) out.push({ s: best.s * (it.k === 'page' ? 0.75 : 1.25), t: it.t, u: it.u, x: best.x }); // the wikis come first
    });
    out.sort(function (a, b) { return b.s - a.s; });
    return out.slice(0, max || 6);
  }

  /* ---- messages */
  function link(text, href) { var a = doc.createElement('a'); a.href = href; a.textContent = text; a.addEventListener('click', function () { track('ask_source_click', { page: href }); }); return a; }
  // text: paragraphs split by newline; links: [{t,u}]; more: show a "More" button
  function msg(role, text, o) {
    o = o || {};
    var m = doc.createElement('div'); m.className = 'ask__msg ask__msg--' + role;
    String(text).split('\n').forEach(function (line) { var p = doc.createElement('p'); p.textContent = line; m.appendChild(p); });
    if (o.links && o.links.length) {
      var ul = doc.createElement('ul'); ul.className = 'ask__src';
      o.links.forEach(function (l) { var li = doc.createElement('li'); li.appendChild(link(l.t, l.u)); ul.appendChild(li); });
      m.appendChild(ul);
    }
    if (o.related && o.related.length) {
      var h = doc.createElement('p'); h.className = 'ask__rel'; h.textContent = S.related; m.appendChild(h);
      var ul2 = doc.createElement('ul'); ul2.className = 'ask__src';
      o.related.forEach(function (l) { var li = doc.createElement('li'); li.appendChild(link(l.t, l.u)); ul2.appendChild(li); });
      m.appendChild(ul2);
    }
    if (o.more) {
      var b = doc.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = S.more;
      b.addEventListener('click', function () { b.remove(); showMore(); });
      m.appendChild(b);
    }
    log.appendChild(m); log.scrollTop = log.scrollHeight;
    return m;
  }

  function passageReply(hit, hasMore, related) {
    msg('bot', S.lead.replace('{t}', hit.t) + '\n' + hit.x, { links: [{ t: S.read, u: hit.u }], more: hasMore, related: related });
  }
  function showMore() {
    var next = queue.shift();
    if (!next) { msg('bot', S.nomore); return; }
    passageReply(next, queue.length > 0);
  }

  function answer(q) {
    msg('user', q);
    track('ask_question', { length: q.length });
    load().then(function () {
      var n = normalise(q).trim();
      if (RX.more.test(n)) return showMore();
      if (RX.greet.test(n) && n.split(/\s+/).length < 4) return msg('bot', S.greet);
      if (RX.thanks.test(n) && n.split(/\s+/).length < 5) return msg('bot', S.thanks);
      if (RX.who.test(n)) return msg('bot', S.who, { links: [{ t: S.read, u: S.links.about }] });
      if (RX.contact.test(n)) return msg('bot', S.contact, { links: [{ t: S.contactLabel, u: S.links.contact }] });
      if (RX.services.test(n)) return msg('bot', S.services, { links: [{ t: S.read, u: S.links.services }] });
      var hits = retrieve(q, 6);
      if (!hits.length) {
        track('ask_no_answer', { length: q.length });
        return msg('bot', S.none, { links: S.areas_list });
      }
      queue = hits.slice(1);
      passageReply(hits[0], queue.length > 0, hits.slice(1, 4).map(function (h) { return { t: h.t, u: h.u }; }));
    });
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
