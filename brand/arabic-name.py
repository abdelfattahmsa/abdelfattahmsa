"""Outlines the Arabic name in Tajawal Bold with real Arabic shaping (HarfBuzz), for the Arabic lockup.
Run:  python3 brand/arabic-name.py   (needs: pip install uharfbuzz fonttools brotli)
Writes brand/mascot/arabic-name.json: two right-aligned lines as SVG path data (y down), with width/height."""
import io, json, pathlib
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

root = pathlib.Path(__file__).resolve().parent.parent
src = root / 'node_modules/@fontsource/tajawal/files/tajawal-arabic-700-normal.woff'
tt = TTFont(str(src))
tt.flavor = None
buf = io.BytesIO(); tt.save(buf); data = buf.getvalue()
tt = TTFont(io.BytesIO(data))
gs = tt.getGlyphSet()
order = tt.getGlyphOrder()
upem = tt['head'].unitsPerEm
face = hb.Face(data); font = hb.Font(face)

def line(text):
    b = hb.Buffer(); b.add_str(text); b.direction = 'rtl'; b.script = 'Arab'; b.language = 'ar'
    hb.shape(font, b, {'kern': True, 'liga': True, 'calt': True})
    x = 0; items = []
    for info, pos in zip(b.glyph_infos, b.glyph_positions):
        items.append((order[info.codepoint], x + pos.x_offset, pos.y_offset)); x += pos.x_advance
    return items, x

def outline(items, scale):
    pen = SVGPathPen(gs); bp = BoundsPen(gs)
    for name, gx, gy in items:
        for p in (pen, bp):
            gs[name].draw(TransformPen(p, (scale, 0, 0, -scale, gx * scale, -gy * scale)))
    return pen.getCommands(), bp.bounds

S = 100 / upem
lines = [line('عبدالفتاح'), line('أبو الفتوح')]
res = []
for items, adv in lines:
    d, b = outline(items, S)
    res.append({'items': items, 'd': d, 'b': b, 'adv': adv * S})
# stack: line 1 on top, right edges aligned, leading 118 units (font size 100)
LEAD = 118
right = max(r['b'][2] for r in res)
out = []
ymin = 1e9; ymax = -1e9
for i, r in enumerate(res):
    items = r['items']
    pen = SVGPathPen(gs)
    dx = right - r['b'][2]
    for name, gx, gy in items:
        gs[name].draw(TransformPen(pen, (S, 0, 0, -S, gx * S + dx, -gy * S + i * LEAD)))
    bp = BoundsPen(gs)
    for name, gx, gy in items:
        gs[name].draw(TransformPen(bp, (S, 0, 0, -S, gx * S + dx, -gy * S + i * LEAD)))
    b = bp.bounds
    ymin = min(ymin, b[1]); ymax = max(ymax, b[3])
    out.append({'d': pen.getCommands(), 'x1': b[0], 'x2': b[2]})
xmin = min(o['x1'] for o in out)
# normalise to origin
def shift(d, ox, oy):
    import re
    def f(m):
        return m.group(0)
    toks = re.findall(r'[MLHVCQZmlhvcqz]|-?\d*\.?\d+(?:e-?\d+)?', d)
    res_, cmd, idx = [], None, 0
    for t in toks:
        if t.isalpha():
            cmd = t; res_.append(t); idx = 0
        else:
            v = float(t)
            if cmd in 'MLCQ': v = v - (ox if idx % 2 == 0 else oy)
            elif cmd == 'H': v = v - ox
            elif cmd == 'V': v = v - oy
            res_.append(('%.2f' % v).rstrip('0').rstrip('.')); idx += 1
    # join: letters then numbers separated by spaces
    s = ''
    for t in res_:
        s += t if t.isalpha() else (' ' + t)
    return s.replace('M ', 'M').replace('L ', 'L').replace('C ', 'C').replace('Q ', 'Q').replace('H ', 'H').replace('V ', 'V')
w = right - xmin; h = ymax - ymin
json.dump({'w': round(w, 2), 'h': round(h, 2), 'd': ''.join(shift(o['d'], xmin, ymin) for o in out)}, open(root / 'brand/mascot/arabic-name.json', 'w'))
print('arabic name', round(w, 1), 'x', round(h, 1))
