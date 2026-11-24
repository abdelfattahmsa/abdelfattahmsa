// Hand-hinted favicon pixels for the new face. K = black, W = white, . = leave the yellow disc.
// 16 x 16 is drawn by hand; 32 x 32 is that drawing doubled, then refined by hand (ears, brows, nose, mouth line).
import sharp from 'sharp';
import { INK, PAPER, YELLOW } from './mascot-art.mjs';

export const HEAD16 = [
  '................',
  '.....KKKKKK.....',
  '....KKKKKKKK....',
  '...KKKKKKKKKK...',
  '...KKWWWWWWKK...',
  '...KWWWWWWWWK...',
  '...KWWKWWKWWK...',
  '...KWWWWWWWWK...',
  '...KWWKKKKWWK...',
  '...KKWWWWWWKK...',
  '...KKKWWWWKKK...',
  '....KKKKKKKK....',
  '.....KKKKKK.....',
  '................',
  '................',
  '................',
];

function head32() {
  const rows = HEAD16.flatMap((r) => { const a = [...r].flatMap((c) => [c, c]); return [a, a.slice()]; });
  const set = (x, y, c) => { rows[y][x] = c; };
  for (const x of [11, 12, 13, 14, 17, 18, 19, 20]) set(x, 10, 'K'); // brows (one row above the eyes)
  for (const y of [14, 15]) set(15, y, 'K'); // nose
  for (const x of [14, 15, 16, 17]) set(x, 19, 'K'); // mouth line
  return rows.map((r) => r.join(''));
}
export const HEAD32 = head32();

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const YEL = rgb(YELLOW), BLK = rgb(INK), WHT = rgb(PAPER);
function pixels(rows) {
  const n = rows.length;
  const buf = Buffer.alloc(n * n * 4);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const d = Math.hypot(x + 0.5 - n / 2, y + 0.5 - n / 2);
      const o = (y * n + x) * 4;
      if (d > n / 2) { buf[o + 3] = 0; continue; } // outside the disc: transparent
      const c = rows[y][x];
      const col = c === 'K' ? BLK : c === 'W' ? WHT : YEL;
      buf[o] = col[0]; buf[o + 1] = col[1]; buf[o + 2] = col[2]; buf[o + 3] = 255;
    }
  }
  return { buf, n };
}
export const png = (rows) => { const { buf, n } = pixels(rows); return sharp(buf, { raw: { width: n, height: n, channels: 4 } }).png({ compressionLevel: 9 }).toBuffer(); };
