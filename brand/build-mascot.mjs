// Builds the mascot and logo set from brand/mascot-art.mjs and brand/lockup.mjs:
//   brand/mascot/    the face (dark / light / flat), sunglasses, avatar, icons       + png/
//   brand/logos/     every logo layout, English and Arabic, on yellow, white and black + png/
// plus the site's icons (src/assets/icons/), social image (src/assets/img/og.png) and src/data/mascot.json (header sprite).
// Run after build-logo.mjs and arabic-name.py:  npm run brand
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { art, maskable, INK, PAPER, YELLOW } from './mascot-art.mjs';
import { png as pixelPng, HEAD16, HEAD32 } from './mascot-pixel.mjs';
import { POSES, VB as POSE_VB, poseInner, poseInnerLight } from './poses.mjs';
import { ICONS } from './mascot-icons.mjs';
import { lockupSide, lockupSideLettering, lockupUnder, lockupLettering, nameLettering, LOGOS } from './lockup.mjs';
import { NAME, outDir, root, siteIcons, svgDoc, toPng, writeData, TRANSPARENT } from './lib.mjs';

const mascot = outDir('mascot');
const mascotPng = outDir('mascot/png');
const logos = outDir('logos');
const logosPng = outDir('logos/png');
const write = (dir, n, c) => fs.writeFileSync(path.join(dir, n), c);

// ---- the face
const FACES = {
  'am-mascot': art.head, // dark backgrounds and transparent use (white sticker edge)
  'am-mascot-light': art.headLight, // white backgrounds (thin grey ring)
  'am-mascot-flat': art.headFlat, // yellow or white backgrounds, print
  'am-mascot-sun': art.headSun,
  'am-mascot-sun-light': art.headSunLight,
  'am-mascot-sun-flat': art.headSunFlat,
  'am-avatar': art.avatar,
  'am-avatar-sun': art.avatarSun,
  'am-icon': art.icon,
  'am-icon-maskable': maskable,
};
for (const [name, a] of Object.entries(FACES)) write(mascot, `${name}.svg`, svgDoc(a, NAME));
for (const name of Object.keys(FACES).filter((n) => !n.includes('icon'))) await toPng(svgDoc(FACES[name], NAME), path.join(mascotPng, `${name}-1024.png`), { width: 1024 });
for (const px of [48, 180, 192, 512]) await toPng(svgDoc(art.icon, NAME), path.join(mascotPng, `am-icon-${px}.png`), { width: px });
for (const px of [192, 512]) await toPng(svgDoc(maskable, NAME), path.join(mascotPng, `am-icon-maskable-${px}.png`), { width: px });
// 16 and 32 are hand-hinted pixel drawings (mascot-pixel.mjs), not scaled vectors
fs.writeFileSync(path.join(mascotPng, 'am-icon-16.png'), await pixelPng(HEAD16));
fs.writeFileSync(path.join(mascotPng, 'am-icon-32.png'), await pixelPng(HEAD32));

// ---- the logos
const BG = { yellow: YELLOW, white: PAPER, black: INK };
const LOGO_FILES = {};
for (const ink of ['black', 'white']) {
  LOGO_FILES[`am-side-${ink}`] = lockupSide(ink === 'black' ? INK : PAPER);
  LOGO_FILES[`am-side-ar-${ink}`] = lockupSide(ink === 'black' ? INK : PAPER, true);
}
for (const ink of ['black', 'white']) {
  LOGO_FILES[`am-side-lettering-${ink}`] = lockupSideLettering(ink === 'black' ? INK : PAPER);
  LOGO_FILES[`am-side-lettering-ar-${ink}`] = lockupSideLettering(ink === 'black' ? INK : PAPER, true);
}
for (const [bgName, bg] of Object.entries(BG)) {
  for (const ar of [false, true]) {
    const sfx = ar ? '-ar' : '';
    LOGO_FILES[`am-under${sfx}-${bgName}`] = lockupUnder({ bg, ar });
    LOGO_FILES[`am-lettering${sfx}-${bgName}`] = lockupLettering({ bg, ar });
  }
}
LOGO_FILES['am-under-sun-yellow'] = lockupUnder({ bg: YELLOW, sun: true });
LOGO_FILES['am-lettering-sun-yellow'] = lockupLettering({ bg: YELLOW, sun: true });
for (const [name, svg] of Object.entries(LOGO_FILES)) {
  write(logos, `${name}.svg`, svg);
  await toPng(svg, path.join(logosPng, `${name}-1600.png`), { width: 1600 });
}


// ---- contact sheet: every logo on the background it is made for, with its use
{
  const dark = (n) => n.endsWith('-black') && !n.startsWith('am-side') || (n.startsWith('am-side') && n.endsWith('white'));
  const bgFor = (n) => (n.endsWith('-yellow') ? '#ffcc00' : dark(n) ? '#000' : '#fff');
  const groups = [
    ['Side lockup', 'side', LOGOS[1].use],
    ['Name under the face', 'under', LOGOS[2].use],
    ['Mascot lettering', 'lettering', LOGOS[3].use],
  ];
  const card = (n) => `<figure style="background:${bgFor(n)}"><img src="${n}.svg" alt=""><figcaption>${n}</figcaption></figure>`;
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>Logo set</title>
<style>body{margin:0;padding:40px;background:#111;color:#fff;font-family:Tajawal,system-ui,sans-serif}h1{margin:0 0 6px}h2{margin:36px 0 4px}p{color:#a6a6a6;margin:0 0 14px;max-width:70ch}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}figure{margin:0;border-radius:18px;padding:18px;display:grid;place-items:center;min-height:300px;position:relative}figure img{max-width:100%;max-height:260px}
figcaption{position:absolute;left:12px;bottom:8px;font:11px monospace;color:#888}</style>
<body><h1>Logo set</h1><p>Every logo exists in English and Arabic. Each has one job; pick by where it is used.</p>
${LOGOS.map((l) => `<p><b>${l.title}.</b> ${l.use}</p>`).join('')}
${groups.map(([t, key, use]) => `<h2>${t}</h2><p>${use}</p><div class="g">${Object.keys(LOGO_FILES).filter((n) => n.startsWith('am-' + key)).map(card).join('')}</div>`).join('')}</body></html>`;
  fs.writeFileSync(path.join(logos, 'index.html'), html);
}

// ---- social / Open Graph 1200x630: yellow, the side lockup centred
{
  const WW = 1200, HH = 630;
  const lock = await sharp(Buffer.from(lockupSide(INK)), { density: 384 }).resize({ width: 960 }).png().toBuffer();
  const m = await sharp(lock).metadata();
  await sharp({ create: { width: WW, height: HH, channels: 4, background: YELLOW } })
    .composite([{ input: lock, left: Math.round((WW - m.width) / 2), top: Math.round((HH - m.height) / 2) }])
    .png({ compressionLevel: 9 }).toFile(path.join(mascotPng, 'am-og-1200x630.png'));
}

// ---- favicon.ico: PNG entries, 16 and 32 hand-hinted, 48 vector
{
  const sizes = [16, 32, 48];
  const imgs = sizes.map((n) => fs.readFileSync(path.join(mascotPng, `am-icon-${n}.png`)));
  const head = Buffer.alloc(6); head.writeUInt16LE(1, 2); head.writeUInt16LE(imgs.length, 4);
  let offset = 6 + 16 * imgs.length;
  const dir = imgs.map((b, i) => { const e = Buffer.alloc(16); e[0] = sizes[i]; e[1] = sizes[i]; e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(b.length, 8); e.writeUInt32LE(offset, 12); offset += b.length; return e; });
  fs.writeFileSync(path.join(mascotPng, 'favicon.ico'), Buffer.concat([head, ...dir, ...imgs]));
}

// ---- site copies (the site's manifest lists them: build/build.mjs)
fs.copyFileSync(path.join(mascot, 'am-icon.svg'), path.join(siteIcons, 'favicon.svg'));
for (const [a, b] of [['am-icon-16.png', 'favicon-16.png'], ['am-icon-32.png', 'favicon-32.png'], ['am-icon-180.png', 'apple-touch-icon.png'], ['am-icon-192.png', 'icon-192.png'], ['am-icon-512.png', 'icon-512.png'], ['am-icon-maskable-192.png', 'icon-maskable-192.png'], ['am-icon-maskable-512.png', 'icon-maskable-512.png'], ['favicon.ico', 'favicon.ico']]) {
  fs.copyFileSync(path.join(mascotPng, a), path.join(siteIcons, b));
}
fs.copyFileSync(path.join(mascotPng, 'am-og-1200x630.png'), path.join(root, 'src/assets/img/og.png'));
// the poses the website shows (each page part has its own reaction: build/lib/templates.mjs, POSE_FOR)
const SITE_POSES = ['happy', 'calm', 'search', 'idea', 'sketching', 'sunglasses', 'coding', 'launch', 'wink', 'surprised', 'builder'];
const sitePoses = {};
for (const n of SITE_POSES) {
  const p = POSES.find((x) => x.name === n);
  if (!p) throw new Error(`build-mascot.mjs: no pose "${n}"`);
  sitePoses[`pose-${n}`] = { vb: POSE_VB, inner: poseInner(p) };
  sitePoses[`pose-${n}Light`] = { vb: POSE_VB, inner: poseInnerLight(p) };
}
// the contact icons (sticky widget on the site) and their SVG files in the brand library
const iconsDir = outDir('mascot/contact');
const siteIcons2 = {};
for (const [id, a] of Object.entries(ICONS)) {
  write(iconsDir, `am-contact-${id}.svg`, svgDoc({ vb: a.vb, inner: a.inner }, `${NAME}: ${id}`));
  write(iconsDir, `am-contact-${id}-light.svg`, svgDoc({ vb: a.vb, inner: a.innerLight }, `${NAME}: ${id}`));
  siteIcons2[`mk-${id}`] = { vb: a.vb, inner: a.inner };
  siteIcons2[`mk-${id}Light`] = { vb: a.vb, inner: a.innerLight };
}
// the name in the lettering style, for the website header (light theme = black offset, dark theme = white offset)
writeData('wordmark-lettering.json', Object.fromEntries([false, true].map((ar) => {
  const dark = nameLettering({ ar, dark: true }), light = nameLettering({ ar, dark: false });
  return [ar ? 'ar' : 'en', { vb: dark.vb, dark: dark.inner, light: light.inner }];
})));
writeData('mascot.json', { head: art.head, headLight: art.headLight, ...sitePoses, ...siteIcons2 });
console.log('mascot and logo set built:', Object.keys(FACES).length, 'mascot files,', Object.keys(LOGO_FILES).length, 'logos');
