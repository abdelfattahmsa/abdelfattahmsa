// admin/schema.json resolved against site.json: "wiki-*" expanded to one collection per wiki, select options filled in.
// Used by the local admin server and by the build (dist/admin/schema.json, for the online admin).
import path from 'node:path';
import { collections, INDEX_SLUG } from '../build/lib/content.mjs';
import { DEFAULT_LANG } from '../build/lib/i18n.mjs';
import { readJSON } from '../build/lib/util.mjs';
import { root } from '../build/lib/paths.mjs';

export function resolveSchema(site) {
  const COLLECTIONS = collections(site);
  const raw = readJSON(path.join(root, 'admin/schema.json'));
  const out = {};
  for (const [id, c] of Object.entries(raw.collections)) {
    const entries = id === 'wiki-*' ? site.wikis.map((w) => [`wiki-${w.id}`, { ...c, label: w.title[DEFAULT_LANG] }]) : [[id, c]];
    for (const [cid, def] of entries) {
      const fields = (typeof def.fields === 'string' ? raw.fieldSets[def.fields] : def.fields).map((f) => {
        if (f.source) return { ...f, options: site[f.source].map((x) => ({ value: x.id, label: x.label[DEFAULT_LANG] })) };
        if (f.options) return { ...f, options: f.options.map((v) => (typeof v === 'string' ? { value: v, label: v } : v)) };
        return f;
      });
      out[cid] = { label: def.label, fields, indexSlug: COLLECTIONS[cid].index ? INDEX_SLUG : null };
    }
  }
  return { schema: out, COLLECTIONS };
}
