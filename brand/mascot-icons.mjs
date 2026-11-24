// Contact icons in the mascot's style: thick black outline, white fill, a white sticker edge round the shape
// (a thin grey ring on light backgrounds) and yellow as the one accent. 120 x 120 grid.
import { INK, PAPER, YELLOW } from './mascot-art.mjs';

const W = 9; // outline weight
const BUBBLE = 'M22 34Q22 20 36 20H84Q98 20 98 34V68Q98 82 84 82H58L38 100V82H36Q22 82 22 68Z';
const HANDSET = 'M34 20Q22 20 22 33C22 72 50 100 88 100Q100 100 100 88V78Q100 71 93 69L78 65Q72 64 68 68L62 75C53 71 47 65 43 56L50 50Q55 46 54 40L50 26Q48 20 41 20Z';
const ENVELOPE = 'M20 30H100Q106 30 106 36V86Q106 92 100 92H20Q14 92 14 86V36Q14 30 20 30Z';

const out = (d, c = INK, w = W) => `<path d="${d}" fill="${PAPER}" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const edge = (d, light) =>
  (light ? `<path d="${d}" fill="#cfcfcf" stroke="#cfcfcf" stroke-width="31" stroke-linejoin="round"/>` : '') +
  `<path d="${d}" fill="${PAPER}" stroke="${PAPER}" stroke-width="26" stroke-linejoin="round"/>`;

const art = {
  chat: (light) =>
    edge(BUBBLE, light) + out(BUBBLE) +
    [46, 60, 74].map((x) => `<circle cx="${x}" cy="51" r="6.5" fill="${YELLOW}" stroke="${INK}" stroke-width="4.5"/>`).join(''),
  ask: (light) =>
    edge(BUBBLE, light) + out(BUBBLE) +
    `<path d="M60 31Q62.5 46 77 51Q62.5 56 60 71Q57.5 56 43 51Q57.5 46 60 31Z" fill="${YELLOW}" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>`,
  call: (light) =>
    edge(HANDSET, light) + out(HANDSET) +
    `<path d="M70 30Q88 32 90 50M70 16Q102 18 106 52" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/>` +
    `<path d="M70 30Q88 32 90 50M70 16Q102 18 106 52" fill="none" stroke="${YELLOW}" stroke-width="5" stroke-linecap="round"/>`,
  mail: (light) =>
    edge(ENVELOPE, light) + out(ENVELOPE) +
    `<path d="M18 38L58 68Q60 70 62 68L102 38" fill="none" stroke="${INK}" stroke-width="${W}" stroke-linejoin="round" stroke-linecap="round"/>` +
    `<circle cx="60" cy="78" r="9" fill="${YELLOW}" stroke="${INK}" stroke-width="5"/>`,
};

export const ICON_VB = '-8 -8 136 136';
// { chat: { vb, inner, innerLight }, ... }
export const ICONS = Object.fromEntries(Object.entries(art).map(([id, fn]) => [id, { vb: ICON_VB, inner: fn(false), innerLight: fn(true) }]));
