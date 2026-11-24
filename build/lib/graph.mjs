// The knowledge map's data, built from the wikis: one graph for both languages.
//
//   area  one per wiki (a big node; every area is a cluster)
//   tag   a medium node: a page with `node: tag`, or a tag written on a post
//   post  a wiki page (a small node)
//
// Bonds (nothing else is ever connected automatically):
//   member  tag -> its area, and a post with no tags -> its area
//   tag     post -> each of its tags (matched by name in either language)
//   link    the "connections" chosen by hand in the admin, on any node
//
// Positions are computed here, in 3D, so the browser only draws. The layout is stable: nodes
// that already have a position in src/data/graph-layout.json keep it, new nodes are placed
// next to their neighbours and settle, so the map grows instead of reshuffling.
import { normalise } from './search.mjs';
import { slugify } from './util.mjs';

export const AREA = 0, TAG = 1, POST = 2;
export const MEMBER = 0, TAGGED = 1, LINK = 2;

const arr = (v) => (Array.isArray(v) ? v : v ? String(v).split(',') : []).map((x) => String(x).trim()).filter(Boolean);
const clip = (s = '', n = 110) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);

// ---- deterministic randomness: the same graph always lays out the same way
function rng(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = (h = Math.imul(h ^ (h >>> 16), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const inBall = (rand, r) => {
  for (;;) {
    const x = rand() * 2 - 1, y = rand() * 2 - 1, z = rand() * 2 - 1;
    if (x * x + y * y + z * z <= 1) return [x * r, y * r, z * r];
  }
};

export function buildGraph({ site, content, prevLayout = {} }) {
  const nodes = []; // { id, type, area, label: [en, ar], sum: [en, ar], url, votes? }
  const byId = new Map();
  const add = (n) => { n.i = nodes.length; nodes.push(n); byId.set(n.id, n.i); return n.i; };

  // ---- areas
  const wikis = Object.values(content.wikis);
  const areaIndex = new Map();
  for (const w of wikis) {
    areaIndex.set(w.id, add({ id: `area:${w.id}`, type: AREA, area: areaIndex.size, label: [w.title.en, w.title.ar || w.title.en], sum: [clip(w.blurb.en), clip(w.blurb.ar || w.blurb.en)], url: w.base, wiki: w }));
  }
  const areaOf = (wid) => nodes[areaIndex.get(wid)].area;

  // ---- pages: tag nodes and posts
  const tagKey = new Map(); // normalised tag text (any language) -> node index
  const pageNodes = [];
  for (const w of wikis) {
    for (const p of w.pages) {
      const en = p.variants.en, ar = p.variants.ar;
      const isTag = p.data.node === 'tag';
      const i = add({
        id: `${w.id}/${p.slug}`,
        type: isTag ? TAG : POST,
        area: areaOf(w.id),
        label: [en.data.title || p.slug, ar?.data.title || en.data.title || p.slug],
        sum: [clip(en.data.summary), clip(ar?.data.summary || en.data.summary)],
        url: p.url,
        page: p,
      });
      pageNodes.push(i);
      if (isTag) for (const t of [p.slug, en.data.title, ar?.data.title, ...arr(p.data.aliases)]) if (t) tagKey.set(normalise(t), i);
    }
  }

  // ---- edges (one bond per pair; a hand-made bond wins over an automatic one)
  const edges = new Map();
  const bond = (a, b, kind) => {
    if (a === b) return;
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    const old = edges.get(key);
    if (!old || kind > old[2]) edges.set(key, [Math.min(a, b), Math.max(a, b), kind]);
  };

  // a tag written on a post: an existing tag node, or a new tag node made from the text
  const resolveTag = (text, textAr, area) => {
    const key = normalise(text);
    let i = tagKey.get(key);
    if (i === undefined && textAr) i = tagKey.get(normalise(textAr));
    if (i === undefined) {
      i = add({ id: `tag:${slugify(text)}`, type: TAG, area, label: [text, textAr || text], sum: ['', ''], url: '', votes: new Map(), implicit: true });
      tagKey.set(key, i);
      if (textAr) tagKey.set(normalise(textAr), i);
    }
    const n = nodes[i];
    if (n.votes) n.votes.set(area, (n.votes.get(area) || 0) + 1);
    return i;
  };

  const postTags = new Map();
  for (const i of pageNodes) {
    const n = nodes[i];
    if (n.type !== POST) continue;
    const enTags = arr(n.page.data.tags);
    const arTags = arr(n.page.variants.ar?.data.tags);
    const paired = enTags.length === arTags.length;
    const found = [];
    enTags.forEach((t, k) => found.push(resolveTag(t, paired ? arTags[k] : '', n.area)));
    if (!paired) for (const t of arTags) found.push(resolveTag(t, '', n.area));
    postTags.set(i, [...new Set(found)]);
  }
  // an implicit tag belongs to the area that uses it most
  for (const n of nodes) {
    if (!n.votes) continue;
    n.area = [...n.votes.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0][0];
  }
  for (const n of nodes) {
    if (n.type === TAG) bond(n.i, areaIndex.get(wikis[n.area].id), MEMBER);
    if (n.type === POST) {
      const tags = postTags.get(n.i) || [];
      if (!tags.length) bond(n.i, areaIndex.get(wikis[n.area].id), MEMBER);
      for (const t of tags) bond(n.i, t, TAGGED);
    }
  }

  // ---- bonds chosen by hand ("connections" on a page, or on a wiki's landing page)
  const resolveRef = (ref) => {
    const r = String(ref).trim();
    if (byId.has(r)) return byId.get(r);
    if (byId.has(`area:${r}`)) return byId.get(`area:${r}`);
    if (byId.has(`tag:${r}`)) return byId.get(`tag:${r}`);
    return tagKey.get(normalise(r));
  };
  const manual = (from, list, where) => {
    for (const ref of arr(list)) {
      const to = resolveRef(ref);
      if (to === undefined) console.warn(`! ${where}: connection "${ref}" does not match any node`);
      else bond(from, to, LINK);
    }
  };
  for (const w of wikis) if (w.index) manual(areaIndex.get(w.id), w.index.data.connections, `wiki ${w.id} landing page`);
  for (const i of pageNodes) manual(i, nodes[i].page.data.connections, nodes[i].id);

  const E = [...edges.values()].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const adj = nodes.map(() => []);
  for (const [a, b, k] of E) { adj[a].push([b, k]); adj[b].push([a, k]); }

  const layout = layoutGraph({ nodes, edges: E, adj, prev: prevLayout, areaCount: wikis.length });

  // ---- compact JSON for the browser
  const json = {
    v: 1,
    areas: wikis.map((w) => ({ id: w.id, l: [w.title.en, w.title.ar || w.title.en], u: w.base, n: areaIndex.get(w.id) })),
    t: nodes.map((n) => n.type).join(''),
    a: nodes.map((n) => n.area),
    x: nodes.map((n) => layout[n.id][0]),
    y: nodes.map((n) => layout[n.id][1]),
    z: nodes.map((n) => layout[n.id][2]),
    d: adj.map((l) => l.length),
    l: nodes.map((n) => n.label),
    m: nodes.map((n) => n.sum),
    u: nodes.map((n) => n.url),
    e: E.flat(),
  };
  const stats = { nodes: nodes.length, areas: wikis.length, tags: nodes.filter((n) => n.type === TAG).length, posts: nodes.filter((n) => n.type === POST).length, bonds: E.length };
  const nodeLayout = Object.fromEntries(nodes.map((n) => [n.id, layout[n.id]]));
  return { json, layout: nodeLayout, nodes, adj, byId, stats };
}

// ------------------------------------------------------------------ layout
const SPRING = { [TAGGED]: 30, [LINK]: 140 };

function layoutGraph({ nodes, edges, adj, prev, areaCount }) {
  const n = nodes.length;
  const px = new Float64Array(n), py = new Float64Array(n), pz = new Float64Array(n);
  const fixed = new Uint8Array(n);

  // cluster size and where each cluster sits (centres on a sphere, far enough apart)
  const sizes = new Array(areaCount).fill(0);
  for (const nd of nodes) sizes[nd.area]++;
  const radius = sizes.map((s) => 26 * Math.cbrt(s + 1) + 56);
  const maxR = Math.max(...radius, 1);
  const centre = radius.map((_, a) => {
    if (areaCount === 1) return [0, 0, 0];
    if (areaCount === 2) return [(a ? 1 : -1) * (1.5 * maxR + 60), 0, 0];
    const R = 2.3 * maxR + 120, phi = Math.PI * (3 - Math.sqrt(5));
    const y = 1 - (a / (areaCount - 1)) * 2, r = Math.sqrt(1 - y * y);
    return [Math.cos(phi * a) * r * R, y * R, Math.sin(phi * a) * r * R];
  });

  // areas are anchors; nodes with a saved position keep it
  let known = 0;
  for (const nd of nodes) {
    const i = nd.i, p = prev[nd.id];
    if (nd.type === AREA) { [px[i], py[i], pz[i]] = centre[nd.area]; fixed[i] = 1; }
    else if (p) { [px[i], py[i], pz[i]] = p; fixed[i] = 1; known++; }
  }
  const placed = new Uint8Array(n);
  for (let i = 0; i < n; i++) placed[i] = fixed[i];

  // new nodes start beside neighbours that are already placed (tags first, then posts)
  for (const type of [TAG, POST]) {
    for (const nd of nodes) {
      if (nd.type !== type || placed[nd.i]) continue;
      const rand = rng(nd.id);
      let sx = 0, sy = 0, sz = 0, c = 0;
      for (const [j] of adj[nd.i]) if (placed[j]) { sx += px[j]; sy += py[j]; sz += pz[j]; c++; }
      const [jx, jy, jz] = inBall(rand, c ? 22 : radius[nd.area] * 0.8);
      const base = c ? [sx / c, sy / c, sz / c] : centre[nd.area];
      px[nd.i] = base[0] + jx; py[nd.i] = base[1] + jy; pz[nd.i] = base[2] + jz;
      placed[nd.i] = 1;
    }
  }
  const moving = [];
  for (let i = 0; i < n; i++) if (!fixed[i]) moving.push(i);

  if (moving.length) {
    const iters = known ? 45 : 110;
    const CELL = 44;
    const vx = new Float64Array(n), vy = new Float64Array(n), vz = new Float64Array(n);
    const fx = new Float64Array(n), fy = new Float64Array(n), fz = new Float64Array(n);
    for (let it = 0; it < iters; it++) {
      const cool = 1 - it / iters;
      // grid of every node, so movers are pushed off all of them
      const grid = new Map();
      const key = (x, y, z) => (x * 73856093) ^ (y * 19349663) ^ (z * 83492791);
      for (let i = 0; i < n; i++) {
        const k = key(Math.floor(px[i] / CELL), Math.floor(py[i] / CELL), Math.floor(pz[i] / CELL));
        const cell = grid.get(k);
        if (cell) cell.push(i); else grid.set(k, [i]);
      }
      for (const i of moving) {
        let ax = 0, ay = 0, az = 0;
        const cx = Math.floor(px[i] / CELL), cy = Math.floor(py[i] / CELL), cz = Math.floor(pz[i] / CELL);
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
          const cell = grid.get(key(cx + dx, cy + dy, cz + dz));
          if (!cell) continue;
          for (const j of cell) {
            if (j === i) continue;
            const ex = px[i] - px[j], ey = py[i] - py[j], ez = pz[i] - pz[j];
            const d2 = ex * ex + ey * ey + ez * ez + 0.5;
            if (d2 > CELL * CELL) continue;
            const f = (nodes[j].type === AREA ? 900 : 260) / d2;
            const d = Math.sqrt(d2);
            ax += (ex / d) * f; ay += (ey / d) * f; az += (ez / d) * f;
          }
        }
        // stay near the area's centre
        const c = centre[nodes[i].area];
        const pull = nodes[i].type === TAG ? 0.02 : 0.03;
        ax += (c[0] - px[i]) * pull; ay += (c[1] - py[i]) * pull; az += (c[2] - pz[i]) * pull;
        fx[i] = ax; fy[i] = ay; fz[i] = az;
      }
      for (const [a, b, kind] of edges) {
        if (fixed[a] && fixed[b]) continue;
        const ex = px[b] - px[a], ey = py[b] - py[a], ez = pz[b] - pz[a];
        const d = Math.sqrt(ex * ex + ey * ey + ez * ez) + 0.01;
        // an area's bond to its topics is as long as the cluster is wide; hand-made bonds only ever pull gently
        const rest = kind === MEMBER ? 0.34 * radius[nodes[a].area] : SPRING[kind];
        // a bond across two areas is a long bridge: it stretches instead of dragging the clusters together
        const bridge = nodes[a].area !== nodes[b].area ? 0.12 : 1;
        const f = kind === LINK ? Math.max(0, d - rest) * 0.0025 / d : (d - rest) * (kind === MEMBER ? 0.03 : 0.07) * bridge / d;
        if (!fixed[a]) { fx[a] += ex * f; fy[a] += ey * f; fz[a] += ez * f; }
        if (!fixed[b]) { fx[b] -= ex * f; fy[b] -= ey * f; fz[b] -= ez * f; }
      }
      const step = 0.55 * cool + 0.08;
      for (const i of moving) {
        vx[i] = (vx[i] + fx[i]) * 0.55; vy[i] = (vy[i] + fy[i]) * 0.55; vz[i] = (vz[i] + fz[i]) * 0.55;
        const m = Math.hypot(vx[i], vy[i], vz[i]);
        const cap = 14 * step + 2;
        const s = m > cap ? cap / m : 1;
        px[i] += vx[i] * s; py[i] += vy[i] * s; pz[i] += vz[i] * s;
      }
    }
  }

  const out = {};
  for (const nd of nodes) out[nd.id] = [Math.round(px[nd.i]), Math.round(py[nd.i]), Math.round(pz[nd.i])];
  return out;
}

// What a page needs to show its place in the map: its area, its tags and its connections.
export function connectionsOf(graph, id, lang) {
  const i = graph.byId.get(id);
  if (i === undefined) return [];
  return graph.adj[i].map(([j, kind]) => {
    const n = graph.nodes[j];
    return { id: n.id, type: n.type, label: n.label[lang === 'ar' ? 1 : 0], url: n.url, kind };
  });
}
