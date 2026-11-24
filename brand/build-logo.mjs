// The name in Tajawal, outlined: the clean wordmark (two stacked lines, Bold) for the site header and the lockups, and the
// separate lines (Bold and ExtraBold) the lockups and the lettering style lay out themselves.
// Writes brand/logo/am-wordmark*.svg, src/data/wordmark.json and brand/name-lines-en.json.
// Run: node brand/build-logo.mjs   (needs devDependencies: opentype.js, sharp)
import fs from 'node:fs';
import opentype from 'opentype.js';
import path from 'node:path';
import { INK, PAPER } from './mascot-art.mjs';
import { NAME, brandDir, outDir, svgDoc, tajawal, toPng, writeData, TRANSPARENT } from './lib.mjs';

const out = outDir('logo');
const png = outDir('logo/png');
const f = (n) => +n.toFixed(2);
const SIZE = 100;
const LINES = ['Abdelfattah', 'Aboulfoutoh'];

// one line as a path on its baseline (x from 0), with its box
function line(font, text) {
  const p = font.getPath(text, 0, 0, SIZE, { kerning: true, letterSpacing: -0.012 });
  const b = p.getBoundingBox();
  return { path: p, d: p.toPathData(2), x1: f(b.x1), y1: f(b.y1), x2: f(b.x2), y2: f(b.y2) };
}
const moved = (p, dx, dy) => {
  const q = new opentype.Path();
  q.commands = p.commands.map((c) => { const n = { ...c }; for (const k of ['x', 'y', 'x1', 'y1', 'x2', 'y2']) if (k in n) n[k] += k.startsWith('x') ? dx : dy; return n; });
  return q;
};
const lines = (font) => LINES.map((t) => line(font, t));

// ---------------------------------------------------------------- the clean wordmark: two stacked lines, left aligned
const bold = tajawal(700);
const capH = bold.charToGlyph('A').getBoundingBox().y2 * (SIZE / bold.unitsPerEm);
const LEAD = capH * 1.2;
const L = lines(bold);
const X0 = Math.min(...L.map((l) => l.x1));
const Y0 = Math.min(L[0].y1, L[1].y1 + LEAD);
const W = Math.max(...L.map((l) => l.x2)) - X0;
const H = Math.max(L[0].y2, L[1].y2 + LEAD) - Y0;
const shifted = (l, i) => `<g transform="translate(${f(-X0)} ${f(-Y0 + i * LEAD)})"><path d="${l.d}"/></g>`;
const word = (fill) => `<g fill="${fill}">${L.map(shifted).join('')}</g>`;
const doc = (fill) => svgDoc({ vb: `0 0 ${f(W)} ${f(H)}`, inner: word(fill) }, NAME);
fs.writeFileSync(path.join(out, 'am-wordmark.svg'), doc(INK));
fs.writeFileSync(path.join(out, 'am-wordmark-white.svg'), doc(PAPER));
await toPng(doc(INK), path.join(png, 'am-wordmark-black-2000.png'), { width: 2000, fit: 'contain', background: TRANSPARENT });
await toPng(doc(PAPER), path.join(png, 'am-wordmark-white-2000.png'), { width: 2000, fit: 'contain', background: TRANSPARENT });

// the site header wants the two lines as one path, placed
const one = new opentype.Path();
L.forEach((l, i) => one.commands.push(...moved(l.path, -X0, -Y0 + i * LEAD).commands));
writeData('wordmark.json', { d: one.toPathData(2), w: f(W), h: f(H) });

// ---------------------------------------------------------------- separate lines for the lockups and the lettering
const heavy = tajawal(800);
fs.writeFileSync(path.join(brandDir, 'name-lines-en.json'), JSON.stringify({ size: SIZE, lead: f(LEAD), w700: lines(bold).map(({ path, ...r }) => r), w800: lines(heavy).map(({ path, ...r }) => r) }));
console.log(`wordmark ${f(W)}x${f(H)} in Tajawal Bold`);
