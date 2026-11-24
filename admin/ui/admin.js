/* Local content admin. Talks only to the admin server on this machine. */
(function () {
  'use strict';
  var TOKEN = document.querySelector('meta[name="admin-token"]').content;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var el = function (tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'class') n.className = attrs[k];
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  };

  function api(method, url, body, raw) {
    var opts = { method: method, headers: { 'X-Admin-Token': TOKEN } };
    if (body !== undefined) { opts.body = raw ? body : JSON.stringify(body); if (!raw) opts.headers['Content-Type'] = 'application/json'; }
    return fetch(url, opts).then(function (r) {
      return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || r.statusText); return j; });
    });
  }
  var toastTimer;
  function toast(msg, kind) {
    var t = $('#toast'); t.textContent = msg; t.dataset.kind = kind || ''; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, kind === 'error' ? 6000 : 2600);
  }
  function slugify(s) {
    return String(s).normalize('NFKD').replace(/[^\x00-\x7F]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70);
  }
  function today() { return new Date().toISOString().slice(0, 10); }

  var schema = { langs: [], defaultLang: 'en', collections: {} };
  var state = { c: null, slug: null, isNew: false, lang: 'en', langs: [], values: {}, bodies: {}, slugInput: null };
  function coll() { return schema.collections[state.c]; }
  function langDir(l) { return schema.langs.filter(function (x) { return x.code === l; })[0].dir; }
  function perLang(v) { var o = {}; schema.langs.forEach(function (l) { o[l.code] = typeof v === 'function' ? v() : v; }); return o; }

  /* ---------------------------------------------------------- collections + list */
  function renderCollections() {
    var nav = $('#collections'); nav.textContent = '';
    Object.keys(schema.collections).forEach(function (id) {
      var b = el('button', { type: 'button', text: schema.collections[id].label, 'aria-current': String(id === state.c) });
      b.addEventListener('click', function () { showList(id); });
      nav.appendChild(b);
    });
  }
  var cached = [];
  function showList(c) {
    state.c = c; renderCollections();
    $('#edit-view').hidden = true; $('#list-view').hidden = false;
    $('#list-title').textContent = schema.collections[c].label;
    api('GET', '/api/items?c=' + encodeURIComponent(c)).then(function (items) { cached = items; drawList(); }).catch(function (e) { toast(e.message, 'error'); });
  }
  function drawList() {
    var q = $('#filter').value.toLowerCase();
    var ul = $('#items'); ul.textContent = '';
    var shown = cached.filter(function (i) { return !q || (i.title + ' ' + i.slug).toLowerCase().indexOf(q) !== -1; });
    if (!shown.length) ul.appendChild(el('li', { class: 'muted', text: 'Nothing here yet. Press New.' }));
    shown.forEach(function (i) {
      var pills = i.langs.filter(function (l) { return l !== schema.defaultLang; }).map(function (l) { return el('span', { class: 'pill', text: l.toUpperCase() }); });
      var t = el('span', { class: 't', text: i.title || i.slug }, [i.draft ? el('span', { class: 'pill', text: 'draft' }) : null].concat(pills));
      var m = el('span', { class: 'm', text: [i.slug, i.date].filter(Boolean).join(' · ') });
      var b = el('button', { type: 'button' }, [t, m]);
      b.addEventListener('click', function () { openEditor(i.slug, false); });
      ul.appendChild(el('li', {}, [b]));
    });
  }
  $('#filter').addEventListener('input', drawList);
  $('#btn-new').addEventListener('click', function () { openEditor('', true); });

  /* ---------------------------------------------------------- editor */
  function openEditor(slug, isNew) {
    var main = schema.defaultLang;
    state.slug = slug; state.isNew = isNew; state.lang = main;
    state.values = perLang(function () { return {}; }); state.bodies = perLang(''); state.langs = isNew ? [main] : [];
    $('#list-view').hidden = true; $('#edit-view').hidden = false; $('#preview').hidden = true;
    $('#edit-title').textContent = isNew ? 'New ' + coll().label : slug;
    $('#save-status').textContent = '';
    $('#btn-delete').hidden = isNew;
    if (isNew) { state.values[main] = defaults(); loadNodes().then(function () { renderForm(); renderTabs(); }); return; }
    var langs = schema.langs.map(function (l) { return l.code; });
    var nodesReady = loadNodes();
    Promise.all(langs.map(function (l) { return api('GET', '/api/item?c=' + encodeURIComponent(state.c) + '&slug=' + encodeURIComponent(slug) + '&lang=' + l).catch(function () { return null; }); }))
      .then(function (res) { return nodesReady.then(function () { return res; }); })
      .then(function (res) {
        res.forEach(function (r, i) { if (r) { state.langs.push(langs[i]); state.values[langs[i]] = r.data; state.bodies[langs[i]] = r.body; } });
        if (!state.langs.length) throw new Error('Item not found');
        renderForm(); renderTabs();
      }).catch(function (e) { toast(e.message, 'error'); showList(state.c); });
  }
  // the nodes a page can be bonded to (needed before the form is drawn)
  function loadNodes() {
    return api('GET', '/api/nodes').then(function (r) { state.nodes = r.nodes; state.topics = r.topics; }).catch(function () { state.nodes = []; state.topics = []; });
  }
  function defaults() {
    var d = {};
    coll().fields.forEach(function (f) {
      if (f.default !== undefined) d[f.name] = f.default === 'today' && f.type === 'date' ? today() : f.default;
    });
    return d;
  }
  function renderTabs() {
    var t = $('#lang-tabs'); t.textContent = '';
    schema.langs.forEach(function (lang) {
      var l = lang.code;
      var has = state.langs.indexOf(l) !== -1;
      var b = el('button', { type: 'button', role: 'tab', 'aria-selected': String(state.lang === l), text: lang.label + (has ? '' : ' +') });
      b.addEventListener('click', function () {
        if (!has) {
          if (state.isNew) { toast('Save the English version first', 'error'); return; }
          state.langs.push(l); state.values[l] = {}; state.bodies[l] = '';
        }
        collect(); state.lang = l; renderForm(); renderTabs();
      });
      t.appendChild(b);
    });
  }

  function field(f, val, lang) {
    var id = 'f-' + f.name;
    var hint = f.hint ? el('span', { class: 'hint', text: f.hint }) : null;
    var input;
    if (f.type === 'textarea') input = el('textarea', { id: id, rows: '3', 'data-f': f.name });
    else if (f.type === 'select') {
      input = el('select', { id: id, 'data-f': f.name }, [el('option', { value: '', text: '—' })].concat((f.options || []).map(function (o) { return el('option', { value: o.value, text: o.label }); })));
    } else if (f.type === 'bool') {
      input = el('input', { id: id, type: 'checkbox', 'data-f': f.name });
      input.checked = val === true;
      return el('div', { class: 'f inline' }, [input, el('label', { for: id, text: f.name }), hint]);
    } else if (f.type === 'date') input = el('input', { id: id, type: 'date', 'data-f': f.name });
    else if (f.type === 'number') input = el('input', { id: id, type: 'number', 'data-f': f.name });
    else if (f.type === 'tags') input = el('input', { id: id, type: 'text', 'data-f': f.name, placeholder: 'comma, separated' });
    else if (f.type === 'links') input = el('textarea', { id: id, rows: '3', 'data-f': f.name, placeholder: 'IEEE Xplore | https://…' });
    else if (f.type === 'nodes') return nodesField(f, val, hint);
    else if (f.type === 'file') return fileField(f, val, hint);
    else input = el('input', { id: id, type: 'text', 'data-f': f.name });
    if (f.type === 'tags') input.value = Array.isArray(val) ? val.join(', ') : (val || '');
    else if (f.type === 'links') input.value = (val || []).map(function (l) { return l.label + ' | ' + l.url; }).join('\n');
    else input.value = val == null ? '' : val;
    if (f.type === 'text' || f.type === 'textarea') input.dir = langDir(lang);
    var extra = f.type === 'tags' && f.suggest === 'topics' ? topicPicker(input) : null;
    return el('div', { class: 'f' }, [el('label', { for: id, text: f.name + (f.required ? ' *' : '') }), input, extra, hint]);
  }
  // existing topics, one click to add
  function topicPicker(input) {
    if (!state.topics || !state.topics.length) return null;
    var row = el('div', { class: 'chips chips--pick', 'aria-label': 'Existing topics' });
    state.topics.forEach(function (t) {
      var b = el('button', { type: 'button', class: 'chip', text: '+ ' + t });
      b.addEventListener('click', function () {
        var cur = input.value.split(',').map(function (x) { return x.trim(); }).filter(Boolean);
        if (cur.indexOf(t) === -1) cur.push(t);
        input.value = cur.join(', ');
      });
      row.appendChild(b);
    });
    return row;
  }
  // the connections picker: chips + a search box over every node (area, topic, page)
  function nodesField(f, val, hint) {
    var id = 'f-' + f.name, list = Array.isArray(val) ? val.slice() : [];
    var nodes = state.nodes || [];
    var byId = {};
    nodes.forEach(function (n) { byId[n.id] = n; });
    var wrap = el('div', { class: 'chips', 'data-f': f.name });
    wrap.__list = list;
    var dl = el('datalist', { id: id + '-dl' });
    nodes.forEach(function (n) {
      if (state.c && n.id === state.c.replace('wiki-', '') + '/' + state.slug) return; // not itself
      dl.appendChild(el('option', { value: n.label + '  [' + n.type + ' · ' + n.id + ']' }));
    });
    var input = el('input', { id: id, type: 'text', list: id + '-dl', placeholder: 'Search a page, topic or area…' });
    function draw() {
      wrap.textContent = '';
      list.forEach(function (ref, i) {
        var n = byId[ref];
        var x = el('button', { type: 'button', class: 'chip chip--on', title: ref, text: (n ? n.label + ' · ' + n.type : ref) + '  ×' });
        x.addEventListener('click', function () { list.splice(i, 1); draw(); });
        wrap.appendChild(x);
      });
      if (!list.length) wrap.appendChild(el('span', { class: 'muted', text: 'No manual bonds yet.' }));
    }
    function add(text) {
      var m = text.match(/\[[^\]]*· ([^\]]+)\]\s*$/);
      var ref = m ? m[1].trim() : text.trim();
      if (!ref) return;
      if (list.indexOf(ref) === -1) list.push(ref);
      input.value = ''; draw();
    }
    input.addEventListener('change', function () { add(input.value); });
    input.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); add(input.value); } });
    draw();
    return el('div', { class: 'f' }, [el('label', { for: id, text: f.name }), wrap, input, dl, hint]);
  }
  function fileField(f, val, hint) {
    var cur = el('code', { text: val || 'No file uploaded', 'data-f': f.name, 'data-v': val || '' });
    var pick = el('input', { type: 'file', id: 'f-' + f.name });
    var rep = el('input', { type: 'checkbox', id: 'f-replace' });
    var up = el('button', { type: 'button', class: 'btn', text: 'Upload' });
    var clr = el('button', { type: 'button', class: 'btn', text: 'Remove link' });
    up.addEventListener('click', function () {
      var file = pick.files[0];
      if (!file) { toast('Choose a file first', 'error'); return; }
      up.disabled = true;
      api('POST', '/api/upload?name=' + encodeURIComponent(file.name) + (rep.checked ? '&overwrite=1' : ''), file, true)
        .then(function (r) { cur.textContent = r.path; cur.dataset.v = r.path; toast('Uploaded ' + r.path); })
        .catch(function (e) { toast(e.message, 'error'); })
        .then(function () { up.disabled = false; });
    });
    clr.addEventListener('click', function () { cur.textContent = 'No file uploaded'; cur.dataset.v = ''; });
    return el('div', { class: 'f' }, [
      el('span', { class: 'l', text: f.name }),
      el('div', { class: 'filerow' }, [cur, clr]),
      el('div', { class: 'filerow' }, [pick, el('label', {}, [rep, ' replace if exists']), up]),
      hint
    ]);
  }

  function renderForm() {
    var form = $('#form'); form.textContent = '';
    var lang = state.lang;
    var v = state.values[lang] || {};
    if (state.isNew || lang === schema.defaultLang) {
      state.slugInput = el('input', { id: 'f-slug', type: 'text', placeholder: 'url-friendly-name', value: state.slug || '' });
      if (!state.isNew) state.slugInput.disabled = true;
      else if (coll().indexSlug) state.slugInput.placeholder = 'url-friendly-name (or ' + coll().indexSlug + ' for the wiki landing page)';
      form.appendChild(el('div', { class: 'f' }, [el('label', { for: 'f-slug', text: 'slug (the page address)' }), state.slugInput, state.isNew ? el('span', { class: 'hint', text: 'Filled in from the title. Cannot be changed later.' }) : null]));
    }
    coll().fields.forEach(function (f) {
      if (lang !== schema.defaultLang && f.shared) return;
      if (f.hideOnIndex && state.slug && state.slug === coll().indexSlug) return;
      form.appendChild(field(f, v[f.name], lang));
    });
    var body = el('textarea', { id: 'f-body', class: 'md', 'data-body': '1' });
    body.value = state.bodies[lang] || '';
    body.dir = langDir(lang);
    form.appendChild(el('div', { class: 'f' }, [el('label', { for: 'f-body', text: 'Content (Markdown)' }), body, el('span', { class: 'hint', text: '## Heading · **bold** · - list · [link](https://…). Raw HTML is not allowed.' })]));
    var t = $('#f-title');
    if (t && state.isNew && state.slugInput) t.addEventListener('input', function () { if (!state.slugInput.dataset.touched) state.slugInput.value = slugify(t.value); });
    if (state.slugInput) state.slugInput.addEventListener('input', function () { state.slugInput.dataset.touched = '1'; });
    $('#preview').hidden = true;
  }

  function collect() {
    var lang = state.lang, out = {};
    document.querySelectorAll('#form [data-f]').forEach(function (n) {
      var k = n.dataset.f, f = coll().fields.filter(function (x) { return x.name === k; })[0];
      if (!f) return;
      if (f.type === 'nodes') out[k] = (n.__list || []).slice();
      else if (f.type === 'bool') out[k] = n.checked;
      else if (f.type === 'file') out[k] = n.dataset.v || '';
      else if (f.type === 'tags') out[k] = n.value.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      else if (f.type === 'links') out[k] = n.value.split('\n').map(function (line) { var p = line.split('|'); return { label: (p[0] || '').trim(), url: (p.slice(1).join('|') || '').trim() }; }).filter(function (l) { return l.label && l.url; });
      else out[k] = n.value;
    });
    state.values[lang] = out;
    var b = $('#f-body'); if (b) state.bodies[lang] = b.value;
    if (state.slugInput && state.isNew) state.slug = state.slugInput.value.trim();
  }

  $('#btn-save').addEventListener('click', function () {
    collect();
    var lang = state.lang;
    if (state.isNew && !state.slug) { toast('Give it a slug (it fills in from the title)', 'error'); return; }
    var data = state.values[lang];
    if ((lang === schema.defaultLang || state.isNew) && state.slug !== coll().indexSlug && coll().fields.some(function (f) { return f.required && !data[f.name]; })) { toast('Fill in the required fields (*)', 'error'); return; }
    var status = $('#save-status'); status.textContent = 'Saving…';
    api('PUT', '/api/item', { c: state.c, slug: state.slug, lang: lang, data: data, body: state.bodies[lang] })
      .then(function () {
        status.textContent = 'Saved ' + new Date().toLocaleTimeString();
        if (state.langs.indexOf(lang) === -1) state.langs.push(lang);
        if (state.isNew) { state.isNew = false; $('#edit-title').textContent = state.slug; $('#btn-delete').hidden = false; renderForm(); renderTabs(); }
        toast('Saved');
      })
      .catch(function (e) { status.textContent = ''; toast(e.message, 'error'); });
  });
  $('#btn-back').addEventListener('click', function () { showList(state.c); });
  $('#btn-preview').addEventListener('click', function () {
    var p = $('#preview'); collect();
    api('POST', '/api/preview', { body: state.bodies[state.lang] }).then(function (r) {
      p.dir = langDir(state.lang); p.innerHTML = r.html; p.hidden = false; p.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }).catch(function (e) { toast(e.message, 'error'); });
  });
  $('#btn-delete').addEventListener('click', function () {
    var only = state.lang !== schema.defaultLang;
    var label = schema.langs.filter(function (l) { return l.code === state.lang; })[0].label;
    dialog('Delete', el('p', { text: only ? 'Delete the ' + label + ' version of "' + state.slug + '"?' : 'Delete "' + state.slug + '" (all languages)? This removes the files; git still has history.' }), 'Delete', function () {
      var q = '/api/item?c=' + encodeURIComponent(state.c) + '&slug=' + encodeURIComponent(state.slug) + (only ? '&lang=' + state.lang : '');
      api('DELETE', q).then(function () { toast('Deleted'); showList(state.c); }).catch(function (e) { toast(e.message, 'error'); });
    });
  });

  /* ---------------------------------------------------------- dialogs: build + publish */
  var dlg = $('#dlg'), onOk = null;
  function dialog(title, content, okLabel, ok) {
    $('#dlg-title').textContent = title;
    var b = $('#dlg-body'); b.textContent = ''; b.appendChild(content);
    var btn = $('#dlg-ok'); btn.textContent = okLabel || 'OK'; btn.hidden = !ok; onOk = ok || null;
    if (typeof dlg.showModal === 'function') dlg.showModal();
  }
  $('#dlg-form').addEventListener('submit', function (e) {
    var v = e.submitter && e.submitter.value;
    if (v === 'ok' && onOk) { var f = onOk; onOk = null; f(); }
  });

  $('#btn-build').addEventListener('click', function () {
    api('POST', '/api/build').then(function (r) {
      dialog(r.ok ? 'Build passed' : 'Build failed', el('pre', { text: r.log || '(no output)' }));
    }).catch(function (e) { toast(e.message, 'error'); });
  });
  $('#btn-publish').addEventListener('click', function () {
    api('GET', '/api/git/status').then(function (s) {
      var msg = el('input', { type: 'text', value: 'Update content', 'aria-label': 'Commit message' });
      var box = el('div', {}, [
        el('p', {}, ['Branch: ', el('code', { text: s.branch })]),
        s.changes.length ? el('pre', { text: s.changes.join('\n') }) : el('p', { class: 'muted', text: 'No changes in src/ to publish.' }),
        s.changes.length ? el('label', { class: 'muted', text: 'Commit message' }) : null,
        s.changes.length ? msg : null,
        el('p', { class: 'muted', text: 'Publishing runs git add src, git commit and git push with your git login. If this branch deploys the site, it goes live.' })
      ]);
      dialog('Publish changes', box, s.changes.length ? 'Commit & push' : null, function () {
        api('POST', '/api/git/publish', { message: msg.value }).then(function (r) {
          dialog(r.ok ? 'Published' : 'Publish failed', el('pre', { text: r.log }));
        }).catch(function (e) { toast(e.message, 'error'); });
      });
    }).catch(function (e) { toast(e.message, 'error'); });
  });

  /* ---------------------------------------------------------- boot */
  api('GET', '/api/schema').then(function (s) { schema = s; showList(Object.keys(s.collections)[0]); }).catch(function (e) { toast(e.message, 'error'); });
})();
