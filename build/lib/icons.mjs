import fs from 'node:fs';
import path from 'node:path';
import { root } from './paths.mjs';

// Stroke icons: 24 grid, 1.75 stroke, round caps. Also drawn on the download covers (brand/build-covers.mjs).
export const STROKE = {
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  hub: '<rect x="3" y="4" width="18" height="16" rx="4"/><path d="M9.5 4v16"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6L6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>',
  moon: '<path d="M20.5 13.2A8.5 8.5 0 1 1 10.8 3.5a6.8 6.8 0 0 0 9.7 9.7z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9c-2.6-2.6-3.9-5.6-3.9-9S9.4 5.6 12 3z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3.5 7.5l8.5 6 8.5-6"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  external: '<path d="M7 17L17 7M8.5 7H17v8.5"/>',
  download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
  list: '<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.5" cy="6.5" r=".6"/><circle cx="4.5" cy="12" r=".6"/><circle cx="4.5" cy="17.5" r=".6"/>',
  network: '<circle cx="6" cy="7" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="12" cy="18" r="2.8"/><path d="M8 8l2.6 7.4M16.3 7.8L13.4 15.3M8.4 6.8l7.2-.6"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
  code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4"/>',
  pencil: '<path d="M4 20l1-4L16 5l3 3L8 19l-4 1z"/><path d="M14 7l3 3"/>',
  file: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  gift: '<rect x="4" y="9" width="16" height="11" rx="2"/><path d="M3 9h18M12 9v11M12 9c-2.5 0-4-1-4-2.5S9.5 4 12 9zM12 9c2.5 0 4-1 4-2.5S14.5 4 12 9z"/>',
  book: '<path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z"/><path d="M5 17a3 3 0 0 1 3-3h10"/>',
};

// The packaged Medium glyph is wider than its viewBox; draw the classic mark instead.
const MEDIUM = '<g fill="currentColor"><ellipse cx="6.6" cy="12" rx="5.6" ry="5.8"/><ellipse cx="16" cy="12" rx="3" ry="5.6"/><ellipse cx="21.1" cy="12" rx="1.1" ry="4.9"/></g>';

function socialGlyph(id) {
  if (id === 'medium') return MEDIUM;
  const svg = fs.readFileSync(path.join(root, 'node_modules/simple-icons/icons', `${id}.svg`), 'utf8');
  return `<path fill="currentColor" d="${svg.match(/<path d="([^"]+)"/)[1]}"/>`;
}

// One SVG sprite for the whole site: stroke icons (i-*), social glyphs (s-*), the Kyberia lockups in
// three recolourable parts (k-<arm>-mark|word|suffix), the mascot (mascot-*) and the name (logo, logo-ar).
export function buildSprite({ socials, brand }) {
  const sym = [];
  for (const [id, body] of Object.entries(STROKE)) {
    sym.push(`<symbol id="i-${id}" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${body}</g></symbol>`);
  }
  for (const { id } of socials) sym.push(`<symbol id="s-${id}" viewBox="0 0 24 24">${socialGlyph(id)}</symbol>`);
  for (const [arm, v] of Object.entries(brand.kyberia)) {
    sym.push(`<g id="k-${arm}-mark" fill="currentColor">${v.mark.map((d) => `<path d="${d}"/>`).join('')}</g>`);
    sym.push(`<g id="k-${arm}-word" fill="currentColor"><path d="${v.word}"/></g>`);
    sym.push(`<g id="k-${arm}-suffix" fill="currentColor"><path d="${v.suffix}"/></g>`);
  }
  for (const [id, a] of Object.entries(brand.mascot)) sym.push(`<symbol id="mascot-${id}" viewBox="${a.vb}">${a.inner}</symbol>`);
  for (const [id, w] of [['logo', brand.wordmark], ['logo-ar', brand.wordmarkAr]]) {
    sym.push(`<symbol id="${id}" viewBox="0 0 ${w.w} ${w.h}"><path fill="currentColor" d="${w.d}"/></symbol>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg">${sym.join('')}</svg>`;
}

// The header shows the mascot head and the name through <use>, which carries no size of its own,
// so their CSS boxes take the proportions of the symbols above.
export function logoCss(brand) {
  const [, , hw, hh] = brand.mascot.head.vb.split(' ');
  return [
    `.brandlink__face{aspect-ratio:${hw}/${hh}}`,
    `.brandlink__mark{aspect-ratio:${brand.wordmark.w}/${brand.wordmark.h}}`,
    `.brandlink__mark--ar{aspect-ratio:${brand.wordmarkAr.w}/${brand.wordmarkAr.h}}`,
  ].join('\n') + '\n';
}
