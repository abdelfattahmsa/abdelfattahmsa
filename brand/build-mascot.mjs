// Builds the mascot brand set from brand/mascot-art.mjs. Run after build-logo.mjs:  npm run brand
// Writes brand/mascot/*.svg + png/, the site's icons and social image, and build/lib/mascot.json (header sprite).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { art, svgDoc, YELLOW } from './mascot-art.mjs';
import { png as pixelPng, HEAD16, HEAD32 } from './mascot-pixel.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'brand/mascot');
const png = path.join(out, 'png');
fs.mkdirSync(png, { recursive: true });
const write = (n, c) => fs.writeFileSync(path.join(out, n), c);
const word = JSON.parse(fs.readFileSync(path.join(root, 'build/lib/mark-path.json'), 'utf8'));
const TITLE = 'Abdelfattah Aboulfoutoh';

// ---- standalone SVGs
write('am-mascot.svg', svgDoc(art.bust, TITLE));
write('am-mascot-mono.svg', svgDoc(art.bustMono, TITLE));
write('am-mascot-head.svg', svgDoc(art.head, TITLE));
write('am-avatar.svg', svgDoc(art.avatar, TITLE));
write('am-icon.svg', svgDoc(art.icon, TITLE));
write('am-mascot-light.svg', svgDoc(art.bustLight, TITLE));
write('am-mascot-head-light.svg', svgDoc(art.headLight, TITLE));

// ---- horizontal lockup: head + stacked name
function lockup(ink) {
  const [, , hw, hh] = art.head.vb.split(' ').map(Number);
  const H = 200, s = H / hh, fw = hw * s;
  const ws = 1.0, ww = word.w * ws, wh = word.h * ws;
  const gap = 36, W = fw + gap + ww;
  const face = `<svg x="0" y="0" width="${fw.toFixed(1)}" height="${H}" viewBox="${art.head.vb}">${art.head.inner}</svg>`;
  const name = `<g transform="translate(${(fw + gap).toFixed(1)} ${((H - wh) / 2).toFixed(1)}) scale(${ws})"><path fill="${ink}" d="${word.d}"/></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W.toFixed(1)} ${H}" role="img" aria-label="${TITLE}"><title>${TITLE}</title>${face}${name}</svg>\n`;
}
write('am-lockup.svg', lockup('#000000'));
write('am-lockup-white.svg', lockup('#ffffff'));

// ---- Arabic lockup: right-to-left, so the head sits on the right and the name on the left (right-aligned lines)
const ar = JSON.parse(fs.readFileSync(path.join(out, 'arabic-name.json'), 'utf8'));
function lockupAr(ink) {
  const [, , hw, hh] = art.head.vb.split(' ').map(Number);
  const H = 200, s = H / hh, fw = hw * s;
  const k = word.h / ar.h; // same total height as the English name
  const ww = ar.w * k, wh = ar.h * k;
  const gap = 36, W = ww + gap + fw;
  const name = `<g transform="translate(0 ${((H - wh) / 2).toFixed(1)}) scale(${k.toFixed(4)})"><path fill="${ink}" d="${ar.d}"/></g>`;
  const face = `<svg x="${(ww + gap).toFixed(1)}" y="0" width="${fw.toFixed(1)}" height="${H}" viewBox="${art.head.vb}">${art.head.inner}</svg>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W.toFixed(1)} ${H}" role="img" aria-label="عبدالفتاح أبو الفتوح"><title>عبدالفتاح أبو الفتوح</title>${name}${face}</svg>\n`;
}
write('am-lockup-ar.svg', lockupAr('#000000'));
write('am-lockup-ar-white.svg', lockupAr('#ffffff'));

// ---- rasters (transparent)
const T = { r: 0, g: 0, b: 0, alpha: 0 };
const read = (n) => fs.readFileSync(path.join(out, n));
async function raster(name, file, width) {
  await sharp(read(file), { density: 384 }).resize({ width, fit: 'contain', background: T }).png({ compressionLevel: 9 }).toFile(path.join(png, name));
}
await raster('am-mascot-1024.png', 'am-mascot.svg', 1024);
await raster('am-mascot-head-1024.png', 'am-mascot-head.svg', 1024);
await raster('am-avatar-1024.png', 'am-avatar.svg', 1024);
await raster('am-lockup-black-2000.png', 'am-lockup.svg', 2000);
await raster('am-lockup-white-2000.png', 'am-lockup-white.svg', 2000);
await raster('am-lockup-ar-black-2000.png', 'am-lockup-ar.svg', 2000);
await raster('am-lockup-ar-white-2000.png', 'am-lockup-ar-white.svg', 2000);
await raster('am-mascot-light-1024.png', 'am-mascot-light.svg', 1024);
await raster('am-mascot-head-light-1024.png', 'am-mascot-head-light.svg', 1024);
for (const px of [48, 180, 192, 512]) await raster(`am-icon-${px}.png`, 'am-icon.svg', px);
// 16 and 32 are hand-hinted pixel drawings (see mascot-pixel.mjs), not scaled vectors
fs.writeFileSync(path.join(png, 'am-icon-16.png'), await pixelPng(HEAD16));
fs.writeFileSync(path.join(png, 'am-icon-32.png'), await pixelPng(HEAD32));

// ---- social / Open Graph 1200x630: black, mascot left, name right, short yellow rule
{
  const WW = 1200, HH = 630;
  const mh = 470;
  const mascot = await sharp(read('am-mascot.svg'), { density: 384 }).resize({ height: mh }).png().toBuffer();
  const mm = await sharp(mascot).metadata();
  const nw = 520;
  const name = await sharp(Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${word.w} ${word.h}"><path fill="#ffffff" d="${word.d}"/></svg>`), { density: 384 }).resize({ width: nw }).png().toBuffer();
  const nm = await sharp(name).metadata();
  const gap = 70, total = mm.width + gap + nw, left = Math.round((WW - total) / 2);
  const nx = left + mm.width + gap, ny = Math.round((HH - nm.height) / 2) - 14;
  const rule = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${WW}" height="${HH}"><rect x="${nx}" y="${ny + nm.height + 34}" width="64" height="6" fill="${YELLOW}"/></svg>`);
  await sharp({ create: { width: WW, height: HH, channels: 4, background: '#000000' } })
    .composite([{ input: mascot, left, top: Math.round((HH - mm.height) / 2) }, { input: name, left: nx, top: ny }, { input: rule }])
    .png({ compressionLevel: 9 }).toFile(path.join(png, 'am-og-1200x630.png'));
}

// ---- site copies
const site = path.join(root, 'src/assets/icons');
fs.copyFileSync(path.join(out, 'am-icon.svg'), path.join(site, 'favicon.svg'));
for (const [a, b] of [['am-icon-16.png', 'favicon-16.png'], ['am-icon-32.png', 'favicon-32.png'], ['am-icon-180.png', 'apple-touch-icon.png'], ['am-icon-192.png', 'icon-192.png'], ['am-icon-512.png', 'icon-512.png']]) fs.copyFileSync(path.join(png, a), path.join(site, b));
fs.copyFileSync(path.join(png, 'am-og-1200x630.png'), path.join(root, 'src/assets/img/og.png'));
// header / page sprite symbols (the build adds them to the icon sprite)
fs.writeFileSync(path.join(root, 'build/lib/mascot.json'), JSON.stringify({ head: art.head, bust: art.bust, headLight: art.headLight, bustLight: art.bustLight }));
console.log('mascot set built');
