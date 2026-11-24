// The icon pack, built from build/lib/iconset.mjs: the same icons the website uses.
//   brand/icons/ui/*.svg           black line + yellow accent (for light backgrounds)
//   brand/icons/ui-white/*.svg     white line + yellow accent (for dark backgrounds)
//   brand/icons/sticker/*.svg      mascot style: white edge, black outline, yellow accent with a black rim
//   brand/icons/icons-sheet.png    all of them on one sheet, brand/icons/index.html a preview
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { ICONS, YELLOW, inner, layer } from '../build/lib/iconset.mjs';

const out = path.resolve('brand/icons');
fs.rmSync(out, { recursive: true, force: true });
for (const d of ['ui', 'ui-white', 'sticker']) fs.mkdirSync(path.join(out, d), { recursive: true });

const WEIGHT = 1.5; // default line weight; the site varies it per section (see design-tokens.json)
const svg = (body, vb = '0 0 24 24', size = 96) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${size}" height="${size}">${body}</svg>\n`;

function ui(id, line) {
  return svg(`<g fill="none" stroke="${line}" stroke-width="${WEIGHT}" stroke-linecap="round" stroke-linejoin="round">${inner(id, { mode: 'file' }).replace(/stroke="#ffcc00"/g, `stroke="${YELLOW}" stroke-width="${WEIGHT}"`)}</g>`);
}
// sticker: white edge underneath, black outline, then the yellow accent with its own black rim
function sticker(id) {
  const edge = layer(id, 'line', { stroke: '#fff', w: 5.4 }) + layer(id, 'acc', { stroke: '#fff', w: 5.4, fill: '#fff', fw: 5.4 });
  const rim = layer(id, 'acc', { stroke: '#000', w: 3.2, fill: '#000', fw: 3.2 });
  const black = layer(id, 'line', { stroke: '#000', w: 2.2 });
  const yellow = layer(id, 'acc', { stroke: YELLOW, w: 1.7, fill: YELLOW, fw: 1.7 });
  return svg(edge + black + rim + yellow, '-2 -2 28 28', 128);
}

const ids = Object.keys(ICONS);
for (const id of ids) {
  fs.writeFileSync(path.join(out, 'ui', `${id}.svg`), ui(id, '#000'));
  fs.writeFileSync(path.join(out, 'ui-white', `${id}.svg`), ui(id, '#fff'));
  fs.writeFileSync(path.join(out, 'sticker', `${id}.svg`), sticker(id));
}

// the sheet: line icons on white, stickers on yellow
const cell = 120, cols = 9, rows = Math.ceil(ids.length / cols);
const place = (kind, bg, x0) => ids.map((id, i) => {
  const s = fs.readFileSync(path.join(out, kind, `${id}.svg`), 'utf8').replace(/^<svg[^>]*>/, '').replace('</svg>\n', '');
  const vb = kind === 'sticker' ? 28 : 24; const k = 76 / vb;
  const x = x0 + (i % cols) * cell + 22, y = Math.floor(i / cols) * cell + 22;
  return `<g transform="translate(${x} ${y}) scale(${k}) ${kind === 'sticker' ? 'translate(2 2)' : ''}">${s}</g>`;
}).join('');
const W = cols * cell, H = rows * cell;
const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="${W * 2}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/><rect x="${W}" width="${W}" height="${H}" fill="${YELLOW}"/>${place('ui', '#fff', 0)}${place('sticker', YELLOW, W)}</svg>`;
await sharp(Buffer.from(sheet)).png().toFile(path.join(out, 'icons-sheet.png'));

const tile = (kind, bg) => ids.map((id) => `<figure style="background:${bg}"><img src="${kind}/${id}.svg" alt="${id}" width="56" height="56"><figcaption>${id}</figcaption></figure>`).join('');
fs.writeFileSync(path.join(out, 'index.html'), `<!doctype html><meta charset="utf-8"><title>AM icon pack</title><style>body{font-family:Tajawal,system-ui,sans-serif;margin:24px}h2{margin:28px 0 10px}div{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px}figure{margin:0;padding:12px;border-radius:20px;text-align:center;border:1px solid #0002}figcaption{font-size:12px;margin-top:6px;color:#666}</style>
<h1>AM icon pack · ${ids.length} icons</h1><p>Line icons with a yellow accent (default line weight ${WEIGHT}); mascot-style stickers. All drawn on a 24 grid.</p>
<h2>Line · for light backgrounds</h2><div>${tile('ui', '#fff')}</div><h2>Line · for dark backgrounds</h2><div>${tile('ui-white', '#000').replace(/<figcaption>/g, '<figcaption style="color:#aaa">')}</div><h2>Sticker</h2><div>${tile('sticker', '#ffcc00')}</div>`);
console.log(`icon pack: ${ids.length} icons × 3 styles → brand/icons`);
