// A tiny calligraphy engine: turns hand-placed centre-line points into a filled outline.
// The pen is a flat ellipse held at a fixed angle, swept along a smooth curve, so the stroke
// is naturally thick on down-strokes and thin on up-strokes, like a brush/signature pen.
import polygonClipping from 'polygon-clipping';

const f = (n) => +n.toFixed(2);

// Centripetal Catmull-Rom through the points; returns dense samples.
export function spline(pts, perSeg = 18) {
  const P = [pts[0], ...pts, pts[pts.length - 1]];
  const out = [];
  const t = (a, b) => Math.pow(Math.hypot(b[0] - a[0], b[1] - a[1]), 0.5);
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    const t0 = 0, t1 = t0 + (t(p0, p1) || 1e-3), t2 = t1 + (t(p1, p2) || 1e-3), t3 = t2 + (t(p2, p3) || 1e-3);
    for (let s = 0; s < perSeg; s++) {
      const tt = t1 + ((t2 - t1) * s) / perSeg;
      const A = (a, b, ta, tb) => a.map((v, k) => ((tb - tt) / (tb - ta)) * v + ((tt - ta) / (tb - ta)) * b[k]);
      const A1 = A(p0, p1, t0, t1), A2 = A(p1, p2, t1, t2), A3 = A(p2, p3, t2, t3);
      const B1 = A1.map((v, k) => ((t2 - tt) / (t2 - t0)) * v + ((tt - t0) / (t2 - t0)) * A2[k]);
      const B2 = A2.map((v, k) => ((t3 - tt) / (t3 - t1)) * v + ((tt - t1) / (t3 - t1)) * A3[k]);
      out.push(B1.map((v, k) => ((t2 - tt) / (t2 - t1)) * v + ((tt - t1) / (t2 - t1)) * B2[k]));
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

function ellipse(cx, cy, a, b, ang, n = 16) {
  const c = Math.cos(ang), s = Math.sin(ang), pts = [];
  for (let i = 0; i < n; i++) {
    const th = (i / n) * Math.PI * 2;
    const x = a * Math.cos(th), y = b * Math.sin(th);
    pts.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return pts;
}

function hull(points) {
  const seen = new Set();
  points = points.filter((q) => { const k = q[0].toFixed(4) + ',' + q[1].toFixed(4); if (seen.has(k)) return false; seen.add(k); return true; });
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  const up = [];
  for (const q of p.reverse()) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

const smooth = (x) => x * x * (3 - 2 * x);

// stroke: { pts, nib?, taperIn?, taperOut?, min? }  ->  array of polygons (rings)
export function strokePolys(stroke, pen) {
  const s = spline(stroke.pts, stroke.detail || 18);
  // arc length for tapering
  const L = [0];
  for (let i = 1; i < s.length; i++) L.push(L[i - 1] + Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]));
  const total = L[L.length - 1] || 1;
  const tin = stroke.taperIn ?? 0.06, tout = stroke.taperOut ?? 0.12, min = stroke.min ?? 0.22;
  const scale = (u) => {
    const a = tin ? smooth(Math.min(1, u / tin)) : 1;
    const b = tout ? smooth(Math.min(1, (1 - u) / tout)) : 1;
    return min + (1 - min) * Math.min(a, b);
  };
  const ang = ((stroke.angle ?? pen.angle) * Math.PI) / 180;
  const A = stroke.major ?? pen.major, B = stroke.minor ?? pen.minor;
  const polys = [];
  let prev = null;
  for (let i = 0; i < s.length; i++) {
    if (i && Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]) < 1e-3) continue; // skip repeated samples
    const k = scale(L[i] / total) * (stroke.swell ? stroke.swell(L[i] / total) : 1);
    const e = ellipse(s[i][0], s[i][1], (A / 2) * k, (B / 2) * Math.max(k, 0.6), ang);
    if (prev) { const h = hull(prev.concat(e)); if (h.length >= 3) polys.push(h); }
    prev = e;
  }
  return polys;
}

export function dotPoly(cx, cy, r) {
  return ellipse(cx, cy, r, r, 0, 28);
}

// Union everything into clean outlines and emit one SVG path (even-odd).
export function outline(polys) {
  // snap to a 0.01 grid and drop repeated points so the boolean engine never sees a degenerate edge
  const clean = polys
    .map((p) => {
      const q = [];
      for (const [x, y] of p) { const pt = [Math.round(x * 100) / 100, Math.round(y * 100) / 100]; const l = q[q.length - 1]; if (!l || l[0] !== pt[0] || l[1] !== pt[1]) q.push(pt); }
      if (q.length > 1 && q[0][0] === q[q.length - 1][0] && q[0][1] === q[q.length - 1][1]) q.pop();
      return q;
    })
    .filter((q) => q.length >= 3);
  const mp = polygonClipping.union(...clean.map((p) => [p.concat([p[0]])]));
  let d = '';
  for (const poly of mp) for (const ring of poly) {
    const r = simplify(ring.slice(0, -1), 0.12);
    d += 'M' + r.map((p) => `${f(p[0])} ${f(p[1])}`).join('L') + 'Z';
  }
  return d;
}

function simplify(pts, eps) {
  if (pts.length < 4) return pts;
  const keep = new Array(pts.length).fill(false);
  keep[0] = keep[pts.length - 1] = true;
  (function rec(a, b) {
    let max = 0, idx = -1;
    const [x1, y1] = pts[a], [x2, y2] = pts[b];
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1e-9;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / len;
      if (d > max) { max = d; idx = i; }
    }
    if (max > eps) { keep[idx] = true; rec(a, idx); rec(idx, b); }
  })(0, pts.length - 1);
  return pts.filter((_, i) => keep[i]);
}

export function bounds(polys) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const p of polys) for (const [x, y] of p) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return { x0, y0, x1, y1 };
}
