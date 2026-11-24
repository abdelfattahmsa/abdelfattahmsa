// Builds the v3 concept sheet (HTML). Set REF=/path/to/reference.jpg to include the reference beside it for comparison.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { head, presets, VB, ORANGE } from './mascot-v3.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const svg = (inner) => `<svg viewBox="${VB}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
const on = (o) => svg(`<rect x="200" y="375" width="450" height="530" fill="${ORANGE}"/>` + head(o));
const ref = process.env.REF ? `<div class="big"><img src="${process.env.REF}" alt=""><b>Reference</b></div>` : '';
const cards = presets.map(([n, o]) => `<div class="c"><div class="h">${on(o)}</div><b>${n}</b></div>`).join('');
const html = `<!doctype html><meta charset="utf-8"><title>Mascot v3 concept</title><style>*{box-sizing:border-box}body{margin:0;padding:36px;background:#000;color:#fff;font-family:Tajawal,system-ui,sans-serif}
h1{margin:0 0 4px;font-size:26px}.sub{color:#a6a6a6;margin:0 0 24px;max-width:900px}.top{display:flex;gap:20px;align-items:flex-end;margin-bottom:30px}
.big{background:#0b0b0b;border:1px solid #252525;border-radius:28px;padding:14px;text-align:center}.big svg,.big img{height:390px;width:auto;border-radius:18px}.big b{display:block;margin-top:8px}
.g{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;max-width:1160px}.c{background:#0b0b0b;border:1px solid #252525;border-radius:24px;padding:12px;text-align:center}.h svg{width:100%;height:auto;border-radius:14px}.c b{display:block;margin-top:6px}</style>
<h1>Mascot v3: concept</h1><p class="sub">Face only, in the exact style and proportions of your reference: the hair, ears, brows, eyes and nose are traced from it. No mustache and no mouth; a full beard drawn as a thick jaw band; the area around the mouth is clean skin.</p>
<div class="top">${ref}<div class="big">${on(presets[0][1])}<b>New (calm)</b></div><div class="big">${on({ brow: 'calm', sun: true })}<b>Sunglasses</b></div></div>
<h1 style="font-size:20px">Reactions</h1><div class="g">${cards}</div>`;
fs.writeFileSync(path.join(here, 'concept-v3.html'), html);
console.log('v3 sheet written');
