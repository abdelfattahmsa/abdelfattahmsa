// The mascot, drawn once. 240 x 240 design grid, flat shapes, 5-unit black outline, yellow tie.
// Everything else (site sprite, logos, icons, OG image) is built from these strings by build-mascot.mjs.
export const YELLOW = '#ffcc00';
export const INK = '#000000';
export const PAPER = '#ffffff';

// shapes (shared by the artwork and by the white "sticker" edge)
const SUIT = 'M18 246C18 208 56 194 100 190H140C184 194 222 208 222 246Z';
const NECK = 'M98 160V190L120 214L142 190V160Z';
const HEAD = 'M64 100C64 58 88 40 120 40C152 40 176 58 176 100V124C176 160 152 184 120 184C88 184 64 160 64 124Z';
const HAIR = 'M62 104C54 56 86 30 124 32C160 34 186 58 178 106C174 84 160 72 138 68C118 76 84 74 62 104Z';
// beard and mustache are one shape: sideburns run down the jaw and meet the mustache; the lip patch is cut out
const BEARD_OUTER =
  'M63 112L64 124C64 160 88 184 120 184C152 184 176 160 176 124L177 112' +
  'C176 130 162 142 146 144C138 136 128 137 120 141C112 137 102 136 94 144C78 142 64 130 63 112Z';
const PATCH = {
  calm: 'M101 153C108 151 113 152 120 152C127 152 132 151 139 153C139 160 131 163 120 163C109 163 101 160 101 153Z',
  smile: 'M97 151C104 148 112 150 120 150C128 150 136 148 143 151C144 165 133 172 120 172C107 172 96 165 97 151Z',
};
const BEARD = BEARD_OUTER + PATCH.calm;
const EARS = [[60, 120], [180, 120]];

export const line = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;

// opts: mouth calm|smile, eyes normal|up|happy, brows normal|raised, glasses, hat
export const face = (o = {}) => {
  const { mouth = 'calm', eyes = 'normal', brows = 'normal', glasses = false, hat = false } = o;
  const beard = BEARD_OUTER + PATCH[mouth];
  const eyeEls =
    eyes === 'happy'
      ? `<path d="M90 113Q98 103 106 113M134 113Q142 103 150 113" fill="none" stroke-width="5"/>`
      : `<ellipse cx="98" cy="${eyes === 'up' ? 106 : 110}" rx="5" ry="4.5" fill="${INK}" stroke="none"/><ellipse cx="142" cy="${eyes === 'up' ? 106 : 110}" rx="5" ry="4.5" fill="${INK}" stroke="none"/>`;
  const browEls = brows === 'raised' ? 'M82 86Q98 76 114 85M126 82Q142 72 158 84' : 'M82 92Q98 82 114 91M126 91Q142 82 158 92';
  const mouthEl =
    mouth === 'smile'
      ? `<path d="M102 156Q120 168 138 156" fill="none" stroke-width="3.5"/>`
      : `<path d="M109 157Q120 160 131 157" fill="none" stroke-width="3.5"/>`;
  const gl = glasses
    ? `<rect x="76" y="96" width="42" height="30" rx="12" fill="none" stroke-width="5"/><rect x="122" y="96" width="42" height="30" rx="12" fill="none" stroke-width="5"/><path d="M118 108H122M76 106L63 102M164 106L177 102" fill="none" stroke-width="5"/>`
    : '';
  const hatEl = hat
    ? `<path d="M54 82C54 38 84 16 120 16C156 16 186 38 186 82Z" fill="${YELLOW}"/><path d="M42 82H198V94H42Z" fill="${YELLOW}"/><path d="M104 18V40M136 18V40" fill="none" stroke-width="4"/>`
    : '';
  return `
<g ${line}>
  ${EARS.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="${PAPER}"/>`).join('')}
  <path d="${HEAD}" fill="${PAPER}"/>
  <path d="${HAIR}" fill="${INK}"/>
  <path d="${beard}" fill="${INK}" fill-rule="evenodd" stroke-width="3"/>
  <path d="${browEls}" fill="none" stroke-width="7"/>
  ${eyeEls}
  <path d="M121 108Q113 128 126 129" fill="none" stroke-width="4.5"/>
  ${mouthEl}
  ${gl}
  ${hatEl}
</g>`;
};

export const body = (tie = YELLOW) => `
<g ${line}>
  <path d="${SUIT}" fill="${INK}"/>
  <path d="${NECK}" fill="${PAPER}"/>
  <path d="M100 186L120 226L140 186Z" fill="${PAPER}" stroke-width="4"/>
  <path d="M100 186L108 202L96 208ZM140 186L132 202L144 208Z" fill="${PAPER}" stroke-width="3"/>
  <path d="M114 200H126L124 210H116Z" fill="${tie}" stroke-width="3.5"/>
  <path d="M116 210H124L130 240H110Z" fill="${tie}" stroke-width="3.5"/>
</g>`;

// white sticker edge: every outer shape drawn fat in white, underneath
export const edge = (parts, w = 18) =>
  `<g fill="${PAPER}" stroke="${PAPER}" stroke-width="${w}" stroke-linejoin="round">${parts}</g>`;
export const headParts = `<path d="${HEAD}"/><path d="${HAIR}"/>${EARS.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11"/>`).join('')}`;
export const bustParts = `<path d="${SUIT}"/><path d="${NECK}"/>${headParts}`;

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
