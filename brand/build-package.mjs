// Builds the downloadable brand package: brand/package/AM-Brand-Package.zip
// (logos, mascot, poses, icons, social kit with setup copy, print files, covers, fonts, a start-here guide).
// Run after `npm run brand`:  node brand/build-package.mjs
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const b = (p) => path.join(root, 'brand', p);
const out = b('package');
const stage = path.join(out, 'AM-Brand-Package');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true });

const copy = (from, to) => fs.cpSync(from, path.join(stage, to), { recursive: true, filter: (s) => !/\.(mjs|py)$/.test(s) && !s.endsWith('.DS_Store') });
copy(b('social/SETUP-COPY.md'), '01-Setup-copy/SETUP-COPY.md');
copy(b('logos'), '02-Logos');
copy(b('logo'), '02-Logos/name-wordmark');
copy(b('mascot'), '03-Mascot');
copy(b('social'), '04-Social');
fs.rmSync(path.join(stage, '04-Social/SETUP-COPY.md'), { force: true });
copy(b('icons'), '05-Icons');
copy(b('print'), '06-Print');
copy(b('covers'), '07-Download-covers');
copy(b('design-tokens.json'), '08-Brand-guide/design-tokens.json');
copy(b('CLAUDE-DESIGN-BRIEF.md'), '08-Brand-guide/brand-brief-for-designers.md');
const fontDir = path.join(root, 'node_modules/@fontsource/tajawal/files');
for (const f of fs.readdirSync(fontDir)) if (/tajawal-(latin|arabic)-(400|500|700)-normal\.woff2?$/.test(f)) copy(path.join(fontDir, f), `09-Fonts/web/${f}`);
fs.writeFileSync(path.join(stage, '09-Fonts/README.txt'), 'Font: Tajawal (SIL Open Font License 1.1), the only font of the brand, for English and Arabic.\nFor Canva, Figma, Word and phones: install Tajawal for free from https://fonts.google.com/specimen/Tajawal (weights 400, 500, 700).\nThe web folder holds the website files (WOFF/WOFF2).\n');

fs.writeFileSync(path.join(stage, '00-START-HERE.md'), `# Abdelfattah M. and Ask AM!: brand package

Your name: Abdelfattah Aboulfoutoh, MSc. · Engineer, Entrepreneur, Creative · abdelfattah.site
Your new pages: Ask AM! (LinkedIn and Instagram), plus personal profiles.

## What is in the folders
| Folder | What it holds | Use it for |
|---|---|---|
| 01-Setup-copy | SETUP-COPY.md | Names, bios, about text, first posts, highlights, hashtags for every page: copy and paste |
| 02-Logos | Logo set (SVG + PNG): the mascot with the name beside or under it, name lettering, English and Arabic, black, white and yellow | Websites, documents, slides, merch |
| 03-Mascot | The mascot head (flat, light, sun versions), round avatars, app icons, 12 poses (calm, happy, idea, coding, launch, wink...) and the contact icons | Avatars, stickers, posts, presentations |
| 04-Social | Avatars, banners and covers for LinkedIn, Instagram, X, YouTube, Facebook and GitHub; post, carousel and story templates; highlight covers; LinkedIn post image | Setting up and posting on every network |
| 05-Icons | 54 icons in 3 styles: line (black + yellow), line (white + yellow), mascot-style stickers | Slides, posts, documents |
| 06-Print | Business card (front and back), A4 letterhead (PDF and editable Word), mascot print files | Printing and email letters |
| 07-Download-covers | Cover images for free downloads and resources | Notion templates, guides, downloads |
| 08-Brand-guide | Colours and sizes as data, and the full brand brief | Briefing a designer or an AI tool |
| 09-Fonts | Tajawal | All text |

## The brand in one minute
- **Mascot:** a face-only cartoon of you: black hair and beard, white face, black line art. It reacts (poses) instead of using emoji. White sticker edge on dark backgrounds; on yellow, use the flat version.
- **Colours:** yellow **#FFCC00** (the one accent), black **#000000**, white **#FFFFFF**. Greys: #A6A6A6 (muted text on dark), #595959 (muted text on light).
- **Font:** Tajawal only, weights 400 / 500 / 700, English and Arabic.
- **Shapes:** rounded corners everywhere, thin lines, round buttons.
- **Text on yellow is black. Never put yellow text on white.**
- **Tone:** plain, warm, direct. One idea per post.

## Sizes (already made in 04-Social)
LinkedIn company logo 300 × 300, company cover 1128 × 191, personal cover 1584 × 396 · Instagram profile 1080 square, post 1080 × 1350, story 1080 × 1920, highlight cover 1080 × 1920 · X header 1500 × 500 · YouTube banner 2560 × 1440 (keep text in the centre) · Facebook cover 820 × 312 · GitHub preview 1280 × 640.

## Rules
Do not stretch, recolour or outline the logos. Keep clear space equal to half the mascot's width around them. Every PNG has an editable SVG beside it (text is already converted to shapes, so it needs no font).

## Editing the templates
Open the SVG files in Figma, Illustrator, Affinity or Canva (upload SVG), or ask Claude to change a template and rebuild the package (\`npm run brand\`).
`);

const zip = path.join(out, 'AM-Brand-Package.zip');
const r = spawnSync('zip', ['-rq', zip, 'AM-Brand-Package'], { cwd: out });
if (r.status !== 0) throw new Error(String(r.stderr));
console.log(`brand package → ${path.relative(root, zip)} (${(fs.statSync(zip).size / 1048576).toFixed(1)} MB)`);
