// The mascot's poses: the approved face with other eyes and brows, sunglasses, or a prop on or beside the head.
// Written out by build-poses.mjs and drawn on the download covers by build-covers.mjs. Brand library only (not on the website).
import { face, edge, INK, PAPER, YELLOW, BOX } from './mascot-art.mjs';

// one canvas for every pose (room above and to the right for props), so poses swap without the head moving
export const VB = '176 190 520 722';

// props: a black outline, with a white sticker edge behind them so they read on dark backgrounds too
const outline = (inner, w = 11) => `<g stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round">${inner}</g>`;
const sticker = (inner, w = 26) => `<g fill="${PAPER}" stroke="${PAPER}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round">${inner}</g>`;
// a prop drawn as: sticker edge shape(s) first, then its coloured art
const prop = (shapes, art) => ({ under: sticker(shapes), over: art });

const HAT = {
  shapes: '<path d="M236 566C236 424 324 366 427 366C530 366 618 424 618 566Z"/><path d="M204 566H650Q650 590 626 590H228Q204 590 204 566Z"/>',
  art: outline(`<path d="M236 566C236 424 324 366 427 366C530 366 618 424 618 566Z" fill="${YELLOW}"/><path d="M204 566H650Q650 590 626 590H228Q204 590 204 566Z" fill="${YELLOW}"/><path d="M398 372V560M456 372V560" fill="none" stroke-width="8"/>`),
};
const BULB = {
  shapes: '<circle cx="427" cy="322" r="40"/><rect x="408" y="356" width="38" height="26" rx="6"/>',
  art: outline(`<circle cx="427" cy="322" r="40" fill="${YELLOW}"/><rect x="408" y="356" width="38" height="26" rx="6" fill="${PAPER}"/>`, 9) +
    `<path d="M427 262V282M370 282L384 296M484 282L470 296M350 330H368M486 330H504" stroke="${YELLOW}" stroke-width="9" stroke-linecap="round" fill="none"/>`,
};
const LENS = { cx: 358, cy: 704, r: 74 };
const MAGNIFIER = {
  shapes: `<circle cx="${LENS.cx}" cy="${LENS.cy}" r="${LENS.r}"/><path d="M308 758L246 836" stroke-width="40"/>`,
  art: `<circle cx="${LENS.cx}" cy="${LENS.cy}" r="${LENS.r}" fill="${YELLOW}" fill-opacity=".28"/>` +
    outline(`<circle cx="${LENS.cx}" cy="${LENS.cy}" r="${LENS.r}" fill="none" stroke-width="15"/><path d="M308 758L246 836" stroke-width="26" fill="none"/>`) +
    `<path d="M308 758L246 836" stroke="${YELLOW}" stroke-width="12" stroke-linecap="round" fill="none"/><path d="M318 660Q338 646 362 648" stroke="${PAPER}" stroke-width="10" stroke-linecap="round" fill="none"/>`,
};
const PHONES = {
  shapes: '<path d="M240 700C226 520 322 422 427 422C532 422 628 520 614 700" fill="none" stroke-width="34"/><rect x="204" y="650" width="58" height="124" rx="26"/><rect x="592" y="650" width="58" height="124" rx="26"/>',
  art: `<path d="M240 700C226 520 322 422 427 422C532 422 628 520 614 700" fill="none" stroke="${INK}" stroke-width="30" stroke-linecap="round"/><path d="M240 700C226 520 322 422 427 422C532 422 628 520 614 700" fill="none" stroke="${YELLOW}" stroke-width="14" stroke-linecap="round"/>` +
    outline(`<rect x="204" y="650" width="58" height="124" rx="26" fill="${YELLOW}"/><rect x="592" y="650" width="58" height="124" rx="26" fill="${YELLOW}"/>`, 10),
};
const PENCIL = {
  shapes: '<g transform="rotate(-24 640 640)"><rect x="628" y="520" width="26" height="170" rx="6"/><path d="M628 690H654L641 722Z"/></g>',
  art: `<g transform="rotate(-24 640 640)">` + outline(`<rect x="628" y="520" width="26" height="150" fill="${YELLOW}"/><rect x="628" y="506" width="26" height="22" rx="6" fill="${PAPER}"/><path d="M628 670H654L641 704Z" fill="${PAPER}"/><path d="M636 692H646L641 704Z" fill="${INK}" stroke="none"/>`, 8) + '</g>',
};
const ROCKET = (() => {
  const body = 'M0 -92C32 -50 34 14 20 56H-20C-34 14 -32 -50 0 -92Z';
  const fins = 'M-20 28L-46 64L-20 56ZM20 28L46 64L20 56Z';
  return {
    shapes: `<g transform="translate(600 300) rotate(34)"><path d="${body}"/><path d="${fins}"/><path d="M-11 60L0 104L11 60Z"/></g>`,
    art: `<g transform="translate(600 300) rotate(34)">` + outline(`<path d="${fins}" fill="${YELLOW}"/><path d="${body}" fill="${PAPER}"/><circle cx="0" cy="-30" r="14" fill="${YELLOW}" stroke-width="8"/><path d="M-11 60L0 104L11 60Z" fill="${YELLOW}" stroke-width="8"/>`, 10) + '</g>',
  };
})();

export const POSES = [
  { name: 'calm', group: 'Reactions', title: 'Calm', note: 'Default. Steady eyes. Headers, About, serious pages.', face: {} },
  { name: 'happy', group: 'Reactions', title: 'Happy', note: 'Friendly. Welcome states, success messages, social avatars.', face: { eye: 'happy', brow: 'raised' } },
  { name: 'wink', group: 'Reactions', title: 'Wink', note: 'Playful. Tips, asides, newsletter sign-offs.', face: { eye: 'wink' } },
  { name: 'surprised', group: 'Reactions', title: 'Surprised', note: 'Surprise. Announcements, "did you know", new releases.', face: { eye: 'surprised', brow: 'raised' } },
  { name: 'angry', group: 'Reactions', title: 'Angry', note: 'Frustration. Errors, warnings, "what not to do" posts.', face: { brow: 'angry' } },
  { name: 'sunglasses', group: 'Style', title: 'Sunglasses', note: 'Cool and relaxed. Social posts, launches, weekends, thumbnails.', face: { sun: true } },
  { name: 'builder', group: 'Work', title: 'Builder', note: 'Hard hat on. Engineering wiki, project controls, construction content.', face: {}, ...prop(HAT.shapes, HAT.art) },
  { name: 'idea', group: 'Work', title: 'Idea', note: 'Lightbulb moment. Tips, announcements, new resources.', face: { eye: 'happy', brow: 'raised' }, ...prop(BULB.shapes, BULB.art) },
  { name: 'search', group: 'Work', title: 'Search', note: 'Looking closely. Search, empty results, research pages.', face: { brow: 'raised' }, ...prop(MAGNIFIER.shapes, MAGNIFIER.art) },
  { name: 'coding', group: 'Work', title: 'Coding', note: 'Headphones on. Developer wiki, tooling and automation guides.', face: {}, ...prop(PHONES.shapes, PHONES.art) },
  { name: 'sketching', group: 'Work', title: 'Sketching', note: 'Pencil behind the ear. Design wiki, drafts, "first idea" posts.', face: { eye: 'wink' }, ...prop(PENCIL.shapes, PENCIL.art) },
  { name: 'launch', group: 'Work', title: 'Launch', note: 'Shipped. Releases, new tools, "it is live" announcements.', face: { eye: 'happy', brow: 'raised' }, ...prop(ROCKET.shapes, ROCKET.art) },
];

// the artwork of one pose (everything inside its <svg>): the sticker edge round the head and the prop, the face, the prop
export function poseInner(p) {
  return edge() + (p.under || '') + face(p.face) + (p.over || '');
}
export const poseSvg = (p) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VB}" role="img" aria-label="Abdelfattah mascot: ${p.title}"><title>Abdelfattah mascot: ${p.title}</title>${poseInner(p)}</svg>\n`;
