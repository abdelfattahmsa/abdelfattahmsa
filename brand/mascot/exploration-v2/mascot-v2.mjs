// Mascot v2 concept: more like the owner (short curly hair, full neat beard joined to the mustache, big ears, black irises with
// highlights), drawn in the bold flat style of the references, with a retro reaction set (eyes and brows only: no mouth).
// Concept only: nothing here is used by the site or the brand library yet.
export const YELLOW = '#ffcc00', INK = '#000000', PAPER = '#ffffff', GREY = '#a6a6a6';
const L = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;

// ---- shapes shared by the artwork and the white sticker edge
// slicked-back hair, shown by its shape alone: a tight combed silhouette with a small lift at the front (it sits behind the
// face; the face edge is the hairline, receding at the temples with a widow's peak)
const HAIR_SHAPE = '<path d="M58 134C49 98 62 66 88 50C102 42 112 35 132 37C160 40 178 60 182 92C185 108 184 122 182 134Z"/>';
// round, wide face; the top edge is the hairline
const FACE = 'M60 128V114C62 98 70 86 82 76C92 81 104 86 120 87C136 86 148 81 158 76C170 86 178 98 180 114V136C180 172 154 194 120 194C86 194 60 172 60 136Z';
// short full beard on the lower face: thin sideburns, mustache and chin, one shape
const BEARD = 'M58 132C58 176 88 204 120 204C152 204 182 176 182 132C180 142 170 148 158 150C148 146 132 144 120 150C108 144 92 146 82 150C70 148 60 142 58 132Z';
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
const glasses = () => `<g fill="none" ${L} stroke-width="7"><rect x="78" y="100" width="36" height="30" rx="12"/><rect x="126" y="100" width="36" height="30" rx="12"/><path d="M114 112H126M78 110L62 106M162 110L178 106"/></g>`;

// ---- the head and the bust
export function head({ eye = 'wide', brow: b = 'normal', glass = false, edge = true } = {}) {
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
    `<path d="${BEARD}" fill="${INK}" stroke-width="3"/></g>` +
    brows[b]() + eyes[eye]() +
    `<path d="M112 132Q120 141 128 132" fill="none" ${L}/>` +
    (glass ? glasses() : '')
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
  ['Content', { eye: 'content', brow: 'normal' }],
  ['Wink', { eye: 'wink', brow: 'normal' }],
  ['Surprised', { eye: 'surprised', brow: 'raised' }],
  ['Side-eye', { eye: 'side', brow: 'normal' }],
  ['Sleepy', { eye: 'sleepy', brow: 'normal' }],
  ['Worried', { eye: 'wide', brow: 'worried' }],
  ['Angry', { eye: 'wide', brow: 'angry' }],
  ['Cool', { eye: 'wide', brow: 'normal', glass: true }],
  ['Retro', { eye: 'pie', brow: 'raised' }],
  ['Hearts', { eye: 'hearts', brow: 'raised' }],
];
