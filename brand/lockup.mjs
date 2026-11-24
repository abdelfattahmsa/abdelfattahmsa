// The logo layouts, all built from the mascot face (mascot-art.mjs) and the name in Tajawal (name-lines-*.json, wordmark*.json).
//   side      face left, clean name right (Arabic: face right, name left)   header, signature, letterhead
//   under     face above the clean name, centred                            vertical formats: posters, covers, profile cards
//   lettering face above the name in the mascot's own style: ExtraBold with a thick black outline and a hard offset
//             (black on light backgrounds, white on dark ones)              loud, friendly: thumbnails, stickers, merch, stories
import fs from 'node:fs';
import path from 'node:path';
import { art, INK, PAPER, YELLOW } from './mascot-art.mjs';
import { NAME, brandDir, readData, readJSON } from './lib.mjs';

const NAME_AR = 'عبدالفتاح أبو الفتوح';
const lines = { en: readJSON(path.join(brandDir, 'name-lines-en.json')), ar: readJSON(path.join(brandDir, 'name-lines-ar.json')) };
const [, , HW, HH] = art.head.vb.split(' ').map(Number);

const svgOpen = (w, h, ar, bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(1)} ${h.toFixed(1)}" role="img" aria-label="${ar ? NAME_AR : NAME}"><title>${ar ? NAME_AR : NAME}</title>${bg ? `<rect width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${bg}"/>` : ''}`;
// the head with the edge that suits the background: dark -> white edge; white -> edge + thin grey ring; yellow / print -> none
const headFor = (bg, sun) => (bg === INK ? (sun ? art.headSun : art.head) : bg === PAPER ? (sun ? art.headSunLight : art.headLight) : sun ? art.headSunFlat : art.headFlat);
const face = (x, y, w, h, bg, sun) => `<svg x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" viewBox="${headFor(bg, sun).vb}">${headFor(bg, sun).inner}</svg>`;

// ---- the name as lines laid out centred, scaled so the widest line is `width` wide; returns svg and its height
function centred({ ar, weight, width, x, y, paint, leadScale = 1 }) {
  const set = lines[ar ? 'ar' : 'en'][weight];
  const lead = lines[ar ? 'ar' : 'en'].lead * leadScale;
  const widest = Math.max(...set.map((l) => l.x2 - l.x1));
  const s = width / widest;
  const top = Math.min(set[0].y1, set[1].y1 + lead), bottom = Math.max(set[0].y2, set[1].y2 + lead);
  const body = set.map((l, i) => `<g transform="translate(${(x - ((l.x1 + l.x2) / 2) * s).toFixed(1)} ${(y - top * s + i * lead * s).toFixed(1)}) scale(${s.toFixed(4)})"><path d="${l.d}"/></g>`).join('');
  return { svg: paint(body, s), h: (bottom - top) * s, s };
}

// ---- side lockup (200 tall); `ink` is the name colour
export function lockupSide(ink, ar = false) {
  const H = 200, bg = null;
  const fw = HW * (H / HH);
  const gap = H * 0.18;
  const word = readData('wordmark.json');
  const wordAr = readData('wordmark-ar.json');
  if (!ar) {
    const ws = H / 200, ww = word.w * ws, wh = word.h * ws;
    return svgOpen(fw + gap + ww, H, false, bg) + face(0, 0, fw, H, ink === PAPER ? INK : YELLOW, false) +
      `<g transform="translate(${(fw + gap).toFixed(1)} ${((H - wh) / 2).toFixed(1)}) scale(${ws})"><path fill="${ink}" d="${word.d}"/></g></svg>\n`;
  }
  const k = word.h / wordAr.h, ww = wordAr.w * k, wh = wordAr.h * k;
  return svgOpen(ww + gap + fw, H, true, bg) +
    `<g transform="translate(0 ${((H - wh) / 2).toFixed(1)}) scale(${k.toFixed(4)})"><path fill="${ink}" d="${wordAr.d}"/></g>` +
    face(ww + gap, 0, fw, H, ink === PAPER ? INK : YELLOW, false) + '</svg>\n';
}

// ---- face over the clean name (centred). bg: INK | PAPER | YELLOW | null (null = transparent, face with flat style)
export function lockupUnder({ bg = null, ar = false, sun = false } = {}) {
  const pad = 40, W = HW, gap = 34;
  const ink = bg === INK ? PAPER : INK;
  const { svg, h } = centred({ ar, weight: 'w700', width: W * (ar ? 0.62 : 0.8), x: pad + W / 2, y: pad + HH + gap, paint: (b) => `<g fill="${ink}">${b}</g>` });
  return svgOpen(W + pad * 2, pad + HH + gap + h + pad, ar, bg) + face(pad, pad, W, HH, bg, sun) + svg + '</svg>\n';
}

// ---- face over the mascot-style lettering. The offset is black on light backgrounds and white on dark ones.
export function lockupLettering({ bg = YELLOW, ar = false, sun = false } = {}) {
  const dark = bg === INK;
  const offsetColor = dark ? PAPER : INK;
  const pad = 56, W = HW, gap = 40, off = 8;
  const paint = (b, s) => {
    const sw = (ar ? 4 : 3.6) / s; // outline thickness outside the letters, in screen units
    const o = (off / s).toFixed(2);
    const shadow = `<g transform="translate(${o} ${o})" fill="${offsetColor}" stroke="${offsetColor}" stroke-width="${sw * 2}" stroke-linejoin="round">${b}</g>`;
    // outline under the fill, so the letters keep their full weight
    const main = `<g fill="${PAPER}" stroke="${INK}" stroke-width="${sw * 2}" stroke-linejoin="round" paint-order="stroke">${b}</g>`;
    return shadow + main;
  };
  const { svg, h } = centred({ ar, weight: 'w800', width: W * (ar ? 0.68 : 0.9), x: pad + W / 2 - off / 2, y: pad + HH + gap, paint, leadScale: 1.22 });
  return svgOpen(W + pad * 2, pad + HH + gap + h + pad + off, ar, bg) + face(pad, pad, W, HH, bg, sun) + svg + '</svg>\n';
}


// ---- the name alone in the mascot's lettering style (the website header uses it): white letters, thick black
// outline, hard offset copy (white on dark backgrounds, black on light ones). Returns { vb, inner }.
export function nameLettering({ ar = false, dark = false } = {}) {
  const width = ar ? 300 : 416, pad = 16, off = 8;
  const offsetColor = dark ? PAPER : INK;
  const paint = (b, s) => {
    const sw = (ar ? 4 : 3.6) / s;
    const o = (off / s).toFixed(2);
    const shadow = `<g transform="translate(${o} ${o})" fill="${offsetColor}" stroke="${offsetColor}" stroke-width="${sw * 2}" stroke-linejoin="round">${b}</g>`;
    const main = `<g fill="${PAPER}" stroke="${INK}" stroke-width="${sw * 2}" stroke-linejoin="round" paint-order="stroke">${b}</g>`;
    return shadow + main;
  };
  const { svg, h } = centred({ ar, weight: 'w800', width, x: pad + width / 2, y: pad, paint, leadScale: 1.22 });
  return { vb: `0 0 ${(width + pad * 2 + off).toFixed(1)} ${(h + pad * 2 + off).toFixed(1)}`, inner: svg };
}

// ---- side lockup in the lettering style (face left, name right; Arabic mirrored). ink: INK = for light backgrounds
// (black offset), PAPER = for dark ones (white offset)
export function lockupSideLettering(ink, ar = false) {
  const H = 200, dark = ink === PAPER;
  const fw = HW * (H / HH), gap = H * 0.08;
  const n = nameLettering({ ar, dark });
  const [, , nw, nh] = n.vb.split(' ').map(Number);
  const k = (H * 0.84) / nh, w = nw * k, y = (H - nh * k) / 2;
  const name = (x) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k.toFixed(4)})">${n.inner}</g>`;
  const bg = dark ? INK : PAPER;
  return ar
    ? svgOpen(w + gap + fw, H, true, null) + name(0) + face(w + gap, 0, fw, H, bg, false) + '</svg>\n'
    : svgOpen(fw + gap + w, H, false, null) + face(0, 0, fw, H, bg, false) + name(fw + gap) + '</svg>\n';
}

// ---- what each logo is for (read by the brand book, the brief and the contact sheet)
export const LOGOS = [
  { id: 'mark', title: 'Mascot mark', use: 'Avatars, app and site icons, stickers, anywhere a small square or circle is needed.' },
  { id: 'side', title: 'Side lockup', use: 'Email signature, letterhead header, slide footers: one wide, short line. The lettering version (am-side-lettering-*) is the website header: the name in the mascot style with an offset.' },
  { id: 'under', title: 'Name under the face', use: 'Vertical formats: posters, covers, profile cards, banners, packaging, anything taller than wide.' },
  { id: 'lettering', title: 'Mascot lettering', use: 'Loud and friendly: video thumbnails, stickers, merch, stories, event badges. Black offset on light, white on dark.' },
  { id: 'sun', title: 'Sunglasses version', use: 'Relaxed or celebratory moments: social posts, launches, weekends, thumbnails. Never on formal documents.' },
  { id: 'ar', title: 'Arabic versions', use: 'Every logo above exists in Arabic (right-to-left: the face sits on the right in the side lockup).' },
  { id: 'print', title: 'One-colour print', use: 'Business card, letterhead, stamps and anything printed in one colour: black on white, no edge, no yellow.' },
];
