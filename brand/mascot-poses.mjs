// Pose set for the mascot. Built on mascot-art.mjs; NOT used on the website (brand library only).
// Run: node brand/mascot-poses.mjs   -> brand/mascot/poses/*.svg, png/, and poses.html + poses sheet source
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { face, body, edge, bustParts, line, INK, PAPER, YELLOW } from './mascot-art.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'brand/mascot/poses');
fs.mkdirSync(path.join(out, 'png'), { recursive: true });

// shared canvas for every pose: 276 x 314 incl. sticker edge, so poses line up
const VB = '-12 -62 276 314';

const hand = (x, y, r = 14) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${PAPER}"/>`;
// a sleeve is a fat round-capped line; its white sticker edge is the same line, wider
const sleeve = (x1, y1, x2, y2) => `M${x1} ${y1}L${x2} ${y2}`;
const sleeveEdge = (d) => `<path d="${d}" fill="none" stroke="${PAPER}" stroke-width="44" stroke-linecap="round"/>`;
const sleeveInk = (d) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="26" stroke-linecap="round"/>`;
const handEdge = (x, y, r = 14) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${PAPER}" stroke="${PAPER}" stroke-width="18"/>`;
const ring = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${INK}" stroke-width="6"/>`;

// each pose: { name, title, note, under (drawn before body), over (after face), edge (extra sticker-edge shapes), face opts, tie }
const poses = [
  { name: 'calm', title: 'Calm', note: 'Default. Closed mouth, steady eyes. Headers, About, serious pages.', face: {} },
  { name: 'smile', title: 'Smile', note: 'Friendly. Welcome states, success messages, social avatars.', face: { mouth: 'smile', eyes: 'happy' } },
  {
    name: 'wave', title: 'Wave', note: 'Hello. Greetings, onboarding, newsletter sign-off.', face: { mouth: 'smile' },
    edgeExtra: sleeveEdge(sleeve(200, 214, 220, 132)) + handEdge(222, 118, 17),
    over: () => sleeveInk(sleeve(200, 214, 220, 132)) + `<g ${line}>${hand(222, 118, 17)}<path d="M214 100v-8M222 98v-10M230 100v-8" fill="none" stroke-width="5"/></g><path d="M244 96q10 14 0 28M254 90q16 20 0 40" fill="none" stroke="${YELLOW}" stroke-width="5" stroke-linecap="round"/>`,
  },
  {
    name: 'thinking', title: 'Thinking', note: 'Working it out. Research, guides, "how it works" sections.', face: { eyes: 'up', brows: 'raised' },
    edgeExtra: sleeveEdge(sleeve(40, 222, 100, 186)) + handEdge(110, 176, 18),
    over: () => sleeveInk(sleeve(40, 222, 100, 186)) + `<g ${line}>${hand(110, 176, 18)}</g><g fill="${YELLOW}" ${line}><circle cx="208" cy="40" r="7" stroke-width="3"/><circle cx="224" cy="18" r="10" stroke-width="3"/></g>`,
  },
  { name: 'builder', title: 'Builder', note: 'Hard hat on. Engineering wiki, project controls, construction content.', face: { hat: true, mouth: 'smile' }, tie: true },
  {
    name: 'searching', title: 'Searching', note: 'Looking closely. Search, empty results, research pages.', face: { eyes: 'up', brows: 'raised' },
    edgeExtra: sleeveEdge(sleeve(204, 220, 178, 176)) + `<circle cx="158" cy="146" r="38" fill="${PAPER}" stroke="${PAPER}" stroke-width="18"/>`,
    over: () => sleeveInk(sleeve(204, 220, 178, 176)) + `<g ${line}><circle cx="158" cy="146" r="36" fill="none" stroke-width="6"/><path d="M140 138Q144 126 158 122" fill="none" stroke="${YELLOW}" stroke-width="5"/>${hand(180, 172, 13)}</g>`,
  },
  {
    name: 'laptop', title: 'Building', note: 'At the keyboard. Developer wiki, build guides, behind-the-scenes posts.', face: { mouth: 'smile' },
    edgeExtra: `<rect x="60" y="190" width="120" height="70" rx="9" fill="${PAPER}" stroke="${PAPER}" stroke-width="18"/>`,
    over: () => `<g ${line}><rect x="60" y="190" width="120" height="70" rx="9" fill="${PAPER}"/><circle cx="120" cy="222" r="11" fill="${YELLOW}" stroke-width="4"/></g>`,
  },
  {
    name: 'thumbs-up', title: 'Thumbs up', note: 'Approved. Success, confirmations, "good to go".', face: { mouth: 'smile', eyes: 'happy' },
    edgeExtra: sleeveEdge(sleeve(202, 222, 208, 160)) + handEdge(208, 146, 17) + `<rect x="196" y="108" width="14" height="30" rx="7" fill="${PAPER}" stroke="${PAPER}" stroke-width="18"/>`,
    over: () => sleeveInk(sleeve(202, 222, 208, 160)) + `<g ${line}><rect x="196" y="108" width="14" height="32" rx="7" fill="${PAPER}"/>${hand(208, 148, 17)}</g>`,
  },
  {
    name: 'idea', title: 'Idea', note: 'Lightbulb moment. Tips, announcements, new resources.', face: { mouth: 'smile', brows: 'raised' },
    edgeExtra: `<circle cx="120" cy="-14" r="20" fill="${PAPER}" stroke="${PAPER}" stroke-width="12"/>`,
    over: () => `<g stroke-linecap="round"><path d="M84 -12l-14 -4M156 -12l14 -4M92 -40l-8 -10M148 -40l8 -10M120 -50v-10" fill="none" stroke="${YELLOW}" stroke-width="5"/></g><g ${line}><circle cx="120" cy="-14" r="18" fill="${YELLOW}"/><rect x="110" y="2" width="20" height="10" rx="3" fill="${PAPER}" stroke-width="4"/></g>`,
  },
  { name: 'glasses', title: 'Glasses', note: 'Glasses on (they appear in the reference photo). Reading, research, detail work.', face: { glasses: true, mouth: 'smile' } },
];

function build(p) {
  const f = face(p.face);
  const stick = edge(bustParts + (p.edgeExtra ? '' : ''), 18) + (p.edgeExtra || '');
  const hatEdge = p.face.hat ? `<path d="M54 82C54 38 84 16 120 16C156 16 186 38 186 82Z" fill="${PAPER}" stroke="${PAPER}" stroke-width="18" stroke-linejoin="round"/><path d="M42 82H198V94H42Z" fill="${PAPER}" stroke="${PAPER}" stroke-width="18" stroke-linejoin="round"/>` : '';
  const inner = stick + hatEdge + body(YELLOW) + f + (p.over ? p.over() : '');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VB}" role="img" aria-label="Abdelfattah mascot: ${p.title}"><title>Abdelfattah mascot: ${p.title}</title>${inner}</svg>\n`;
}

const cards = [];
for (const p of poses) {
  const svg = build(p);
  fs.writeFileSync(path.join(out, `am-pose-${p.name}.svg`), svg);
  await sharp(Buffer.from(svg), { density: 384 }).resize({ height: 1024 }).png({ compressionLevel: 9 }).toFile(path.join(out, 'png', `am-pose-${p.name}-1024.png`));
  cards.push({ ...p });
}

const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>Mascot poses</title>
<style>*{box-sizing:border-box}body{margin:0;padding:40px;background:#000;color:#fff;font-family:Tajawal,system-ui,sans-serif}
h1{font-size:28px;margin:0 0 6px}.sub{color:#a6a6a6;margin:0 0 28px}
.g{display:grid;grid-template-columns:repeat(5,1fr);gap:18px;max-width:1500px}
.c{background:#0b0b0b;border:1px solid #252525;border-radius:28px;padding:16px}
.h{background:#000;border-radius:20px;display:grid;place-items:center;height:250px}.h img{height:230px}
h2{font-size:17px;margin:12px 0 4px}p{margin:0;color:#a6a6a6;font-size:12.5px;line-height:1.45;min-height:54px}</style>
<body><h1>Mascot poses</h1><p class="sub">Ten poses on one shared canvas. Brand library only: not used on the website.</p>
<div class="g">${cards.map((p) => `<div class="c"><div class="h"><img src="am-pose-${p.name}.svg" alt=""></div><h2>${p.title}</h2><p>${p.note}</p></div>`).join('')}</div></body></html>`;
fs.writeFileSync(path.join(out, 'poses.html'), html);
console.log('poses built:', poses.length);
