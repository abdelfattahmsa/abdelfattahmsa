// Mascot v3 concept: face only, drawn in the exact style and proportions of the reference mascot (orange background).
// The hair, ears, brows, eyes, nose and glasses frame are traced from the reference (ref-traced.json, reference pixel coordinates);
// the beard, face base, expressions and sunglasses lenses are drawn here to the same proportions. No mustache, no mouth.
// Concept only: not used by the site or the brand library until approved.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const T = JSON.parse(fs.readFileSync(path.join(here, 'ref-traced.json'), 'utf8'));
export const VB = '200 375 450 530'; // reference pixel space, head only
export const INK = '#000', PAPER = '#fff', ORANGE = '#ff4500', YELLOW = '#ffcc00';
const k = (d, extra = '') => `<path d="${d}" fill-rule="evenodd" fill="${INK}"${extra}/>`;

// ---- proportions measured on the reference (head 425 wide, 495 tall; eyes at 65% of the height; ears 27% of the width tall)
const FACE = 'M286 540H572V742C572 812 500 862 427 862C354 862 286 812 286 742Z';
// beard: a thick band (the reference's jaw rim, made fuller) from the sideburns round the chin; the area inside, including the
// mouth and chin, stays clean skin
const BEARD = 'M277 650V780C300 850 360 888 427 888C494 888 554 850 577 780V650H553C553 765 508 852 427 852C346 852 301 765 301 650Z';
const EARS_WHITE = '<ellipse cx="254" cy="730" rx="27" ry="50" fill="#fff"/><ellipse cx="600" cy="730" rx="27" ry="50" fill="#fff"/>';

const hi = (cx, cy) => `<path d="M${cx - 12} ${cy - 18}L${cx + 6} ${cy - 8}L${cx - 10} ${cy + 4}Z" fill="${PAPER}"/>`;
export const eyes = {
  calm: () => k(T.eyeL) + k(T.eyeR),
  happy: () => `<path d="M334 730Q358 686 382 730M474 730Q498 686 522 730" fill="none" stroke="${INK}" stroke-width="17" stroke-linecap="round"/>`,
  wink: () => k(T.eyeL) + `<path d="M474 716Q498 740 522 716" fill="none" stroke="${INK}" stroke-width="17" stroke-linecap="round"/>`,
  surprised: () => [358, 498].map((x) => `<circle cx="${x}" cy="716" r="34" fill="${PAPER}" stroke="${INK}" stroke-width="12"/><circle cx="${x}" cy="716" r="13" fill="${INK}"/>`).join(''),
};
const browG = (d, rot, dy, cx, cy) => `<g transform="translate(0 ${dy}) rotate(${rot} ${cx} ${cy})">${k(d)}</g>`;
export const brows = {
  calm: () => k(T.browL) + k(T.browR),
  raised: () => browG(T.browL, -4, -16, 358, 648) + browG(T.browR, 4, -16, 497, 648),
  angry: () => browG(T.browL, 17, 6, 358, 648) + browG(T.browR, -17, 6, 497, 648),
};
const sunglasses = () =>
  `<path d="M312 684H392Q404 684 404 698V742Q404 762 384 762H322Q304 762 304 742V698Q304 684 312 684Z" fill="${INK}"/>` +
  `<path d="M462 684H542Q552 684 552 698V742Q552 762 532 762H472Q452 762 452 742V698Q452 684 462 684Z" fill="${INK}"/>` +
  k(T.frame) +
  `<path d="M322 698L342 698L326 722Z M472 698L492 698L476 722Z" fill="${PAPER}"/>`;

export function head({ eye = 'calm', brow = 'calm', sun = false, bg = null } = {}) {
  return (
    (bg ? `<rect x="200" y="375" width="450" height="530" fill="${bg}"/>` : '') +
    EARS_WHITE + k(T.earL) + k(T.earR) + k(T.earInL) + k(T.earInR) +
    `<path d="${FACE}" fill="${PAPER}"/>` +
    `<path d="${BEARD}" fill="${INK}"/>` +
    brows[brow]() + (sun ? '' : eyes[eye]()) + k(T.nose) + (sun ? sunglasses() : '') +
    k(T.hair)
  );
}
export const presets = [
  ['Calm', { eye: 'calm', brow: 'calm' }],
  ['Happy', { eye: 'happy', brow: 'raised' }],
  ['Wink', { eye: 'wink', brow: 'calm' }],
  ['Surprised', { eye: 'surprised', brow: 'raised' }],
  ['Angry', { eye: 'calm', brow: 'angry' }],
];
