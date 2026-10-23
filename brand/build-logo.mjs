// Generates the logo set: the name stacked in the website's display font, plus an "AM" badge and favicon.
// Run: node brand/build-logo.mjs   (needs devDependencies: opentype.js, sharp)
//
// Font: uses Satoshi Bold if you put Satoshi-Bold.otf/.ttf/.woff in brand/fonts/ (download it from
// fontshare.com, it is free); otherwise falls back to Tajawal Bold so the build always works.
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
const INK = '#000000', PAPER = '#ffffff', YELLOW = '#ffcc00';
const f = (n) => +n.toFixed(2);

// ---------------------------------------------------------------- font
const fontsDir = path.join(root, 'brand/fonts');
const satoshi = fs.existsSync(fontsDir) ? fs.readdirSync(fontsDir).find((n) => /satoshi.*bold(?!.*italic).*\.(otf|ttf|woff)$/i.test(n)) : null;
const fontFile = satoshi ? path.join(fontsDir, satoshi) : path.join(root, 'node_modules/@fontsource/tajawal/files/tajawal-latin-700-normal.woff');
const font = opentype.parse(fs.readFileSync(fontFile).buffer.slice(fs.readFileSync(fontFile).byteOffset, fs.readFileSync(fontFile).byteOffset + fs.readFileSync(fontFile).byteLength));
const FONT_NAME = satoshi ? 'Satoshi Bold' : 'Tajawal Bold (interim; add Satoshi-Bold to brand/fonts/ and re-run)';

function shift(p, dx, dy) {
  for (const c of p.commands) for (const k of ['x', 'y', 'x1', 'y1', 'x2', 'y2']) if (k in c) c[k] += k.startsWith('x') ? dx : dy;
  return p;
}
const SIZE = 100;
function line(text, y, tracking = -0.012) {
  return font.getPath(text, 0, y, SIZE, { kerning: true, letterSpacing: tracking });
}

// ---------------------------------------------------------------- the wordmark: two stacked lines, left aligned
const asc = font.charToGlyph('A').getBoundingBox();
const capH = asc.y2 * (SIZE / font.unitsPerEm);
const leading = capH * 1.2;
const l1 = line('Abdelfattah', 0);
const l2 = line('Aboulfoutoh', leading);
const b1 = l1.getBoundingBox(), b2 = l2.getBoundingBox();
const X0 = Math.min(b1.x1, b2.x1), Y0 = Math.min(b1.y1, b2.y1);
const X1 = Math.max(b1.x2, b2.x2), Y1 = Math.max(b1.y2, b2.y2);
const W = X1 - X0, H = Y1 - Y0;
shift(l1, -X0, -Y0); shift(l2, -X0, -Y0);
const WORD = l1.toPathData(2) + l2.toPathData(2);

const svg = (w, h, body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(w)} ${f(h)}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;
const write = (n, c) => fs.writeFileSync(path.join(out, n), c);
const TITLE = 'Abdelfattah Aboulfoutoh';
write('am-wordmark.svg', svg(W, H, `<path fill="${INK}" d="${WORD}"/>`, TITLE));
write('am-wordmark-white.svg', svg(W, H, `<path fill="${PAPER}" d="${WORD}"/>`, TITLE));

// ---------------------------------------------------------------- "AM" (badge + favicon)
function am(sizeUnits) {
  const p = font.getPath('AM', 0, 0, sizeUnits, { kerning: true, letterSpacing: -0.01 });
  const b = p.getBoundingBox();
  shift(p, -b.x1, -b.y1);
  return { d: p.toPathData(2), w: b.x2 - b.x1, h: b.y2 - b.y1 };
}
function scaled(d, s, ox, oy) {
  return d.replace(/(-?\d+\.?\d*),?\s?(-?\d+\.?\d*)/g, (_, a, b) => `${f(+a * s + ox)} ${f(+b * s + oy)}`);
}
const AM = am(100);
function discD(D, fraction) {
  const s = (D * fraction) / AM.w;
  const ox = (D - AM.w * s) / 2, oy = (D - AM.h * s) / 2;
  return scaled(AM.d, s, ox, oy);
}
const circle = (D) => `M${D / 2} 0A${D / 2} ${D / 2} 0 1 1 ${D / 2} ${D}A${D / 2} ${D / 2} 0 1 1 ${D / 2} 0Z`;
const badge = (color) => svg(100, 100, `<path fill="${color}" fill-rule="evenodd" d="${circle(100)}${discD(100, 0.6)}"/>`, TITLE);
write('am-badge.svg', badge(INK));
write('am-badge-white.svg', badge(PAPER));
write('am-favicon.svg', svg(64, 64, `<circle cx="32" cy="32" r="32" fill="${YELLOW}"/><path fill="${INK}" fill-rule="evenodd" d="${discD(64, 0.78)}"/>`, TITLE));

// ---------------------------------------------------------------- rasters
const read = (n) => fs.readFileSync(path.join(out, n));
const T = { r: 0, g: 0, b: 0, alpha: 0 };
async function raster(name, file, width) {
  await sharp(read(file), { density: 384 }).resize({ width, fit: 'contain', background: T }).png({ compressionLevel: 9 }).toFile(path.join(png, name));
}
await raster('am-wordmark-black-2000.png', 'am-wordmark.svg', 2000);
await raster('am-wordmark-white-2000.png', 'am-wordmark-white.svg', 2000);
await raster('am-badge-black-1024.png', 'am-badge.svg', 1024);
await raster('am-badge-white-1024.png', 'am-badge-white.svg', 1024);
for (const px of [16, 32, 48, 180, 192, 512]) await raster(`am-favicon-${px}.png`, 'am-favicon.svg', px);
{
  const w = 640;
  const word = await sharp(read('am-wordmark-white.svg'), { density: 384 }).resize({ width: w }).png().toBuffer();
  const meta = await sharp(word).metadata();
  const WW = 1200, HH = 630;
  const left = Math.round((WW - w) / 2), top = Math.round((HH - meta.height) / 2) - 14;
  const rule = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${WW}" height="${HH}"><rect x="${left}" y="${top + meta.height + 36}" width="64" height="6" fill="${YELLOW}"/></svg>`);
  await sharp({ create: { width: WW, height: HH, channels: 4, background: '#000000' } })
    .composite([{ input: word, left, top }, { input: rule }]).png({ compressionLevel: 9 }).toFile(path.join(png, 'am-og-1200x630.png'));
}

// ---------------------------------------------------------------- site copies
const site = path.join(root, 'src/assets/icons');
fs.copyFileSync(path.join(out, 'am-favicon.svg'), path.join(site, 'favicon.svg'));
for (const [a, b] of [['am-favicon-32.png', 'favicon-32.png'], ['am-favicon-180.png', 'apple-touch-icon.png'], ['am-favicon-192.png', 'icon-192.png'], ['am-favicon-512.png', 'icon-512.png']]) fs.copyFileSync(path.join(png, a), path.join(site, b));
fs.copyFileSync(path.join(png, 'am-og-1200x630.png'), path.join(root, 'src/assets/img/og.png'));
fs.writeFileSync(path.join(root, 'build/lib/mark-path.json'), JSON.stringify({ d: WORD, w: f(W), h: f(H) }));
console.log(`wordmark ${f(W)}x${f(H)} in ${FONT_NAME}`);
