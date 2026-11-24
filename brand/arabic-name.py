"""Outlines the Arabic name in Tajawal with real Arabic shaping (HarfBuzz), for the Arabic header, lockups and lettering.
Run:  python3 brand/arabic-name.py   (needs: pip install uharfbuzz fonttools brotli; only when the name changes)
Writes src/data/wordmark-ar.json (the two lines as one right-aligned path, Bold: the site header) and
brand/name-lines-ar.json (the two lines separately, Bold and ExtraBold, each with its box)."""
import io, json, pathlib, re
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

root = pathlib.Path(__file__).resolve().parent.parent
TEXT = ['عبدالفتاح', 'أبو الفتوح']
LEAD = 118  # font size 100


def load(weight):
    tt = TTFont(str(root / f'node_modules/@fontsource/tajawal/files/tajawal-arabic-{weight}-normal.woff'))
    tt.flavor = None  # HarfBuzz needs plain sfnt data, not WOFF
    buf = io.BytesIO(); tt.save(buf); data = buf.getvalue()
    tt = TTFont(io.BytesIO(data))
    return tt, hb.Font(hb.Face(data)), 100 / tt['head'].unitsPerEm


def shape(font, order, text):
    b = hb.Buffer(); b.add_str(text); b.direction = 'rtl'; b.script = 'Arab'; b.language = 'ar'
    hb.shape(font, b, {'kern': True, 'liga': True, 'calt': True})
    x = 0; items = []
    for info, pos in zip(b.glyph_infos, b.glyph_positions):
        items.append((order[info.codepoint], x + pos.x_offset, pos.y_offset)); x += pos.x_advance
    return items


def fmt(d):
    """Path data with numbers to 2 decimals, compact."""
    res = []
    for t in re.findall(r'[MLHVCQZmlhvcqz]|-?\d*\.?\d+(?:e-?\d+)?', d):
        res.append(t if t.isalpha() else ('%.2f' % float(t)).rstrip('0').rstrip('.'))
    s = ''.join(t if t.isalpha() else ' ' + t for t in res)
    return re.sub(r'([MLCQHV]) ', r'\1', s)


def lines(weight):
    """Each line on its own baseline at y=0, x from its right edge at 0 (extending left); with its box."""
    tt, font, S = load(weight)
    gs, order = tt.getGlyphSet(), tt.getGlyphOrder()
    out = []
    for text in TEXT:
        items = shape(font, order, text)
        def draw(pen, dx):
            for name, gx, gy in items:
                gs[name].draw(TransformPen(pen, (S, 0, 0, -S, gx * S + dx, -gy * S)))
        bp = BoundsPen(gs); draw(bp, 0)
        x1, y1, x2, y2 = bp.bounds
        pen = SVGPathPen(gs); draw(pen, -x2)  # right edge at x = 0
        out.append({'d': fmt(pen.getCommands()), 'x1': round(x1 - x2, 2), 'y1': round(y1, 2), 'x2': 0, 'y2': round(y2, 2)})
    return out


bold, heavy = lines(700), lines(800)
json.dump({'size': 100, 'lead': LEAD, 'w700': bold, 'w800': heavy}, open(root / 'brand/name-lines-ar.json', 'w'))

# the site header: both lines as one right-aligned block, Bold
def shifted(d, ox, oy):
    res, cmd, idx = [], None, 0
    for t in re.findall(r'[MLHVCQZmlhvcqz]|-?\d*\.?\d+(?:e-?\d+)?', d):
        if t.isalpha():
            cmd = t; res.append(t); idx = 0; continue
        v = float(t)
        if cmd in 'MLCQ': v += ox if idx % 2 == 0 else oy
        elif cmd == 'H': v += ox
        elif cmd == 'V': v += oy
        res.append(('%.2f' % v).rstrip('0').rstrip('.')); idx += 1
    s = ''.join(t if t.isalpha() else ' ' + t for t in res)
    return re.sub(r'([MLCQHV]) ', r'\1', s)

xmin = min(l['x1'] for l in bold)
ymin = min(bold[0]['y1'], bold[1]['y1'] + LEAD); ymax = max(bold[0]['y2'], bold[1]['y2'] + LEAD)
w = -xmin; h = ymax - ymin
d = ''.join(shifted(l['d'], -xmin, -ymin + i * LEAD) for i, l in enumerate(bold))
json.dump({'w': round(w, 2), 'h': round(h, 2), 'd': d}, open(root / 'src/data/wordmark-ar.json', 'w'))
print('arabic name', round(w, 1), 'x', round(h, 1))
