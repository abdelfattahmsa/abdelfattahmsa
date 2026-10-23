import fs from 'node:fs';
import path from 'node:path';

// Simple stroke icons (24 grid, 1.75 stroke, round caps) + brand glyphs from simple-icons.
const STROKE = {
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  hub: '<rect x="3" y="4" width="18" height="16" rx="4"/><path d="M9.5 4v16"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6L6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>',
  moon: '<path d="M20.5 13.2A8.5 8.5 0 1 1 10.8 3.5a6.8 6.8 0 0 0 9.7 9.7z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9c-2.6-2.6-3.9-5.6-3.9-9S9.4 5.6 12 3z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3.5 7.5l8.5 6 8.5-6"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  external: '<path d="M7 17L17 7M8.5 7H17v8.5"/>',
  download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
  list: '<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.5" cy="6.5" r=".6"/><circle cx="4.5" cy="12" r=".6"/><circle cx="4.5" cy="17.5" r=".6"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
  code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4"/>',
  pencil: '<path d="M4 20l1-4L16 5l3 3L8 19l-4 1z"/><path d="M14 7l3 3"/>',
  file: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  gift: '<rect x="4" y="9" width="16" height="11" rx="2"/><path d="M3 9h18M12 9v11M12 9c-2.5 0-4-1-4-2.5S9.5 4 12 9zM12 9c2.5 0 4-1 4-2.5S14.5 4 12 9z"/>',
  book: '<path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z"/><path d="M5 17a3 3 0 0 1 3-3h10"/>',
};

// Project marks (48 grid). Placeholders until final brand marks are supplied.
const spokes = (r = 0, scale = 1) =>
  [0, 45, 90, 135]
    .map((a) => `<rect x="${24 - 3 * scale}" y="${24 - 18 * scale}" width="${6 * scale}" height="${36 * scale}" rx="${3 * scale}" transform="rotate(${a + r} 24 24)"/>`)
    .join('');
const MARKS = {
  asterisk: `<g fill="currentColor">${spokes()}</g>`,
  'asterisk-ring': `<g fill="currentColor">${spokes(0, 0.58)}</g><circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" stroke-width="3"/>`,
  'asterisk-square': `<g fill="currentColor">${spokes(0, 0.58)}</g><rect x="3" y="3" width="42" height="42" rx="11" fill="none" stroke="currentColor" stroke-width="3"/>`,
  gem: '<path d="M24 4l15 9v22l-15 9-15-9V13z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M24 15l7 4.5v9L24 33l-7-4.5v-9z" fill="currentColor"/>',
};

export function buildSprite(root, markPath) {
  const sym = [];
  for (const [id, body] of Object.entries(STROKE)) {
    sym.push(`<symbol id="i-${id}" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${body}</g></symbol>`);
  }
  for (const id of ['github', 'instagram', 'behance', 'medium', 'researchgate', 'x', 'linkedin']) {
    const svg = fs.readFileSync(path.join(root, 'node_modules/simple-icons/icons', `${id}.svg`), 'utf8');
    const d = svg.match(/<path d="([^"]+)"/)?.[1];
    if (id === 'medium') {
      // the packaged glyph is wider than its viewBox; draw the classic mark instead
      sym.push('<symbol id="s-medium" viewBox="0 0 24 24"><g fill="currentColor"><ellipse cx="6.6" cy="12" rx="5.6" ry="5.8"/><ellipse cx="16" cy="12" rx="3" ry="5.6"/><ellipse cx="21.1" cy="12" rx="1.1" ry="4.9"/></g></symbol>');
    } else if (d) sym.push(`<symbol id="s-${id}" viewBox="0 0 24 24"><path fill="currentColor" d="${d}"/></symbol>`);
  }
  for (const [id, body] of Object.entries(MARKS)) sym.push(`<symbol id="m-${id}" viewBox="0 0 48 48">${body}</symbol>`);
  sym.push(`<symbol id="logo" viewBox="0 0 ${markPath.w} ${markPath.h}"><path fill="currentColor" d="${markPath.d}"/></symbol>`);
  return `<svg xmlns="http://www.w3.org/2000/svg">${sym.join('')}</svg>`;
}

export const hasIcon = (id) => id in STROKE;
