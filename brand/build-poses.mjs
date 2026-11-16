// Writes the mascot poses (brand/poses.mjs): brand/mascot/poses/*.svg, png/, poses.json and poses.html (contact sheet).
// Run: npm run brand:poses
import fs from 'node:fs';
import path from 'node:path';
import { POSES, poseSvg } from './poses.mjs';
import { outDir, toPng } from './lib.mjs';

const out = outDir('mascot/poses');
const png = outDir('mascot/poses/png');

for (const p of POSES) {
  const svg = poseSvg(p);
  fs.writeFileSync(path.join(out, `am-pose-${p.name}.svg`), svg);
  await toPng(svg, path.join(png, `am-pose-${p.name}-1024.png`), { height: 1024 });
}
fs.writeFileSync(path.join(out, 'poses.json'), JSON.stringify(POSES.map(({ name, group, title, note }) => ({ name, group, title, note })), null, 1));

const groups = [...new Set(POSES.map((p) => p.group.toLowerCase()))];
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>Mascot poses</title>
<style>*{box-sizing:border-box}body{margin:0;padding:40px;background:#000;color:#fff;font-family:Tajawal,system-ui,sans-serif}
h1{font-size:28px;margin:0 0 6px}.sub{color:#a6a6a6;margin:0 0 28px}
.g{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;max-width:1300px}
.c{background:#0b0b0b;border:1px solid #252525;border-radius:28px;padding:16px}
.h{background:#000;border-radius:20px;display:grid;place-items:center;height:260px}.h img{height:240px}
.k{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#ffcc00}
h2{font-size:17px;margin:4px 0 4px}p{margin:0;color:#a6a6a6;font-size:12.5px;line-height:1.45;min-height:36px}</style>
<body><h1>Mascot poses</h1><p class="sub">${POSES.length} poses on one shared canvas: ${groups.slice(0, -1).join(', ')} and ${groups.at(-1)}. Brand library only: not used on the website.</p>
<div class="g">${POSES.map((p) => `<div class="c"><div class="h"><img src="am-pose-${p.name}.svg" alt=""></div><div class="k">${p.group}</div><h2>${p.title}</h2><p>${p.note}</p></div>`).join('')}</div></body></html>`;
fs.writeFileSync(path.join(out, 'poses.html'), html);
console.log('poses built:', POSES.length);
