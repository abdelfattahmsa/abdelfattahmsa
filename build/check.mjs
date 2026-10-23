// Post-build checks on dist/. Exits 1 on any failure so CI blocks a bad deploy.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, process.env.OUT_DIR || 'dist');
if (!fs.existsSync(dist)) { console.error('dist/ missing. Run npm run build first.'); process.exit(1); }

const problems = [];
const fail = (page, msg) => problems.push(`${page}: ${msg}`);
const htmlFiles = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) htmlFiles.push(p);
  }
})(dist);

function resolves(url) {
  let p = url.split('#')[0].split('?')[0];
  if (!p) return true;
  p = decodeURIComponent(p);
  const file = path.join(dist, p);
  if (!file.startsWith(dist)) return false;
  if (fs.existsSync(file)) return fs.statSync(file).isDirectory() ? fs.existsSync(path.join(file, 'index.html')) : true;
  return false;
}

let bytes = 0;
for (const f of htmlFiles) {
  const rel = '/' + path.relative(dist, f).replace(/index\.html$/, '');
  const html = fs.readFileSync(f, 'utf8');
  bytes += html.length;

  if ((html.match(/<h1[\s>]/g) || []).length !== 1) fail(rel, 'must have exactly one <h1>');
  if (!/<html lang="(en|ar)" dir="(ltr|rtl)"/.test(html)) fail(rel, 'missing lang/dir on <html>');
  if (!/<title>[^<]+<\/title>/.test(html)) fail(rel, 'missing <title>');
  if (!/<meta name="description" content="[^"]+"/.test(html)) fail(rel, 'missing meta description');
  if (!/http-equiv="Content-Security-Policy"/.test(html)) fail(rel, 'missing CSP meta');
  if (/\sstyle="/.test(html)) fail(rel, 'inline style attribute (blocked by CSP)');
  if (/\son[a-z]+="/i.test(html)) fail(rel, 'inline event handler (blocked by CSP)');
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt="/.test(m[0])) fail(rel, 'image without alt');

  // external *resources* are not allowed (links to other sites are fine)
  for (const m of html.matchAll(/<(?:script|img|link|iframe|source)\b[^>]*\b(?:src|href)="(https?:)?\/\/[^"]+"/g)) {
    if (!/rel="(canonical|alternate)"/.test(m[0])) fail(rel, `external resource: ${m[0].slice(0, 80)}`);
  }

  // internal references must exist
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const u = m[1];
    if (/^(https?:|mailto:|tel:|data:|#)/.test(u)) continue;
    if (u.startsWith('/') && !resolves(u)) fail(rel, `broken link ${u}`);
  }
  // in-page anchors
  for (const m of html.matchAll(/href="#([^"]+)"/g)) {
    if (!html.includes(`id="${m[1]}"`)) fail(rel, `missing anchor #${m[1]}`);
  }
}

for (const lang of ['', 'ar/']) {
  const idx = path.join(dist, lang, 'search-index.json');
  if (!fs.existsSync(idx)) fail('/' + lang, 'search-index.json missing');
  else {
    const j = JSON.parse(fs.readFileSync(idx, 'utf8'));
    for (const it of j.i) if (!resolves(it.u)) fail('search-index', `dead result ${it.u}`);
  }
}
for (const f of ['404.html', 'sitemap.xml', 'robots.txt']) if (!fs.existsSync(path.join(dist, f))) fail('/', `${f} missing`);

const assetBytes = fs.readdirSync(path.join(dist, 'assets')).filter((f) => /\.(css|js|svg)$/.test(f)).reduce((n, f) => n + fs.statSync(path.join(dist, 'assets', f)).size, 0);
console.log(`checked ${htmlFiles.length} pages · HTML ${(bytes / 1024).toFixed(0)} KB total · css+js+icons ${(assetBytes / 1024).toFixed(0)} KB`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n - ` + problems.join('\n - '));
  process.exit(1);
}
console.log('all checks passed');
