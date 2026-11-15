// Print assets: one-colour mascot, business card (front/back, 85 x 55 mm + 3 mm bleed) and A4 letterhead.
// Text is outlined (opentype.js) so the files need no fonts. Run: npm run brand  (or node brand/build-print.mjs)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import sharp from 'sharp';
import { art, svgDoc, YELLOW } from './mascot-art.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'brand/print');
fs.mkdirSync(out, { recursive: true });
const word = JSON.parse(fs.readFileSync(path.join(root, 'build/lib/mark-path.json'), 'utf8'));
const TITLE = 'Abdelfattah Aboulfoutoh';

const loadFont = (f) => { const b = fs.readFileSync(path.join(root, 'node_modules/@fontsource/tajawal/files', f)); return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)); };
const T500 = loadFont('tajawal-latin-500-normal.woff');
const T700 = loadFont('tajawal-latin-700-normal.woff');
const text = (font, str, x, y, size, fill) => `<path fill="${fill}" d="${font.getPath(str, x, y, size, { kerning: true }).toPathData(2)}"/>`;

// head mark (sticker edge when on dark, plain print version on light) + stacked name, as a nested svg group
function lockup({ x, y, h, ink, dark }) {
  const head = dark ? art.head : art.headPrint;
  const [, , hw, hh] = head.vb.split(' ').map(Number);
  const s = h / hh, fw = hw * s;
  const ws = h / 200, ww = word.w * ws, wh = word.h * ws, gap = h * 0.18;
  return {
    w: fw + gap + ww,
    svg: `<svg x="${x}" y="${y}" width="${fw.toFixed(2)}" height="${h}" viewBox="${head.vb}">${head.inner}</svg><g transform="translate(${(x + fw + gap).toFixed(2)} ${(y + (h - wh) / 2).toFixed(2)}) scale(${ws.toFixed(5)})"><path fill="${ink}" d="${word.d}"/></g>`,
  };
}
const doc = (wmm, hmm, body, bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${wmm}mm" height="${hmm}mm" viewBox="0 0 ${wmm} ${hmm}" role="img" aria-label="${TITLE}"><title>${TITLE}</title><rect width="${wmm}" height="${hmm}" fill="${bg}"/>${body}</svg>\n`;

// ---- one-colour print mascot (black on white, no edge, no yellow)
fs.writeFileSync(path.join(out, 'am-mascot-print.svg'), svgDoc(art.bustPrint, TITLE));
fs.writeFileSync(path.join(out, 'am-mascot-head-print.svg'), svgDoc(art.headPrint, TITLE));

// ---- business card: trim 85 x 55, bleed 3 on each side (canvas 91 x 61), safe margin 5 inside the trim
const W = 91, H = 61;
{
  // front: black, white lockup, short yellow rule
  const lk = lockup({ x: 0, y: 0, h: 17, ink: '#ffffff', dark: true });
  const x0 = (W - lk.w) / 2, y0 = (H - 17) / 2 - 2;
  const l = lockup({ x: x0, y: y0, h: 17, ink: '#ffffff', dark: true });
  fs.writeFileSync(path.join(out, 'business-card-front.svg'), doc(W, H, l.svg + `<rect x="${x0.toFixed(2)}" y="${(y0 + 17 + 5).toFixed(2)}" width="12" height="0.8" fill="${YELLOW}"/>`, '#000000'));
  // back: white, mascot left, text right
  const head = art.headPrint;
  const [, , hw, hh] = head.vb.split(' ').map(Number);
  const mh = 26, ms = mh / hh, mw = hw * ms;
  const tx = 7 + mw + 6;
  const lines = [
    [T700, 'Engineer. System Builder.', 3.4, '#000000'],
    [T700, 'Product Architect.', 3.4, '#000000'],
  ];
  let body = `<svg x="7" y="${((H - mh) / 2).toFixed(2)}" width="${mw.toFixed(2)}" height="${mh}" viewBox="${head.vb}">${head.inner}</svg>`;
  let y = 21;
  for (const [f, t, sz, c] of lines) { body += text(f, t, tx, y, sz, c); y += 5; }
  body += `<rect x="${tx}" y="${y - 2}" width="10" height="0.7" fill="${YELLOW}"/>`;
  y += 6.5;
  for (const t of ['Abdelfattah.Aboulfoutoh@outlook.com', 'abdelfattah.site', 'Cairo, Egypt']) { body += text(T500, t, tx, y, 2.5, '#000000'); y += 4.2; }
  fs.writeFileSync(path.join(out, 'business-card-back.svg'), doc(W, H, body, '#ffffff'));
}

// ---- A4 letterhead (210 x 297)
{
  const l = lockup({ x: 20, y: 16, h: 14, ink: '#000000', dark: false });
  let body = l.svg + `<rect x="20" y="36" width="170" height="0.25" fill="#000000"/><rect x="20" y="35.7" width="14" height="0.8" fill="${YELLOW}"/>`;
  body += text(T500, 'Abdelfattah.Aboulfoutoh@outlook.com', 20, 283, 2.9, '#000000');
  body += text(T500, 'abdelfattah.site', 20, 287.5, 2.9, '#000000');
  const loc = 'Cairo, Egypt';
  body += text(T500, loc, 190 - T500.getAdvanceWidth(loc, 2.9), 283, 2.9, '#000000');
  fs.writeFileSync(path.join(out, 'letterhead-a4.svg'), doc(210, 297, body, '#ffffff'));
}

// ---- PNG previews at 300 dpi
const mmToPx = (mm) => Math.round((mm / 25.4) * 300);
for (const [f, w] of [['business-card-front', W], ['business-card-back', W], ['letterhead-a4', 210], ['am-mascot-print', 0]]) {
  const file = path.join(out, f + '.svg');
  const img = sharp(fs.readFileSync(file), { density: 300 });
  await (w ? img.resize({ width: mmToPx(w) }) : img.resize({ width: 1024 })).png({ compressionLevel: 9 }).toFile(path.join(out, f + '.png'));
}
console.log('print set built');
