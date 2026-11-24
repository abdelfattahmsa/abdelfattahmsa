/* Knowledge Hub: the Map / Grid / List switcher and the 3D knowledge map.
   No dependencies and no inline handlers (CSP-safe). The graph is one JSON file for both
   languages (build/lib/graph.mjs): t node types (0 area, 1 topic, 2 page), a area, x y z
   positions, d degree, l labels [en, ar], m summaries, u urls, e bonds as flat [a, b, kind]. */
(function () {
  'use strict';

  var doc = document;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var views = $('[data-views]');
  var mapEl = $('[data-kmap]');
  if (!views && !mapEl) return;

  var AREA = 0, TAG = 1, POST = 2;
  var MEMBER = 0, TAGGED = 1, LINK = 2;

  // Same Arabic-aware matching as the site search.
  function normalise(s) {
    return String(s || '').toLowerCase().replace(/[ً-ٰٟـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
  }

  /* ------------------------------------------------------------ the graph (loaded once, only when needed) */
  var graphPromise = null;
  function loadGraph(url) {
    if (!graphPromise) {
      graphPromise = fetch(url).then(function (r) { if (!r.ok) throw new Error('graph'); return r.json(); }).then(prepare);
    }
    return graphPromise;
  }
  function prepare(j) {
    var n = j.t.length, e = j.e.length / 3;
    var g = { j: j, n: n, type: new Uint8Array(n), x: new Float32Array(j.x), y: new Float32Array(j.y), z: new Float32Array(j.z), area: j.a, deg: j.d, ea: new Int32Array(e), eb: new Int32Array(e), ek: new Uint8Array(e), ne: e };
    for (var i = 0; i < n; i++) g.type[i] = j.t.charCodeAt(i) - 48;
    var count = new Int32Array(n + 1);
    for (var k = 0; k < e; k++) { g.ea[k] = j.e[3 * k]; g.eb[k] = j.e[3 * k + 1]; g.ek[k] = j.e[3 * k + 2]; count[g.ea[k]]++; count[g.eb[k]]++; }
    var off = new Int32Array(n + 1);
    for (i = 0; i < n; i++) off[i + 1] = off[i] + count[i];
    var fill = off.slice(0, n), adj = new Int32Array(off[n]), adjE = new Int32Array(off[n]);
    for (k = 0; k < e; k++) {
      adj[fill[g.ea[k]]] = g.eb[k]; adjE[fill[g.ea[k]]++] = k;
      adj[fill[g.eb[k]]] = g.ea[k]; adjE[fill[g.eb[k]]++] = k;
    }
    g.off = off; g.adj = adj; g.adjE = adjE;
    return g;
  }

  /* ------------------------------------------------------------ Map / Grid / List switcher */
  function initViews() {
    var buttons = $$('[data-view-btn]', views);
    var panels = $$('[data-view-panel]', views);
    function show(v) {
      views.dataset.view = v;
      buttons.forEach(function (b) { b.setAttribute('aria-checked', String(b.dataset.viewBtn === v)); b.tabIndex = b.dataset.viewBtn === v ? 0 : -1; });
      panels.forEach(function (p) { p.hidden = p.dataset.viewPanel !== (v === 'map' ? 'map' : 'items'); });
      views.classList.toggle('views--grid', v === 'grid');
      if (v === 'map' && mapEl && mapEl.__kmap) mapEl.__kmap.start();
      if (v !== 'map' && mapEl && mapEl.__kmap) mapEl.__kmap.stop();
    }
    buttons.forEach(function (b, i) {
      b.addEventListener('click', function () { store.set('kview', b.dataset.viewBtn); if (window.amTrack) window.amTrack('map_view_change', { view: b.dataset.viewBtn }); show(b.dataset.viewBtn); });
      b.addEventListener('keydown', function (ev) {
        var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[ev.key];
        if (!d) return;
        if (doc.documentElement.dir === 'rtl') d = -d;
        ev.preventDefault();
        var nb = buttons[(i + d + buttons.length) % buttons.length];
        nb.focus(); nb.click();
      });
    });
    var saved = store.get('kview');
    var start = buttons.some(function (b) { return b.dataset.viewBtn === saved; }) ? saved : (views.dataset.default || 'map');
    views.__show = show;
    show(start);
  }

  // "Show more": the next pages of an area, read from the same graph file
  function initMore() {
    $$('[data-more]').forEach(function (btn) {
      var list = btn.previousElementSibling;
      btn.addEventListener('click', function () {
        btn.disabled = true;
        loadGraph(btn.dataset.src).then(function (g) {
          var area = Number(btn.dataset.more), shown = Number(btn.dataset.shown), prefix = btn.dataset.prefix, ar = btn.dataset.lang === 'ar';
          var go = $('.item__go', list), made = 0, seen = 0;
          for (var i = 0; i < g.n && made < 60; i++) {
            if (g.type[i] !== POST || g.area[i] !== area) continue;
            if (seen++ < shown) continue;
            var li = doc.createElement('li'), a = doc.createElement('a'), main = doc.createElement('span'), t = doc.createElement('strong'), s = doc.createElement('span');
            a.className = 'item'; a.href = prefix + g.j.u[i];
            main.className = 'item__main'; t.className = 'item__title'; s.className = 'item__sum';
            t.textContent = g.j.l[i][ar ? 1 : 0]; s.textContent = g.j.m[i][ar ? 1 : 0];
            main.appendChild(t); if (s.textContent) main.appendChild(s);
            a.appendChild(main); if (go) a.appendChild(go.cloneNode(true));
            li.appendChild(a); list.appendChild(li); made++;
          }
          btn.dataset.shown = String(shown + made);
          btn.disabled = false;
          if (shown + made >= Number(btn.dataset.total)) btn.hidden = true;
        }).catch(function () { btn.disabled = false; });
      });
    });
  }

  /* ------------------------------------------------------------ matrices (column-major) */
  function perspective(f, a, n, fa) {
    var t = 1 / Math.tan(f / 2), r = 1 / (n - fa);
    return [t / a, 0, 0, 0, 0, t, 0, 0, 0, 0, (n + fa) * r, -1, 0, 0, 2 * n * fa * r, 0];
  }
  function mul(a, b) {
    var o = new Array(16);
    for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    return o;
  }
  function lookAt(e, t) {
    var zx = e[0] - t[0], zy = e[1] - t[1], zz = e[2] - t[2], zl = Math.hypot(zx, zy, zz) || 1;
    zx /= zl; zy /= zl; zz /= zl;
    var xx = zz, xy = 0, xz = -zx, xl = Math.hypot(xx, xz) || 1; // up is +y
    xx /= xl; xz /= xl;
    var yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    return { m: [xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0, -(xx * e[0] + xy * e[1] + xz * e[2]), -(yx * e[0] + yy * e[1] + yz * e[2]), -(zx * e[0] + zy * e[1] + zz * e[2]), 1], right: [xx, xy, xz], up: [yx, yy, yz] };
  }

  function parseColor(s, fallback) {
    s = (s || '').trim();
    var m = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (m) {
      var h = m[1].length === 3 ? m[1].replace(/./g, '$&$&') : m[1];
      return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
    }
    m = s.match(/rgba?\(([^)]+)\)/);
    if (m) { var p = m[1].split(/[ ,\/]+/).map(Number); return [p[0] / 255, p[1] / 255, p[2] / 255]; }
    return fallback;
  }

  /* ------------------------------------------------------------ the map */
  function KMap(el) {
    var self = this;
    this.el = el;
    this.t = JSON.parse(el.dataset.t || '{}');
    this.lang = el.dataset.lang === 'ar' ? 1 : 0;
    this.prefix = el.dataset.prefix || '';
    this.areaId = el.dataset.area || '';
    this.stage = $('.kmap__stage', el);
    this.gl = $('.kmap__gl', el);
    this.lbl = $('.kmap__lbl', el);
    this.status = $('.kmap__status', el);
    this.panel = $('.kmap__panel', el);
    this.running = false; this.ready = false; this.failed = false; this.dirty = true;
    this.cam = { tx: 0, ty: 0, tz: 0, dist: 800, yaw: 0.6, pitch: 0.25 };
    this.sel = -1; this.hov = -1; this.focusArea = -1; this.query = '';
    this.fly = null; this.vel = { yaw: 0, pitch: 0 };
    this.ptrs = {};
    this.begun = false;
    this.ctx2 = this.lbl.getContext('2d');
    this.gl.addEventListener('webglcontextlost', function (e) { e.preventDefault(); self.fail('map.nowebgl'); });
  }

  KMap.prototype.fail = function (key) {
    this.failed = true; this.stop();
    this.status.hidden = false; this.status.textContent = this.t[key] || key;
    this.stage.classList.add('is-failed');
    if (key === 'map.nowebgl' && views && views.__show && views.dataset.view === 'map') views.__show('list');
  };

  KMap.prototype.start = function () {
    var self = this;
    if (this.failed) return;
    if (!this.begun) { this.begun = true; this.begin(); }
    this.running = true; this.dirty = true;
    if (this.ready) {
      this.resize();
      if (this.pendingFit && this.W) { this.pendingFit = false; this.fit(true); }
    }
    if (!this.raf) this.raf = requestAnimationFrame(function () { self.frame(); });
  };
  KMap.prototype.stop = function () { this.running = false; if (this.raf) cancelAnimationFrame(this.raf); this.raf = 0; };

  KMap.prototype.begin = function () {
    var self = this;
    var gl = this.gl.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: false }) || this.gl.getContext('experimental-webgl');
    if (!gl) return this.fail('map.nowebgl');
    this.glc = gl;
    this.status.hidden = false; this.status.textContent = this.t['map.loading'] || '';
    loadGraph(this.el.dataset.src).then(function (g) {
      self.g = g; self.setup(); self.ready = true;
      self.status.hidden = true;
      self.resize();
      if (self.W) self.fit(true); else self.pendingFit = true;
      self.dirty = true;
      if (self.running && !self.raf) self.raf = requestAnimationFrame(function () { self.frame(); });
    }).catch(function () { self.fail('map.error'); });
  };

  // which nodes this map shows: all of them, or one area and what it is bonded to
  KMap.prototype.setup = function () {
    var g = this.g, gl = this.glc, keep = new Uint8Array(g.n), areaIdx = -1, i;
    if (this.areaId) for (i = 0; i < g.j.areas.length; i++) if (g.j.areas[i].id === this.areaId) areaIdx = i;
    if (areaIdx < 0) keep.fill(1);
    else {
      for (i = 0; i < g.n; i++) if (g.area[i] === areaIdx) keep[i] = 1;
      for (i = 0; i < g.n; i++) if (keep[i] === 1) for (var q = g.off[i]; q < g.off[i + 1]; q++) if (!keep[g.adj[q]]) keep[g.adj[q]] = 2;
    }
    this.keep = keep; this.areaIdx = areaIdx;
    this.ids = [];
    for (i = 0; i < g.n; i++) if (keep[i]) this.ids.push(i);
    this.edgeIds = [];
    for (var k = 0; k < g.ne; k++) if (keep[g.ea[k]] && keep[g.eb[k]]) this.edgeIds.push(k);

    var prog = this.prog = {};
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
    function program(vs, fs) { var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p); return p; }
    prog.pts = program(
      'attribute vec3 p;attribute float s;attribute vec4 c;uniform mat4 m;uniform float k;uniform float far;uniform float dpr;varying vec4 v;' +
      'void main(){vec4 q=m*vec4(p,1.0);gl_Position=q;float px=clamp(s*k/max(q.w,1.0),1.5+s*0.5,90.0)*dpr;gl_PointSize=px;' +
      'float fog=clamp(1.3-q.w/far,0.3,1.0);v=vec4(c.rgb,c.a*fog);}',
      'precision mediump float;varying vec4 v;void main(){vec2 d=gl_PointCoord-0.5;float r=length(d)*2.0;if(r>1.0)discard;gl_FragColor=vec4(v.rgb,v.a*smoothstep(1.0,0.8,r));}');
    prog.lines = program(
      'attribute vec3 p;attribute vec4 c;uniform mat4 m;uniform float far;varying vec4 v;' +
      'void main(){vec4 q=m*vec4(p,1.0);gl_Position=q;float fog=clamp(1.3-q.w/far,0.2,1.0);v=vec4(c.rgb,c.a*fog);}',
      'precision mediump float;varying vec4 v;void main(){gl_FragColor=v;}');

    var nn = this.ids.length, ne = this.edgeIds.length;
    this.pos = new Float32Array(nn * 3); this.size = new Float32Array(nn); this.col = new Float32Array(nn * 4);
    this.local = new Int32Array(g.n).fill(-1);
    for (i = 0; i < nn; i++) {
      var id = this.ids[i];
      this.local[id] = i;
      this.pos[3 * i] = g.x[id]; this.pos[3 * i + 1] = g.y[id]; this.pos[3 * i + 2] = g.z[id];
      var t = g.type[id], deg = Math.min(g.deg[id], 12);
      this.size[i] = t === AREA ? 15 : t === TAG ? 6.5 + deg * 0.12 : 2.6 + deg * 0.12;
    }
    this.epos = new Float32Array(ne * 6); this.ecol = new Float32Array(ne * 8);
    for (k = 0; k < ne; k++) {
      var e = this.edgeIds[k], a = this.local[g.ea[e]], b = this.local[g.eb[e]];
      for (var d = 0; d < 3; d++) { this.epos[6 * k + d] = this.pos[3 * a + d]; this.epos[6 * k + 3 + d] = this.pos[3 * b + d]; }
    }
    this.bufs = { pos: gl.createBuffer(), size: gl.createBuffer(), col: gl.createBuffer(), epos: gl.createBuffer(), ecol: gl.createBuffer() };
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufs.pos); gl.bufferData(gl.ARRAY_BUFFER, this.pos, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufs.size); gl.bufferData(gl.ARRAY_BUFFER, this.size, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufs.epos); gl.bufferData(gl.ARRAY_BUFFER, this.epos, gl.STATIC_DRAW);
    this.proj = new Float32Array(nn * 3);

    // extent, for the camera's far plane
    var r = 1;
    for (i = 0; i < nn; i++) r = Math.max(r, Math.hypot(this.pos[3 * i], this.pos[3 * i + 1], this.pos[3 * i + 2]));
    this.extent = r;

    this.readTheme();
    this.bind();
    this.updateColors();
    if (!this.ids.length) { this.status.hidden = false; this.status.textContent = this.t['map.empty'] || ''; }
  };

  KMap.prototype.readTheme = function () {
    var cs = getComputedStyle(doc.documentElement);
    this.fg = parseColor(cs.getPropertyValue('--text'), [1, 1, 1]);
    this.bg = parseColor(cs.getPropertyValue('--bg'), [0, 0, 0]);
    this.accent = parseColor(cs.getPropertyValue('--accent'), [1, 0.8, 0]);
    this.muted = parseColor(cs.getPropertyValue('--muted'), [0.6, 0.6, 0.6]);
    this.fontFamily = getComputedStyle(this.el).fontFamily || 'Tajawal, sans-serif';
  };

  // node and bond colours for the current selection / hover / area focus / search
  KMap.prototype.updateColors = function () {
    var g = this.g, nn = this.ids.length, ne = this.edgeIds.length, i, k;
    var focus = this.sel >= 0 ? this.sel : this.hov;
    var near = null;
    if (focus >= 0) { near = {}; near[focus] = 2; for (var q = g.off[focus]; q < g.off[focus + 1]; q++) near[g.adj[q]] = 1; }
    this.near = near;
    var fg = this.fg, ac = this.accent, bg = this.bg, mu = this.muted;
    var fa = this.focusArea, qy = this.query;
    var thin = Math.min(1, Math.pow(2500 / Math.max(ne, 1), 0.5)); // many bonds: each one fainter
    for (i = 0; i < nn; i++) {
      var id = this.ids[i], t = g.type[id], a = t === AREA ? 1 : t === TAG ? 0.92 : 0.72, c = fg;
      if (t === POST) c = [fg[0] * 0.78 + bg[0] * 0.22, fg[1] * 0.78 + bg[1] * 0.22, fg[2] * 0.78 + bg[2] * 0.22];
      var dim = false;
      if (near) dim = !near[id];
      else if (fa >= 0) dim = g.area[id] !== fa;
      if (qy && !near) dim = !this.matches(id, qy);
      if (dim) a = 0.13;
      if (near && near[id] === 2) { c = ac; a = 1; }
      else if (near && near[id] === 1) { a = 1; }
      this.col[4 * i] = c[0]; this.col[4 * i + 1] = c[1]; this.col[4 * i + 2] = c[2]; this.col[4 * i + 3] = a;
    }
    for (k = 0; k < ne; k++) {
      var e = this.edgeIds[k], ka = g.ea[e], kb = g.eb[e], kind = g.ek[e];
      var al = (kind === LINK ? 0.42 : kind === MEMBER ? 0.26 : 0.2) * thin, c2 = kind === LINK ? mu : fg;
      if (g.area[ka] !== g.area[kb] && kind !== LINK) al *= 0.35;
      if (near) {
        if (ka === focus || kb === focus) { al = 0.95; c2 = ac; } else al = 0.04;
      } else if (fa >= 0 && g.area[ka] !== fa && g.area[kb] !== fa) al = 0.04;
      for (var s = 0; s < 2; s++) {
        var o = 8 * k + 4 * s;
        this.ecol[o] = c2[0]; this.ecol[o + 1] = c2[1]; this.ecol[o + 2] = c2[2]; this.ecol[o + 3] = al;
      }
    }
    var gl = this.glc;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufs.col); gl.bufferData(gl.ARRAY_BUFFER, this.col, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufs.ecol); gl.bufferData(gl.ARRAY_BUFFER, this.ecol, gl.DYNAMIC_DRAW);
    this.dirty = true;
  };

  KMap.prototype.matches = function (id, q) {
    var l = this.g.j.l[id];
    return normalise(l[0]).indexOf(q) >= 0 || normalise(l[1]).indexOf(q) >= 0;
  };

  KMap.prototype.resize = function () {
    var r = this.stage.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (r.width < 2) return;
    this.W = r.width; this.H = r.height; this.dpr = dpr;
    this.gl.width = this.lbl.width = Math.round(r.width * dpr);
    this.gl.height = this.lbl.height = Math.round(r.height * dpr);
    this.dirty = true;
  };

  KMap.prototype.fit = function (instant, only) {
    var g = this.g, ids = only || this.ids, i, cx = 0, cy = 0, cz = 0;
    if (!ids.length) return;
    for (i = 0; i < ids.length; i++) { cx += g.x[ids[i]]; cy += g.y[ids[i]]; cz += g.z[ids[i]]; }
    cx /= ids.length; cy /= ids.length; cz /= ids.length;
    var r = 20;
    for (i = 0; i < ids.length; i++) r = Math.max(r, Math.hypot(g.x[ids[i]] - cx, g.y[ids[i]] - cy, g.z[ids[i]] - cz));
    var aspect = this.W / this.H, fov = 0.9, fitD = (r * 1.15) / Math.sin(Math.min(fov / 2, Math.atan(Math.tan(fov / 2) * aspect)));
    this.flyTo({ tx: cx, ty: cy, tz: cz, dist: fitD }, instant);
  };

  KMap.prototype.flyTo = function (to, instant) {
    var c = this.cam;
    if (instant || reduced) { for (var k in to) c[k] = to[k]; this.fly = null; this.dirty = true; return; }
    var from = {}; for (var key in to) from[key] = c[key];
    this.fly = { from: from, to: to, t0: performance.now(), dur: 650 };
    this.dirty = true;
  };

  KMap.prototype.matrices = function () {
    var c = this.cam, cp = Math.cos(c.pitch);
    var eye = [c.tx + c.dist * cp * Math.sin(c.yaw), c.ty + c.dist * Math.sin(c.pitch), c.tz + c.dist * cp * Math.cos(c.yaw)];
    var v = lookAt(eye, [c.tx, c.ty, c.tz]);
    var far = Math.max(this.extent * 8, c.dist * 4);
    this.far = far; this.view = v;
    this.mvp = mul(perspective(0.9, this.W / this.H, Math.max(1, c.dist * 0.02), far), v.m);
    this.pixelScale = this.H / (2 * Math.tan(0.45));
    return this.mvp;
  };

  KMap.prototype.project = function () {
    var m = this.mvp, p = this.pos, o = this.proj, W = this.W, H = this.H;
    for (var i = 0, n = this.ids.length; i < n; i++) {
      var x = p[3 * i], y = p[3 * i + 1], z = p[3 * i + 2];
      var w = m[3] * x + m[7] * y + m[11] * z + m[15];
      if (w <= 0.5) { o[3 * i + 2] = -1; continue; }
      o[3 * i] = ((m[0] * x + m[4] * y + m[8] * z + m[12]) / w * 0.5 + 0.5) * W;
      o[3 * i + 1] = (1 - ((m[1] * x + m[5] * y + m[9] * z + m[13]) / w * 0.5 + 0.5)) * H;
      o[3 * i + 2] = w;
    }
  };

  KMap.prototype.px = function (i) {
    var w = this.proj[3 * i + 2];
    if (w < 0) return 0;
    return Math.min(90, Math.max(1.5 + this.size[i] * 0.5, this.size[i] * this.pixelScale / Math.max(w, 1))) / 2;
  };

  KMap.prototype.frame = function () {
    var self = this;
    this.raf = 0;
    if (!this.running || !this.ready) return;
    var animating = false;
    if (this.fly) {
      var t = Math.min(1, (performance.now() - this.fly.t0) / this.fly.dur), e = 1 - Math.pow(1 - t, 3);
      for (var k in this.fly.to) this.cam[k] = this.fly.from[k] + (this.fly.to[k] - this.fly.from[k]) * e;
      if (t >= 1) this.fly = null; else animating = true;
      this.dirty = true;
    }
    if (Math.abs(this.vel.yaw) > 1e-4 || Math.abs(this.vel.pitch) > 1e-4) {
      this.cam.yaw += this.vel.yaw; this.cam.pitch = Math.max(-1.45, Math.min(1.45, this.cam.pitch + this.vel.pitch));
      this.vel.yaw *= 0.92; this.vel.pitch *= 0.92; this.dirty = true; animating = true;
    }
    if (this.dirty) { this.draw(); this.dirty = false; }
    if (animating || this.dirty) this.raf = requestAnimationFrame(function () { self.frame(); });
  };
  KMap.prototype.kick = function () {
    var self = this;
    this.dirty = true;
    if (this.running && this.ready && !this.raf) this.raf = requestAnimationFrame(function () { self.frame(); });
  };

  KMap.prototype.draw = function () {
    var gl = this.glc, P = this.prog, m = this.matrices();
    this.project();
    gl.viewport(0, 0, this.gl.width, this.gl.height);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    var f32 = new Float32Array(m);
    function attr(prog, name, buf, size) {
      var loc = gl.getAttribLocation(prog, name);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
      return loc;
    }
    gl.useProgram(P.lines);
    gl.uniformMatrix4fv(gl.getUniformLocation(P.lines, 'm'), false, f32);
    gl.uniform1f(gl.getUniformLocation(P.lines, 'far'), this.far);
    var l1 = attr(P.lines, 'p', this.bufs.epos, 3), l2 = attr(P.lines, 'c', this.bufs.ecol, 4);
    gl.drawArrays(gl.LINES, 0, this.edgeIds.length * 2);
    gl.disableVertexAttribArray(l1); gl.disableVertexAttribArray(l2);
    gl.useProgram(P.pts);
    gl.uniformMatrix4fv(gl.getUniformLocation(P.pts, 'm'), false, f32);
    gl.uniform1f(gl.getUniformLocation(P.pts, 'k'), this.pixelScale);
    gl.uniform1f(gl.getUniformLocation(P.pts, 'far'), this.far);
    gl.uniform1f(gl.getUniformLocation(P.pts, 'dpr'), this.dpr);
    var a1 = attr(P.pts, 'p', this.bufs.pos, 3), a2 = attr(P.pts, 's', this.bufs.size, 1), a3 = attr(P.pts, 'c', this.bufs.col, 4);
    gl.drawArrays(gl.POINTS, 0, this.ids.length);
    gl.disableVertexAttribArray(a1); gl.disableVertexAttribArray(a2); gl.disableVertexAttribArray(a3);
    this.drawLabels();
  };

  // labels: areas always, topics and pages as you get close, anything selected or hovered
  KMap.prototype.drawLabels = function () {
    var g = this.g, c = this.ctx2, W = this.W, H = this.H, dpr = this.dpr, ar = this.lang === 1;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    c.textAlign = 'center'; c.textBaseline = 'top'; c.direction = ar ? 'rtl' : 'ltr';
    var order = [], i, id, near = this.near;
    for (i = 0; i < this.ids.length; i++) {
      var w = this.proj[3 * i + 2];
      if (w < 0) continue;
      var x = this.proj[3 * i], y = this.proj[3 * i + 1];
      if (x < -20 || y < -20 || x > W + 20 || y > H + 20) continue;
      id = this.ids[i];
      var t = g.type[id], r = this.px(i), score = 0;
      if (near && near[id]) score = near[id] === 2 ? 1e6 : 5e5 + r;
      else if (this.query && this.matches(id, this.query)) score = 4e5 + r;
      else if (t === AREA) score = 3e5 + r;
      else if (t === TAG && r > 3.2) score = 2e5 + r;
      else if (t === POST && r > 4.2) score = 1e5 + r;
      if (near && !near[id] && score < 4e5) score = 0;
      if (score) order.push([score, i, r]);
    }
    order.sort(function (a, b) { return b[0] - a[0]; });
    var boxes = [], drawn = 0, fill = this.fg, bg = this.bg;
    for (var o = 0; o < order.length && drawn < 90; o++) {
      i = order[o][1]; id = this.ids[i];
      var tt = g.type[id], r2 = order[o][2], label = g.j.l[id][this.lang];
      var size = tt === AREA ? 15 : tt === TAG ? 12.5 : 11.5;
      c.font = (tt === POST ? '500 ' : '700 ') + size + 'px ' + this.fontFamily;
      var tw = c.measureText(label).width, lx = this.proj[3 * i], ly = this.proj[3 * i + 1] + r2 + 3;
      var box = [lx - tw / 2 - 3, ly - 1, lx + tw / 2 + 3, ly + size + 3], hit = false;
      for (var b = 0; b < boxes.length; b++) { var q = boxes[b]; if (box[0] < q[2] && box[2] > q[0] && box[1] < q[3] && box[3] > q[1]) { hit = true; break; } }
      if (hit && order[o][0] < 1e6) continue;
      boxes.push(box); drawn++;
      c.lineWidth = 3.5; c.lineJoin = 'round';
      c.strokeStyle = 'rgba(' + Math.round(bg[0] * 255) + ',' + Math.round(bg[1] * 255) + ',' + Math.round(bg[2] * 255) + ',0.9)';
      c.fillStyle = 'rgb(' + Math.round(fill[0] * 255) + ',' + Math.round(fill[1] * 255) + ',' + Math.round(fill[2] * 255) + ')';
      c.strokeText(label, lx, ly); c.fillText(label, lx, ly);
    }
  };

  /* ---- picking */
  KMap.prototype.pick = function (mx, my) {
    var best = -1, bd = 1e9;
    for (var i = 0, n = this.ids.length; i < n; i++) {
      if (this.proj[3 * i + 2] < 0) continue;
      var dx = this.proj[3 * i] - mx, dy = this.proj[3 * i + 1] - my, d = Math.hypot(dx, dy), r = this.px(i) + 5;
      if (d < r) {
        var score = d / r + this.proj[3 * i + 2] / this.far * 0.5 - (this.g.type[this.ids[i]] === AREA ? 0.3 : 0);
        if (score < bd) { bd = score; best = i; }
      }
    }
    return best < 0 ? -1 : this.ids[best];
  };

  /* ---- selection and the side panel */
  KMap.prototype.select = function (id, fly) {
    this.sel = id; this.updateColors();
    if (id < 0) { this.panel.hidden = true; return; }
    if (fly) this.flyTo({ tx: this.g.x[id], ty: this.g.y[id], tz: this.g.z[id], dist: Math.min(this.cam.dist, Math.max(120, this.extent * 0.35)) });
    this.renderPanel(id);
    if (window.amTrack) window.amTrack('map_node_open', { node_type: ['area', 'tag', 'post'][this.g.type[id]] || 'node' });
  };

  KMap.prototype.renderPanel = function (id) {
    var self = this, g = this.g, p = this.panel, lang = this.lang, t = g.type[id];
    var el = function (tag, cls, text) { var n = doc.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };
    p.textContent = '';
    var close = el('button', 'kmap__x'); close.type = 'button'; close.setAttribute('aria-label', this.t['map.close'] || 'Close'); close.textContent = '×';
    close.addEventListener('click', function () { self.select(-1); });
    p.appendChild(close);
    p.appendChild(el('p', 'kmap__kind', this.t[t === AREA ? 'map.type.area' : t === TAG ? 'map.type.tag' : 'map.type.post']));
    p.appendChild(el('h3', 'kmap__title', g.j.l[id][lang]));
    var sum = g.j.m[id][lang];
    if (sum) p.appendChild(el('p', 'kmap__sum', sum));
    if (g.j.u[id]) {
      var a = el('a', 'btn btn--primary btn--sm', this.t['map.open']); a.href = this.prefix + g.j.u[id];
      p.appendChild(a);
    }
    var head = el('p', 'kmap__kind', (this.t['map.connections'] || '') + ' (' + (g.off[id + 1] - g.off[id]) + ')');
    p.appendChild(head);
    var ul = el('ul', 'kmap__links');
    for (var q = g.off[id]; q < g.off[id + 1]; q++) {
      (function (nb) {
        var li = el('li'), b = el('button', 'kmap__link'); b.type = 'button';
        b.appendChild(el('span', 'kmap__dot kmap__dot--' + g.type[nb]));
        b.appendChild(el('span', '', g.j.l[nb][lang]));
        b.addEventListener('click', function () { self.select(nb, true); });
        li.appendChild(b); ul.appendChild(li);
      })(g.adj[q]);
    }
    if (g.off[id + 1] === g.off[id]) ul.appendChild(el('li', 'kmap__none', this.t['map.none']));
    p.appendChild(ul);
    p.hidden = false;
  };

  /* ---- focus an area (hub chips) */
  KMap.prototype.focus = function (area) {
    this.focusArea = area; this.select(-1);
    this.updateColors();
    if (area < 0) this.fit(false);
    else {
      var ids = [];
      for (var i = 0; i < this.ids.length; i++) if (this.g.area[this.ids[i]] === area) ids.push(this.ids[i]);
      this.fit(false, ids);
    }
  };

  /* ---- search box */
  KMap.prototype.bindSearch = function () {
    var self = this, input = $('.kmap__search', this.el), list = $('.kmap__results', this.el);
    if (!input) return;
    function results(q) {
      var out = [], g = self.g;
      for (var i = 0; i < self.ids.length && out.length < 60; i++) {
        var id = self.ids[i];
        if (!self.matches(id, q)) continue;
        var l = normalise(g.j.l[id][self.lang]);
        out.push([l.indexOf(q) === 0 ? 0 : 1, g.type[id], id]);
      }
      out.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
      return out.slice(0, 8).map(function (x) { return x[2]; });
    }
    function render(ids) {
      list.textContent = '';
      ids.forEach(function (id) {
        var li = doc.createElement('li'), b = doc.createElement('button');
        b.type = 'button'; b.textContent = self.g.j.l[id][self.lang];
        b.addEventListener('click', function () { choose(id); });
        li.appendChild(b); list.appendChild(li);
      });
      if (!ids.length && input.value) { var li2 = doc.createElement('li'); li2.className = 'kmap__none'; li2.textContent = self.t['map.noresult']; list.appendChild(li2); }
      list.hidden = !list.children.length;
    }
    function choose(id) { list.hidden = true; input.value = self.g.j.l[id][self.lang]; self.query = ''; self.select(id, true); }
    input.addEventListener('input', function () {
      if (!self.ready) return;
      var q = normalise(input.value.trim());
      self.query = q; self.updateColors();
      render(q ? results(q) : []);
    });
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' && self.ready) { var r = results(normalise(input.value.trim())); if (r.length) { ev.preventDefault(); choose(r[0]); } }
      if (ev.key === 'Escape') { input.value = ''; self.query = ''; list.hidden = true; self.updateColors(); }
    });
    doc.addEventListener('click', function (ev) { if (!self.el.contains(ev.target)) list.hidden = true; });
  };

  /* ---- pointer, wheel and keyboard */
  KMap.prototype.bind = function () {
    var self = this, cv = this.lbl, c = this.cam;
    this.bindSearch();
    $$('[data-area-chip]', this.el).forEach(function (b) {
      b.addEventListener('click', function () {
        var a = Number(b.dataset.areaChip);
        var on = self.focusArea === a || a < 0;
        $$('[data-area-chip]', self.el).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        if (on) { self.focus(-1); $('[data-area-chip="-1"]', self.el).setAttribute('aria-pressed', 'true'); }
        else { self.focus(a); b.setAttribute('aria-pressed', 'true'); }
      });
    });
    var reset = $('.kmap__reset', this.el);
    if (reset) reset.addEventListener('click', function () { self.vel.yaw = self.vel.pitch = 0; self.cam.yaw = 0.6; self.cam.pitch = 0.25; self.select(-1); self.focus(-1); });

    var down = null;
    function rel(ev) { var r = cv.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; }
    cv.addEventListener('contextmenu', function (ev) { ev.preventDefault(); });
    cv.addEventListener('pointerdown', function (ev) {
      cv.setPointerCapture(ev.pointerId);
      var p = rel(ev);
      self.ptrs[ev.pointerId] = { x: p[0], y: p[1] };
      down = { x: p[0], y: p[1], t: performance.now(), moved: 0, pan: ev.button === 2 || ev.shiftKey, n: Object.keys(self.ptrs).length };
      self.vel.yaw = self.vel.pitch = 0; self.fly = null;
      cv.focus({ preventScroll: true });
    });
    cv.addEventListener('pointermove', function (ev) {
      var p = rel(ev), prev = self.ptrs[ev.pointerId];
      if (!prev) {
        if (ev.pointerType === 'mouse') {
          var h = self.pick(p[0], p[1]);
          if (h !== self.hov) { self.hov = h; cv.style.cursor = h >= 0 ? 'pointer' : 'grab'; if (self.sel < 0) self.updateColors(); }
        }
        return;
      }
      var dx = p[0] - prev.x, dy = p[1] - prev.y, ids = Object.keys(self.ptrs);
      if (ids.length >= 2) {
        // two fingers: pinch to zoom, drag to pan
        var other = self.ptrs[ids.find(function (k) { return Number(k) !== ev.pointerId; })];
        var d0 = Math.hypot(prev.x - other.x, prev.y - other.y), d1 = Math.hypot(p[0] - other.x, p[1] - other.y);
        if (d0 > 0) c.dist = Math.max(30, Math.min(self.extent * 6, c.dist * (d0 / d1)));
        self.panBy(dx / 2, dy / 2);
      } else if (down && down.pan) self.panBy(dx, dy);
      else {
        c.yaw -= dx * 0.0062; c.pitch = Math.max(-1.45, Math.min(1.45, c.pitch + dy * 0.0062));
        self.vel.yaw = -dx * 0.0062 * 0.4; self.vel.pitch = dy * 0.0062 * 0.4;
      }
      if (down) down.moved += Math.abs(dx) + Math.abs(dy);
      prev.x = p[0]; prev.y = p[1];
      self.kick();
    });
    function up(ev) {
      var p = rel(ev);
      delete self.ptrs[ev.pointerId];
      if (down && down.moved < 6 && performance.now() - down.t < 500 && down.n === 1) {
        var h = self.pick(p[0], p[1]);
        if (h >= 0) self.select(h, false); else self.select(-1);
      }
      if (!Object.keys(self.ptrs).length) { down = null; if (reduced) { self.vel.yaw = self.vel.pitch = 0; } else self.kick(); }
    }
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);
    cv.addEventListener('dblclick', function (ev) {
      var p = rel(ev), h = self.pick(p[0], p[1]);
      if (h >= 0) self.select(h, true); else self.fit(false);
    });
    cv.addEventListener('wheel', function (ev) {
      ev.preventDefault();
      var f = Math.exp((ev.deltaMode === 1 ? ev.deltaY * 16 : ev.deltaY) * 0.0013);
      c.dist = Math.max(30, Math.min(self.extent * 6, c.dist * f));
      self.fly = null; self.kick();
    }, { passive: false });
    cv.addEventListener('keydown', function (ev) {
      var k = ev.key, hit = true;
      if (k === 'ArrowLeft') c.yaw -= 0.12; else if (k === 'ArrowRight') c.yaw += 0.12;
      else if (k === 'ArrowUp') c.pitch = Math.min(1.45, c.pitch + 0.1); else if (k === 'ArrowDown') c.pitch = Math.max(-1.45, c.pitch - 0.1);
      else if (k === '+' || k === '=') c.dist = Math.max(30, c.dist * 0.85); else if (k === '-') c.dist = Math.min(self.extent * 6, c.dist / 0.85);
      else if (k === 'Escape') self.select(-1);
      else if (k === 'Enter' && self.sel >= 0 && self.g.j.u[self.sel]) location.href = self.prefix + self.g.j.u[self.sel];
      else hit = false;
      if (hit) { ev.preventDefault(); self.kick(); }
    });
    if (window.ResizeObserver) new ResizeObserver(function () { self.resize(); self.kick(); }).observe(this.stage);
    new MutationObserver(function () { self.readTheme(); self.updateColors(); }).observe(doc.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  };

  KMap.prototype.panBy = function (dx, dy) {
    var c = this.cam, s = c.dist * 0.0017, v = this.view;
    if (!v) return;
    c.tx -= (v.right[0] * dx - v.up[0] * dy) * s; c.ty -= (v.right[1] * dx - v.up[1] * dy) * s; c.tz -= (v.right[2] * dx - v.up[2] * dy) * s;
  };

  /* ------------------------------------------------------------ start */
  if (views) initViews();
  initMore();
  if (mapEl) {
    var km = mapEl.__kmap = new KMap(mapEl);
    if (!views || views.dataset.view === 'map') {
      if (window.IntersectionObserver) {
        var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); if (!views || views.dataset.view === 'map') km.start(); } }, { rootMargin: '200px' });
        io.observe(mapEl);
      } else km.start();
    }
  }
})();
