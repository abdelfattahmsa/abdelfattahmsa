// Static site build: Markdown + JSON in src/ -> dist/ (plain HTML, CSS, JS).
// Usage: node build/build.mjs [--drafts]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { loadAll, pick } from './lib/content.mjs';
import { buildSprite } from './lib/icons.mjs';
import { createTemplates, THEME_INIT } from './lib/templates.mjs';
import { ensureDir, writeFile, copyDir, readJSON, normalise, esc } from './lib/util.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src');
const dist = path.join(root, process.env.OUT_DIR || 'dist');
const drafts = process.argv.includes('--drafts') || process.env.BUILD_DRAFTS === '1';
const t0 = Date.now();

const hash = (buf) => crypto.createHash('sha256').update(buf).digest('hex').slice(0, 8);

export function build() {
  fs.rmSync(dist, { recursive: true, force: true });
  ensureDir(dist);

  const site = readJSON(path.join(src, 'data/site.json'));
  const i18n = { en: readJSON(path.join(src, 'data/i18n/en.json')), ar: readJSON(path.join(src, 'data/i18n/ar.json')) };
  const content = loadAll(root, { drafts });

  // ---- static assets (fonts, images, icons) -------------------------------------------------
  copyDir(path.join(src, 'assets/fonts'), path.join(dist, 'assets/fonts'));
  copyDir(path.join(src, 'assets/img'), path.join(dist, 'assets/img'));
  copyDir(path.join(src, 'assets/icons'), path.join(dist, 'assets/icons'));

  // ---- CSS: base + brand colours + optional Heming @font-face ------------------------------
  const fontDir = path.join(src, 'assets/fonts');
  // Display font: Satoshi, if its WOFF2 files are in src/assets/fonts/ (download free from fontshare.com).
  // Variable file (Satoshi-Variable.woff2) or static files (Satoshi-Regular/Medium/Bold.woff2) both work.
  const satoshi = fs.existsSync(fontDir) ? fs.readdirSync(fontDir).filter((f) => /^satoshi.*\.woff2$/i.test(f) && !/italic/i.test(f)) : [];
  let css = fs.readFileSync(path.join(src, 'assets/css/main.css'), 'utf8');
  css += '\n/* ---- generated: brand colours ---- */\n';
  for (const v of site.ventures) css += `.brand-${v.id}{--brand:${v.color};--brand-text:${v.colorText}}\n`;
  if (satoshi.length) {
    css += '\n/* ---- generated: Satoshi display font ---- */\n';
    const W = { light: 300, regular: 400, medium: 500, bold: 700, black: 900 };
    for (const file of satoshi) {
      const variable = /variable/i.test(file);
      const key = Object.keys(W).find((k) => new RegExp(k, 'i').test(file));
      const weight = variable ? '300 900' : W[key || 'regular'];
      css += `@font-face{font-family:"Satoshi";src:url("/assets/fonts/${file}") format("woff2");font-weight:${weight};font-style:normal;font-display:swap}\n`;
    }
    css += ':root{--ff-display:"Satoshi","Tajawal",system-ui,sans-serif}\n';
  }
  const cssName = `main.${hash(css)}.css`;
  writeFile(path.join(dist, 'assets', cssName), css);

  // ---- JS ----------------------------------------------------------------------------------
  const js = fs.readFileSync(path.join(src, 'assets/js/main.js'), 'utf8');
  const jsName = `main.${hash(js)}.js`;
  writeFile(path.join(dist, 'assets', jsName), js);

  // ---- icon sprite -------------------------------------------------------------------------
  const markPath = readJSON(path.join(root, 'build/lib/mark-path.json'));
  const kyberia = readJSON(path.join(src, 'data/kyberia.json'));
  const sprite = buildSprite(root, markPath, kyberia);
  const spriteName = `icons.${hash(sprite)}.svg`;
  writeFile(path.join(dist, 'assets', spriteName), sprite);

  // ---- downloads: copy only files referenced by included items ------------------------------
  for (const d of content.downloads) {
    if (!d.fileInfo) continue;
    const rel = String(d.data.file).replace(/^\//, '');
    const to = path.join(dist, rel);
    ensureDir(path.dirname(to));
    fs.copyFileSync(path.join(src, rel), to);
  }

  // ---- CV button: only appears once the PDF exists, so there is never a dead link ----
  let cv = null;
  if (site.cv?.file) {
    const rel = site.cv.file.replace(/^\//, '');
    if (fs.existsSync(path.join(src, rel))) {
      ensureDir(path.dirname(path.join(dist, rel)));
      fs.copyFileSync(path.join(src, rel), path.join(dist, rel));
      cv = { href: site.cv.file };
    } else console.warn(`! CV not found at src/${rel}: the Download CV button is hidden until you add it`);
  }

  // ---- CSP ---------------------------------------------------------------------------------
  const initHash = crypto.createHash('sha256').update(THEME_INIT).digest('base64');
  const csp = [
    "default-src 'none'",
    `script-src 'self' 'sha256-${initHash}'`,
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self' https://formspree.io",
    "form-action 'self' https://formspree.io",
    "base-uri 'self'",
  ].join('; ');

  const ctx = {
    site,
    i18n,
    content,
    kyberia,
    cv,
    csp,
    wikiIcons: { engineering: 'layers', developer: 'code', design: 'pencil' },
    assets: {
      css: `/assets/${cssName}`,
      js: `/assets/${jsName}`,
      sprite: `/assets/${spriteName}`,
      og: '/assets/img/og.png',
      faviconSvg: '/assets/icons/favicon.svg',
      favicon32: '/assets/icons/favicon-32.png',
      appleIcon: '/assets/icons/apple-touch-icon.png',
      displayFont: satoshi.length ? `/assets/fonts/${satoshi[0]}` : null,
    },
  };
  const { pages, T, L, u } = createTemplates(ctx);

  // ---- render every page in both languages ---------------------------------------------------
  const urls = [];
  const searchIndex = { en: [], ar: [] };
  for (const lang of ['en', 'ar']) {
    for (const key of ['home', 'about', 'hub', 'resources', 'contact']) {
      for (const page of pages[key](lang)) {
        const file = path.join(dist, u(lang, page.path), 'index.html');
        writeFile(file, page.html);
        urls.push({ lang, path: page.path });
      }
    }
    // search index
    const idx = searchIndex[lang];
    const add = (type, urlPath, v, tags = []) =>
      idx.push({
        t: v.data.title,
        s: v.data.summary || '',
        u: u(lang, urlPath),
        k: type,
        a: normalise(v.data.title),
        b: normalise((tags || []).join(' ')),
        c: normalise(v.data.summary || ''),
        d: normalise(v.text.slice(0, 3000)),
      });
    for (const w of site.wikis) {
      const data = content.wikis[w.id] || { pages: [], index: null };
      if (data.index) {
        const v = pick(data.index, lang);
        add('wiki', `/hub/${w.id}/`, { ...v, data: { ...v.data, title: L(w.title, lang), summary: L(w.blurb, lang) } });
      }
      for (const p of data.pages) add('wiki', `/hub/${w.id}/${p.slug}/`, pick(p, lang), p.variants.en.data.tags);
    }
    for (const p of content.research) add('research', `/hub/research/${p.slug}/`, pick(p, lang), pick(p, lang).data.tags);
    for (const p of content.journey) add('journey', `/hub/journey/${p.slug}/`, pick(p, lang), pick(p, lang).data.tags);
    for (const p of content.guides) add('guide', `/resources/guides/${p.slug}/`, pick(p, lang), pick(p, lang).data.tags);
    for (const p of content.downloads) add('download', `/resources/downloads/${p.slug}/`, pick(p, lang), pick(p, lang).data.tags);
    add('page', '/about/', pick(content.pages.about, lang));
    for (const e of content.career) add('page', '/about/#timeline', { ...pick(e, lang), data: { ...pick(e, lang).data, title: `${pick(e, lang).data.title}, ${pick(e, lang).data.org}`, summary: pick(e, lang).data.summary } }, []);
    const labels = Object.fromEntries(['wiki', 'research', 'journey', 'guide', 'download', 'page'].map((k) => [k, T(lang, 'type.' + k)]));
    writeFile(path.join(dist, u(lang, '/search-index.json').replace(/^\//, '')), JSON.stringify({ l: labels, i: idx }));
  }

  // 404 (GitHub Pages serves /404.html for the whole site)
  writeFile(path.join(dist, '404.html'), pages.notFound('en')[0].html);

  // sitemap / robots / misc
  const sm = urls
    .map(({ lang, path: p }) => `<url><loc>${esc(site.url + u(lang, p))}</loc></url>`)
    .join('\n');
  writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sm}\n</urlset>\n`);
  writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
  writeFile(path.join(dist, '.nojekyll'), '');
  if (fs.existsSync(path.join(root, 'CNAME'))) fs.copyFileSync(path.join(root, 'CNAME'), path.join(dist, 'CNAME'));

  const pageCount = urls.length;
  console.log(`built ${pageCount} pages (${drafts ? 'with' : 'without'} drafts)${satoshi.length ? ' · Satoshi: ' + satoshi.length + ' file(s)' : ' · Satoshi: not found, using Tajawal'} in ${Date.now() - t0}ms`);
  return { dist, pageCount };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) build();
