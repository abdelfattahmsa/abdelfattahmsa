import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const src = path.join(root, 'src');
export const contentDir = path.join(src, 'content');
export const dataDir = path.join(src, 'data');

// Files people download are served at /downloads/<name> and stored in src/downloads/<name>.
export const DOWNLOADS_URL = '/downloads/';
export const downloadsDir = path.join(src, 'downloads');

// The source file behind a site URL that is served straight from src/ (downloads, the CV).
export const srcFileFor = (url) => path.join(src, String(url).replace(/^\//, ''));
