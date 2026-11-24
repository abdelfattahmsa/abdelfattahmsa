// Concept sheet 2: blended beard (front view), logos with the name under the face, and the 3/4 view built to the second reference.
// Set REF9=/path/to/crop.png to show that reference beside the 3/4 version.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { head, VB, YELLOW } from './mascot-v3.mjs';
import { head34, VB34 } from './mascot-34.mjs';
import { logoUnder, variants } from './logos-v3.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const front = `<svg viewBox="${VB}" xmlns="http://www.w3.org/2000/svg"><rect x="200" y="375" width="450" height="530" fill="${YELLOW}"/>${head({})}</svg>`;
const three = (o) => `<svg viewBox="${VB34}" xmlns="http://www.w3.org/2000/svg"><rect x="145" y="308" width="430" height="597" fill="${YELLOW}"/>${head34(o)}</svg>`;
const logos = variants.map(([n, o]) => `<div class="c"><div class="lg">${logoUnder(o)}</div><b>${n}</b></div>`).join('');
const ref = process.env.REF9 ? `<div class="big"><img src="${process.env.REF9}" alt=""><b>Reference (3/4 style)</b></div>` : '';
const html = `<!doctype html><meta charset="utf-8"><title>Mascot v3 concept 2</title><style>*{box-sizing:border-box}body{margin:0;padding:36px;background:#000;color:#fff;font-family:Tajawal,system-ui,sans-serif}
h1{margin:0 0 6px;font-size:24px}h2{margin:34px 0 10px;font-size:20px}.sub{color:#a6a6a6;margin:0 0 18px;max-width:950px}
.row{display:flex;gap:18px;align-items:flex-end;flex-wrap:wrap}.big{background:#0b0b0b;border:1px solid #252525;border-radius:26px;padding:14px;text-align:center}.big svg,.big img{height:430px;width:auto;border-radius:16px;display:block;margin:0 auto}.big b{display:block;margin-top:8px}
.c{background:#0b0b0b;border:1px solid #252525;border-radius:22px;padding:12px;text-align:center}.lg svg{height:380px;width:auto;border-radius:12px;display:block;margin:0 auto}.c b{display:block;margin-top:6px}</style>
<h1>Mascot v3: round 2</h1><p class="sub">The beard now blends into the hairline, the logo has a version with the name under the face, and there is a 3/4 version built to the second reference's proportions and perspective.</p>
<h2>1. Beard blended into the hairline</h2><div class="row"><div class="big">${front}<b>Front view</b></div></div>
<h2>2. Logo with the name under the face</h2><div class="row">${logos}</div>
<h2>3. 3/4 version in the attached style</h2><div class="row">${ref}<div class="big">${three({})}<b>3/4 view</b></div><div class="big">${three({ sun: true })}<b>With sunglasses</b></div></div>`;
fs.writeFileSync(path.join(here, 'concept-v3b.html'), html);
console.log('sheet 2 written');
