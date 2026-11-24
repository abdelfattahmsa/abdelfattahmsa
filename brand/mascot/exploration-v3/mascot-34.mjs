// Mascot v3, 3/4 view facing right, built to the proportions and perspective measured on the second reference
// (head 395 wide x 516 tall = 1.31; near eye at 50% / 38%, far eye at 86% / 33% and smaller; ear at the left, 38-61% down;
// nose tip at 82% / 48%; wide grin centred at 67% / 69%, 41% of the head wide; beard from the near ear to the chin).
// Drawn in that reference's pixel space (viewBox 145 308 430 597). The hair is his orange-mascot hair, fitted to the dome.
// Concept only.
export const VB34 = '145 308 430 597';
export const INK = '#000', PAPER = '#fff', YELLOW = '#ffcc00';

// smooth closed path through points (Catmull-Rom to cubic Beziers)
export function smooth(pts, t = 0.5) {
  const n = pts.length; let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + ((p2[0] - p0[0]) * t) / 3, p1[1] + ((p2[1] - p0[1]) * t) / 3];
    const c2 = [p2[0] - ((p3[0] - p1[0]) * t) / 3, p2[1] - ((p3[1] - p1[1]) * t) / 3];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d + 'Z';
}
// head outline (centre line of the thick outline), clockwise from the top
const SKULL = smooth([[348, 387], [418, 401], [468, 440], [503, 498], [528, 562], [540, 640], [541, 720], [532, 790], [506, 840], [466, 870], [414, 880], [362, 877], [312, 862], [268, 836], [234, 798], [216, 752], [212, 700], [208, 640], [208, 580], [214, 520], [232, 460], [262, 418], [300, 396]]);
// beard: everything below this boundary (clipped to the head), round the mouth, up the far cheek
const BEARD_ZONE = 'M190 790L232 748C282 724 322 702 352 692C364 664 420 646 468 646C494 648 508 656 520 642C532 630 541 612 545 590L560 920L190 920Z';
const CRESCENT = 'M233 706C238 792 300 862 376 882C320 842 262 782 247 706Z';
const EAR = 'M236 566C196 546 158 580 163 632C168 678 206 702 238 688Z';
const EAR_IN = 'M214 600C200 618 204 640 220 654';
const HAIR = 'M212 566L204 522Q188 508 187 470Q202 476 214 468Q205 446 222 420Q246 392 282 378Q300 366 318 362Q328 350 336 340Q346 336 344 328Q360 340 370 352Q396 350 410 360Q420 348 418 338Q434 346 442 362Q474 376 504 416Q532 428 544 458Q556 472 550 494Q540 490 534 494Q544 512 540 548L538 590L514 524C510 466 480 436 446 434C426 434 414 446 394 442C374 438 360 420 338 422C308 426 286 462 266 498C254 520 244 544 236 570Z';

const eye = (cx, cy, rx, ry, rot, hs) => `<g transform="translate(${cx} ${cy}) rotate(${rot})"><ellipse rx="${rx}" ry="${ry}" fill="${INK}"/><path d="M${-0.55 * rx} ${-0.5 * ry}L${0.15 * rx} ${-0.2 * ry}L${-0.45 * rx} ${0.12 * ry}Z" fill="${PAPER}" transform="scale(${hs})"/></g>`;
const brow = (d, w) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round"/>`;

const grin = () => `
<path d="M341 698C376 680 470 662 509 674C516 722 472 776 414 780C364 778 338 744 341 698Z" fill="${PAPER}"/>
<path d="M357 704C386 690 466 674 497 684C503 722 468 766 412 768C374 766 354 738 357 704Z" fill="${INK}"/>
<g fill="${PAPER}"><rect x="370" y="692" width="30" height="25" rx="5" transform="rotate(-9 385 704)"/><rect x="403" y="684" width="30" height="25" rx="5" transform="rotate(-3 418 696)"/><rect x="436" y="683" width="30" height="25" rx="5" transform="rotate(3 451 695)"/><rect x="468" y="686" width="24" height="24" rx="5" transform="rotate(9 480 698)"/></g>
<ellipse cx="420" cy="750" rx="30" ry="10" fill="${PAPER}" transform="rotate(-10 420 750)"/>`;

const sunglasses = () => `
<g fill="${INK}" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round">
 <path d="M300 534L548 516" fill="none" stroke-width="13"/>
 <ellipse cx="357" cy="574" rx="56" ry="52" transform="rotate(-6 357 574)"/>
 <ellipse cx="500" cy="548" rx="46" ry="36" transform="rotate(-8 500 548)"/>
 <path d="M408 562L452 552" fill="none" stroke-width="13"/>
 <path d="M304 548L236 562" fill="none" stroke-width="13"/>
</g>
<g fill="${PAPER}"><path d="M318 548L348 544L326 590Z"/><path d="M474 530L494 528L480 556Z"/></g>`;

export function head34({ sun = false, grinOn = true } = {}) {
  return `
<g stroke-linejoin="round" stroke-linecap="round">
 <path d="${EAR}" fill="${PAPER}" stroke="${INK}" stroke-width="22"/>
 <path d="${EAR_IN}" fill="none" stroke="${INK}" stroke-width="9"/>
 <clipPath id="skull34"><path d="${SKULL}"/></clipPath>
 <path d="${SKULL}" fill="${PAPER}"/>
 <g clip-path="url(#skull34)"><path d="${BEARD_ZONE}" fill="${INK}"/><path d="${CRESCENT}" fill="${PAPER}"/></g>
 <path d="${SKULL}" fill="none" stroke="${INK}" stroke-width="24"/>
</g>
${brow('M312 530Q358 494 414 520', 15)}${brow('M444 526Q472 506 502 514', 12)}
${sun ? sunglasses() : eye(357, 574, 25, 32, -6, 1) + eye(476, 552, 14, 24, -8, 0.8)}
<path d="M446 576C462 590 488 604 484 624C480 640 456 642 436 632" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
${grinOn ? grin() : ''}
<path d="${HAIR}" fill="${INK}"/>`;
}
