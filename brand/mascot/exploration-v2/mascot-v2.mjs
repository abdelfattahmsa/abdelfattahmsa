// Mascot v2 concept: more like the owner (short curly hair, full neat beard joined to the mustache, big ears, black irises with
// highlights), drawn in the bold flat style of the references, with a retro reaction set (eyes x mouths x brows).
// Concept only: nothing here is used by the site or the brand library yet.
export const YELLOW = '#ffcc00', INK = '#000000', PAPER = '#ffffff', GREY = '#a6a6a6';
const L = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;

// ---- shapes shared by the artwork and the white sticker edge
const HAIR_BLOB = '<ellipse cx="120" cy="80" rx="60" ry="36"/>';
const curls = [198, 216, 234, 252, 270, 288, 306, 324, 342].map((a) => {
  const r = (a * Math.PI) / 180;
  return `<circle cx="${(120 + 62 * Math.cos(r)).toFixed(1)}" cy="${(80 + 39 * Math.sin(r)).toFixed(1)}" r="12"/>`;
}).join('') + '<circle cx="62" cy="100" r="9"/><circle cx="178" cy="100" r="9"/>';
// round, wide face; the top edge is the hairline
const FACE = 'M60 128V108C62 94 76 86 88 88C100 90 108 84 120 87C132 84 140 90 152 88C164 86 178 94 180 108V136C180 172 154 194 120 194C86 194 60 172 60 136Z';
// short full beard on the lower face: thin sideburns, mustache and chin, one shape
const BEARD = 'M58 132C58 176 88 204 120 204C152 204 182 176 182 132C180 142 170 148 158 150C148 146 132 144 120 150C108 144 92 146 82 150C70 148 60 142 58 132Z';
const EAR = (x) => `<ellipse cx="${x}" cy="130" rx="12" ry="16"/>`;
const SUIT = 'M8 252C8 222 40 208 90 204L150 204C200 208 232 222 232 252Z';

// ---- features
const hi = (x, y) => `<path d="M${x - 5} ${y - 7}L${x + 3} ${y - 3}L${x - 4} ${y + 2}Z" fill="${PAPER}" stroke="none"/>`;
export const eyes = {
  wide: () => [96, 144].map((x) => `<ellipse cx="${x}" cy="116" rx="9" ry="11" fill="${INK}"/>${hi(x, 116)}`).join(''),
  happy: () => `<path d="M86 120Q96 104 106 120M134 120Q144 104 154 120" fill="none" ${L} stroke-width="6.5"/>`,
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
const wm = (d, w = 5.5) => `<path d="${d}" fill="none" stroke="${PAPER}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
export const mouths = {
  grin: () => `<g ${L} stroke-width="4"><path d="M92 152C104 146 136 146 148 152C148 178 136 190 120 190C104 190 92 178 92 152Z" fill="${PAPER}"/><path d="M93 166H147M106 152V166M120 150V166M134 152V166" fill="none" stroke-width="3.2"/></g>`,
  laugh: () => `<path d="M88 152C104 144 136 144 152 152C152 184 138 198 120 198C102 198 88 184 88 152Z" fill="${INK}" stroke="${PAPER}" stroke-width="4" stroke-linejoin="round"/><path d="M92 154C106 149 134 149 148 154L146 166C134 162 106 162 94 166Z" fill="${PAPER}"/><ellipse cx="120" cy="187" rx="15" ry="8" fill="${PAPER}"/>`,
  smile: () => wm('M98 160Q120 176 142 160'),
  smirk: () => wm('M100 166Q116 172 130 166Q138 162 144 154'),
  flat: () => wm('M102 166H138'),
  frown: () => wm('M100 174Q120 158 140 174'),
  o: () => `<ellipse cx="120" cy="168" rx="9.5" ry="12" fill="${INK}" stroke="${PAPER}" stroke-width="4.5"/>`,
  tongue: () => `<path d="M94 154C106 148 134 148 146 154C146 172 136 180 120 180C104 180 94 172 94 154Z" fill="${INK}" stroke="${PAPER}" stroke-width="4" stroke-linejoin="round"/><path d="M108 174C108 198 132 198 132 174Z" fill="${PAPER}" ${L} stroke-width="4"/><path d="M120 178V190" fill="none" ${L} stroke-width="3"/>`,
};
const glasses = () => `<g fill="none" ${L} stroke-width="7"><rect x="78" y="100" width="36" height="30" rx="12"/><rect x="126" y="100" width="36" height="30" rx="12"/><path d="M114 112H126M78 110L62 106M162 110L178 106"/></g>`;

// ---- the head and the bust
export function head({ eye = 'wide', brow: b = 'normal', mouth = 'smile', glass = false, edge = true } = {}) {
  const parts = `<g>${HAIR_BLOB}${curls}</g>`;
  const ears = [50, 190];
  const sticker = edge
    ? `<g fill="${PAPER}" stroke="${PAPER}" stroke-width="16" stroke-linejoin="round">${parts}<path d="${BEARD}"/><path d="${FACE}"/>${ears.map(EAR).join('')}</g>`
    : '';
  return (
    sticker +
    `<g ${L}>${ears.map((x) => `<g><ellipse cx="${x}" cy="130" rx="12" ry="16" fill="${PAPER}"/><path d="M${x - 2} 122q${x < 120 ? -5 : 5} 10 1 20" fill="none" stroke-width="3"/></g>`).join('')}` +
    `<g fill="${INK}">${HAIR_BLOB}${curls}</g>` +
    `<path d="${FACE}" fill="${PAPER}"/>` +
    `<path d="${BEARD}" fill="${INK}" stroke-width="3"/></g>` +
    brows[b]() + eyes[eye]() +
    `<path d="M112 132Q120 141 128 132" fill="none" ${L}/>` +
    `<g transform="translate(12 21) scale(.9)">${mouths[mouth]()}</g>` + (glass ? glasses() : '')
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
  ['Calm', { eye: 'wide', brow: 'normal', mouth: 'smile' }],
  ['Happy', { eye: 'happy', brow: 'raised', mouth: 'grin' }],
  ['Laugh', { eye: 'happy', brow: 'raised', mouth: 'laugh' }],
  ['Wink', { eye: 'wink', brow: 'normal', mouth: 'grin' }],
  ['Cheeky', { eye: 'wink', brow: 'normal', mouth: 'tongue' }],
  ['Smirk', { eye: 'side', brow: 'normal', mouth: 'smirk' }],
  ['Surprised', { eye: 'surprised', brow: 'raised', mouth: 'o' }],
  ['Sleepy', { eye: 'sleepy', brow: 'normal', mouth: 'flat' }],
  ['Worried', { eye: 'wide', brow: 'worried', mouth: 'frown' }],
  ['Angry', { eye: 'wide', brow: 'angry', mouth: 'frown' }],
  ['Cool', { eye: 'wide', brow: 'normal', mouth: 'smile', glass: true }],
  ['Retro', { eye: 'pie', brow: 'raised', mouth: 'laugh' }],
];
