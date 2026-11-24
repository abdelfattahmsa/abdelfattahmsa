// The icon set, drawn once on a 24 grid: thin round-capped line shapes (`line`) plus a yellow accent (`acc`).
// In `acc`, class="a" is an accent stroke, class="f" an accent fill (a dot or a block) and class="n" a filled
// accent with an outline. The website draws them with a light line weight that changes per section
// (--icon-w, set in main.css); the brand pack also draws them as mascot-style stickers (brand/build-icons.mjs).
export const YELLOW = '#ffcc00';

const I = (line, acc = '') => ({ line, acc });

export const ICONS = {
  // ---- interface
  search: I('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>', '<path class="a" d="M8 10.5a3.2 3.2 0 0 1 3-2.6"/>'),
  hub: I('<rect x="3" y="4" width="18" height="16" rx="4"/><path d="M9.5 4v16"/>', '<circle class="f" cx="6.2" cy="9" r="1.2"/>'),
  sun: I('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6L6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>', '<circle class="f" cx="12" cy="12" r="1.9"/>'),
  moon: I('<path d="M20.5 13.2A8.5 8.5 0 1 1 10.8 3.5a6.8 6.8 0 0 0 9.7 9.7z"/>', '<circle class="f" cx="16.6" cy="6.6" r="1.3"/>'),
  globe: I('<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9c-2.6-2.6-3.9-5.6-3.9-9S9.4 5.6 12 3z"/>', '<circle class="f" cx="16.4" cy="7.6" r="1.3"/>'),
  mail: I('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3.5 7.5l8.5 6 8.5-6"/>', '<circle class="f" cx="12" cy="14.6" r="1.3"/>'),
  arrow: I('<path d="M8 12h11M13 6l6 6-6 6"/>', '<circle class="f" cx="4.6" cy="12" r="1.4"/>'),
  up: I('<path d="M12 17V5M6 11l6-6 6 6"/>', '<circle class="f" cx="12" cy="20.4" r="1.4"/>'),
  external: I('<path d="M8.5 7H17v8.5M17 7L9.5 14.5"/>', '<circle class="f" cx="6.6" cy="17.4" r="1.4"/>'),
  download: I('<path d="M12 8v7M7 11l5 5 5-5M5 20h14"/>', '<circle class="f" cx="12" cy="4.2" r="1.4"/>'),
  menu: I('<path d="M4 7h16M4 12h10M4 17h16"/>', '<path class="a" d="M17 12h3"/>'),
  close: I('<path d="M6 6l12 12M18 6L6 18"/>', '<circle class="f" cx="12" cy="12" r="1.3"/>'),
  chevron: I('<path d="M6 9l6 6 6-6"/>', '<circle class="f" cx="12" cy="19.6" r="1.2"/>'),
  grid: I('<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>', '<rect class="n" x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/>'),
  list: I('<path d="M9 6.5h11M9 12h11M9 17.5h11"/>', '<circle class="f" cx="4.6" cy="6.5" r="1.2"/><circle class="f" cx="4.6" cy="12" r="1.2"/><circle class="f" cx="4.6" cy="17.5" r="1.2"/>'),
  network: I('<circle cx="6" cy="7" r="2.4"/><circle cx="18" cy="6" r="2.4"/><path d="M8 8l2.6 7.4M16.3 7.8L13.4 15.3M8.4 6.8l7.2-.6"/>', '<circle class="n" cx="12" cy="18" r="2.8"/>'),
  layers: I('<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>', '<circle class="f" cx="12" cy="8" r="1.3"/>'),
  code: I('<path d="M8 8l-4 4 4 4M16 8l4 4-4 4"/>', '<path class="a" d="M13.4 6.5l-2.8 11"/>'),
  pencil: I('<path d="M4 20l1-4L16 5l3 3L8 19l-4 1z"/>', '<path class="a" d="M14 7l3 3"/>'),
  file: I('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 17h6"/>', '<path class="a" d="M10 13h6"/>'),
  compass: I('<circle cx="12" cy="12" r="9"/>', '<path class="n" d="M15.5 8.5l-2 5-5 2 2-5z"/>'),
  gift: I('<rect x="4" y="9" width="16" height="11" rx="2"/><path d="M3 9h18M12 9c-2.5 0-4-1-4-2.5S9.5 4 12 9zM12 9c2.5 0 4-1 4-2.5S14.5 4 12 9z"/>', '<path class="a" d="M12 9v11"/>'),
  book: I('<path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z"/>', '<path class="a" d="M5 17a3 3 0 0 1 3-3h10"/>'),
  // ---- people, work, content
  briefcase: I('<rect x="3" y="7.5" width="18" height="12" rx="2.5"/><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3 13h18"/>', '<circle class="f" cx="12" cy="13" r="1.4"/>'),
  calendar: I('<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/>', '<rect class="f" x="7.5" y="13" width="3.2" height="3.2" rx=".8"/>'),
  chat: I('<path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4.5 3.5V17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/>', '<circle class="f" cx="8.4" cy="11" r="1.1"/><circle class="f" cx="12" cy="11" r="1.1"/><circle class="f" cx="15.6" cy="11" r="1.1"/>'),
  phone: I('<path d="M6.5 3.5h3l1.5 4-2 1.3a11 11 0 0 0 5.2 5.2l1.3-2 4 1.5v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2z"/>', '<path class="a" d="M14.5 4.5a5 5 0 0 1 5 5"/>'),
  home: I('<path d="M4 11l8-7 8 7"/><path d="M6 9.5V20h12V9.5"/>', '<path class="a" d="M10 20v-5h4v5"/>'),
  user: I('<circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/>', '<circle class="f" cx="12" cy="8" r="1.3"/>'),
  tag: I('<path d="M3.5 12.5V5A1.5 1.5 0 0 1 5 3.5h7.5l8 8a2 2 0 0 1 0 2.8l-6.2 6.2a2 2 0 0 1-2.8 0z"/>', '<circle class="f" cx="8" cy="8" r="1.4"/>'),
  link: I('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 10 18.7l1-1"/>', '<path class="a" d="M10.5 13.5l3-3"/>'),
  check: I('<circle cx="12" cy="12" r="9"/>', '<path class="a" d="M8 12.5l2.7 2.7L16 9.5"/>'),
  star: I('<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8z"/>', '<circle class="f" cx="12" cy="12" r="1.5"/>'),
  bulb: I('<path d="M9 17.5h6M10 20.5h4"/><path d="M12 3.5a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3.5z"/>', '<path class="a" d="M10.4 11.4L12 13l1.6-1.6"/>'),
  chart: I('<path d="M4 4v16h16"/>', '<path class="a" d="M7.5 15l3.5-4 3 3 4.5-6"/>'),
  pin: I('<path d="M12 21s6.5-5.7 6.5-11A6.5 6.5 0 0 0 5.5 10c0 5.3 6.5 11 6.5 11z"/>', '<circle class="f" cx="12" cy="10" r="2.2"/>'),
  clock: I('<circle cx="12" cy="12" r="9"/>', '<path class="a" d="M12 7v5l3 2"/>'),
  shield: I('<path d="M12 3l7.5 3v5.5c0 4.6-3.2 7.9-7.5 9.5-4.3-1.6-7.5-4.9-7.5-9.5V6z"/>', '<path class="a" d="M9 12l2.2 2.2L15.2 10"/>'),
  sliders: I('<path d="M4 7h16M4 17h16"/>', '<circle class="n" cx="9" cy="7" r="2.2"/><circle class="n" cx="15" cy="17" r="2.2"/>'),
  play: I('<circle cx="12" cy="12" r="9"/>', '<path class="a" d="M10 8.5l5 3.5-5 3.5z"/>'),
  bookmark: I('<path d="M6.5 3.5h11v17L12 16.5l-5.5 4z"/>', '<circle class="f" cx="12" cy="9" r="1.4"/>'),
  heart: I('<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.2 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>', '<path class="a" d="M7.6 10a2.4 2.4 0 0 1 2-2.2"/>'),
  folder: I('<path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>', '<path class="a" d="M3.5 11.5h17"/>'),
  terminal: I('<rect x="3" y="4.5" width="18" height="15" rx="3"/>', '<path class="a" d="M7.5 10l3 2.5-3 2.5M13 15.5h3.5"/>'),
  rocket: I('<path d="M12 3c3 2.5 4.5 6 4.5 9.5l-2 3.5h-5l-2-3.5C7.5 9 9 5.5 12 3z"/><path d="M7.5 13l-3 2.5 1 3 3-1.5M16.5 13l3 2.5-1 3-3-1.5"/>', '<circle class="f" cx="12" cy="9.6" r="1.6"/>'),
  target: I('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/>', '<circle class="f" cx="12" cy="12" r="1.6"/>'),
  quote: I('<path d="M5 17.5v-4.5a5 5 0 0 1 5-5M13.5 17.5v-4.5a5 5 0 0 1 5-5"/>', '<circle class="f" cx="5" cy="19.6" r="1.2"/><circle class="f" cx="13.5" cy="19.6" r="1.2"/>'),
  filter: I('<path d="M4 6h16l-6 7.5V19l-4 1.5v-7z"/>', '<path class="a" d="M8 6h8"/>'),
  image: I('<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M4 17l5-5 4 4 2.5-2.5 4.5 4.5"/>', '<circle class="f" cx="15.4" cy="9" r="1.6"/>'),
  key: I('<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l2.5 2.5"/>', '<circle class="f" cx="8" cy="15" r="1.4"/>'),
  lock: I('<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>', '<circle class="f" cx="12" cy="15.5" r="1.5"/>'),
  plus: I('<circle cx="12" cy="12" r="9"/>', '<path class="a" d="M12 8v8M8 12h8"/>'),
  info: I('<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/>', '<circle class="f" cx="12" cy="7.9" r="1.3"/>'),
  bell: I('<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>', '<circle class="f" cx="12" cy="5" r="1.3"/>'),
};

// the SVG for one icon, `site` (accent colours come from the page: var(--accent)) or `file` (fixed colours)
export function inner(id, { mode = 'file', accent = YELLOW } = {}) {
  const { line, acc } = ICONS[id];
  const a = mode === 'site' ? 'var(--accent,#ffcc00)' : accent;
  const body = acc
    .replace(/class="a"/g, mode === 'site' ? `style="stroke:${a}"` : `stroke="${a}"`)
    .replace(/class="f"/g, mode === 'site' ? `style="fill:${a};stroke:none"` : `fill="${a}" stroke="none"`)
    .replace(/class="n"/g, mode === 'site' ? `style="fill:${a}"` : `fill="${a}"`);
  return line + body;
}

// a layer of one icon with its own colours, used for the sticker edge, rim and fill:
//   part 'line' or 'acc'; stroke colour and width for strokes; fill colour for dots and blocks
export function layer(id, part, { stroke, w, fill = stroke, fw = w }) {
  const raw = ICONS[id][part];
  if (part === 'line') return `<g fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${raw}</g>`;
  const body = raw
    .replace(/class="a"/g, `fill="none" stroke="${stroke}" stroke-width="${w}"`)
    .replace(/class="f"/g, `fill="${fill}" stroke="${fill}" stroke-width="${fw}"`)
    .replace(/class="n"/g, `fill="${fill}" stroke="${stroke}" stroke-width="${w}"`);
  return `<g stroke-linecap="round" stroke-linejoin="round">${body}</g>`;
}
