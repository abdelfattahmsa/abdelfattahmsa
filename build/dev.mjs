// Dev server: builds with drafts into .dev-dist/, serves it, rebuilds when src/ or build/ changes.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { root } from './lib/paths.mjs';
import { contentType } from './lib/util.mjs';

const OUT = '.dev-dist'; // separate from dist/ so dev rebuilds never collide with real builds
const dist = path.join(root, OUT);
const port = Number(process.env.PORT) || 4000;

function rebuild() {
  const r = spawnSync(process.execPath, [path.join(root, 'build/build.mjs'), '--drafts', '--out', OUT], { cwd: root, encoding: 'utf8' });
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
      res.writeHead(404, { 'Content-Type': contentType('404.html') });
      res.end(fs.readFileSync(path.join(dist, '404.html')));
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType(file), 'Cache-Control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, '127.0.0.1', () => console.log(`dev server: http://127.0.0.1:${port}/  (drafts visible)`));
