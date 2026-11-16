// Print assets: one-colour mascot, business card (front/back, 85 x 55 mm + 3 mm bleed) and A4 letterhead.
// Text is outlined (opentype.js) so the files need no fonts. Run: npm run brand  (or node brand/build-print.mjs)
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { art, INK, YELLOW } from './mascot-art.mjs';
import { lockup as lockupDoc } from './lockup.mjs';
import { DETAILS as D, NAME, lockupLayout, outDir, readData, svgDoc, tajawal, toPng, TRANSPARENT } from './lib.mjs';

const out = outDir('print');
const word = readData('wordmark.json');
const T500 = tajawal(500);
const T700 = tajawal(700);
const text = (font, str, x, y, size, fill) => `<path fill="${fill}" d="${font.getPath(str, x, y, size, { kerning: true }).toPathData(2)}"/>`;

// head mark (sticker edge when on dark, plain print version on light) + stacked name, as a nested svg group
function lockup({ x, y, h, ink, dark }) {
  const head = dark ? art.head : art.headPrint;
  const { fw, ws, gap, wh, w } = lockupLayout(head, word, h);
  return {
    w,
    svg: `<svg x="${x}" y="${y}" width="${fw.toFixed(2)}" height="${h}" viewBox="${head.vb}">${head.inner}</svg><g transform="translate(${(x + fw + gap).toFixed(2)} ${(y + (h - wh) / 2).toFixed(2)}) scale(${ws.toFixed(5)})"><path fill="${ink}" d="${word.d}"/></g>`,
  };
}
const doc = (wmm, hmm, body, bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${wmm}mm" height="${hmm}mm" viewBox="0 0 ${wmm} ${hmm}" role="img" aria-label="${NAME}"><title>${NAME}</title><rect width="${wmm}" height="${hmm}" fill="${bg}"/>${body}</svg>\n`;

// ---- one-colour print mascot (black on white, no edge, no yellow)
fs.writeFileSync(path.join(out, 'am-mascot-print.svg'), svgDoc(art.bustPrint, NAME));
fs.writeFileSync(path.join(out, 'am-mascot-head-print.svg'), svgDoc(art.headPrint, NAME));
// concentric rings (the circular-frame language): a quiet design element, no logo or mascot
const rings = (cx, cy, radii, stroke, w = 0.3) => radii.map((r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${stroke}" stroke-width="${w}"/>`).join('');
const clipTrim = (id, w, h) => `<clipPath id="${id}"><rect width="${w}" height="${h}"/></clipPath>`;

// ---- business card: trim 85 x 55, bleed 3 on each side (canvas 91 x 61), safe margin 5 inside the trim
const W = 91, H = 61;
{
  // side 1: black. Mascot head + stacked name, quiet rings bottom right, short yellow rule
  const hLk = 19;
  const x0 = (W - lockupLayout(art.head, word, hLk).w) / 2, y0 = (H - hLk) / 2 - 3;
  const l = lockup({ x: x0, y: y0, h: hLk, ink: '#ffffff', dark: true });
  const ringsF = `<g clip-path="url(#cf)">${clipTrim('cf', W, H)}${rings(W - 4, H - 2, [14, 22, 30, 38, 46, 54], '#1c1c1c', 0.35)}</g>`;
  fs.writeFileSync(path.join(out, 'business-card-front.svg'), doc(W, H, ringsF + l.svg + `<rect x="${x0.toFixed(2)}" y="${(y0 + hLk + 5).toFixed(2)}" width="12" height="0.8" fill="${YELLOW}"/>`, '#000000'));

  // side 2: white. Details, rings bottom right
  const L = 9, V = 25;
  let body = `<g clip-path="url(#cb)">${clipTrim('cb', W, H)}${rings(W - 4, H - 2, [14, 22, 30, 38, 46, 54], '#ececec', 0.35)}<circle cx="${(W - 4 - 30 * Math.cos(Math.PI / 3.2)).toFixed(2)}" cy="${(H - 2 - 30 * Math.sin(Math.PI / 3.2)).toFixed(2)}" r="0.9" fill="${YELLOW}"/></g>`;
  body += text(T700, D.name, L, 17, 3.7, '#000000');
  body += text(T500, D.title, L, 22, 2.7, '#595959');
  body += `<rect x="${L}" y="25.2" width="10" height="0.7" fill="${YELLOW}"/>`;
  const rows = [['TEL', D.phone], ['EMAIL', D.email], ['WEB', D.web.join(' | ')], ['ADDRESS', D.address]];
  let y = 33;
  for (const [k, v] of rows) {
    body += text(T700, k, L, y, 1.9, '#8a8a8a');
    body += text(T500, v, V, y, 2.5, '#000000');
    y += 5.4;
  }
  fs.writeFileSync(path.join(out, 'business-card-back.svg'), doc(W, H, body, '#ffffff'));
}

// ---- A4 letterhead (210 x 297): small header lockup, faint mascot watermark, details + page number in the footer
{
  const l = lockup({ x: 20, y: 14, h: 9, ink: '#000000', dark: false });
  let body = l.svg + `<rect x="20" y="27" width="170" height="0.25" fill="#000000"/><rect x="20" y="26.7" width="14" height="0.8" fill="${YELLOW}"/>`;
  // watermark: the mascot head, line art at 5% ink, centred in the lower half of the page
  const hd = art.headPrint, [, , hw, hh] = hd.vb.split(' ').map(Number);
  const wh = 130, ws = wh / hh;
  body += `<svg x="${((210 - hw * ws) / 2).toFixed(2)}" y="120" width="${(hw * ws).toFixed(2)}" height="${wh}" viewBox="${hd.vb}" opacity="0.05">${hd.inner}</svg>`;
  body += `<rect x="20" y="270.2" width="14" height="0.8" fill="${YELLOW}"/><rect x="34" y="270.4" width="156" height="0.25" fill="#000000"/>`;
  body += text(T500, `${D.email}  ·  ${D.phone}`, 20, 277, 2.8, '#000000');
  body += text(T500, [...D.web, D.address].join('  ·  '), 20, 281.6, 2.8, '#000000');
  const pg = 'Page 1';
  body += text(T700, pg, 190 - T700.getAdvanceWidth(pg, 2.8), 277, 2.8, '#000000');
  fs.writeFileSync(path.join(out, 'letterhead-a4.svg'), doc(210, 297, body, '#ffffff'));
}

// ---- assets for the Word letterhead (brand/build-letterhead-docx.py): padded logo, faint watermark
{
  const lockupPng = await sharp(Buffer.from(lockupDoc(INK)), { density: 300 }).resize({ width: 1400 }).extend({ right: 40, top: 20, bottom: 20, left: 10, background: TRANSPARENT }).png().toBuffer();
  fs.writeFileSync(path.join(out, 'letterhead-logo.png'), lockupPng);
  const hd = art.headPrint;
  const wm = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${hd.vb}"><g opacity=".06">${hd.inner}</g></svg>`;
  await sharp(Buffer.from(wm), { density: 300 }).resize({ width: 1200 }).png().toFile(path.join(out, 'letterhead-watermark.png'));
}

// ---- PNG previews at 300 dpi
const mmToPx = (mm) => Math.round((mm / 25.4) * 300);
for (const [f, w] of [['business-card-front', W], ['business-card-back', W], ['letterhead-a4', 210], ['am-mascot-print', 0]]) {
  await toPng(fs.readFileSync(path.join(out, f + '.svg')), path.join(out, f + '.png'), { width: w ? mmToPx(w) : 1024 }, 300);
}
console.log('print set built');
