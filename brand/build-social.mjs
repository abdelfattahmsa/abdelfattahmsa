// Social brand package: "Ask AM!" (LinkedIn + Instagram) and the personal profile, for every network.
// Avatars, wordmark lockups, banners/covers, post/story/carousel templates and highlight covers, all from the
// mascot, Tajawal, black / white / one yellow. Output: brand/social/** (SVG + PNG), brand/social/README.md.
// Run: npm run brand  (or node brand/build-social.mjs)
import fs from 'node:fs';
import path from 'node:path';
import { art, YELLOW } from './mascot-art.mjs';
import { ICONS, YELLOW as Y, layer } from '../build/lib/iconset.mjs';
import { outDir, tajawal, toPng, readJSON, root } from './lib.mjs';

const out = outDir('social');
const B = tajawal(700), M = tajawal(500);
const site = readJSON(path.join(root, 'src/data/site.json'));
const txt = (font, s, x, y, size, fill, { ls: lpx = 0, anchor = 'start' } = {}) => {
  const ls = lpx / size; // letter spacing is given in px, opentype wants em
  const w = font.getAdvanceWidth(s, size, { kerning: true, letterSpacing: ls });
  const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  return `<path fill="${fill}" d="${font.getPath(s, x0, y, size, { kerning: true, letterSpacing: ls }).toPathData(1)}"/>`;
};
const width = (font, s, size, ls = 0) => font.getAdvanceWidth(s, size, { kerning: true, letterSpacing: ls / size });
const head = (kind, x, y, h) => { const a = art[kind]; const [, , w, hh] = a.vb.split(' ').map(Number); return `<svg x="${x}" y="${y}" width="${(w * h / hh).toFixed(1)}" height="${h}" viewBox="${a.vb}">${a.inner}</svg>`; };
const headW = (h) => { const [, , w, hh] = art.head.vb.split(' ').map(Number); return w * h / hh; };
const doc = (W, H, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${body}</svg>\n`;
const save = async (rel, svg, W, scale = 1) => {
  const f = path.join(out, rel); fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f + '.svg', svg);
  await toPng(svg, f + '.png', { width: Math.round(W * scale) }, 96 * scale);
};
const sticker = (id, x, y, s) => { // an icon sticker at (x,y), s px
  const k = s / 24;
  const edge = layer(id, 'line', { stroke: '#fff', w: 5.4 }) + layer(id, 'acc', { stroke: '#fff', w: 5.4, fill: '#fff', fw: 5.4 });
  return `<g transform="translate(${x} ${y}) scale(${k})">${edge}${layer(id, 'line', { stroke: '#000', w: 2.2 })}${layer(id, 'acc', { stroke: '#000', w: 3.2, fill: '#000', fw: 3.2 })}${layer(id, 'acc', { stroke: Y, w: 1.7, fill: Y, fw: 1.7 })}</g>`;
};

// ---------- logos: Ask AM! wordmark, horizontal and stacked, three colourways
const ASK = 'Ask AM!';
async function logos() {
  const ways = { black: { ink: '#000', bg: null, head: 'headLight' }, white: { ink: '#fff', bg: null, head: 'head' }, yellow: { ink: '#000', bg: YELLOW, head: 'headFlat' } };
  for (const [n, c] of Object.entries(ways)) {
    const h = 200, fs_ = 150, w = width(B, ASK, fs_, -2);
    const hw = headW(h);
    const W = hw + 40 + w + 40, H = 240;
    let b = c.bg ? `<rect width="${W}" height="${H}" rx="40" fill="${c.bg}"/>` : '';
    b += head(c.head, 20, 20, h) + txt(B, ASK, hw + 50, 156, fs_, c.ink, { ls: -2 });
    b += `<circle cx="${(hw + 50 + w - 8).toFixed(0)}" cy="38" r="0" fill="${YELLOW}"/>`;
    await save(`logo/ask-am-horizontal-${n}`, doc(W, H, b), W, 1);
    // stacked
    const sw = Math.max(width(B, ASK, 170, -2), headW(300)) + 80, sh = 300 + 190 + 60;
    let s = c.bg ? `<rect width="${sw}" height="${sh}" rx="48" fill="${c.bg}"/>` : '';
    s += head(c.head, (sw - headW(300)) / 2, 30, 300) + txt(B, ASK, sw / 2, 300 + 160, 170, c.ink, { ls: -2, anchor: 'middle' });
    await save(`logo/ask-am-stacked-${n}`, doc(sw, sh, s), sw, 1);
  }
}

// ---------- avatars: the profile picture for every network (square, the platform rounds it)
async function avatars() {
  const sq = (inner, bg) => doc(1080, 1080, `<rect width="1080" height="1080" fill="${bg}"/>${inner}`);
  // Ask AM!: yellow, head big, a small speech bubble with "?" energy via the exclamation of the name below the face
  const h = 760;
  const askY = sq(head('headFlat', (1080 - headW(h)) / 2, 150, h) + txt(B, ASK, 540, 1010, 108, '#000', { ls: -2, anchor: 'middle' }), YELLOW);
  await save('avatar/ask-am-yellow', askY, 1080, 1);
  await save('avatar/ask-am-black', sq(head('head', (1080 - headW(h)) / 2, 150, h) + txt(B, ASK, 540, 1010, 108, '#fff', { ls: -2, anchor: 'middle' }), '#000'), 1080);
  // personal: the mascot head only
  const p = sq(head('headFlat', (1080 - headW(880)) / 2, 150, 880), YELLOW);
  await save('avatar/personal-yellow', p, 1080);
  await save('avatar/personal-black', sq(head('head', (1080 - headW(880)) / 2, 150, 880), '#000'), 1080);
  // round preview (what a circular crop shows)
  fs.writeFileSync(path.join(out, 'avatar/README.txt'), 'Square 1080 px originals: upload as is, the networks crop them round. The head sits inside the central 80 % so a circle crop never cuts it.\n');
}

// ---------- banners and covers: one layout, sized per network
// layout: black, yellow dot rule, name, line and the mascot on the right; the safe area keeps text clear of profile overlays
function banner({ W, H, name, line, safeLeft = 0.04, big = 1, avatarGap = 0, center = false }) {
  if (center) { // YouTube: everything inside the central safe area (1546 x 423)
    const hh = 400, fsN = 130, fsL = 44, gw = Math.max(width(B, name, fsN, -1), width(M, line, fsL)), gx = (W - (headW(hh) + 60 + gw)) / 2;
    let c = `<rect width="${W}" height="${H}" fill="#000"/>` + head('head', gx, (H - hh) / 2, hh);
    const tx = gx + headW(hh) + 60;
    c += txt(B, name, tx, H / 2 + 10, fsN, '#fff', { ls: -1 }) + `<rect x="${tx}" y="${H / 2 + 40}" width="90" height="8" fill="${YELLOW}"/>` + txt(M, line, tx, H / 2 + 120, fsL, '#a6a6a6');
    return doc(W, H, c);
  }
  let b = `<rect width="${W}" height="${H}" fill="#000"/>`;
  b += `<rect x="${W * 0.012}" y="${H * 0.04}" width="${W * 0.976}" height="${H * 0.92}" rx="${Math.min(W, H) * 0.06}" fill="none" stroke="#262626" stroke-width="${Math.max(2, H * 0.006)}"/>`;
  const hh = H * 0.82 * big, x = W - headW(hh) - W * 0.06;
  b += head('head', x, H * 0.09, hh);
  const px = W * safeLeft + avatarGap;
  const fsN = Math.min(H * 0.26 * big, 150), fsL = fsN * 0.38;
  b += txt(B, name, px, H * 0.5, fsN, '#fff', { ls: -1 });
  b += `<rect x="${px}" y="${H * 0.5 + fsN * 0.2}" width="${fsN * 0.7}" height="${Math.max(4, fsN * 0.06)}" fill="${YELLOW}"/>`;
  b += txt(M, line, px, H * 0.5 + fsN * 0.2 + fsL * 1.9, fsL, '#a6a6a6', { ls: 0.4 });
  return doc(W, H, b);
}
async function banners() {
  const askLine = 'Engineering, AI and building things. Ask me anything.';
  const meLine = 'Engineer, Entrepreneur, Creative';
  const items = [
    ['linkedin-company-cover-1128x191', 1128, 191, ASK, 'Engineering, AI and building things', { big: 1.25 }],
    ['linkedin-personal-cover-1584x396', 1584, 396, 'Abdelfattah M.', meLine, { avatarGap: 260 }],
    ['x-header-1500x500', 1500, 500, 'Abdelfattah M.', meLine, { avatarGap: 0 }],
    ['x-header-ask-am-1500x500', 1500, 500, ASK, askLine, {}],
    ['facebook-cover-820x312', 820, 312, ASK, askLine, { big: 0.9 }],
    ['youtube-banner-2560x1440', 2560, 1440, ASK, askLine, { center: true }],
    ['github-social-preview-1280x640', 1280, 640, 'Abdelfattah M.', meLine, {}],
    ['instagram-profile-link-card-1080x566', 1080, 566, ASK, 'Follow for engineering, AI and builds', {}],
  ];
  for (const [n, W, H, name, line, o] of items) await save(`banner/${n}`, banner({ W, H, name, line, ...o }), W, W < 1300 ? 2 : 1);
}

// ---------- Instagram: posts (1080x1350 and 1080x1080), carousel, story, quote, highlight covers
const POSTS = [
  { id: 'tip', kind: 'TIP', title: 'One idea, explained in a minute', icon: 'bulb' },
  { id: 'build', kind: 'BUILD LOG', title: 'What I shipped this week', icon: 'rocket' },
  { id: 'ask', kind: 'ASK AM!', title: 'Your question, answered', icon: 'chat' },
  { id: 'quote', kind: 'NOTE TO SELF', title: '“Write the quote here.”', icon: 'quote' },
];
const wrap = (font, s, size, max) => { const out = []; let cur = ''; for (const w of s.split(' ')) { const t = cur ? cur + ' ' + w : w; if (width(font, t, size) > max && cur) { out.push(cur); cur = w; } else cur = t; } if (cur) out.push(cur); return out; };
function post(W, H, p, mode = 'dark') {
  const dark = mode === 'dark', bg = dark ? '#000' : YELLOW, ink = dark ? '#fff' : '#000', sub = dark ? '#a6a6a6' : '#000';
  let b = `<rect width="${W}" height="${H}" fill="${bg}"/>`;
  b += `<rect x="28" y="28" width="${W - 56}" height="${H - 56}" rx="56" fill="none" stroke="${dark ? '#262626' : '#00000033'}" stroke-width="3"/>`;
  b += txt(M, p.kind, 96, 150, 34, dark ? YELLOW : '#000', { ls: 6 });
  const size = 104, lines = wrap(B, p.title, size, W - 192);
  const y0 = H * 0.36;
  lines.slice(0, 4).forEach((l, i) => { b += txt(B, l, 96, y0 + i * 118, size, ink, { ls: -2 }); });
  b += `<rect x="96" y="${y0 + Math.min(lines.length, 4) * 118 - 40}" width="96" height="10" fill="${dark ? YELLOW : '#000'}"/>`;
  b += sticker(p.icon, W - 96 - 150, 90, 150);
  b += head(dark ? 'head' : 'headFlat', W - 96 - headW(250), H - 96 - 250, 250);
  b += txt(B, ASK, 96, H - 110, 56, ink, { ls: -1 });
  b += txt(M, 'abdelfattah.site', 96, H - 56, 30, sub);
  return doc(W, H, b);
}
async function instagram() {
  for (const p of POSTS) {
    await save(`instagram/post-${p.id}-1080x1350`, post(1080, 1350, p), 1080);
    await save(`instagram/post-${p.id}-yellow-1080x1350`, post(1080, 1350, p, 'yellow'), 1080);
  }
  await save('instagram/post-square-1080x1080', post(1080, 1080, POSTS[0]), 1080);
  // carousel: cover, content, last (call to action)
  await save('instagram/carousel-1-cover', post(1080, 1350, { kind: 'SWIPE →', title: 'Your carousel title', icon: 'layers' }), 1080);
  const content = (() => { let b = `<rect width="1080" height="1350" fill="#000"/><rect x="28" y="28" width="1024" height="1294" rx="56" fill="none" stroke="#262626" stroke-width="3"/>`;
    b += txt(B, '01', 96, 200, 120, YELLOW, { ls: -2 }) + txt(B, 'Point headline', 96, 360, 88, '#fff', { ls: -2 });
    wrap(M, 'Body text goes here. Short sentences, one idea per slide, plenty of space.', 52, 880).forEach((l, i) => { b += txt(M, l, 96, 460 + i * 70, 52, '#a6a6a6'); });
    b += head('head', 1080 - 96 - headW(200), 1350 - 96 - 200, 200) + txt(B, ASK, 96, 1260, 48, '#fff'); return doc(1080, 1350, b); })();
  await save('instagram/carousel-2-content', content, 1080);
  const last = (() => { let b = `<rect width="1080" height="1350" fill="${YELLOW}"/>`;
    b += head('headFlat', (1080 - headW(560)) / 2, 150, 560) + txt(B, 'Follow for more', 540, 900, 92, '#000', { ls: -2, anchor: 'middle' }) + txt(B, ASK, 540, 1020, 120, '#000', { ls: -2, anchor: 'middle' }) + txt(M, 'Save · Share · Ask a question in the comments', 540, 1110, 40, '#000', { anchor: 'middle' }); return doc(1080, 1350, b); })();
  await save('instagram/carousel-3-follow', last, 1080);
  // story 1080x1920 (safe area: keep text between y 250 and 1670)
  const story = (() => { let b = `<rect width="1080" height="1920" fill="#000"/>`;
    b += head('head', (1080 - headW(620)) / 2, 330, 620) + txt(B, 'Ask AM!', 540, 1180, 190, '#fff', { ls: -3, anchor: 'middle' }) + `<rect x="${540 - 60}" y="1230" width="120" height="10" fill="${YELLOW}"/>` + txt(M, 'Send me your question', 540, 1330, 56, '#a6a6a6', { anchor: 'middle' });
    return doc(1080, 1920, b); })();
  await save('instagram/story-1080x1920', story, 1080);
  // highlight covers 1080x1920 (the circle crop shows the centre): yellow disc, sticker icon
  const hl = [['about', 'user'], ['work', 'briefcase'], ['ideas', 'bulb'], ['builds', 'rocket'], ['ask', 'chat'], ['learn', 'book']];
  for (const [n, icon] of hl) await save(`instagram/highlight-${n}`, doc(1080, 1920, `<rect width="1080" height="1920" fill="#000"/><circle cx="540" cy="960" r="420" fill="${YELLOW}"/>${sticker(icon, 540 - 230, 960 - 230, 460)}`), 540, 1);
}

// ---------- LinkedIn post image (1200x627) and email signature mark
async function linkedin() {
  const w = 1200, h = 627;
  let b = `<rect width="${w}" height="${h}" fill="#000"/><rect x="18" y="18" width="${w - 36}" height="${h - 36}" rx="40" fill="none" stroke="#262626" stroke-width="3"/>`;
  b += txt(M, 'ASK AM!', 72, 110, 28, YELLOW, { ls: 6 });
  wrap(B, 'Headline of the post goes here', 82, 700).forEach((l, i) => { b += txt(B, l, 72, 240 + i * 96, 82, '#fff', { ls: -1.5 }); });
  b += head('head', w - 72 - headW(380), h - 40 - 380, 380) + txt(M, 'abdelfattah.site', 72, h - 60, 28, '#a6a6a6');
  await save('linkedin/post-image-1200x627', doc(w, h, b), w);
  await save('linkedin/company-logo-300x300', doc(300, 300, `<rect width="300" height="300" fill="${YELLOW}"/>${head('headFlat', (300 - headW(250)) / 2, 36, 250)}`), 300);
}

await logos(); await avatars(); await banners(); await instagram(); await linkedin();

fs.writeFileSync(path.join(out, 'README.md'), `# Social brand package: Ask AM! and Abdelfattah M.

Everything here is made from the mascot, Tajawal, black, white and the one yellow (${YELLOW}). Rebuild with \`npm run brand\`.

## Pages
| | Name | Handle (suggested) | Type |
|---|---|---|---|
| LinkedIn | Ask AM! | /company/ask-am | Company page |
| Instagram | Ask AM! | @askam (or @ask.am.official) | Creator account |
| LinkedIn | Abdelfattah Aboulfoutoh, MSc. | personal profile | use \`avatar/personal-yellow.png\` and \`banner/linkedin-personal-cover-1584x396.png\` |

Use the same handle on every network (try \`askam\`, then \`ask.am\`, \`askam.official\`); the personal accounts use \`abdelfattahmsa\`.

## Files
- \`logo/\` horizontal and stacked Ask AM! lockups in black, white and yellow (SVG + PNG, transparent except yellow).
- \`avatar/\` 1080 px square profile pictures (Ask AM! and personal, yellow and black). The head stays inside the central 80 % so round crops never cut it.
- \`banner/\` LinkedIn company (1128 x 191) and personal (1584 x 396) covers, X (1500 x 500), Facebook (820 x 312), YouTube (2560 x 1440, text kept in the safe area), GitHub social preview (1280 x 640), Instagram link card.
- \`instagram/\` post templates 1080 x 1350 (tip, build log, ask, quote; dark and yellow), a square post, a 3-slide carousel, a story (1080 x 1920) and six highlight covers (about, work, ideas, builds, ask, learn).
- \`linkedin/\` company logo 300 x 300 and a post image 1200 x 627.
Each PNG has an editable SVG next to it (text is outlined, so no font is needed).

## Bios
**Ask AM! (LinkedIn about, 2 lines)**
Ask AM! is where Abdelfattah Aboulfoutoh, an engineer, entrepreneur and creative, answers questions on engineering, AI and building products: short, practical and honest. Questions welcome in English and Arabic.

**Ask AM! (Instagram, under 150 characters)**
Engineering, AI and building things.
Ask me anything 👇
abdelfattah.site

**Abdelfattah (LinkedIn headline)**
Engineer, Entrepreneur, Creative | MSc. | Building with AI

## Voice
Plain, warm, direct. One idea per post. Answer the question in the first line. The mascot reacts instead of using emoji walls. English and Arabic posts use the same layouts (Arabic: mirror the layout, keep Tajawal).

## Content pillars
1. **Ask AM!**: a viewer's question, answered in a minute.
2. **Build log**: what I shipped this week, with a screenshot.
3. **Tips**: one tool, one workflow, one idea.
4. **Notes**: short thoughts from the knowledge hub, linking back to abdelfattah.site.

## Hashtags
#AskAM #Engineering #AI #BuildInPublic #Entrepreneurship #ProductDesign #عربي_تقني

## Rules
- Yellow is the accent, never the text colour on white. On yellow, text is black.
- Keep the mascot sticker edge (white outline) on dark backgrounds; on yellow use the flat head.
- Do not stretch, recolour or outline the lockups, keep clear space equal to half the head's width.
`);
console.log('social package → brand/social');
