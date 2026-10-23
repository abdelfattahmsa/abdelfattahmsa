// Generates every logo asset from one geometric source of truth.
// Run: node brand/build-logo.mjs   (needs devDependencies: opentype.js, sharp)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'brand/logo');
const png = path.join(out, 'png');
fs.mkdirSync(png, { recursive: true });
fs.mkdirSync(path.join(root, 'src/assets/icons'), { recursive: true });

const INK = '#000000';
const PAPER = '#ffffff';
const YELLOW = '#ffcc00';
const f = (n) => +n.toFixed(3);

// ---------------------------------------------------------------------------
// The AM monogram. Grid: height 60, A = 48 wide, gap 10, M = 60 wide => 118 x 60.
//   A  = a peak (flat apex) with a semicircular arch opening: truss / tunnel.
//   M  = two adjoining arches (a lowercase "m" built from circles): bridge.
// Stems are 12 units, arches are true semicircles, so every curve is a circle
// and every edge is a straight line. There are no strokes, only filled shapes.
// ---------------------------------------------------------------------------
const MARK_W = 118;
const MARK_H = 60;

function markPath(s = 1, ox = 0, oy = 0) {
  const X = (x) => f(ox + x * s);
  const Y = (y) => f(oy + y * s);
  const R = (r) => f(r * s);
  const A = `M${X(0)} ${Y(60)}L${X(18)} ${Y(0)}H${X(30)}L${X(48)} ${Y(60)}H${X(34)}V${Y(46)}A${R(10)} ${R(10)} 0 0 0 ${X(14)} ${Y(46)}V${Y(60)}Z`;
  const m = 58;
  const M =
    `M${X(m)} ${Y(60)}V${Y(18)}A${R(18)} ${R(18)} 0 0 1 ${X(m + 30)} ${Y(4.584)}` +
    `A${R(18)} ${R(18)} 0 0 1 ${X(m + 60)} ${Y(18)}V${Y(60)}H${X(m + 48)}V${Y(18)}` +
    `A${R(6)} ${R(6)} 0 0 0 ${X(m + 36)} ${Y(18)}V${Y(60)}H${X(m + 24)}V${Y(18)}` +
    `A${R(6)} ${R(6)} 0 0 0 ${X(m + 12)} ${Y(18)}V${Y(60)}Z`;
  return A + M;
}

// Small-size master: heavier stems and wider counters so it survives at 16px.
function markPathSmall(s = 1, ox = 0, oy = 0) {
  const X = (x) => f(ox + x * s);
  const Y = (y) => f(oy + y * s);
  const R = (r) => f(r * s);
  // A: 50 wide, apex 14 wide, arch opening 16 wide
  const A = `M${X(0)} ${Y(60)}L${X(18)} ${Y(0)}H${X(32)}L${X(50)} ${Y(60)}H${X(41)}V${Y(46)}A${R(8)} ${R(8)} 0 0 0 ${X(9)} ${Y(46)}V${Y(60)}Z`;
  // M: stems 16, gaps 8 => 3*16 + 2*8 = 64 wide, outer radius 20, inner radius 4
  const m = 56;
  const M =
    `M${X(m)} ${Y(60)}V${Y(20)}A${R(20)} ${R(20)} 0 0 1 ${X(m + 32)} ${Y(1.98)}` +
    `A${R(20)} ${R(20)} 0 0 1 ${X(m + 64)} ${Y(20)}V${Y(60)}H${X(m + 48)}V${Y(20)}` +
    `A${R(4)} ${R(4)} 0 0 0 ${X(m + 40)} ${Y(20)}V${Y(60)}H${X(m + 24)}V${Y(20)}` +
    `A${R(4)} ${R(4)} 0 0 0 ${X(m + 16)} ${Y(20)}V${Y(60)}Z`;
  return A + M;
}
const SMALL_W = 120;

// ---------------------------------------------------------------------------
// Wordmark outlines from Tajawal Bold (interim: swap for Heming once licensed
// and available, see brand/CLAUDE-DESIGN-BRIEF.md).
// ---------------------------------------------------------------------------
const fontFile = path.join(root, 'node_modules/@fontsource/tajawal/files/tajawal-latin-700-normal.woff');
const font = opentype.parse(fs.readFileSync(fontFile).buffer.slice(0));
function wordmark(text, capHeight, tracking = 0.16) {
  const upm = font.unitsPerEm;
  const H = font.charToGlyph('H').getBoundingBox();
  const size = (capHeight / (H.y2 - H.y1)) * upm;
  const sc = size / upm;
  let x = 0;
  const parts = [];
  const chars = [...text];
  chars.forEach((ch, i) => {
    const g = font.charToGlyph(ch);
    parts.push(g.getPath(x, 0, size).toPathData(2));
    x += g.advanceWidth * sc;
    if (i < chars.length - 1) x += font.getKerningValue(g, font.charToGlyph(chars[i + 1])) * sc + tracking * size;
  });
  return { d: parts.join(''), width: x, capHeight };
}

// ---------------------------------------------------------------------------
// SVG helpers
// ---------------------------------------------------------------------------
const svg = (w, h, body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(w)} ${f(h)}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;
const write = (name, content) => fs.writeFileSync(path.join(out, name), content);

const TITLE = 'Abdelfattah M. — AM monogram';

// 1. Mark
write('am-mark.svg', svg(MARK_W, MARK_H, `<path fill="${INK}" d="${markPath()}"/>`, TITLE));
write('am-mark-white.svg', svg(MARK_W, MARK_H, `<path fill="${PAPER}" d="${markPath()}"/>`, TITLE));

// 2. Badge: solid circle with the monogram knocked out (true transparency).
//    A single compound path with even-odd fill keeps it a one-colour logo.
function badgePath() {
  const D = 100;
  const s = (D * 0.64) / MARK_W;
  const ox = (D - MARK_W * s) / 2;
  const oy = (D - MARK_H * s) / 2;
  const circle = `M50 0A50 50 0 1 1 50 100A50 50 0 1 1 50 0Z`;
  return circle + markPath(s, ox, oy);
}
write('am-badge.svg', svg(100, 100, `<path fill="${INK}" fill-rule="evenodd" d="${badgePath()}"/>`, TITLE));
write('am-badge-white.svg', svg(100, 100, `<path fill="${PAPER}" fill-rule="evenodd" d="${badgePath()}"/>`, TITLE));

// 3. Favicon / app icon: yellow disc, black small-size master (two colours by design).
function faviconSvg() {
  const D = 64;
  const s = (D * 0.84) / SMALL_W; // as large as the disc allows (corners stay inside the circle)
  const ox = (D - SMALL_W * s) / 2;
  const oy = (D - 60 * s) / 2;
  return svg(
    D,
    D,
    `<circle cx="32" cy="32" r="32" fill="${YELLOW}"/><path fill="${INK}" d="${markPathSmall(s, ox, oy)}"/>`,
    TITLE
  );
}
write('am-favicon.svg', faviconSvg());

// 4. Lockups
const cap = 24;
const wm = wordmark('ABDELFATTAH', cap, 0.16);
function horizontal(color) {
  const gap = 26;
  const w = MARK_W + gap + wm.width;
  const wy = MARK_H / 2 + cap / 2; // baseline so the cap-height is vertically centred on the mark
  return svg(
    w,
    MARK_H,
    `<path fill="${color}" d="${markPath()}"/><path fill="${color}" transform="translate(${f(MARK_W + gap)} ${f(wy)})" d="${wm.d}"/>`,
    'Abdelfattah M. — AM monogram with wordmark'
  );
}
write('am-lockup-horizontal.svg', horizontal(INK));
write('am-lockup-horizontal-white.svg', horizontal(PAPER));

function stacked(color) {
  const w = Math.max(MARK_W, wm.width);
  const gap = 22;
  const h = MARK_H + gap + cap;
  return svg(
    w,
    h,
    `<path fill="${color}" transform="translate(${f((w - MARK_W) / 2)} 0)" d="${markPath()}"/>` +
      `<path fill="${color}" transform="translate(${f((w - wm.width) / 2)} ${f(MARK_H + gap + cap)})" d="${wm.d}"/>`,
    'Abdelfattah M. — AM monogram with wordmark, stacked'
  );
}
write('am-lockup-stacked.svg', stacked(INK));
write('am-lockup-stacked-white.svg', stacked(PAPER));

// ---------------------------------------------------------------------------
// Raster exports
// ---------------------------------------------------------------------------
const read = (n) => fs.readFileSync(path.join(out, n));
async function raster(name, file, width, bg) {
  let img = sharp(read(file), { density: 384 }).resize({ width, fit: 'contain', background: bg || { r: 0, g: 0, b: 0, alpha: 0 } });
  await img.png({ compressionLevel: 9 }).toFile(path.join(png, name));
}
const T = { r: 0, g: 0, b: 0, alpha: 0 };
await raster('am-mark-black-1024.png', 'am-mark.svg', 1024, T);
await raster('am-mark-white-1024.png', 'am-mark-white.svg', 1024, T);
await raster('am-badge-black-1024.png', 'am-badge.svg', 1024, T);
await raster('am-badge-white-1024.png', 'am-badge-white.svg', 1024, T);
await raster('am-lockup-horizontal-black-2000.png', 'am-lockup-horizontal.svg', 2000, T);
await raster('am-lockup-horizontal-white-2000.png', 'am-lockup-horizontal-white.svg', 2000, T);
await raster('am-lockup-stacked-black-1200.png', 'am-lockup-stacked.svg', 1200, T);
for (const px of [16, 32, 48, 180, 192, 512]) await raster(`am-favicon-${px}.png`, 'am-favicon.svg', px, T);

// Social / Open Graph card: black field, white horizontal lockup, one yellow rule.
{
  const lock = await sharp(read('am-lockup-horizontal-white.svg'), { density: 384 }).resize({ width: 760 }).png().toBuffer();
  const meta = await sharp(lock).metadata();
  const W = 1200, H = 630;
  const rule = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect x="${(W - 760) / 2}" y="${(H + meta.height) / 2 + 36}" width="64" height="6" fill="${YELLOW}"/></svg>`);
  await sharp({ create: { width: W, height: H, channels: 4, background: '#000000' } })
    .composite([
      { input: lock, left: Math.round((W - 760) / 2), top: Math.round((H - meta.height) / 2) - 10 },
      { input: rule },
    ])
    .png({ compressionLevel: 9 })
    .toFile(path.join(png, 'am-og-1200x630.png'));
}

// Site-facing copies
const site = path.join(root, 'src/assets/icons');
fs.copyFileSync(path.join(out, 'am-favicon.svg'), path.join(site, 'favicon.svg'));
fs.copyFileSync(path.join(png, 'am-favicon-32.png'), path.join(site, 'favicon-32.png'));
fs.copyFileSync(path.join(png, 'am-favicon-180.png'), path.join(site, 'apple-touch-icon.png'));
fs.copyFileSync(path.join(png, 'am-favicon-192.png'), path.join(site, 'icon-192.png'));
fs.copyFileSync(path.join(png, 'am-favicon-512.png'), path.join(site, 'icon-512.png'));
fs.mkdirSync(path.join(root, 'src/assets/img'), { recursive: true });
fs.copyFileSync(path.join(png, 'am-og-1200x630.png'), path.join(root, 'src/assets/img/og.png'));
// the header uses the mark as a sprite symbol, so export its geometry for the build
fs.writeFileSync(path.join(root, 'build/lib/mark-path.json'), JSON.stringify({ d: markPath(), w: MARK_W, h: MARK_H }));
console.log('logo assets written');
