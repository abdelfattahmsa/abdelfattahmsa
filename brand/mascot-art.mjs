// The mascot, drawn once. 240 x 240 design grid, flat shapes, 5-unit black outline, yellow tie.
// Everything else (site sprite, logos, icons, OG image) is built from these strings by build-mascot.mjs.
export const YELLOW = '#ffcc00';
const INK = '#000000';
const PAPER = '#ffffff';

// shapes (shared by the artwork and by the white "sticker" edge)
const SUIT = 'M18 246C18 208 56 194 100 190H140C184 194 222 208 222 246Z';
const NECK = 'M98 160V190L120 214L142 190V160Z';
const HEAD = 'M64 100C64 58 88 40 120 40C152 40 176 58 176 100V124C176 160 152 184 120 184C88 184 64 160 64 124Z';
const HAIR = 'M62 104C54 56 86 30 124 32C160 34 186 58 178 106C174 84 160 72 138 68C118 76 84 74 62 104Z';
// beard and mustache are one shape: sideburns run down the jaw and meet the mustache; the lip patch is cut out
const BEARD =
  'M63 112L64 124C64 160 88 184 120 184C152 184 176 160 176 124L177 112' +
  'C176 130 162 142 146 144C138 136 128 137 120 141C112 137 102 136 94 144C78 142 64 130 63 112Z' +
  'M101 153C108 151 113 152 120 152C127 152 132 151 139 153C139 160 131 163 120 163C109 163 101 160 101 153Z';
const EARS = [[60, 120], [180, 120]];

const line = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;

const face = () => `
<g ${line}>
  ${EARS.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="${PAPER}"/>`).join('')}
  <path d="${HEAD}" fill="${PAPER}"/>
  <path d="${HAIR}" fill="${INK}"/>
  <path d="${BEARD}" fill="${INK}" fill-rule="evenodd" stroke-width="3"/>
  <path d="M82 92Q98 82 114 91M126 91Q142 82 158 92" fill="none" stroke-width="7"/>
  <ellipse cx="98" cy="110" rx="5" ry="4.5" fill="${INK}" stroke="none"/><ellipse cx="142" cy="110" rx="5" ry="4.5" fill="${INK}" stroke="none"/>
  <path d="M121 108Q113 128 126 129" fill="none" stroke-width="4.5"/>
  <path d="M109 157Q120 160 131 157" fill="none" stroke-width="3.5"/>
</g>`;

const body = (tie = YELLOW) => `
<g ${line}>
  <path d="${SUIT}" fill="${INK}"/>
  <path d="${NECK}" fill="${PAPER}"/>
  <path d="M100 186L120 226L140 186Z" fill="${PAPER}" stroke-width="4"/>
  <path d="M100 186L108 202L96 208ZM140 186L132 202L144 208Z" fill="${PAPER}" stroke-width="3"/>
  <path d="M114 200H126L124 210H116Z" fill="${tie}" stroke-width="3.5"/>
  <path d="M116 210H124L130 240H110Z" fill="${tie}" stroke-width="3.5"/>
</g>`;

// white sticker edge: every outer shape drawn fat in white, underneath
const edge = (parts, w = 18) =>
  `<g fill="${PAPER}" stroke="${PAPER}" stroke-width="${w}" stroke-linejoin="round">${parts}</g>`;
const headParts = `<path d="${HEAD}"/><path d="${HAIR}"/>${EARS.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11"/>`).join('')}`;
const bustParts = `<path d="${SUIT}"/><path d="${NECK}"/>${headParts}`;

export const art = {
  // viewBoxes include the sticker edge
  head: { vb: '36 16 168 184', inner: edge(headParts) + face() },
  bust: { vb: '6 14 228 232', inner: edge(bustParts) + body() + face() },
  // single colour version (tie in ink)
  bustMono: { vb: '6 14 228 232', inner: edge(bustParts) + body(INK) + face() },
  // circular avatar: yellow disc, bust bleeding off the bottom, no edge
  avatar: { vb: '0 0 240 240', inner: `<clipPath id="av"><circle cx="120" cy="120" r="120"/></clipPath><circle cx="120" cy="120" r="120" fill="${YELLOW}"/><g clip-path="url(#av)">${body(INK)}${face()}</g>` },
  // favicon: simplified head (no ears, brows, nose or mouth) so it survives 16 px
  icon: {
    vb: '0 0 64 64',
    inner: `<circle cx="32" cy="32" r="32" fill="${YELLOW}"/>
<g transform="translate(32 33) scale(.34) translate(-120 -112)">
  <path d="${HEAD}" fill="${PAPER}"/>
  <path d="${HAIR}" fill="${INK}"/>
  <path d="${BEARD}" fill="${INK}" fill-rule="evenodd"/>
  <ellipse cx="98" cy="108" rx="9" ry="9" fill="${INK}"/><ellipse cx="142" cy="108" rx="9" ry="9" fill="${INK}"/>
</g>`,
  },
};

export const svgDoc = (a, title, size) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${a.vb}"${size ? ` width="${size[0]}" height="${size[1]}"` : ''} role="img" aria-label="${title}"><title>${title}</title>${a.inner}</svg>\n`;
