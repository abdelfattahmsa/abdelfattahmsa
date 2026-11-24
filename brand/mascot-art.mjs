// The mascot, drawn once: a face-only front view. The hair, ears, brows, eyes, nose, mustache, mouth line and the glasses frame are
// traced vectors (mascot-shapes.json, in the reference's pixel space: the head is 425 wide, 495 tall); the face base, the beard band
// (its sideburns start inside the hair so hair and beard read as one mass), the expressions and the sunglasses lenses are drawn here
// to the same proportions. The brand scripts build every mascot file from these strings.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const YELLOW = '#ffcc00';
export const INK = '#000000';
export const PAPER = '#ffffff';
const S = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'mascot-shapes.json'), 'utf8'));
const k = (d, fill = INK) => `<path d="${d}" fill-rule="evenodd" fill="${fill}"/>`;

// the head's own box, and the box with room for the sticker edge
export const BOX = { x: 208, y: 386, w: 438, h: 512 };
export const VB = '196 374 462 536';

const FACE = 'M286 540H572V742C572 812 500 862 427 862C354 862 286 812 286 742Z';
const BEARD = 'M254 640C254 680 266 706 277 730V780C300 850 360 888 427 888C494 888 554 850 577 780V730C588 706 602 680 602 640H564V690C564 780 510 852 427 852C344 852 294 780 294 690V640Z';
const EARS_WHITE = '<ellipse cx="256" cy="732" rx="29" ry="53" fill="#fff"/><ellipse cx="598" cy="732" rx="29" ry="53" fill="#fff"/>';
const SUN_LENSES =
  '<path d="M312 684H392Q404 684 404 698V742Q404 762 384 762H322Q304 762 304 742V698Q304 684 312 684Z"/>' +
  '<path d="M462 684H542Q552 684 552 698V742Q552 762 532 762H472Q452 762 452 742V698Q452 684 462 684Z"/>';

// ---- expressions: eyes and brows (the mouth line and mustache stay)
const stroke = (d, w = 17) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round"/>`;
export const eyes = {
  calm: () => k(S.eyeL) + k(S.eyeR),
  happy: () => stroke('M334 730Q358 686 382 730M474 730Q498 686 522 730'),
  wink: () => k(S.eyeL) + stroke('M474 716Q498 740 522 716'),
  surprised: () => [358, 498].map((x) => `<circle cx="${x}" cy="716" r="34" fill="${PAPER}" stroke="${INK}" stroke-width="12"/><circle cx="${x}" cy="716" r="13" fill="${INK}"/>`).join(''),
};
const browG = (d, rot, dy, cx, cy) => `<g transform="translate(0 ${dy}) rotate(${rot} ${cx} ${cy})">${k(d)}</g>`;
export const brows = {
  calm: () => k(S.browL) + k(S.browR),
  raised: () => browG(S.browL, -4, -16, 358, 648) + browG(S.browR, 4, -16, 497, 648),
  angry: () => browG(S.browL, 17, 6, 358, 648) + browG(S.browR, -17, 6, 497, 648),
};
const sunglasses = () => `<g fill="${INK}">${SUN_LENSES}</g>${k(S.frame)}<path d="M322 698L342 698L326 722Z M472 698L492 698L476 722Z" fill="${PAPER}"/>`;

// the face, no edge and no background
export function face({ eye = 'calm', brow = 'calm', sun = false } = {}) {
  return (
    EARS_WHITE + k(S.earL) + k(S.earR) + k(S.earInL) + k(S.earInR) +
    `<path d="${FACE}" fill="${PAPER}"/><path d="${BEARD}" fill="${INK}"/>` +
    brows[brow]() + (sun ? '' : eyes[eye]()) + k(S.nose) + k(S.mustache) + k(S.lip) +
    (sun ? sunglasses() : '') + k(S.hair)
  );
}

// ---- the sticker edge round the whole head: dark backgrounds get white, light ones a white edge with a thin grey ring
const silhouette = (fill, stroke, w) =>
  `<g fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round" fill-rule="evenodd">` +
  `<path d="${S.hair}"/><path d="${S.earL}"/><path d="${S.earR}"/><path d="${FACE}"/><path d="${BEARD}"/>${EARS_WHITE.replace(/fill="#fff"/g, '')}</g>`;
export const edge = (w = 26) => silhouette(PAPER, PAPER, w);
export const edgeLight = (w = 26) => silhouette('#cfcfcf', '#cfcfcf', w + 5) + silhouette(PAPER, PAPER, w);

// ---- simplified head (no ears, brows, nose, lip) so it survives small sizes
const small = (transform) => `<g transform="${transform}"><path d="${FACE}" fill="${PAPER}"/><path d="${BEARD}" fill="${INK}"/>${k(S.eyeL)}${k(S.eyeR)}${k(S.mustache)}${k(S.hair)}</g>`;
const place = (cx, cy, s) => `translate(${cx - 427 * s} ${cy - 640 * s}) scale(${s})`;

export const art = {
  // viewBoxes include the sticker edge
  head: { vb: VB, inner: edge() + face() }, // dark backgrounds and transparent use
  headLight: { vb: VB, inner: edgeLight() + face() }, // white backgrounds
  headFlat: { vb: VB, inner: face() }, // yellow or white backgrounds, print (black on white)
  headSun: { vb: VB, inner: edge() + face({ sun: true }) },
  headSunLight: { vb: VB, inner: edgeLight() + face({ sun: true }) },
  headSunFlat: { vb: VB, inner: face({ sun: true }) },
  // circular avatar: yellow disc, the head fills it, no edge
  avatar: { vb: '0 0 240 240', inner: `<clipPath id="av"><circle cx="120" cy="120" r="120"/></clipPath><circle cx="120" cy="120" r="120" fill="${YELLOW}"/><g clip-path="url(#av)"><g transform="${place(120, 128, 0.4)}">${face()}</g></g>` },
  avatarSun: { vb: '0 0 240 240', inner: `<clipPath id="av"><circle cx="120" cy="120" r="120"/></clipPath><circle cx="120" cy="120" r="120" fill="${YELLOW}"/><g clip-path="url(#av)"><g transform="${place(120, 128, 0.4)}">${face({ sun: true })}</g></g>` },
  // favicon
  icon: { vb: '0 0 64 64', inner: `<circle cx="32" cy="32" r="32" fill="${YELLOW}"/>${small(place(32, 33, 0.098))}` },
};
// Android maskable icon: full-bleed yellow square, head kept inside the central safe zone (80% circle)
export const maskable = { vb: '0 0 64 64', inner: `<rect width="64" height="64" fill="${YELLOW}"/>${small(place(32, 33.5, 0.074))}` };
