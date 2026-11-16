"""Outlines the Arabic name in Tajawal Bold with real Arabic shaping (HarfBuzz), for the Arabic header and lockup.
Run:  python3 brand/arabic-name.py   (needs: pip install uharfbuzz fonttools brotli; only when the name changes)
Writes src/data/wordmark-ar.json: two right-aligned lines as SVG path data (y down), with width/height."""
import io, json, pathlib, re
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

root = pathlib.Path(__file__).resolve().parent.parent
tt = TTFont(str(root / 'node_modules/@fontsource/tajawal/files/tajawal-arabic-700-normal.woff'))
tt.flavor = None  # HarfBuzz needs plain sfnt data, not WOFF
buf = io.BytesIO(); tt.save(buf); data = buf.getvalue()
tt = TTFont(io.BytesIO(data))
gs = tt.getGlyphSet()
order = tt.getGlyphOrder()
font = hb.Font(hb.Face(data))

S = 100 / tt['head'].unitsPerEm  # font size 100
LEAD = 118

def shape(text):
    b = hb.Buffer(); b.add_str(text); b.direction = 'rtl'; b.script = 'Arab'; b.language = 'ar'
    hb.shape(font, b, {'kern': True, 'liga': True, 'calt': True})
    x = 0; items = []
    for info, pos in zip(b.glyph_infos, b.glyph_positions):
        items.append((order[info.codepoint], x + pos.x_offset, pos.y_offset)); x += pos.x_advance
    return items

def draw(pen, items, dx, dy):
    for name, gx, gy in items:
        gs[name].draw(TransformPen(pen, (S, 0, 0, -S, gx * S + dx, -gy * S + dy)))

def bounds(items, dx=0, dy=0):
    bp = BoundsPen(gs); draw(bp, items, dx, dy); return bp.bounds

# stack: line 1 on top, right edges aligned
lines = [shape('عبدالفتاح'), shape('أبو الفتوح')]
right = max(bounds(items)[2] for items in lines)
out = []
for i, items in enumerate(lines):
    dx = right - bounds(items)[2]
    pen = SVGPathPen(gs); draw(pen, items, dx, i * LEAD)
    out.append((pen.getCommands(), bounds(items, dx, i * LEAD)))
xmin = min(b[0] for _, b in out)
ymin = min(b[1] for _, b in out); ymax = max(b[3] for _, b in out)

def shift(d, ox, oy):
    """Moves absolute path data by (-ox, -oy), numbers to 2 decimals."""
    res, cmd, idx = [], None, 0
    for t in re.findall(r'[MLHVCQZmlhvcqz]|-?\d*\.?\d+(?:e-?\d+)?', d):
        if t.isalpha():
            cmd = t; res.append(t); idx = 0
            continue
        v = float(t)
        if cmd in 'MLCQ': v -= ox if idx % 2 == 0 else oy
        elif cmd == 'H': v -= ox
        elif cmd == 'V': v -= oy
        res.append(('%.2f' % v).rstrip('0').rstrip('.')); idx += 1
    s = ''.join(t if t.isalpha() else ' ' + t for t in res)
    return re.sub(r'([MLCQHV]) ', r'\1', s)

w = right - xmin; h = ymax - ymin
json.dump({'w': round(w, 2), 'h': round(h, 2), 'd': ''.join(shift(d, xmin, ymin) for d, _ in out)}, open(root / 'src/data/wordmark-ar.json', 'w'))
print('arabic name', round(w, 1), 'x', round(h, 1))
