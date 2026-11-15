// Download-thumbnail system: 4:3 covers (1200 x 900), black and white, one yellow dot, a circular glyph frame
// and a matching mascot pose. One cover per resource category + a blank template.
// Run: npm run brand  (or node brand/build-covers.mjs). Brand library only; not used on the website.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import sharp from 'sharp';
import { STROKE } from '../build/lib/icons.mjs';
import { YELLOW } from './mascot-art.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'brand/covers');
fs.mkdirSync(out, { recursive: true });
const site = JSON.parse(fs.readFileSync(path.join(root, 'src/data/site.json'), 'utf8'));

const load = (p) => { const b = fs.readFileSync(p); return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)); };
const sat = path.join(root, 'brand/fonts/Satoshi-Bold.otf');
const DISPLAY = fs.existsSync(sat) ? load(sat) : load(path.join(root, 'node_modules/@fontsource/tajawal/files/tajawal-latin-700-normal.woff'));
const TEXT = load(path.join(root, 'node_modules/@fontsource/tajawal/files/tajawal-latin-500-normal.woff'));
const txt = (font, s, x, y, size, fill, ls = 0) => `<path fill="${fill}" d="${font.getPath(s, x, y, size, { kerning: true, letterSpacing: ls }).toPathData(1)}"/>`;

const GLYPH = {
  claude: '<path d="M12 3c.7 4.7 3.3 7.3 8 8-4.7.7-7.3 3.3-8 8-.7-4.7-3.3-7.3-8-8 4.7-.7 7.3-3.3 8-8z"/>',
  notion: STROKE.book,
  spreadsheets: STROKE.grid,
  web: STROKE.globe,
  career: STROKE.file,
  other: STROKE.gift,
};
const POSE = { claude: 'idea', notion: 'clipboard', spreadsheets: 'chart', web: 'code', career: 'thumbs-up', other: 'smile' };

function poseInner(name) {
  const svg = fs.readFileSync(path.join(root, 'brand/mascot/poses', `am-pose-${name}.svg`), 'utf8');
  return { vb: svg.match(/viewBox="([^"]+)"/)[1], inner: svg.replace(/^[\s\S]*?<\/title>/, '').replace(/<\/svg>\s*$/, '') };
}

const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
function cover({ id, title, eyebrow = 'FREE DOWNLOAD', glyph, pose }) {
  const W = 1200, H = 900;
  let b = `<rect width="${W}" height="${H}" fill="#000"/><rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="44" fill="none" stroke="#262626" stroke-width="2"/>`;
  // eyebrow
  b += txt(TEXT, eyebrow, 84, 118, 28, '#a6a6a6', 0.14);
  // circular glyph frame (the site's circular-frame language) + the one yellow dot
  const cx = 230, cy = 330, r = 130;
  b += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#fff" stroke-width="5"/>`;
  b += `<circle cx="${(cx + r * Math.cos(-Math.PI / 4)).toFixed(1)}" cy="${(cy + r * Math.sin(-Math.PI / 4)).toFixed(1)}" r="13" fill="${YELLOW}"/>`;
  if (glyph) b += `<g transform="translate(${cx - 70} ${cy - 70}) scale(5.83)" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${glyph}</g>`;
  // title, wrapped to the left column
  const words = title.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (DISPLAY.getAdvanceWidth(t, 82) > 470 && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  lines.slice(0, 3).forEach((l, i) => { b += txt(DISPLAY, l, 84, 600 + i * 90, 82, '#fff', -0.012); });
  b += `<rect x="84" y="${600 + Math.min(lines.length, 3) * 90 - 38}" width="64" height="7" fill="${YELLOW}"/>`;
  // mascot pose, bottom right
  if (pose) {
    const p = poseInner(pose), [, , pw, ph] = p.vb.split(' ').map(Number);
    const mh = 640, ms = mh / ph, mw = pw * ms;
    b += `<svg x="${W - 70 - mw}" y="${H - 40 - mh}" width="${mw.toFixed(1)}" height="${mh}" viewBox="${p.vb}">${p.inner}</svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>${b}</svg>\n`;
}

const items = site.resourceCategories.map((c) => ({ id: c.id, title: c.label.en, glyph: GLYPH[c.id], pose: POSE[c.id] }));
items.push({ id: 'blank', title: 'Your title here', glyph: STROKE.download, pose: 'smile' });
for (const it of items) {
  const svg = cover(it);
  fs.writeFileSync(path.join(out, `cover-${it.id}.svg`), svg);
  await sharp(Buffer.from(svg), { density: 96 }).resize({ width: 1200 }).png({ compressionLevel: 9 }).toFile(path.join(out, `cover-${it.id}.png`));
}
console.log('covers built:', items.length);
