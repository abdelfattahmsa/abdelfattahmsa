// Turns the local Satoshi file into two GitHub secrets (GitHub limits a secret to 48 KB; the font is ~57 KB as base64).
// Usage:  npm run fonts:pack   then follow the printed steps. Output goes to .secrets/ (git-ignored).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'src/assets/fonts/Satoshi-Variable.woff2');
if (!fs.existsSync(file)) { console.error('Put Satoshi-Variable.woff2 in src/assets/fonts/ first.'); process.exit(1); }
const b64 = fs.readFileSync(file).toString('base64');
const cut = 30000; // multiple of 4, so the two halves concatenate into valid base64
const out = path.join(root, '.secrets');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'SATOSHI_WOFF2_B64_1.txt'), b64.slice(0, cut));
fs.writeFileSync(path.join(out, 'SATOSHI_WOFF2_B64_2.txt'), b64.slice(cut));
console.log(`Wrote .secrets/SATOSHI_WOFF2_B64_1.txt (${Math.min(cut, b64.length)} chars) and _2.txt (${Math.max(0, b64.length - cut)} chars).

Add each as a repository secret with the same name:
  GitHub -> your repo -> Settings -> Secrets and variables -> Actions -> New repository secret
  (paste the whole contents of each file), or with the GitHub CLI:
  gh secret set SATOSHI_WOFF2_B64_1 < .secrets/SATOSHI_WOFF2_B64_1.txt
  gh secret set SATOSHI_WOFF2_B64_2 < .secrets/SATOSHI_WOFF2_B64_2.txt

Then delete the .secrets folder. The next deploy will serve Satoshi.`);
