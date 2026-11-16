// The horizontal lockups: mascot head + name, 200 units tall.
import { art } from './mascot-art.mjs';
import { NAME, lockupLayout, readData } from './lib.mjs';

const H = 200;

export function lockup(ink) {
  const word = readData('wordmark.json');
  const { fw, ws, gap, wh, w } = lockupLayout(art.head, word, H);
  const face = `<svg x="0" y="0" width="${fw.toFixed(1)}" height="${H}" viewBox="${art.head.vb}">${art.head.inner}</svg>`;
  const name = `<g transform="translate(${(fw + gap).toFixed(1)} ${((H - wh) / 2).toFixed(1)}) scale(${ws})"><path fill="${ink}" d="${word.d}"/></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(1)} ${H}" role="img" aria-label="${NAME}"><title>${NAME}</title>${face}${name}</svg>\n`;
}

// Arabic reads right to left: the head sits on the right, the name (right-aligned lines) on the left,
// as tall in total as the English name.
export function lockupAr(ink) {
  const word = readData('wordmark.json');
  const ar = readData('wordmark-ar.json');
  const { fw, gap } = lockupLayout(art.head, word, H);
  const k = word.h / ar.h;
  const ww = ar.w * k, wh = ar.h * k;
  const name = `<g transform="translate(0 ${((H - wh) / 2).toFixed(1)}) scale(${k.toFixed(4)})"><path fill="${ink}" d="${ar.d}"/></g>`;
  const face = `<svg x="${(ww + gap).toFixed(1)}" y="0" width="${fw.toFixed(1)}" height="${H}" viewBox="${art.head.vb}">${art.head.inner}</svg>`;
  const title = 'عبدالفتاح أبو الفتوح';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${(ww + gap + fw).toFixed(1)} ${H}" role="img" aria-label="${title}"><title>${title}</title>${name}${face}</svg>\n`;
}
