// Local admin for the site's content. Run: npm run admin  ->  http://127.0.0.1:4173
//
// It edits the same Markdown files the site is built from (src/content) and the files
// people download (src/downloads). Nothing leaves your machine until you press Publish,
// which runs `git add src`, `git commit` and `git push` with your own git credentials.
//
// Safety: listens on 127.0.0.1 only, checks the Host/Origin headers (blocks DNS-rebinding
// and cross-site requests) and requires a per-run token that only the admin page receives.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { renderMarkdown } from '../build/lib/markdown.mjs';
import { slugify } from '../build/lib/util.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.ADMIN_PORT) || 4173;
const HOST = '127.0.0.1';
const TOKEN = crypto.randomBytes(24).toString('hex');
const schema = JSON.parse(fs.readFileSync(path.join(root, 'admin/schema.json'), 'utf8'));
const site = JSON.parse(fs.readFileSync(path.join(root, 'src/data/site.json'), 'utf8'));

const SLUG = /^[a-z0-9_][a-z0-9_-]{0,80}$/;
const LANGS = ['en', 'ar'];
const MAX_UPLOAD = 60 * 1024 * 1024;
const ALLOWED_EXT = new Set(['pdf', 'zip', 'xlsx', 'xlsm', 'xls', 'csv', 'docx', 'dotx', 'doc', 'pptx', 'potx', 'md', 'txt', 'json', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'ics', 'otf', 'ttf', 'woff2']);

function fieldsOf(c) {
  const f = schema.collections[c].fields;
  return typeof f === 'string' ? schema.fieldSets[f] : f;
}
function resolveSchema() {
  const out = {};
  for (const [id, c] of Object.entries(schema.collections)) {
    out[id] = {
      label: c.label,
      bilingual: !!c.bilingual,
      fields: fieldsOf(id).map((f) => {
        const o = { ...f };
        if (f.source) o.options = site[f.source].map((x) => ({ value: x.id, label: x.label.en }));
        else if (f.options) o.options = f.options.map((v) => ({ value: v, label: v }));
        return o;
      }),
    };
  }
  return out;
}

const dirOf = (c) => path.join(root, schema.collections[c].dir);
function fileFor(c, slug, lang) {
  if (!schema.collections[c]) throw httpError(400, 'Unknown collection');
  if (!SLUG.test(slug)) throw httpError(400, 'Invalid slug (use a–z, 0–9 and dashes)');
  if (!LANGS.includes(lang)) throw httpError(400, 'Invalid language');
  const dir = dirOf(c);
  const file = path.join(dir, `${slug}${lang === 'ar' ? '.ar' : ''}.md`);
  if (!file.startsWith(dir + path.sep)) throw httpError(400, 'Bad path');
  return file;
}
function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

function listItems(c) {
  const dir = dirOf(c);
  if (!fs.existsSync(dir)) return [];
  const map = new Map();
  for (const f of fs.readdirSync(dir)) {
    const m = f.match(/^(.+?)(?:\.(ar))?\.md$/);
    if (!m) continue;
    const e = map.get(m[1]) || { slug: m[1], langs: [] };
    e.langs.push(m[2] || 'en');
    if (!m[2]) {
      const { data } = matter(fs.readFileSync(path.join(dir, f), 'utf8'));
      e.title = data.title || (m[1] === '_index' ? '(Wiki landing page)' : m[1]);
      e.draft = data.draft === true || data.status === 'draft';
      e.date = data.date ? String(data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date) : '';
    }
    map.set(m[1], e);
  }
  return [...map.values()].sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.slug.localeCompare(b.slug));
}

function readItem(c, slug, lang) {
  const file = fileFor(c, slug, lang);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, 'utf8'));
  for (const k of Object.keys(data)) if (data[k] instanceof Date) data[k] = data[k].toISOString().slice(0, 10);
  return { data, body: content.replace(/^\n+/, '') };
}

function cleanData(c, data, lang) {
  const out = {};
  for (const f of fieldsOf(c)) {
    if (lang === 'ar' && f.shared) continue; // shared fields live on the English file
    let v = data[f.name];
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length) || v === false) continue;
    if (f.type === 'number') v = Number(v);
    if (f.type === 'tags') v = (Array.isArray(v) ? v : String(v).split(',')).map((x) => String(x).trim()).filter(Boolean);
    if (f.type === 'links') v = v.filter((l) => l && l.label && /^https?:\/\//i.test(l.url)).map((l) => ({ label: String(l.label), url: String(l.url) }));
    if (f.type === 'file' && v && !String(v).startsWith(f.urlPrefix)) throw httpError(400, `${f.name} must point into ${f.urlPrefix}`);
    if (f.name === 'url' && v && !/^https?:\/\//i.test(String(v))) throw httpError(400, 'External link must start with https://');
    if (f.type === 'bool') v = v === true || v === 'true';
    out[f.name] = typeof v === 'string' ? v.trim() : v;
  }
  return out;
}

function writeItem(c, slug, lang, data, body) {
  const file = fileFor(c, slug, lang);
  if (lang === 'ar' && !fs.existsSync(fileFor(c, slug, 'en'))) throw httpError(400, 'Create the English version first');
  const clean = cleanData(c, data || {}, lang);
  const src = matter.stringify(String(body || '').trim() + '\n', clean);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, src);
}

function git(args) {
  const r = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  return { ok: r.status === 0, out: `${r.stdout || ''}${r.stderr || ''}`.trim() };
}

// ------------------------------------------------------------------ http plumbing
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (ch) => {
      size += ch.length;
      if (size > limit) { reject(httpError(413, 'File too large')); req.destroy(); return; }
      chunks.push(ch);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
const json = (res, status, obj) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
};
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript' };

const server = http.createServer(async (req, res) => {
  try {
    const host = (req.headers.host || '').toLowerCase();
    if (host !== `${HOST}:${PORT}` && host !== `localhost:${PORT}`) throw httpError(403, 'Bad host');
    const origin = req.headers.origin;
    if (origin && origin !== `http://${HOST}:${PORT}` && origin !== `http://localhost:${PORT}`) throw httpError(403, 'Bad origin');
    const url = new URL(req.url, `http://${host}`);

    // static admin UI
    if (req.method === 'GET' && !url.pathname.startsWith('/api/')) {
      const name = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
      const file = path.join(root, 'admin/ui', name);
      if (!file.startsWith(path.join(root, 'admin/ui') + path.sep) || !fs.existsSync(file)) throw httpError(404, 'Not found');
      let body = fs.readFileSync(file);
      if (name === 'index.html') body = Buffer.from(body.toString().replace('__TOKEN__', TOKEN));
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
        'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(body);
      return;
    }

    if (req.headers['x-admin-token'] !== TOKEN) throw httpError(401, 'Missing or wrong admin token. Reload the page.');
    const q = url.searchParams;

    if (req.method === 'GET' && url.pathname === '/api/schema') return json(res, 200, resolveSchema());
    if (req.method === 'GET' && url.pathname === '/api/items') {
      if (!schema.collections[q.get('c')]) throw httpError(400, 'Unknown collection');
      return json(res, 200, listItems(q.get('c')));
    }
    if (req.method === 'GET' && url.pathname === '/api/item') {
      const it = readItem(q.get('c'), q.get('slug'), q.get('lang') || 'en');
      return it ? json(res, 200, it) : json(res, 404, { error: 'Not found' });
    }
    if (req.method === 'PUT' && url.pathname === '/api/item') {
      const b = JSON.parse((await readBody(req, 2 * 1024 * 1024)).toString('utf8'));
      writeItem(b.c, b.slug, b.lang || 'en', b.data, b.body);
      return json(res, 200, { ok: true });
    }
    if (req.method === 'DELETE' && url.pathname === '/api/item') {
      const c = q.get('c'), slug = q.get('slug'), lang = q.get('lang');
      const targets = lang ? [lang] : LANGS;
      for (const l of targets) { const f = fileFor(c, slug, l); if (fs.existsSync(f)) fs.unlinkSync(f); }
      return json(res, 200, { ok: true });
    }
    if (req.method === 'POST' && url.pathname === '/api/preview') {
      const b = JSON.parse((await readBody(req, 2 * 1024 * 1024)).toString('utf8'));
      return json(res, 200, { html: renderMarkdown(String(b.body || '')).html });
    }
    if (req.method === 'GET' && url.pathname === '/api/files') {
      const dir = path.join(root, 'src/downloads');
      fs.mkdirSync(dir, { recursive: true });
      return json(res, 200, fs.readdirSync(dir).filter((f) => !f.startsWith('.')).map((f) => ({ name: f, path: `/downloads/${f}`, size: fs.statSync(path.join(dir, f)).size })));
    }
    if (req.method === 'POST' && url.pathname === '/api/upload') {
      const raw = q.get('name') || '';
      const ext = path.extname(raw).slice(1).toLowerCase();
      const base = slugify(path.basename(raw, path.extname(raw))).slice(0, 80) || 'file';
      if (!ALLOWED_EXT.has(ext)) throw httpError(400, `File type .${ext || '?'} is not allowed`);
      const dir = path.join(root, 'src/downloads');
      fs.mkdirSync(dir, { recursive: true });
      const name = `${base}.${ext}`;
      const dest = path.join(dir, name);
      if (fs.existsSync(dest) && q.get('overwrite') !== '1') throw httpError(409, `${name} already exists. Tick "replace" to overwrite it.`);
      fs.writeFileSync(dest, await readBody(req, MAX_UPLOAD));
      return json(res, 200, { ok: true, path: `/downloads/${name}`, size: fs.statSync(dest).size });
    }
    if (req.method === 'POST' && url.pathname === '/api/build') {
      const r = spawnSync(process.execPath, [path.join(root, 'build/build.mjs')], { cwd: root, encoding: 'utf8' });
      return json(res, 200, { ok: r.status === 0, log: `${r.stdout}${r.stderr}`.trim() });
    }
    if (req.method === 'GET' && url.pathname === '/api/git/status') {
      const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']).out;
      const st = git(['status', '--porcelain', '--', 'src']);
      return json(res, 200, { branch, changes: st.out ? st.out.split('\n') : [] });
    }
    if (req.method === 'POST' && url.pathname === '/api/git/publish') {
      const b = JSON.parse((await readBody(req, 10 * 1024)).toString('utf8'));
      const msg = String(b.message || '').trim().replace(/[\r\n]+/g, ' ').slice(0, 200) || 'Update content';
      const log = [];
      for (const args of [['add', '--', 'src'], ['commit', '-m', msg], ['push']]) {
        const r = git(args);
        log.push(`$ git ${args[0]}\n${r.out}`);
        if (!r.ok) return json(res, 200, { ok: false, log: log.join('\n\n') });
      }
      return json(res, 200, { ok: true, log: log.join('\n\n') });
    }
    throw httpError(404, 'Not found');
  } catch (e) {
    json(res, e.status || 500, { error: e.message || 'Server error' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`\nAdmin ready:  http://${HOST}:${PORT}/\nPreview the site in another terminal with:  npm run dev\nCtrl+C to stop.\n`);
});
