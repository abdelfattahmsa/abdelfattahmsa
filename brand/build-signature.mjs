// Generates the AM signature logo set from hand-placed pen strokes (see pen.mjs).
// Run: node brand/build-signature.mjs   (needs devDependencies: polygon-clipping, opentype.js, sharp)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import sharp from 'sharp';
import { strokePolys, dotPoly, outline, bounds } from './pen.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'brand/logo');
const png = path.join(out, 'png');
fs.mkdirSync(png, { recursive: true });
fs.mkdirSync(path.join(root, 'src/assets/icons'), { recursive: true });
const INK = '#000000', PAPER = '#ffffff', YELLOW = '#ffcc00';
const f = (n) => +n.toFixed(2);

// ---------------------------------------------------------------- the signature
// One continuous pen stroke: "a", into "m", out through a rising flourish; then the full stop.
// Coordinates are drawn upright (baseline y=150, x-height top y=70), then leaned 11 degrees.
const lean = (p) => [p[0] + (150 - p[1]) * 0.2, p[1]];
// capital A: up the left side, round the apex, down the right side, then straight into the M
const CAP = [
  [26, 150], [38, 112], [52, 70], [64, 42], [72, 30], [80, 34], [88, 60], [97, 100], [106, 138], [111, 150],
  [119, 151], [124, 138], [128, 100], [132, 62], [137, 36], [144, 30], [152, 46], [162, 86], [172, 118], [178, 124],
  [186, 100], [196, 58], [206, 34], [213, 30], [217, 52], [219, 96], [218, 136], [215, 150],
].map(lean);
// the cross-stroke of the A, a second pen stroke
const CROSS = [[22, 118], [44, 111], [70, 106], [96, 102]].map(lean);
const FLOURISH = [[221, 156], [233, 152], [247, 132], [265, 100], [285, 60], [307, 26], [330, 2]].map(lean);
const DOT = [lean([272, 146])[0], 146];

// weight 'regular' is for display sizes; 'bold' is the small-size master (headers, favicons)
const WEIGHTS = {
  regular: { pen: { angle: -28, major: 12.5, minor: 4.8 }, dot: 8.2 },
  bold: { pen: { angle: -28, major: 19, minor: 9.5 }, dot: 11.5 },
};
// brush swell on the flourish: it fattens mid-way up, then tapers to a point
const swell = (u) => 1 + 0.85 * Math.exp(-Math.pow((u - 0.935) / 0.05, 2));

function signature(weight, { flourish = true, dot = true } = {}) {
  const w = WEIGHTS[weight];
  const polys = [
    ...strokePolys({ pts: CROSS, taperIn: 0.12, taperOut: 0.25, min: 0.35 }, w.pen),
    ...strokePolys(
      { pts: flourish ? CAP.concat(FLOURISH) : CAP, taperIn: 0.02, taperOut: flourish ? 0.14 : 0.05, min: flourish ? 0.2 : 0.35, swell: flourish ? swell : null },
      w.pen
    ),
  ];
  if (dot) polys.push(dotPoly(DOT[0], DOT[1], w.dot));
  const d = outline(polys);
  const b = bounds(polys);
  return { d, b, w: b.x1 - b.x0, h: b.y1 - b.y0 };
}
const SIG = signature('regular');
const SIGB = signature('bold');
const SIGSMALL = signature('bold', { flourish: false, dot: false });

// translate a path by re-emitting through a transform attribute (kept simple and exact)
const tx = (x, y, s = 1) => `translate(${f(x)} ${f(y)})${s !== 1 ? ` scale(${s})` : ''}`;

// ---------------------------------------------------------------- the name
const fontFile = path.join(root, 'node_modules/@fontsource/tajawal/files/tajawal-latin-500-normal.woff');
const font = opentype.parse(fs.readFileSync(fontFile).buffer.slice(0));
function wordmark(text, capHeight, tracking, wordGap) {
  const upm = font.unitsPerEm;
  const H = font.charToGlyph('H').getBoundingBox();
  const size = (capHeight / (H.y2 - H.y1)) * upm, sc = size / upm;
  let x = 0;
  const parts = [];
  const chars = [...text];
  chars.forEach((ch, i) => {
    const g = font.charToGlyph(ch);
    if (ch !== ' ') parts.push(g.getPath(x, 0, size).toPathData(2));
    x += (ch === ' ' ? wordGap * size : g.advanceWidth * sc);
    if (i < chars.length - 1 && ch !== ' ') x += font.getKerningValue(g, font.charToGlyph(chars[i + 1])) * sc + tracking * size;
  });
  return { d: parts.join(''), width: x };
}
const NAME = 'ABDELFATTAH ABOULFOUTOH';
const cap = 11;
const wm = wordmark(NAME, cap, 0.36, 0.9);

const svg = (w, h, body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(w)} ${f(h)}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;
const write = (n, c) => fs.writeFileSync(path.join(out, n), c);
const TITLE = 'Abdelfattah M. Aboulfoutoh';

// 1. Signature mark alone (trimmed to its ink)
function markSvg(color, S = SIG) {
  return svg(S.w, S.h, `<path fill="${color}" fill-rule="evenodd" transform="${tx(-S.b.x0, -S.b.y0)}" d="${S.d}"/>`, TITLE + ' — signature monogram (capitals)');
}
write('am-signature.svg', markSvg(INK));
write('am-signature-white.svg', markSvg(PAPER));

// 2. Lockup: signature, name stacked underneath and centred on the letters (not the flourish)
function lockup(color) {
  const gap = 30;
  const W = Math.max(SIG.w, wm.width);
  const sx = (W - SIG.w) / 2;
  const wx = (W - wm.width) / 2;
  const H = SIG.h + gap + cap;
  return svg(
    W,
    H,
    `<path fill="${color}" fill-rule="evenodd" transform="${tx(sx - SIG.b.x0, -SIG.b.y0)}" d="${SIG.d}"/>` +
      `<path fill="${color}" transform="${tx(wx, SIG.h + gap + cap)}" d="${wm.d}"/>`,
    TITLE + ' — signature with name'
  );
}
write('am-lockup.svg', lockup(INK));
write('am-lockup-white.svg', lockup(PAPER));

// 3. Badge: solid disc, signature knocked out (single compound path, even-odd)
function badge(color) {
  const D = 100, s = (D * 0.66) / SIGB.w;
  const ox = (D - SIGB.w * s) / 2 - SIGB.b.x0 * s, oy = (D - SIGB.h * s) / 2 - SIGB.b.y0 * s;
  // transform the outline coordinates numerically so it stays one compound path
  const moved = SIGB.d.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (_, a, b) => `${f(+a * s + ox)} ${f(+b * s + oy)}`);
  return svg(D, D, `<path fill="${color}" fill-rule="evenodd" d="M50 0A50 50 0 1 1 50 100A50 50 0 1 1 50 0Z${moved}"/>`, TITLE);
}
write('am-badge.svg', badge(INK));
write('am-badge-white.svg', badge(PAPER));

// 4. Favicon / app icon: yellow disc + heavy "am" (flourish and full stop dropped so it survives 16 px)
function favicon() {
  const D = 64, s = (D * 0.74) / SIGSMALL.w;
  const ox = (D - SIGSMALL.w * s) / 2 - SIGSMALL.b.x0 * s, oy = (D - SIGSMALL.h * s) / 2 - SIGSMALL.b.y0 * s;
  return svg(D, D, `<circle cx="32" cy="32" r="32" fill="${YELLOW}"/><path fill="${INK}" fill-rule="evenodd" transform="${tx(ox, oy, s)}" d="${SIGSMALL.d}"/>`, TITLE);
}
write('am-favicon.svg', favicon());

// ---------------------------------------------------------------- rasters
const read = (n) => fs.readFileSync(path.join(out, n));
const T = { r: 0, g: 0, b: 0, alpha: 0 };
async function raster(name, file, width) {
  await sharp(read(file), { density: 384 }).resize({ width, fit: 'contain', background: T }).png({ compressionLevel: 9 }).toFile(path.join(png, name));
}
await raster('am-signature-black-2000.png', 'am-signature.svg', 2000);
await raster('am-signature-white-2000.png', 'am-signature-white.svg', 2000);
await raster('am-lockup-black-2000.png', 'am-lockup.svg', 2000);
await raster('am-lockup-white-2000.png', 'am-lockup-white.svg', 2000);
await raster('am-badge-black-1024.png', 'am-badge.svg', 1024);
await raster('am-badge-white-1024.png', 'am-badge-white.svg', 1024);
for (const px of [16, 32, 48, 180, 192, 512]) await raster(`am-favicon-${px}.png`, 'am-favicon.svg', px);
{
  const lock = await sharp(read('am-lockup-white.svg'), { density: 384 }).resize({ width: 700 }).png().toBuffer();
  const meta = await sharp(lock).metadata();
  const W = 1200, H = 630;
  const rule = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect x="${(W - 64) / 2}" y="${(H + meta.height) / 2 + 40}" width="64" height="6" fill="${YELLOW}"/></svg>`);
  await sharp({ create: { width: W, height: H, channels: 4, background: '#000000' } })
    .composite([{ input: lock, left: Math.round((W - 700) / 2), top: Math.round((H - meta.height) / 2) - 14 }, { input: rule }])
    .png({ compressionLevel: 9 }).toFile(path.join(png, 'am-og-1200x630.png'));
}

// ---------------------------------------------------------------- site copies
const site = path.join(root, 'src/assets/icons');
fs.copyFileSync(path.join(out, 'am-favicon.svg'), path.join(site, 'favicon.svg'));
for (const [from, to] of [['am-favicon-32.png', 'favicon-32.png'], ['am-favicon-180.png', 'apple-touch-icon.png'], ['am-favicon-192.png', 'icon-192.png'], ['am-favicon-512.png', 'icon-512.png']]) fs.copyFileSync(path.join(png, from), path.join(site, to));
fs.copyFileSync(path.join(png, 'am-og-1200x630.png'), path.join(root, 'src/assets/img/og.png'));
// the header symbol uses the bold signature (reads at ~28 px tall), normalised to start at 0,0
const hd = SIGB.d.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (_, a, b) => `${f(+a - SIGB.b.x0)} ${f(+b - SIGB.b.y0)}`);
fs.writeFileSync(path.join(root, 'build/lib/mark-path.json'), JSON.stringify({ d: hd, w: f(SIGB.w), h: f(SIGB.h) }));
console.log(`signature ${f(SIG.w)}x${f(SIG.h)} · path ${SIG.d.length} bytes · name width ${f(wm.width)}`);
