// Builds the mascot brand set from brand/mascot-art.mjs: brand/mascot/*.svg + png/, the site's icons
// (src/assets/icons/) and social image (src/assets/img/og.png), and src/data/mascot.json (header sprite).
// Run after build-logo.mjs:  npm run brand
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { art, maskable, INK, PAPER, YELLOW } from './mascot-art.mjs';
import { png as pixelPng, HEAD16, HEAD32 } from './mascot-pixel.mjs';
import { lockup, lockupAr } from './lockup.mjs';
import { NAME, outDir, readData, root, siteIcons, svgDoc, toPng, writeData, TRANSPARENT } from './lib.mjs';

const out = outDir('mascot');
const png = outDir('mascot/png');
const write = (n, c) => fs.writeFileSync(path.join(out, n), c);
const word = readData('wordmark.json');

write('am-mascot.svg', svgDoc(art.bust, NAME));
write('am-mascot-mono.svg', svgDoc(art.bustMono, NAME));
write('am-mascot-head.svg', svgDoc(art.head, NAME));
write('am-avatar.svg', svgDoc(art.avatar, NAME));
write('am-icon.svg', svgDoc(art.icon, NAME));
write('am-icon-maskable.svg', svgDoc(maskable, NAME));
write('am-mascot-light.svg', svgDoc(art.bustLight, NAME));
write('am-mascot-head-light.svg', svgDoc(art.headLight, NAME));
write('am-lockup.svg', lockup(INK));
write('am-lockup-white.svg', lockup(PAPER));
write('am-lockup-ar.svg', lockupAr(INK));
write('am-lockup-ar-white.svg', lockupAr(PAPER));

// ---- rasters (transparent)
const read = (n) => fs.readFileSync(path.join(out, n));
const raster = (name, file, width) => toPng(read(file), path.join(png, name), { width, fit: 'contain', background: TRANSPARENT });
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
for (const px of [192, 512]) await raster(`am-icon-maskable-${px}.png`, 'am-icon-maskable.svg', px);
// 16 and 32 are hand-hinted pixel drawings (see mascot-pixel.mjs), not scaled vectors
fs.writeFileSync(path.join(png, 'am-icon-16.png'), await pixelPng(HEAD16));
fs.writeFileSync(path.join(png, 'am-icon-32.png'), await pixelPng(HEAD32));

// ---- social / Open Graph 1200x630: black, mascot left, name right, short yellow rule
{
  const WW = 1200, HH = 630;
  const mascot = await sharp(read('am-mascot.svg'), { density: 384 }).resize({ height: 470 }).png().toBuffer();
  const mm = await sharp(mascot).metadata();
  const nw = 520;
  const name = await sharp(Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${word.w} ${word.h}"><path fill="${PAPER}" d="${word.d}"/></svg>`), { density: 384 }).resize({ width: nw }).png().toBuffer();
  const nm = await sharp(name).metadata();
  const gap = 70, left = Math.round((WW - (mm.width + gap + nw)) / 2);
  const nx = left + mm.width + gap, ny = Math.round((HH - nm.height) / 2) - 14;
  const rule = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${WW}" height="${HH}"><rect x="${nx}" y="${ny + nm.height + 34}" width="64" height="6" fill="${YELLOW}"/></svg>`);
  await sharp({ create: { width: WW, height: HH, channels: 4, background: INK } })
    .composite([{ input: mascot, left, top: Math.round((HH - mm.height) / 2) }, { input: name, left: nx, top: ny }, { input: rule }])
    .png({ compressionLevel: 9 }).toFile(path.join(png, 'am-og-1200x630.png'));
}

// ---- favicon.ico: PNG entries, 16 and 32 hand-hinted, 48 vector
{
  const sizes = [16, 32, 48];
  const imgs = sizes.map((n) => fs.readFileSync(path.join(png, `am-icon-${n}.png`)));
  const head = Buffer.alloc(6); head.writeUInt16LE(1, 2); head.writeUInt16LE(imgs.length, 4);
  let offset = 6 + 16 * imgs.length;
  const dir = imgs.map((b, i) => { const e = Buffer.alloc(16); e[0] = sizes[i]; e[1] = sizes[i]; e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(b.length, 8); e.writeUInt32LE(offset, 12); offset += b.length; return e; });
  fs.writeFileSync(path.join(png, 'favicon.ico'), Buffer.concat([head, ...dir, ...imgs]));
}

// ---- site copies (the site's manifest lists them: build/build.mjs)
fs.copyFileSync(path.join(out, 'am-icon.svg'), path.join(siteIcons, 'favicon.svg'));
for (const [a, b] of [['am-icon-16.png', 'favicon-16.png'], ['am-icon-32.png', 'favicon-32.png'], ['am-icon-180.png', 'apple-touch-icon.png'], ['am-icon-192.png', 'icon-192.png'], ['am-icon-512.png', 'icon-512.png'], ['am-icon-maskable-192.png', 'icon-maskable-192.png'], ['am-icon-maskable-512.png', 'icon-maskable-512.png'], ['favicon.ico', 'favicon.ico']]) {
  fs.copyFileSync(path.join(png, a), path.join(siteIcons, b));
}
fs.copyFileSync(path.join(png, 'am-og-1200x630.png'), path.join(root, 'src/assets/img/og.png'));
writeData('mascot.json', { head: art.head, bust: art.bust, headLight: art.headLight, bustLight: art.bustLight });
console.log('mascot set built');
