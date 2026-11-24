// The online admin: dist/admin/ is the same editor as `npm run admin`, but its backend (backend-github.js) talks to
// the GitHub API with the owner's own fine-grained token, so content can be edited from any browser.
// It is not linked from the site, is noindex, and does nothing without a token that can write to the repository.
import fs from 'node:fs';
import path from 'node:path';
import { resolveSchema } from '../../admin/schema.mjs';
import { LANGS, DEFAULT_LANG, langInfo } from './i18n.mjs';
import { DOWNLOADS_URL } from './paths.mjs';
import { writeFile } from './util.mjs';

const ALLOWED_EXT = ['pdf', 'zip', 'xlsx', 'xlsm', 'xls', 'csv', 'docx', 'dotx', 'doc', 'pptx', 'potx', 'md', 'txt', 'json', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'ics'];
const REPO = 'abdelfattahmsa/abdelfattahmsa';
const CSP = "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.github.com; base-uri 'none'; form-action 'none'";

export function buildOnlineAdmin({ root, dist, site }) {
  const ui = path.join(root, 'admin/ui');
  const out = path.join(dist, 'admin');
  const { schema, COLLECTIONS } = resolveSchema(site);
  const collections = Object.fromEntries(Object.entries(schema).map(([id, c]) => [id, { ...c, dir: COLLECTIONS[id].dir, dateField: COLLECTIONS[id].dateField || 'date' }]));
  const langs = LANGS.map((code) => ({ code, label: new Intl.DisplayNames([code], { type: 'language' }).of(code), dir: langInfo(code).dir }));
  const indexSlug = Object.values(schema).find((c) => c.indexSlug)?.indexSlug || null;
  writeFile(path.join(out, 'config.json'), JSON.stringify({ repo: REPO, branch: 'main', langs, defaultLang: DEFAULT_LANG, downloadsUrl: DOWNLOADS_URL, allowedExt: ALLOWED_EXT, indexSlug, collections }));

  for (const f of ['admin.js', 'admin.css', 'backend-github.js']) fs.copyFileSync(path.join(ui, f), path.join(out, f));
  fs.copyFileSync(path.join(root, 'node_modules/js-yaml/dist/js-yaml.min.js'), path.join(out, 'js-yaml.min.js'));

  let html = fs.readFileSync(path.join(ui, 'index.html'), 'utf8');
  html = html
    .replace('<meta name="admin-token" content="__TOKEN__">', `<meta name="description" content="Edit the site's content online.">\n<meta http-equiv="Content-Security-Policy" content="${CSP}">`)
    .replace('<title>Site admin</title>', '<title>Site admin · online</title>')
    .replace('href="/admin.css"', 'href="/admin/admin.css"')
    .replace('<script src="/admin.js" defer></script>', '<script src="/admin/js-yaml.min.js" defer></script>\n<script src="/admin/backend-github.js" defer></script>\n<script src="/admin/admin.js" defer></script>')
    .replace('<p class="muted">Edits the files in <code>src/content</code>. Local only.</p>', '<p class="muted">Edits the site\'s content online. Each save is a commit; the site redeploys in about a minute.</p>')
    .replace('<button class="btn" id="btn-build" type="button">Check build</button>', '<button class="btn" id="btn-build" type="button" hidden>Check build</button>')
    .replace('<button class="btn btn--primary" id="btn-publish" type="button">Publish…</button>', '<button class="btn btn--primary" id="btn-publish" type="button" hidden>Publish…</button>\n      <a class="btn" id="link-actions" href="https://github.com/' + REPO + '/actions" target="_blank" rel="noopener noreferrer">Deployments ↗</a>\n      <button class="btn" id="btn-logout" type="button">Sign out</button>')
    .replace('<div id="toast"', `<dialog id="login">
  <form method="dialog" class="dlg__box" id="login-form">
    <h3>Sign in with GitHub</h3>
    <p class="muted">Paste a fine-grained personal access token with <b>Contents: read and write</b> on this repository only (<a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">create one</a>). It is kept in this browser only and sent only to api.github.com.</p>
    <label for="lg-token">Token</label><input id="lg-token" name="token" type="password" autocomplete="off" required>
    <label for="lg-repo">Repository</label><input id="lg-repo" name="repo" type="text" required>
    <label for="lg-branch">Branch</label><input id="lg-branch" name="branch" type="text" value="main">
    <p id="login-msg" class="muted" role="status"></p>
    <div class="actions"><button class="btn btn--primary" type="submit">Sign in</button></div>
  </form>
</dialog>
<div id="toast"`);
  html = html.replace('<html lang="en" dir="ltr">', '<html lang="en" dir="ltr">');
  writeFile(path.join(out, 'index.html'), html);
}
