// Builds the v2 concept sheet (HTML). Screenshot it with any browser. Concept only.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bust, presets, shades } from './mascot-v2.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const svg = (inner, vb = '-8 -8 256 268') => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
const v1 = fs.readFileSync(path.join(here, '../am-mascot.svg'), 'utf8');
const cards = presets.map(([n, o]) => `<div class="c"><div class="h">${svg(bust(o))}</div><b>${n}</b></div>`).join('');
const html = `<!doctype html><meta charset="utf-8"><title>Mascot v2 concept</title><style>*{box-sizing:border-box}body{margin:0;padding:36px;background:#000;color:#fff;font-family:Tajawal,system-ui,sans-serif}
h1{margin:0 0 4px;font-size:26px}.sub{color:#a6a6a6;margin:0 0 24px;max-width:900px}.top{display:flex;gap:24px;align-items:flex-end;margin-bottom:30px}
.big{background:#0b0b0b;border:1px solid #252525;border-radius:28px;padding:16px;text-align:center}.big svg,.big img{height:330px;width:auto}.big b{display:block;margin-top:8px}
.g{display:grid;grid-template-columns:repeat(5,1fr);gap:16px;max-width:1160px}.c{background:#0b0b0b;border:1px solid #252525;border-radius:24px;padding:12px;text-align:center}.h svg{width:100%;height:220px}.c b{display:block;margin-top:4px}</style>
<h1>Mascot v2: concept</h1><p class="sub">Hair like the orange reference, a beard-free skin area under the mustache with no mouth line, a few eye reactions, and a sunglasses version. Open collar like your photo, with the yellow as a pocket square.</p>
<div class="top"><div class="big"><img src="../am-mascot.svg" alt=""><b>Current</b></div><div class="big">${svg(bust(presets[0][1]))}<b>New (calm)</b></div><div class="big">${svg(bust(shades[1]))}<b>${shades[0]}</b></div></div>
<h1 style="font-size:20px">Reactions</h1><div class="g">${cards}</div>`;
fs.writeFileSync(path.join(here, 'concept-v2.html'), html);
console.log('concept sheet written');
