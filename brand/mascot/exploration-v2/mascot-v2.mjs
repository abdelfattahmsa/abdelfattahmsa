// Mascot v2 concept: more like the owner (short curly hair, full neat beard joined to the mustache, big ears, black irises with
// highlights), drawn in the bold flat style of the references, with a retro reaction set (a few eye reactions; no mouth).
// Concept only: nothing here is used by the site or the brand library yet.
export const YELLOW = '#ffcc00', INK = '#000000', PAPER = '#ffffff', GREY = '#a6a6a6';
const L = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;

// ---- shapes shared by the artwork and the white sticker edge
// hair like the orange reference: a swept, tufted mass with pointed tufts on top and stepped tufts on the sides. It sits behind the
// face; the face edge is the hairline (a lobe hangs on the left, a wave across the middle, a straight edge on the right)
const HAIR_SHAPE = '<path d="M58 138L58 122Q47 116 45 107Q55 108 61 101Q49 93 49 80Q59 85 67 81Q65 62 82 52Q96 44 113 46Q121 40 125 33Q135 30 133 22Q146 33 152 42Q170 44 182 58Q193 66 191 80Q197 91 188 101L186 138Z"/>';
// round, wide face; the top edge is the hairline
const FACE = 'M62 130V110C62 101 72 96 82 100C92 104 98 92 112 90C126 88 136 94 150 90C160 87 170 85 178 87V136C178 172 154 194 120 194C86 194 62 172 62 136Z';
// beard on the cheeks and jaw joined to the mustache; the mouth area and chin are left as clean skin (open at the bottom, so it
// reads as skin and not as a mouth)
const BEARD = 'M58 132C58 160 70 182 92 196L98 190C98 176 96 164 100 158C110 154 130 154 140 158C144 164 142 176 142 190L148 196C170 182 182 160 182 132C180 142 170 148 158 150C148 146 132 144 120 150C108 144 92 146 82 150C70 148 60 142 58 132Z';
const EAR = (x) => `<ellipse cx="${x}" cy="130" rx="12" ry="16"/>`;
const SUIT = 'M8 252C8 222 40 208 90 204L150 204C200 208 232 222 232 252Z';

// ---- features
const hi = (x, y) => `<path d="M${x - 5} ${y - 7}L${x + 3} ${y - 3}L${x - 4} ${y + 2}Z" fill="${PAPER}" stroke="none"/>`;
export const eyes = {
  wide: () => [96, 144].map((x) => `<ellipse cx="${x}" cy="116" rx="9" ry="11" fill="${INK}"/>${hi(x, 116)}`).join(''),
  happy: () => `<path d="M86 120Q96 104 106 120M134 120Q144 104 154 120" fill="none" ${L} stroke-width="6.5"/>`,
  content: () => `<path d="M86 114Q96 126 106 114M134 114Q144 126 154 114" fill="none" ${L} stroke-width="6.5"/>`,
  hearts: () => [96, 144].map((x) => `<path transform="translate(${x} 116) scale(1.25)" d="M0 9C-14 -1 -9 -13 0 -6C9 -13 14 -1 0 9Z" fill="${INK}" stroke="none"/><circle cx="${x - 4}" cy="112" r="2.6" fill="${PAPER}"/>`).join(''),
  wink: () => `<ellipse cx="96" cy="116" rx="9" ry="11" fill="${INK}"/>${hi(96, 116)}<path d="M134 116Q144 124 154 116" fill="none" ${L} stroke-width="6.5"/>`,
  sleepy: () => [96, 144].map((x) => `<path d="M${x - 10} 118H${x + 10}C${x + 10} 128 ${x + 4} 131 ${x} 131C${x - 4} 131 ${x - 10} 128 ${x - 10} 118Z" fill="${INK}" stroke="none"/><path d="M${x - 12} 118H${x + 12}" ${L} stroke-width="5"/>`).join(''),
  surprised: () => [96, 144].map((x) => `<circle cx="${x}" cy="116" r="13" fill="${PAPER}" ${L}/><circle cx="${x}" cy="116" r="5.5" fill="${INK}" stroke="none"/>`).join(''),
  side: () => [96, 144].map((x) => `<ellipse cx="${x}" cy="116" rx="12" ry="13" fill="${PAPER}" ${L} stroke-width="4"/><ellipse cx="${x + 4.5}" cy="114" rx="6.5" ry="8.5" fill="${INK}" stroke="none"/>${hi(x + 4.5, 114)}`).join(''),
  pie: () => [96, 144].map((x) => `<ellipse cx="${x}" cy="116" rx="10" ry="12" fill="${INK}"/><path d="M${x} 116L${x + 11} 108L${x + 11} 119Z" fill="${PAPER}" stroke="none"/>`).join(''),
};
const brow = (d) => `<path d="${d}" fill="none" ${L} stroke-width="9"/>`;
export const brows = {
  normal: () => brow('M82 104Q96 94 110 101') + brow('M130 101Q144 94 158 104'),
  raised: () => brow('M82 98Q96 88 110 95') + brow('M130 95Q144 88 158 98'),
  angry: () => brow('M82 98L112 109') + brow('M158 98L128 109'),
  worried: () => brow('M82 109L112 98') + brow('M158 109L128 98'),
};
const sunglasses = () => `<g ${L} stroke-width="6"><path d="M74 100H166" fill="none"/><path d="M76 104H114Q119 104 119 110V120Q119 132 106 132H90Q76 132 76 120Z" fill="${INK}"/><path d="M164 104H126Q121 104 121 110V120Q121 132 134 132H150Q164 132 164 120Z" fill="${INK}"/><path d="M119 108Q120 105 121 108" fill="none"/><path d="M74 102L58 108M166 102L182 108" fill="none"/></g><g fill="${PAPER}" stroke="none"><path d="M82 110L92 110L85 124Z"/><path d="M130 110L140 110L133 124Z"/></g>`;
const glasses = () => `<g fill="none" ${L} stroke-width="7"><rect x="78" y="100" width="36" height="30" rx="12"/><rect x="126" y="100" width="36" height="30" rx="12"/><path d="M114 112H126M78 110L62 106M162 110L178 106"/></g>`;

// ---- the head and the bust
export function head({ eye = 'wide', brow: b = 'normal', glass = false, sun = false, edge = true } = {}) {
  const parts = `<g>${HAIR_SHAPE}</g>`;
  const ears = [50, 190];
  const sticker = edge
    ? `<g fill="${PAPER}" stroke="${PAPER}" stroke-width="16" stroke-linejoin="round">${parts}<path d="${BEARD}"/><path d="${FACE}"/>${ears.map(EAR).join('')}</g>`
    : '';
  return (
    sticker +
    `<g ${L}>${ears.map((x) => `<g><ellipse cx="${x}" cy="130" rx="12" ry="16" fill="${PAPER}"/><path d="M${x - 2} 122q${x < 120 ? -5 : 5} 10 1 20" fill="none" stroke-width="3"/></g>`).join('')}` +
    `<g fill="${INK}">${HAIR_SHAPE}</g>` +
    `<path d="${FACE}" fill="${PAPER}"/>` +
    `<path d="${BEARD}" fill="${INK}" fill-rule="evenodd" stroke-width="3"/></g>` +
    brows[b]() + (sun ? '' : eyes[eye]()) +
    `<path d="M112 132Q120 141 128 132" fill="none" ${L}/>` +
    (glass ? glasses() : '') + (sun ? sunglasses() : '')
  );
}
export function bust(opts = {}) {
  const edge = opts.edge !== false ? `<g fill="${PAPER}" stroke="${PAPER}" stroke-width="16" stroke-linejoin="round"><path d="${SUIT}"/></g>` : '';
  const body =
    `<g ${L}><path d="${SUIT}" fill="${INK}"/><path d="M94 204L120 240L146 204Z" fill="${PAPER}" stroke-width="4"/><path d="M94 204L82 226L110 228Z M146 204L158 226L130 228Z" fill="${PAPER}" stroke-width="3.5"/>` +
    `<path d="M168 228L182 224L185 236L170 238Z" fill="${YELLOW}" stroke-width="3.5"/></g>` +
    `<path d="M84 210L98 252M156 210L142 252" fill="none" stroke="${PAPER}" stroke-width="2.5" opacity=".55"/>`;
  return edge + body + head(opts);
}
export const presets = [
  ['Calm', { eye: 'wide', brow: 'normal' }],
  ['Happy', { eye: 'happy', brow: 'raised' }],
  ['Wink', { eye: 'wink', brow: 'normal' }],
  ['Surprised', { eye: 'surprised', brow: 'raised' }],
  ['Angry', { eye: 'wide', brow: 'angry' }],
];
export const shades = ['Sunglasses', { sun: true, brow: 'normal' }];
