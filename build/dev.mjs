// Dev server: builds with drafts, serves dist/, rebuilds when src/ changes.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = '.dev-dist'; // separate from dist/ so dev rebuilds never collide with real builds
const dist = path.join(root, OUT);
const port = Number(process.env.PORT) || 4000;
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.ico': 'image/x-icon' };

function rebuild() {
  const r = spawnSync(process.execPath, [path.join(root, 'build/build.mjs'), '--drafts'], { cwd: root, encoding: 'utf8', env: { ...process.env, OUT_DIR: OUT } });
  process.stdout.write(r.stdout || '');
  if (r.status !== 0) process.stderr.write(r.stderr || '');
}
rebuild();

let timer;
for (const dir of ['src', 'build']) {
  fs.watch(path.join(root, dir), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(rebuild, 150);
  });
}

http
  .createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(dist, p);
    if (!file.startsWith(dist)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) {
      res.writeHead(404, { 'Content-Type': MIME['.html'] });
      res.end(fs.readFileSync(path.join(dist, '404.html')));
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, '127.0.0.1', () => console.log(`dev server: http://127.0.0.1:${port}/  (drafts visible)`));
