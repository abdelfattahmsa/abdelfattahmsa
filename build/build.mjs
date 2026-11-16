// Static site build: Markdown + JSON in src/ -> dist/ (plain HTML, CSS, JS).
// Usage: node build/build.mjs [--drafts] [--out <dir>]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { loadAll } from './lib/content.mjs';
import { buildSprite, logoCss } from './lib/icons.mjs';
import { createTemplates } from './lib/templates.mjs';
import { LANGS, u } from './lib/i18n.mjs';
import { searchIndex, clientNormalise, NORMALISE_MARKER } from './lib/search.mjs';
import { root, src, dataDir, srcFileFor } from './lib/paths.mjs';
import { ensureDir, writeFile, copyDir, readJSON, esc } from './lib/util.mjs';

const hash = (buf) => crypto.createHash('sha256').update(buf).digest('hex').slice(0, 8);

// Site icons: drawn by brand/build-mascot.mjs into src/assets/icons/.
const ICONS = {
  svg: '/assets/icons/favicon.svg',
  png16: '/assets/icons/favicon-16.png',
  png32: '/assets/icons/favicon-32.png',
  apple: '/assets/icons/apple-touch-icon.png',
  app: [
    { src: '/assets/icons/icon-192.png', sizes: '192x192', purpose: 'any' },
    { src: '/assets/icons/icon-512.png', sizes: '512x512', purpose: 'any' },
    { src: '/assets/icons/icon-maskable-192.png', sizes: '192x192', purpose: 'maskable' },
    { src: '/assets/icons/icon-maskable-512.png', sizes: '512x512', purpose: 'maskable' },
  ],
};
const MANIFEST = '/assets/icons/site.webmanifest';

// Satoshi (display font) is licensed and never committed; the build uses it when its WOFF2 files are in
// src/assets/fonts/: Satoshi-Variable.woff2, or static Satoshi-Regular/Medium/Bold.woff2.
function satoshiCss(files) {
  const W = { light: 300, regular: 400, medium: 500, bold: 700, black: 900 };
  let css = '\n/* ---- generated: Satoshi display font ---- */\n';
  for (const file of files) {
    const key = Object.keys(W).find((k) => new RegExp(k, 'i').test(file));
    const weight = /variable/i.test(file) ? '300 900' : W[key || 'regular'];
    css += `@font-face{font-family:"Satoshi";src:url("/assets/fonts/${file}") format("woff2");font-weight:${weight};font-style:normal;font-display:swap}\n`;
  }
  return css + ':root{--ff-display:"Satoshi","Tajawal",system-ui,sans-serif}\n';
}

export function build({ outDir = 'dist', drafts = false } = {}) {
  const t0 = Date.now();
  const dist = path.join(root, outDir);
  fs.rmSync(dist, { recursive: true, force: true });
  ensureDir(dist);

  const site = readJSON(path.join(dataDir, 'site.json'));
  const i18n = Object.fromEntries(LANGS.map((l) => [l, readJSON(path.join(dataDir, `i18n/${l}.json`))]));
  // drawn by the brand scripts (see SITE.md) and by brand/kyberia/extract-from-pdf.py
  const brand = {
    wordmark: readJSON(path.join(dataDir, 'wordmark.json')),
    wordmarkAr: readJSON(path.join(dataDir, 'wordmark-ar.json')),
    mascot: readJSON(path.join(dataDir, 'mascot.json')),
    kyberia: readJSON(path.join(dataDir, 'kyberia.json')),
  };
  const content = loadAll(site, { drafts });

  for (const dir of ['fonts', 'img', 'icons']) copyDir(path.join(src, 'assets', dir), path.join(dist, 'assets', dir));
  // browsers ask for /favicon.ico by default
  fs.copyFileSync(path.join(src, 'assets/icons/favicon.ico'), path.join(dist, 'favicon.ico'));

  const fontDir = path.join(src, 'assets/fonts');
  const satoshi = fs.readdirSync(fontDir).filter((f) => /^satoshi.*\.woff2$/i.test(f) && !/italic/i.test(f));
  let css = fs.readFileSync(path.join(src, 'assets/css/main.css'), 'utf8');
  css += '\n/* ---- generated: brand colours ---- */\n';
  for (const v of site.ventures) css += `.brand-${v.id}{--brand:${v.color};--brand-text:${v.colorText}}\n`;
  css += '\n/* ---- generated: header logo proportions ---- */\n' + logoCss(brand);
  if (satoshi.length) css += satoshiCss(satoshi);
  const cssName = `main.${hash(css)}.css`;
  writeFile(path.join(dist, 'assets', cssName), css);

  const js = fs.readFileSync(path.join(src, 'assets/js/main.js'), 'utf8').replace(NORMALISE_MARKER, clientNormalise());
  const jsName = `main.${hash(js)}.js`;
  writeFile(path.join(dist, 'assets', jsName), js);

  const sprite = buildSprite({ socials: site.socials, brand });
  const spriteName = `icons.${hash(sprite)}.svg`;
  writeFile(path.join(dist, 'assets', spriteName), sprite);

  writeFile(path.join(dist, MANIFEST), JSON.stringify({
    name: site.app.name, short_name: site.app.shortName, description: site.tagline.en,
    start_url: '/', display: 'standalone', background_color: site.app.color, theme_color: site.app.color,
    icons: ICONS.app.map(({ src: s, sizes, purpose }) => ({ src: s, sizes, type: 'image/png', purpose })),
  }, null, 2) + '\n');

  // files served as-is from src/: the downloads that are included, and the CV
  const publish = (url) => {
    const to = path.join(dist, url.replace(/^\//, ''));
    ensureDir(path.dirname(to));
    fs.copyFileSync(srcFileFor(url), to);
  };
  for (const d of content.downloads) if (d.fileInfo) publish(String(d.data.file));
  // the Download CV button only appears once the PDF exists, so there is never a dead link
  let cv = null;
  if (site.cv?.file) {
    if (fs.existsSync(srcFileFor(site.cv.file))) {
      publish(site.cv.file);
      cv = { href: site.cv.file };
    } else console.warn(`! CV not found at ${path.relative(root, srcFileFor(site.cv.file))}: the Download CV button is hidden until you add it`);
  }

  const themeInit = fs.readFileSync(path.join(src, 'assets/js/theme-init.js'), 'utf8').trim();
  const formOrigin = site.contact.formEndpoint ? ' ' + new URL(site.contact.formEndpoint).origin : '';
  const csp = [
    "default-src 'none'",
    `script-src 'self' 'sha256-${crypto.createHash('sha256').update(themeInit).digest('base64')}'`,
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src 'self'${formOrigin}`,
    "manifest-src 'self'",
    `form-action 'self'${formOrigin}`,
    "base-uri 'self'",
  ].join('; ');

  const { pages, T, L } = createTemplates({
    site,
    i18n,
    content,
    kyberia: brand.kyberia,
    cv,
    csp,
    themeInit,
    assets: {
      css: `/assets/${cssName}`,
      js: `/assets/${jsName}`,
      sprite: `/assets/${spriteName}`,
      og: '/assets/img/og.png',
      faviconSvg: ICONS.svg,
      manifest: MANIFEST,
      favicon16: ICONS.png16,
      favicon32: ICONS.png32,
      appleIcon: ICONS.apple,
      displayFont: satoshi.length ? `/assets/fonts/${satoshi[0]}` : null,
    },
  });

  const urls = [];
  for (const lang of LANGS) {
    for (const key of ['home', 'about', 'hub', 'resources', 'contact']) {
      for (const page of pages[key](lang)) {
        writeFile(path.join(dist, u(lang, page.path), 'index.html'), page.html);
        urls.push(u(lang, page.path));
      }
    }
    writeFile(path.join(dist, u(lang, '/search-index.json')), JSON.stringify(searchIndex({ lang, site, content, T, L })));
  }
  // GitHub Pages serves /404.html for every missing URL
  writeFile(path.join(dist, '404.html'), pages.notFound('en')[0].html);

  const sm = urls.map((p) => `<url><loc>${esc(site.url + p)}</loc></url>`).join('\n');
  writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sm}\n</urlset>\n`);
  writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
  writeFile(path.join(dist, '.nojekyll'), '');
  if (fs.existsSync(path.join(root, 'CNAME'))) fs.copyFileSync(path.join(root, 'CNAME'), path.join(dist, 'CNAME'));

  console.log(`built ${urls.length} pages (${drafts ? 'with' : 'without'} drafts)${satoshi.length ? ' · Satoshi: ' + satoshi.length + ' file(s)' : ' · Satoshi: not found, using Tajawal'} in ${Date.now() - t0}ms`);
  return { dist, pageCount: urls.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({ options: { drafts: { type: 'boolean', default: false }, out: { type: 'string', default: 'dist' } } });
  build({ outDir: values.out, drafts: values.drafts });
}
