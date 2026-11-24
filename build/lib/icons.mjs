import fs from 'node:fs';
import path from 'node:path';
import { root } from './paths.mjs';
import { ICONS, inner } from './iconset.mjs';

// Line icons with a yellow accent live in iconset.mjs (24 grid, round caps). STROKE gives the fixed-colour
// version, which is also drawn on the download covers (brand/build-covers.mjs).
export const STROKE = Object.fromEntries(Object.keys(ICONS).map((id) => [id, inner(id, { mode: 'file' })]));

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
  // line weight comes from --icon-w, set per section in main.css; the accent follows --accent
  for (const id of Object.keys(ICONS)) {
    sym.push(`<symbol id="i-${id}" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" style="stroke-width:var(--icon-w,1.5)">${inner(id, { mode: 'site' })}</g></symbol>`);
  }
  for (const { id } of socials) sym.push(`<symbol id="s-${id}" viewBox="0 0 24 24">${socialGlyph(id)}</symbol>`);
  for (const [arm, v] of Object.entries(brand.kyberia)) {
    sym.push(`<g id="k-${arm}-mark" fill="currentColor">${v.mark.map((d) => `<path d="${d}"/>`).join('')}</g>`);
    sym.push(`<g id="k-${arm}-word" fill="currentColor"><path d="${v.word}"/></g>`);
    sym.push(`<g id="k-${arm}-suffix" fill="currentColor"><path d="${v.suffix}"/></g>`);
  }
  for (const [id, a] of Object.entries(brand.mascot)) sym.push(`<symbol id="mascot-${id}" viewBox="${a.vb}">${a.inner}</symbol>`);
  // the name in the mascot's lettering (outline and offset): white offset for the dark theme, black for the light one
  for (const [lang, l] of Object.entries(brand.lettering)) {
    const id = lang === 'ar' ? 'logo-ar' : 'logo';
    sym.push(`<symbol id="${id}-dark" viewBox="${l.vb}">${l.dark}</symbol>`);
    sym.push(`<symbol id="${id}-light" viewBox="${l.vb}">${l.light}</symbol>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg">${sym.join('')}</svg>`;
}

// The header shows the mascot head and the name through <use>, which carries no size of its own,
// so their CSS boxes take the proportions of the symbols above.
export function logoCss(brand) {
  const [, , hw, hh] = brand.mascot.head.vb.split(' ');
  return [
    `.brandlink__face{aspect-ratio:${hw}/${hh}}`,
    `.brandlink__mark{aspect-ratio:${brand.lettering.en.vb.split(' ').slice(2).join('/')}}`,
    `.brandlink__mark--ar{aspect-ratio:${brand.lettering.ar.vb.split(' ').slice(2).join('/')}}`,
  ].join('\n') + '\n';
}
