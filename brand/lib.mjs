// Shared by the brand scripts: paths, the name, fonts, SVG documents, PNG export, the lockup geometry.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import sharp from 'sharp';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const brandDir = path.join(root, 'brand');
export const siteIcons = path.join(root, 'src/assets/icons');

export const NAME = 'Abdelfattah Aboulfoutoh';
// Contact details printed on the business card and the letterheads (also read by build-letterhead-docx.py).
export const DETAILS = readJSON(path.join(brandDir, 'details.json'));

export function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
// Brand data the website also uses lives in src/data/ (wordmark.json, wordmark-ar.json, mascot.json).
export const readData = (name) => readJSON(path.join(root, 'src/data', name));
export const writeData = (name, value) => fs.writeFileSync(path.join(root, 'src/data', name), JSON.stringify(value));

export function outDir(rel) {
  const dir = path.join(brandDir, rel);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// ---- fonts: Tajawal (bundled with npm, Latin and Arabic) is the one brand font
function loadFont(file) {
  const b = fs.readFileSync(file);
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
}
export const tajawal = (weight) => loadFont(path.join(root, `node_modules/@fontsource/tajawal/files/tajawal-latin-${weight}-normal.woff`));
export const displayFont = () => ({ font: tajawal(700), name: 'Tajawal Bold' });

// ---- output
export const svgDoc = (a, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${a.vb}" role="img" aria-label="${title}"><title>${title}</title>${a.inner}</svg>\n`;

export const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };
// svg: string or Buffer; resize: sharp resize options
export const toPng = (svg, file, resize, density = 384) =>
  sharp(Buffer.from(svg), { density }).resize(resize).png({ compressionLevel: 9 }).toFile(file);

// Mascot head + stacked name, side by side, h tall: the name is scaled by h / 200, the gap is 18 % of h.
export function lockupLayout(head, word, h) {
  const [, , hw, hh] = head.vb.split(' ').map(Number);
  const fw = hw * (h / hh);
  const ws = h / 200;
  const gap = h * 0.18;
  const ww = word.w * ws;
  return { fw, ws, gap, ww, wh: word.h * ws, w: fw + gap + ww };
}
