// Pose set for the mascot (16 poses). Built on mascot-art.mjs; NOT used on the website (brand library only).
// Run: node brand/mascot-poses.mjs   -> brand/mascot/poses/*.svg, png/, and poses.html (contact sheet source)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { face, body, edge, bustParts, line, INK, PAPER, YELLOW } from './mascot-art.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'brand/mascot/poses');
fs.mkdirSync(path.join(out, 'png'), { recursive: true });

// shared canvas for every pose, sticker edge included, so poses line up and swap without shifting
const VB = '-12 -62 276 314';
const GREY = '#a6a6a6';

// ---- arms: a round-capped black sleeve with a white sticker edge, a white shirt cuff at the wrist, then a hand
const P = (x1, y1, x2, y2) => `M${x1} ${y1}L${x2} ${y2}`;
const lerp = (a, b, t) => a + (b - a) * t;
function arm(x1, y1, x2, y2) {
  // edge (wide white), sleeve (black), cuff (black ring + white band) near the hand
  const d = P(x1, y1, x2, y2);
  const c0 = [lerp(x1, x2, 0.8), lerp(y1, y2, 0.8)], c1 = [lerp(x1, x2, 0.9), lerp(y1, y2, 0.9)];
  const cuff = P(c0[0], c0[1], c1[0], c1[1]);
  return {
    edge: `<path d="${d}" fill="none" stroke="${PAPER}" stroke-width="44" stroke-linecap="round"/>`,
    ink: `<path d="${d}" fill="none" stroke="${INK}" stroke-width="26" stroke-linecap="round"/><path d="${cuff}" fill="none" stroke="${INK}" stroke-width="30"/><path d="${cuff}" fill="none" stroke="${PAPER}" stroke-width="20"/>`,
  };
}
const handEdge = (x, y, r = 15) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${PAPER}" stroke="${PAPER}" stroke-width="18"/>`;
// kinds: open (fingers up), fist, grip
function hand(x, y, kind = 'fist', r = 15) {
  const base = `<circle cx="${x}" cy="${y}" r="${r}" fill="${PAPER}"/>`;
  if (kind === 'open') return `<g ${line}>${base}<path d="M${x - 9} ${y - r + 2}v-12M${x - 3} ${y - r}v-15M${x + 3} ${y - r}v-15M${x + 9} ${y - r + 2}v-12" fill="none" stroke-width="5"/></g>`;
  if (kind === 'fist') return `<g ${line}>${base}<path d="M${x - 6} ${y - 3}h12M${x - 6} ${y + 4}h12" fill="none" stroke-width="3.5"/></g>`;
  return `<g ${line}>${base}</g>`;
}
const R_SHOULDER = [204, 218];
const L_SHOULDER = [38, 224];

// ---- props held in front of the chest: drawn on the suit, no extra sticker edge needed
const page = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="${PAPER}"/>`;
const bar = (x, y, w, h, c = INK) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" stroke="none"/>`;
const hands2 = (y = 246) => hand(64, y, 'grip', 13) + hand(176, y, 'grip', 13);

const poses = [
  // ---- the core ten (refined)
  { name: 'calm', group: 'Core', title: 'Calm', note: 'Default. Closed mouth, steady eyes. Headers, About, serious pages.', face: {} },
  { name: 'smile', group: 'Core', title: 'Smile', note: 'Friendly. Welcome states, success messages, social avatars.', face: { mouth: 'smile', eyes: 'happy' } },
  {
    name: 'wave', group: 'Core', title: 'Wave', note: 'Hello. Greetings, onboarding, newsletter sign-off.', face: { mouth: 'smile' },
    build: () => { const a = arm(...R_SHOULDER, 224, 138); return { edge: a.edge + handEdge(226, 120, 17), ink: a.ink + hand(226, 120, 'open', 17) + `<path d="M246 98q10 14 0 30M256 90q16 22 0 46" fill="none" stroke="${YELLOW}" stroke-width="5" stroke-linecap="round"/>` }; },
  },
  {
    name: 'thinking', group: 'Core', title: 'Thinking', note: 'Working it out. Research, guides, "how it works" sections.', face: { eyes: 'up', brows: 'raised' },
    build: () => { const a = arm(...L_SHOULDER, 96, 192); return { edge: a.edge + handEdge(110, 176, 18), ink: a.ink + hand(110, 176, 'fist', 18) + `<g fill="${YELLOW}" ${line}><circle cx="208" cy="40" r="7" stroke-width="3"/><circle cx="226" cy="16" r="11" stroke-width="3"/></g>` }; },
  },
  { name: 'builder', group: 'Core', title: 'Builder', note: 'Hard hat on. Engineering wiki, project controls, construction content.', face: { hat: true, mouth: 'smile' } },
  {
    name: 'searching', group: 'Core', title: 'Searching', note: 'Looking closely. Search, empty results, research pages.', face: { eyes: 'up', brows: 'raised' },
    build: () => {
      const a = arm(216, 240, 208, 214);
      const handle = P(184, 172, 204, 204);
      return {
        edge: a.edge + `<circle cx="158" cy="146" r="38" fill="${PAPER}" stroke="${PAPER}" stroke-width="18"/><path d="${handle}" stroke="${PAPER}" stroke-width="30" stroke-linecap="round"/>` + handEdge(206, 206, 14),
        ink: a.ink + `<path d="${handle}" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><g ${line}><circle cx="158" cy="146" r="36" fill="none" stroke-width="6"/><path d="M140 138Q144 126 158 122" fill="none" stroke="${YELLOW}" stroke-width="5"/></g>` + hand(206, 206, 'grip', 14),
      };
    },
  },
  {
    name: 'laptop', group: 'Core', title: 'Building', note: 'At the keyboard. Developer wiki, build guides, behind-the-scenes posts.', face: { mouth: 'smile' },
    build: () => ({ edge: '', ink: `<g ${line}>${page(60, 190, 120, 70)}<circle cx="120" cy="222" r="11" fill="${YELLOW}" stroke-width="4"/></g>${hands2(250)}` }),
  },
  {
    name: 'thumbs-up', group: 'Core', title: 'Thumbs up', note: 'Approved. Success, confirmations, "good to go".', face: { mouth: 'smile', eyes: 'happy' },
    build: () => {
      const a = arm(...R_SHOULDER, 210, 168);
      const thumb = `<rect x="201" y="112" width="15" height="40" rx="7.5"/>`;
      return {
        edge: a.edge + handEdge(210, 156, 18) + `<g fill="${PAPER}" stroke="${PAPER}" stroke-width="18">${thumb}</g>`,
        ink: a.ink + `<g ${line}><g fill="${PAPER}">${thumb}</g></g>` + hand(210, 156, 'fist', 18),
      };
    },
  },
  {
    name: 'idea', group: 'Core', title: 'Idea', note: 'Lightbulb moment. Tips, announcements, new resources.', face: { mouth: 'smile', brows: 'raised' },
    build: () => ({
      edge: `<circle cx="120" cy="-14" r="20" fill="${PAPER}" stroke="${PAPER}" stroke-width="12"/>`,
      ink: `<g stroke-linecap="round"><path d="M84 -12l-14 -4M156 -12l14 -4M92 -40l-8 -10M148 -40l8 -10M120 -50v-10" fill="none" stroke="${YELLOW}" stroke-width="5"/></g><g ${line}><circle cx="120" cy="-14" r="18" fill="${YELLOW}"/><rect x="110" y="2" width="20" height="10" rx="3" fill="${PAPER}" stroke-width="4"/></g>`,
    }),
  },
  { name: 'glasses', group: 'Core', title: 'Glasses', note: 'Glasses on (they appear in the reference photo). Reading, detail work.', face: { glasses: true, mouth: 'smile' } },

  // ---- design
  {
    name: 'pencil', group: 'Design', title: 'Sketching', note: 'Pencil up. Design wiki, drafts, "first idea" posts.', face: { mouth: 'smile', eyes: 'up' },
    build: () => {
      const a = arm(...R_SHOULDER, 216, 168);
      const pencil = `<g transform="rotate(22 218 150)"><rect x="211" y="62" width="14" height="96" fill="${YELLOW}"/><rect x="211" y="52" width="14" height="12" rx="4" fill="${PAPER}"/><path d="M211 158h14l-7 20z" fill="${PAPER}"/><path d="M215.5 170h5l-2.5 8z" fill="${INK}" stroke="none"/></g>`;
      const pencilEdge = `<g transform="rotate(22 218 150)"><rect x="211" y="52" width="14" height="108" rx="4" fill="${PAPER}" stroke="${PAPER}" stroke-width="18"/><path d="M211 158h14l-7 20z" fill="${PAPER}" stroke="${PAPER}" stroke-width="18" stroke-linejoin="round"/></g>`;
      return { edge: a.edge + pencilEdge + handEdge(214, 160, 16), ink: a.ink + `<g ${line}>${pencil}</g>` + hand(214, 160, 'grip', 16) };
    },
  },
  {
    name: 'palette', group: 'Design', title: 'Colour', note: 'Choosing colours. Design wiki, brand and colour posts.', face: { mouth: 'smile' },
    build: () => {
      const a = arm(...L_SHOULDER, 50, 232);
      const pal = `<path d="M30 168C30 140 62 124 96 128C128 132 130 156 112 164C100 169 104 182 114 186C124 192 112 212 80 212C48 212 30 196 30 168Z"/>`;
      const T = 'translate(2 78) scale(.85)';
      return {
        edge: a.edge + `<g transform="${T}" fill="${PAPER}" stroke="${PAPER}" stroke-width="21" stroke-linejoin="round">${pal}</g>` + handEdge(48, 238, 13),
        ink: a.ink + `<g transform="${T}" ${line}><g fill="${PAPER}">${pal}</g><circle cx="50" cy="156" r="7" fill="${YELLOW}" stroke-width="3"/><circle cx="72" cy="146" r="7" fill="${INK}" stroke-width="3"/><circle cx="96" cy="148" r="7" fill="${GREY}" stroke-width="3"/><circle cx="104" cy="170" r="7" fill="${PAPER}" stroke-width="3"/></g>` + hand(48, 240, 'grip', 13),
      };
    },
  },
  {
    name: 'tablet', group: 'Design', title: 'Drawing', note: 'Vector curve on a tablet. Design wiki, UI and logo posts.', face: { mouth: 'smile' },
    build: () => ({
      edge: '',
      ink: `<g ${line}>${page(56, 188, 128, 72)}<path d="M72 244C92 200 118 252 152 206" fill="none" stroke-width="4.5"/><path d="M72 244L92 214M152 206L170 218" fill="none" stroke="${GREY}" stroke-width="2.5"/><rect x="68" y="240" width="9" height="9" fill="${YELLOW}" stroke-width="3"/><rect x="148" y="202" width="9" height="9" fill="${YELLOW}" stroke-width="3"/></g>${hands2(252)}`,
    }),
  },

  // ---- research
  {
    name: 'reading', group: 'Research', title: 'Reading', note: 'Deep in a paper. Research page, literature notes.', face: { eyes: 'up', brows: 'raised' },
    build: () => ({
      edge: '',
      ink: `<g ${line}><path d="M120 200Q86 190 52 200V258Q86 248 120 258Z" fill="${PAPER}"/><path d="M120 200Q154 190 188 200V258Q154 248 120 258Z" fill="${PAPER}"/><path d="M62 214Q88 208 110 214M62 226Q88 220 110 226M130 214Q152 208 178 214M130 226Q152 220 178 226" fill="none" stroke="${GREY}" stroke-width="3"/></g>${hands2(254)}`,
    }),
  },
  {
    name: 'chart', group: 'Research', title: 'Data', note: 'Showing results. Charts, project-controls and findings posts.', face: { mouth: 'smile' },
    build: () => ({
      edge: '',
      ink: `<g ${line}>${page(58, 188, 124, 72)}<path d="M74 204V246H170" fill="none" stroke-width="3.5"/></g>${bar(84, 226, 14, 20)}${bar(106, 216, 14, 30)}${bar(128, 232, 14, 14)}${bar(150, 208, 14, 38, YELLOW)}${hands2(256)}`,
    }),
  },
  {
    name: 'clipboard', group: 'Research', title: 'Notes', note: 'Checklist in hand. Methods, schedules, "how I check it" posts.', face: {},
    build: () => ({
      edge: '',
      ink: `<g ${line}>${page(70, 186, 100, 76)}<rect x="104" y="180" width="32" height="14" rx="5" fill="${YELLOW}" stroke-width="4"/><path d="M84 214l5 5 9-10M84 236l5 5 9-10" fill="none" stroke-width="4"/><path d="M106 214h50M106 236h50" fill="none" stroke="${GREY}" stroke-width="4"/></g>${hands2(252)}`,
    }),
  },
];

function build(p) {
  const f = face(p.face);
  const built = p.build ? p.build() : { edge: '', ink: '' };
  const stick = edge(bustParts, 18) + built.edge;
  const hatEdge = p.face.hat ? `<path d="M54 82C54 38 84 16 120 16C156 16 186 38 186 82Z" fill="${PAPER}" stroke="${PAPER}" stroke-width="18" stroke-linejoin="round"/><path d="M42 82H198V94H42Z" fill="${PAPER}" stroke="${PAPER}" stroke-width="18" stroke-linejoin="round"/>` : '';
  const inner = stick + hatEdge + body(YELLOW) + f + built.ink;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VB}" role="img" aria-label="Abdelfattah mascot: ${p.title}"><title>Abdelfattah mascot: ${p.title}</title>${inner}</svg>\n`;
}

for (const p of poses) {
  const svg = build(p);
  fs.writeFileSync(path.join(out, `am-pose-${p.name}.svg`), svg);
  await sharp(Buffer.from(svg), { density: 384 }).resize({ height: 1024 }).png({ compressionLevel: 9 }).toFile(path.join(out, 'png', `am-pose-${p.name}-1024.png`));
}
fs.writeFileSync(path.join(out, 'poses.json'), JSON.stringify(poses.map(({ name, group, title, note }) => ({ name, group, title, note })), null, 1));

const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>Mascot poses</title>
<style>*{box-sizing:border-box}body{margin:0;padding:40px;background:#000;color:#fff;font-family:Tajawal,system-ui,sans-serif}
h1{font-size:28px;margin:0 0 6px}.sub{color:#a6a6a6;margin:0 0 28px}
.g{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;max-width:1300px}
.c{background:#0b0b0b;border:1px solid #252525;border-radius:28px;padding:16px}
.h{background:#000;border-radius:20px;display:grid;place-items:center;height:260px}.h img{height:240px}
.k{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#ffcc00}
h2{font-size:17px;margin:4px 0 4px}p{margin:0;color:#a6a6a6;font-size:12.5px;line-height:1.45;min-height:36px}</style>
<body><h1>Mascot poses</h1><p class="sub">${poses.length} poses on one shared canvas: core, design and research. Brand library only: not used on the website.</p>
<div class="g">${poses.map((p) => `<div class="c"><div class="h"><img src="am-pose-${p.name}.svg" alt=""></div><div class="k">${p.group}</div><h2>${p.title}</h2><p>${p.note}</p></div>`).join('')}</div></body></html>`;
fs.writeFileSync(path.join(out, 'poses.html'), html);
console.log('poses built:', poses.length);
