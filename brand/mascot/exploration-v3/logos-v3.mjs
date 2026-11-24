// Logo with the name under the face (English and Arabic), on yellow, white and black. Uses the brand wordmarks in src/data/.
// On black the head gets a white sticker edge so the black hair and beard still read. Concept only.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { head, VB, YELLOW, INK, PAPER } from './mascot-v3.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const wm = JSON.parse(fs.readFileSync(path.join(root, 'src/data/wordmark.json'), 'utf8'));
const wmAr = JSON.parse(fs.readFileSync(path.join(root, 'src/data/wordmark-ar.json'), 'utf8'));
const T = JSON.parse(fs.readFileSync(path.join(here, 'ref-traced.json'), 'utf8'));

// white sticker edge round the whole head (for dark backgrounds)
const edge = () => {
  const p = (d, w = 26) => `<path d="${d}" fill="#fff" stroke="#fff" stroke-width="${w}" stroke-linejoin="round" fill-rule="evenodd"/>`;
  return p(T.hair) + p(T.earL) + p(T.earR) + p('M286 540H572V742C572 812 500 862 427 862C354 862 286 812 286 742Z') +
    p('M254 640C254 680 266 706 277 730V780C300 850 360 888 427 888C494 888 554 850 577 780V730C588 706 602 680 602 640Z');
};
// the head occupies 450 x 530 in reference units; the name sits under it at 80 % of the head width
export function logoUnder({ bg, ink, ar = false, withEdge = false }) {
  const W = 450, HH = 530, pad = 40;
  const w = ar ? wmAr : wm;
  const nameW = W * (ar ? 0.62 : 0.8);
  const s = nameW / w.w, nameH = w.h * s;
  const gap = 36;
  const totalW = W + pad * 2, totalH = pad + HH + gap + nameH + pad;
  const name = `<g transform="translate(${pad + (W - nameW) / 2} ${pad + HH + gap}) scale(${s})"><path fill="${ink}" d="${w.d}"/></g>`;
  const face = `<svg x="${pad}" y="${pad}" width="${W}" height="${HH}" viewBox="${VB}">${withEdge ? edge() : ''}${head({})}</svg>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" role="img" aria-label="Abdelfattah Aboulfoutoh"><title>Abdelfattah Aboulfoutoh</title>${bg ? `<rect width="${totalW}" height="${totalH}" fill="${bg}"/>` : ''}${face}${name}</svg>\n`;
}
export const variants = [
  ['Yellow', { bg: YELLOW, ink: INK }],
  ['White', { bg: PAPER, ink: INK }],
  ['Black', { bg: INK, ink: PAPER, withEdge: true }],
  ['Arabic, yellow', { bg: YELLOW, ink: INK, ar: true }],
];
