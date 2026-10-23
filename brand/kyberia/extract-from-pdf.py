"""One-off: pull the three Kyberia lockups (page 25 of Kyberia-Brand-Guidelines.pdf) out as vector path data.

    pdftocairo -svg -f 25 -l 25 Kyberia-Brand-Guidelines.pdf p25.svg
    python3 brand/kyberia/extract-from-pdf.py p25.svg src/data/kyberia.json

The guideline says never to redraw the mark, so the paths are copied as supplied (only re-based so each
lockup starts at 0,0). Each arm = 12 mark facets + the 'kyberia' wordmark + the mono '/suffix'.
"""
import re, sys, json

src, out = sys.argv[1], sys.argv[2]
s = open(src).read()
body = s[s.index('</defs>') + 7:]
items = re.findall(r'<g[^>]*>.*?</g>|<path[^>]*/>', body, flags=re.S)

def parse(it):
    d = re.search(r' d="([^"]+)"', it).group(1)
    nums = [float(x) for x in re.findall(r'-?\d+\.?\d*', d)]
    return d, nums

# element ranges found by inspecting positions/colours on the page (x 750-1000 pt)
ARMS = {'tech': (25, 38), 'labs': (39, 52), 'studios': (53, 66)}
res = {}
for arm, (a, b) in ARMS.items():
    parts = [parse(items[i]) for i in range(a, b + 1)]
    xs = [n for _, nums in parts for n in nums[0::2]]
    ys = [n for _, nums in parts for n in nums[1::2]]
    x0, y0, x1, y1 = min(xs), min(ys), max(xs), max(ys)

    def rebase(d):
        # absolute coords: M/L/C/Z with x,y pairs -> subtract origin
        toks = re.findall(r'[MLCZ]|-?\d+\.?\d*', d)
        o, k = [], 0
        for t in toks:
            if t in 'MLCZ':
                o.append(t); continue
            v = float(t) - (x0 if k % 2 == 0 else y0)
            o.append(f'{v:.2f}'.rstrip('0').rstrip('.')); k += 1
        return ' '.join(o)

    mark = [rebase(d) for d, _ in parts[:12]]
    res[arm] = {'w': round(x1 - x0, 2), 'h': round(y1 - y0, 2), 'mark': mark,
                'word': rebase(parts[12][0]), 'suffix': rebase(parts[13][0])}
json.dump(res, open(out, 'w'), separators=(',', ':'))
print({k: (v['w'], v['h'], len(json.dumps(v))) for k, v in res.items()})
