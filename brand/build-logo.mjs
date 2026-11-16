// The name wordmark (two stacked lines in the display font), the "AM" badge and the AM favicon set.
// Also writes src/data/wordmark.json, the name the website header and the other brand scripts use.
// Run: node brand/build-logo.mjs   (needs devDependencies: opentype.js, sharp)
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { INK, PAPER, YELLOW } from './mascot-art.mjs';
import { NAME, displayFont, outDir, svgDoc, toPng, writeData, TRANSPARENT } from './lib.mjs';

const out = outDir('logo');
const png = outDir('logo/png');
const { font, name: fontName } = displayFont();
const f = (n) => +n.toFixed(2);

function shift(p, dx, dy) {
  for (const c of p.commands) for (const k of ['x', 'y', 'x1', 'y1', 'x2', 'y2']) if (k in c) c[k] += k.startsWith('x') ? dx : dy;
  return p;
}
const SIZE = 100;
const line = (text, y) => font.getPath(text, 0, y, SIZE, { kerning: true, letterSpacing: -0.012 });

// ---------------------------------------------------------------- the wordmark: two stacked lines, left aligned
const capH = font.charToGlyph('A').getBoundingBox().y2 * (SIZE / font.unitsPerEm);
const l1 = line('Abdelfattah', 0);
const l2 = line('Aboulfoutoh', capH * 1.2);
const b1 = l1.getBoundingBox(), b2 = l2.getBoundingBox();
const X0 = Math.min(b1.x1, b2.x1), Y0 = Math.min(b1.y1, b2.y1);
const W = Math.max(b1.x2, b2.x2) - X0, H = Math.max(b1.y2, b2.y2) - Y0;
shift(l1, -X0, -Y0); shift(l2, -X0, -Y0);
const WORD = l1.toPathData(2) + l2.toPathData(2);

const svg = (w, h, inner) => svgDoc({ vb: `0 0 ${f(w)} ${f(h)}`, inner }, NAME);
const write = (n, c) => fs.writeFileSync(path.join(out, n), c);
write('am-wordmark.svg', svg(W, H, `<path fill="${INK}" d="${WORD}"/>`));
write('am-wordmark-white.svg', svg(W, H, `<path fill="${PAPER}" d="${WORD}"/>`));

// ---------------------------------------------------------------- "AM" (badge + favicon)
const AM = (() => {
  const p = font.getPath('AM', 0, 0, 100, { kerning: true, letterSpacing: -0.01 });
  const b = p.getBoundingBox();
  shift(p, -b.x1, -b.y1);
  return { d: p.toPathData(2), w: b.x2 - b.x1, h: b.y2 - b.y1 };
})();
// "AM" centred in a D x D square, fraction of D wide
function amIn(D, fraction) {
  const s = (D * fraction) / AM.w;
  const ox = (D - AM.w * s) / 2, oy = (D - AM.h * s) / 2;
  return AM.d.replace(/(-?\d+\.?\d*),?\s?(-?\d+\.?\d*)/g, (_, a, b) => `${f(+a * s + ox)} ${f(+b * s + oy)}`);
}
const circle = (D) => `M${D / 2} 0A${D / 2} ${D / 2} 0 1 1 ${D / 2} ${D}A${D / 2} ${D / 2} 0 1 1 ${D / 2} 0Z`;
const badge = (color) => svg(100, 100, `<path fill="${color}" fill-rule="evenodd" d="${circle(100)}${amIn(100, 0.6)}"/>`);
write('am-badge.svg', badge(INK));
write('am-badge-white.svg', badge(PAPER));
write('am-favicon.svg', svg(64, 64, `<circle cx="32" cy="32" r="32" fill="${YELLOW}"/><path fill="${INK}" fill-rule="evenodd" d="${amIn(64, 0.78)}"/>`));

// ---------------------------------------------------------------- rasters
const read = (n) => fs.readFileSync(path.join(out, n));
const raster = (name, file, width) => toPng(read(file), path.join(png, name), { width, fit: 'contain', background: TRANSPARENT });
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
  await sharp({ create: { width: WW, height: HH, channels: 4, background: INK } })
    .composite([{ input: word, left, top }, { input: rule }]).png({ compressionLevel: 9 }).toFile(path.join(png, 'am-og-1200x630.png'));
}

writeData('wordmark.json', { d: WORD, w: f(W), h: f(H) });
console.log(`wordmark ${f(W)}x${f(H)} in ${fontName}`);
