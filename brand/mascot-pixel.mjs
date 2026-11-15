// Hand-hinted favicon pixels. K = black, W = white, . = leave the yellow disc.
// 16 x 16 is drawn by hand; 32 x 32 is that drawing doubled, then refined by hand (brows, nose, lips).
import sharp from 'sharp';

export const HEAD16 = [
  '................',
  '....KKKKKKKK....',
  '...KKKKKKKKKK...',
  '...KKKKKKKKKK...',
  '...KKWWWWWWKK...',
  '...WWWWWWWWWW...',
  '...WWKWWWWKWW...',
  '...WWWWWWWWWW...',
  '...KWWWWWWWWK...',
  '...KKKKKKKKKK...',
  '...KKKKWWKKKK...',
  '....KKKKKKKK....',
  '.....KKKKKK.....',
  '......KKKK......',
  '................',
  '................',
];

function head32() {
  const g = HEAD16.map((r) => [...r].flatMap((c) => [c, c]));
  const rows = g.flatMap((r) => [r.slice(), r.slice()]);
  const set = (x, y, c) => { rows[y][x] = c; };
  // brows: one pixel thick, over each eye
  for (const x of [9, 10, 11, 12, 19, 20, 21, 22]) set(x, 10, 'K');
  // nose: a short stroke right of centre
  for (const y of [14, 15, 16]) set(17, y, 'K');
  // lips: widen the gap in the beard
  for (const x of [13, 14, 15, 16, 17, 18]) { set(x, 20, 'W'); }
  return rows.map((r) => r.join(''));
}
export const HEAD32 = head32();

const YEL = [255, 204, 0], BLK = [0, 0, 0], WHT = [255, 255, 255];
export function pixels(rows) {
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
