/* Online admin backend: the same API the local admin server offers, but talking straight to the GitHub REST API
   with your own fine-grained token (Contents: read and write on this one repository). Every save is a commit to
   the branch, which makes the site rebuild and redeploy. The token stays in this browser only. */
(function () {
  'use strict';
  var KEY = 'am-admin-login';
  var cfg = null, creds = null, pending = null;
  var cache = {}; // sha -> parsed list entry

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function store(c) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) { /* private mode */ } }
  function err(status, msg) { var e = new Error(msg); e.status = status; return e; }

  function b64enc(str) { var b = new TextEncoder().encode(str), s = ''; for (var i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); }
  function b64dec(b64) { var s = atob(b64.replace(/\s/g, '')), b = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return new TextDecoder().decode(b); }
  function bufB64(buf) { var b = new Uint8Array(buf), s = ''; for (var i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); }

  function gh(path, opts) {
    opts = opts || {};
    var headers = { Accept: opts.accept || 'application/vnd.github+json', Authorization: 'Bearer ' + creds.token, 'X-GitHub-Api-Version': '2022-11-28' };
    if (opts.body) headers['Content-Type'] = 'application/json';
    return fetch('https://api.github.com' + path, { method: opts.method || 'GET', headers: headers, body: opts.body ? JSON.stringify(opts.body) : undefined }).then(function (r) {
      if (opts.text && r.ok) return r.text();
      return r.text().then(function (t) {
        var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) { /* not json */ }
        if (!r.ok) {
          if (r.status === 401) { store(null); creds = null; throw err(401, 'GitHub rejected the token. Reload the page and sign in again.'); }
          throw err(r.status, (j && j.message) || r.statusText);
        }
        return j;
      });
    });
  }
  var repoPath = function (p) { return '/repos/' + creds.repo + '/contents/' + p.split('/').map(encodeURIComponent).join('/'); };
  var refQ = function () { return '?ref=' + encodeURIComponent(creds.branch); };

  /* ---------------------------------------------------------- sign in */
  function login() {
    if (pending) return pending;
    pending = fetch('/admin/config.json').then(function (r) { return r.json(); }).then(function (c) {
      cfg = c; creds = load();
      if (creds && creds.token) return;
      return new Promise(function (resolve) {
        var dlg = document.getElementById('login'), form = document.getElementById('login-form'), msg = document.getElementById('login-msg');
        form.repo.value = cfg.repo; form.branch.value = cfg.branch;
        dlg.showModal();
        form.addEventListener('submit', function (ev) {
          ev.preventDefault();
          var c2 = { token: form.token.value.trim(), repo: form.repo.value.trim(), branch: form.branch.value.trim() || 'main' };
          msg.textContent = 'Checking…';
          creds = c2;
          gh('/repos/' + c2.repo).then(function (r) {
            if (!r.permissions || !r.permissions.push) throw err(403, 'This token cannot write to ' + c2.repo + '. Give it Contents: read and write.');
            store(c2); dlg.close(); resolve();
          }).catch(function (e) { creds = null; msg.textContent = e.message; });
        });
      });
    });
    return pending;
  }
  document.addEventListener('DOMContentLoaded', function () {
    var out = document.getElementById('btn-logout');
    if (out) out.addEventListener('click', function () { store(null); location.reload(); });
    var link = document.getElementById('link-actions');
    login().then(function () { if (link) link.href = 'https://github.com/' + creds.repo + '/actions'; });
  });

  /* ---------------------------------------------------------- content helpers */
  var isUrl = function (v) { return /^https?:\/\//i.test(String(v)); };
  function fileName(slug, lang) { return slug + (lang === cfg.defaultLang ? '' : '.' + lang) + '.md'; }
  function parseName(name) {
    var m = name.match(/^(.+?)(?:\.([a-z]{2}))?\.md$/);
    if (!m) return null;
    if (m[2] && cfg.langs.map(function (l) { return l.code; }).indexOf(m[2]) === -1) return { slug: m[1] + '.' + m[2], lang: cfg.defaultLang };
    return { slug: m[1], lang: m[2] || cfg.defaultLang };
  }
  function coll(c) { var d = cfg.collections[c]; if (!d) throw err(400, 'Unknown collection'); return d; }
  function pathFor(c, slug, lang) {
    if (!/^[a-z0-9_][a-z0-9_-]{0,80}$/.test(slug)) throw err(400, 'Invalid slug (use a–z, 0–9 and dashes)');
    if (!cfg.langs.some(function (l) { return l.code === lang; })) throw err(400, 'Invalid language');
    return 'src/content/' + coll(c).dir + '/' + fileName(slug, lang);
  }
  function parseMd(text) {
    var m = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    var data = m ? (window.jsyaml.load(m[1], { schema: window.jsyaml.JSON_SCHEMA }) || {}) : {};
    return { data: data, body: (m ? m[2] : text).replace(/^\n+/, '') };
  }
  function cleanData(c, data, lang) {
    var out = {};
    coll(c).fields.forEach(function (f) {
      if (lang !== cfg.defaultLang && f.shared) return;
      var v = data[f.name];
      if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length) || v === false) return;
      if (f.type === 'number') v = Number(v);
      if (f.type === 'tags' || f.type === 'nodes') v = (Array.isArray(v) ? v : String(v).split(',')).map(function (x) { return String(x).trim().slice(0, 120); }).filter(Boolean);
      if (f.type === 'nodes') v = v.filter(function (x, i) { return v.indexOf(x) === i; });
      if (f.type === 'select' && f.options && !f.options.some(function (o) { return o.value === v; })) throw err(400, f.name + ' must be one of: ' + f.options.map(function (o) { return o.value; }).join(', '));
      if (f.type === 'links') v = v.filter(function (l) { return l && l.label && isUrl(l.url); }).map(function (l) { return { label: String(l.label), url: String(l.url) }; });
      if (f.type === 'file' && String(v).indexOf(cfg.downloadsUrl) !== 0) throw err(400, f.name + ' must point into ' + cfg.downloadsUrl);
      if (f.type === 'url' && !isUrl(v)) throw err(400, f.name + ' must start with https://');
      if (f.type === 'bool') v = v === true || v === 'true';
      out[f.name] = typeof v === 'string' ? v.trim() : v;
    });
    return out;
  }
  function getFile(p) { return gh(repoPath(p) + refQ()).then(function (j) { return { sha: j.sha, text: b64dec(j.content) }; }); }
  function getSha(p) { return gh(repoPath(p) + refQ()).then(function (j) { return j.sha; }, function (e) { if (e.status === 404) return null; throw e; }); }

  function listDir(c) {
    var d = coll(c);
    return gh(repoPath('src/content/' + d.dir) + refQ()).catch(function (e) { if (e.status === 404) return []; throw e; }).then(function (files) {
      var map = {};
      var jobs = [];
      files.forEach(function (f) {
        var n = f.type === 'file' && parseName(f.name); if (!n) return;
        var e = map[n.slug] = map[n.slug] || { slug: n.slug, langs: [] };
        e.langs.push(n.lang);
        if (n.lang === cfg.defaultLang) {
          jobs.push((cache[f.sha] ? Promise.resolve(cache[f.sha]) : getFile('src/content/' + d.dir + '/' + f.name).then(function (r) { return (cache[f.sha] = parseMd(r.text).data); })).then(function (data) {
            e.title = data.title || (n.slug === d.indexSlug ? '(Wiki landing page)' : n.slug);
            e.draft = data.draft === true || data.status === 'draft';
            e.node = data.node === 'tag' ? 'tag' : 'post';
            e.tags = Array.isArray(data.tags) ? data.tags : [];
            e.date = String(data[d.dateField || 'date'] || '').slice(0, 10);
          }));
        }
      });
      return Promise.all(jobs).then(function () {
        return Object.keys(map).map(function (k) { return map[k]; }).sort(function (a, b) { return (b.date || '').localeCompare(a.date || '') || a.slug.localeCompare(b.slug); });
      });
    });
  }
  function slugify(s) { return String(s).normalize('NFKD').replace(/[^\x00-\x7F]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  function listNodes() {
    var wikis = Object.keys(cfg.collections).filter(function (c) { return c.indexOf('wiki-') === 0; });
    return Promise.all(wikis.map(listDir)).then(function (lists) {
      var nodes = wikis.map(function (c) { return { id: 'area:' + c.slice(5), label: cfg.collections[c].label, type: 'area' }; });
      var topics = {};
      lists.forEach(function (items, i) {
        var area = wikis[i].slice(5);
        items.forEach(function (it) {
          if (it.slug === cfg.indexSlug || !it.langs.length) return;
          nodes.push({ id: area + '/' + it.slug, label: it.title || it.slug, type: it.node, area: area });
          (it.tags || []).forEach(function (t) { topics[t] = (topics[t] || 0) + 1; });
        });
      });
      var named = {}; nodes.forEach(function (n) { if (n.type === 'tag') named[n.label.toLowerCase()] = 1; });
      Object.keys(topics).forEach(function (t) { if (!named[t.toLowerCase()]) nodes.push({ id: 'tag:' + slugify(t), label: t, type: 'topic', count: topics[t] }); });
      return { nodes: nodes, topics: Object.keys(topics).sort(function (a, b) { return topics[b] - topics[a]; }).slice(0, 40) };
    });
  }

  /* ---------------------------------------------------------- the API the admin UI calls */
  function route(method, url, body, raw) {
    var u = new URL(url, location.href), q = u.searchParams, p = u.pathname;
    if (method === 'GET' && p === '/api/schema') return Promise.resolve({ langs: cfg.langs, defaultLang: cfg.defaultLang, collections: cfg.collections });
    if (method === 'GET' && p === '/api/items') return listDir(q.get('c'));
    if (method === 'GET' && p === '/api/nodes') return listNodes();
    if (p === '/api/settings') {
      var siteFile = 'src/data/site.json';
      if (method === 'GET') {
        return getFile(siteFile).then(function (f) {
          var site = JSON.parse(f.text);
          return { fields: cfg.settings.map(function (s) { return { key: s.key, label: s.label, hint: s.hint }; }), values: Object.fromEntries(cfg.settings.map(function (s) { return [s.key, s.path.reduce(function (o, k) { return o ? o[k] : undefined; }, site) || '']; })) };
        });
      }
      if (method === 'PUT') {
        return getFile(siteFile).then(function (f) {
          var site = JSON.parse(f.text);
          cfg.settings.forEach(function (s) {
            if (!(s.key in body)) return;
            var v = String(body[s.key] || '').trim();
            if (v && !new RegExp(s.check).test(v)) throw err(400, s.label + ': not a valid value (example: ' + s.hint + ')');
            var o = site; s.path.slice(0, -1).forEach(function (k) { o = o[k] = o[k] || {}; });
            o[s.path[s.path.length - 1]] = v;
          });
          return gh(repoPath(siteFile), { method: 'PUT', body: { message: 'Admin: update site settings', content: b64enc(JSON.stringify(site, null, 2) + '\n'), sha: f.sha, branch: creds.branch } });
        }).then(function () { return { ok: true }; });
      }
    }
    if (method === 'GET' && p === '/api/item') {
      return getFile(pathFor(q.get('c'), q.get('slug'), q.get('lang') || cfg.defaultLang)).then(function (f) { return parseMd(f.text); }, function (e) { if (e.status === 404) throw err(404, 'Not found'); throw e; });
    }
    if (method === 'PUT' && p === '/api/item') {
      var lang = body.lang || cfg.defaultLang, file = pathFor(body.c, body.slug, lang);
      var data = cleanData(body.c, body.data || {}, lang);
      var text = '---\n' + window.jsyaml.dump(data, { lineWidth: -1, noRefs: true }) + '---\n\n' + String(body.body || '').trim() + '\n';
      var ready = lang === cfg.defaultLang ? Promise.resolve() : getSha(pathFor(body.c, body.slug, cfg.defaultLang)).then(function (s) { if (!s) throw err(400, 'Create the English version first'); });
      return ready.then(function () { return getSha(file); }).then(function (sha) {
        return gh(repoPath(file), { method: 'PUT', body: { message: 'Admin: ' + (sha ? 'update ' : 'add ') + body.c + '/' + file.split('/').pop(), content: b64enc(text), sha: sha || undefined, branch: creds.branch } });
      }).then(function () { return { ok: true }; });
    }
    if (method === 'DELETE' && p === '/api/item') {
      var c = q.get('c'), slug = q.get('slug'), one = q.get('lang');
      var langs = one ? [one] : cfg.langs.map(function (l) { return l.code; });
      return langs.reduce(function (chain, l) {
        return chain.then(function () {
          var f = pathFor(c, slug, l);
          return getSha(f).then(function (sha) { if (sha) return gh(repoPath(f), { method: 'DELETE', body: { message: 'Admin: delete ' + c + '/' + f.split('/').pop(), sha: sha, branch: creds.branch } }); });
        });
      }, Promise.resolve()).then(function () { return { ok: true }; });
    }
    if (method === 'POST' && p === '/api/preview') {
      return gh('/markdown', { method: 'POST', body: { text: String(body.body || ''), mode: 'gfm' }, accept: 'text/html', text: true }).then(function (html) { return { html: html }; });
    }
    if (method === 'POST' && p === '/api/upload') {
      var raw0 = q.get('name') || '', dot = raw0.lastIndexOf('.'), ext = dot > -1 ? raw0.slice(dot + 1).toLowerCase() : '';
      if (cfg.allowedExt.indexOf(ext) === -1) return Promise.reject(err(400, 'File type .' + (ext || '?') + ' is not allowed'));
      var base = slugify(dot > -1 ? raw0.slice(0, dot) : raw0).slice(0, 80) || 'file', name = base + '.' + ext, dest = 'src/downloads/' + name;
      if (raw.size > 25 * 1024 * 1024) return Promise.reject(err(413, 'File too large (25 MB max online)'));
      return getSha(dest).then(function (sha) {
        if (sha && q.get('overwrite') !== '1') throw err(409, name + ' already exists. Tick "replace" to overwrite it.');
        return raw.arrayBuffer().then(function (buf) {
          return gh(repoPath(dest), { method: 'PUT', body: { message: 'Admin: upload ' + name, content: bufB64(buf), sha: sha || undefined, branch: creds.branch } });
        }).then(function () { return { ok: true, path: cfg.downloadsUrl + name, size: raw.size }; });
      });
    }
    return Promise.reject(err(404, 'Not available in the online admin'));
  }
  window.AdminAPI = function (method, url, body, raw) {
    return login().then(function () { return route(method, url, body, raw ? body : undefined); });
  };
})();
