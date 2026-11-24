// Static site build: Markdown + JSON in src/ -> dist/ (plain HTML, CSS, JS).
// Usage: node build/build.mjs [--drafts] [--out <dir>]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { loadAll } from './lib/content.mjs';
import { buildGraph } from './lib/graph.mjs';
import { buildSprite, logoCss } from './lib/icons.mjs';
import { feedXml } from './lib/feed.mjs';
import { buildOnlineAdmin } from './lib/admin-online.mjs';
import { createTemplates } from './lib/templates.mjs';
import { LANGS, u } from './lib/i18n.mjs';
import { searchIndex, askIndex, clientNormalise, NORMALISE_MARKER } from './lib/search.mjs';
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
    lettering: readJSON(path.join(dataDir, 'wordmark-lettering.json')),
    mascot: readJSON(path.join(dataDir, 'mascot.json')),
    kyberia: readJSON(path.join(dataDir, 'kyberia.json')),
  };
  const content = loadAll(site, { drafts });
  const services = readJSON(path.join(dataDir, 'services.json'));

  // the knowledge map: one graph for both languages; positions are kept in src/data/graph-layout.json
  // so the map grows instead of reshuffling (commit that file with your content)
  const layoutFile = path.join(dataDir, 'graph-layout.json');
  const graph = buildGraph({ site, content, prevLayout: fs.existsSync(layoutFile) ? readJSON(layoutFile) : {} });
  const layoutText = '{\n' + Object.entries(graph.layout).map(([k, v]) => ` ${JSON.stringify(k)}:${JSON.stringify(v)}`).join(',\n') + '\n}\n';
  if (!drafts && (!fs.existsSync(layoutFile) || fs.readFileSync(layoutFile, 'utf8') !== layoutText)) fs.writeFileSync(layoutFile, layoutText);

  for (const dir of ['fonts', 'img', 'icons']) copyDir(path.join(src, 'assets', dir), path.join(dist, 'assets', dir));
  // browsers ask for /favicon.ico by default
  fs.copyFileSync(path.join(src, 'assets/icons/favicon.ico'), path.join(dist, 'favicon.ico'));

  let css = fs.readFileSync(path.join(src, 'assets/css/main.css'), 'utf8');
  css += '\n/* ---- generated: brand colours ---- */\n';
  for (const v of site.ventures) css += `.brand-${v.id}{--brand:${v.color};--brand-text:${v.colorText}}\n`;
  css += '\n/* ---- generated: header logo proportions ---- */\n' + logoCss(brand);
  const cssName = `main.${hash(css)}.css`;
  writeFile(path.join(dist, 'assets', cssName), css);

  const js = fs.readFileSync(path.join(src, 'assets/js/main.js'), 'utf8').replace(NORMALISE_MARKER, clientNormalise());
  const jsName = `main.${hash(js)}.js`;
  writeFile(path.join(dist, 'assets', jsName), js);

  const graphText = JSON.stringify(graph.json);
  const graphName = `graph.${hash(graphText)}.json`;
  writeFile(path.join(dist, 'assets', graphName), graphText);
  const mapJs = fs.readFileSync(path.join(src, 'assets/js/map.js'), 'utf8');
  const gaId = site.analytics?.ga4 || '';
  const anJs = fs.readFileSync(path.join(src, 'assets/js/analytics.js'), 'utf8');
  const anName = `analytics.${hash(anJs)}.js`;
  if (gaId) writeFile(path.join(dist, 'assets', anName), anJs);
  const askJs = fs.readFileSync(path.join(src, 'assets/js/ask.js'), 'utf8').replace(NORMALISE_MARKER, clientNormalise());
  const askName = `ask.${hash(askJs)}.js`;
  writeFile(path.join(dist, 'assets', askName), askJs);
  const mapName = `map.${hash(mapJs)}.js`;
  writeFile(path.join(dist, 'assets', mapName), mapJs);

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
    `script-src 'self' 'sha256-${crypto.createHash('sha256').update(themeInit).digest('base64')}'${site.analytics?.ga4 ? ' https://www.googletagmanager.com' : ''}`,
    "style-src 'self'",
    `img-src 'self' data:${site.analytics?.ga4 ? ' https://*.google-analytics.com https://*.googletagmanager.com' : ''}`,
    "font-src 'self'",
    `connect-src 'self'${formOrigin}${site.analytics?.ga4 ? ' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com' : ''}`,
    "manifest-src 'self'",
    `form-action 'self'${formOrigin}`,
    "base-uri 'self'",
  ].join('; ');

  const { pages, T, L } = createTemplates({
    site,
    i18n,
    content,
    services,
    graph,
    kyberia: brand.kyberia,
    cv,
    csp,
    themeInit,
    assets: {
      css: `/assets/${cssName}`,
      js: `/assets/${jsName}`,
      mapJs: `/assets/${mapName}`,
      askJs: `/assets/${askName}`,
      analyticsJs: gaId ? `/assets/${anName}` : '',
      ga: gaId,
      graph: `/assets/${graphName}`,
      sprite: `/assets/${spriteName}`,
      og: '/assets/img/og.png',
      faviconSvg: ICONS.svg,
      manifest: MANIFEST,
      favicon16: ICONS.png16,
      favicon32: ICONS.png32,
      appleIcon: ICONS.apple,
    },
  });

  const urls = [];
  for (const lang of LANGS) {
    for (const key of ['home', 'about', 'services', 'hub', 'resources', 'contact', 'work', 'text']) {
      for (const page of pages[key](lang)) {
        writeFile(path.join(dist, u(lang, page.path), 'index.html'), page.html);
        urls.push(u(lang, page.path));
      }
    }
    writeFile(path.join(dist, u(lang, '/feed.xml')), feedXml({ lang, site, content, L }));
    writeFile(path.join(dist, u(lang, '/ask-index.json')), JSON.stringify(askIndex({ lang, site, content, services, L })));
    writeFile(path.join(dist, u(lang, '/search-index.json')), JSON.stringify(searchIndex({ lang, site, content, services, T, L })));
  }
  // GitHub Pages serves /404.html for every missing URL
  writeFile(path.join(dist, '404.html'), pages.notFound('en')[0].html);

  const sm = urls.map((p) => `<url><loc>${esc(site.url + p)}</loc></url>`).join('\n');
  writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sm}\n</urlset>\n`);
  writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${site.url}/sitemap.xml\n`);
  buildOnlineAdmin({ root, dist, site });
  writeFile(path.join(dist, '.nojekyll'), '');
  if (fs.existsSync(path.join(root, 'CNAME'))) fs.copyFileSync(path.join(root, 'CNAME'), path.join(dist, 'CNAME'));

  console.log(`built ${urls.length} pages (${drafts ? 'with' : 'without'} drafts) in ${Date.now() - t0}ms · map: ${graph.stats.nodes} nodes, ${graph.stats.bonds} bonds`);
  return { dist, pageCount: urls.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({ options: { drafts: { type: 'boolean', default: false }, out: { type: 'string', default: 'dist' } } });
  build({ outDir: values.out, drafts: values.drafts });
}
