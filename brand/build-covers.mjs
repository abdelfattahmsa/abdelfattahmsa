// Download-thumbnail system: 4:3 covers (1200 x 900), black and white, one yellow dot, a circular glyph frame
// and a matching mascot pose. One cover per resource category + a blank template.
// Run: npm run brand  (or node brand/build-covers.mjs). Brand library only; not used on the website.
import fs from 'node:fs';
import path from 'node:path';
import { STROKE } from '../build/lib/icons.mjs';
import { esc } from '../build/lib/util.mjs';
import { YELLOW } from './mascot-art.mjs';
import { POSES, VB as POSE_VB, poseInner } from './poses.mjs';
import { displayFont, outDir, readJSON, root, tajawal, toPng } from './lib.mjs';

const out = outDir('covers');
const site = readJSON(path.join(root, 'src/data/site.json'));

const DISPLAY = displayFont().font;
const TEXT = tajawal(500);
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

function cover({ title, eyebrow = 'FREE DOWNLOAD', glyph, pose }) {
  const W = 1200, H = 900;
  let b = `<rect width="${W}" height="${H}" fill="#000"/><rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="44" fill="none" stroke="#262626" stroke-width="2"/>`;
  b += txt(TEXT, eyebrow, 84, 118, 28, '#a6a6a6', 0.14);
  // circular glyph frame (the site's circular-frame language) + the one yellow dot
  const cx = 230, cy = 330, r = 130;
  b += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#fff" stroke-width="5"/>`;
  b += `<circle cx="${(cx + r * Math.cos(-Math.PI / 4)).toFixed(1)}" cy="${(cy + r * Math.sin(-Math.PI / 4)).toFixed(1)}" r="13" fill="${YELLOW}"/>`;
  b += `<g transform="translate(${cx - 70} ${cy - 70}) scale(5.83)" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${glyph}</g>`;
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
  const [, , pw, ph] = POSE_VB.split(' ').map(Number);
  const mh = 640, mw = pw * (mh / ph);
  b += `<svg x="${W - 70 - mw}" y="${H - 40 - mh}" width="${mw.toFixed(1)}" height="${mh}" viewBox="${POSE_VB}">${poseInner(POSES.find((p) => p.name === pose))}</svg>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>${b}</svg>\n`;
}

const items = site.resourceCategories.map((c) => {
  if (!GLYPH[c.id] || !POSE[c.id]) throw new Error(`build-covers.mjs: add a glyph and a pose for the new category "${c.id}"`);
  return { id: c.id, title: c.label.en, glyph: GLYPH[c.id], pose: POSE[c.id] };
});
items.push({ id: 'blank', title: 'Your title here', glyph: STROKE.download, pose: 'smile' });
for (const it of items) {
  const svg = cover(it);
  fs.writeFileSync(path.join(out, `cover-${it.id}.svg`), svg);
  await toPng(svg, path.join(out, `cover-${it.id}.png`), { width: 1200 }, 96);
}
console.log('covers built:', items.length);
