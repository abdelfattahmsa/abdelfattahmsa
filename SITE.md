# abdelfattah.site: how it works

A plain HTML / CSS / JavaScript site. Content is Markdown; a small Node script (`build/`) turns it into static pages in English and Arabic, plus a search index. There is no framework and no runtime dependency in the browser.

```
src/
  content/          all writing, as Markdown with front matter
    wiki/{engineering,developer,design}/   wiki pages  (_index.md = the wiki's landing text)
    journey/  research/  guides/  downloads/  pages/  career/   (career = the About-page timeline)
  data/site.json    name, tagline, socials, menu, wikis (+ icon), ventures (+ brand colours), download categories, app manifest, JSON-LD person
  data/i18n/        UI strings (en.json, ar.json)
  data/*.json       drawn by the brand scripts and used by the header and sprite: wordmark, wordmark-ar, mascot, kyberia
  assets/           css, js, fonts, img, icons
  downloads/        the files people download
build/              build.mjs, dev.mjs, check.mjs; lib/: content.mjs (the collections: folders, URLs, ordering),
                    i18n.mjs (languages), search.mjs (search index), templates.mjs (HTML), icons.mjs (sprite)
admin/              local content editor (see below)
brand/              logo, mascot, poses, print and cover generators (shared code in lib.mjs, contact details in details.json), brief for Claude Design
```

## Commands

```
npm ci            # once
npm run dev       # http://127.0.0.1:4000, shows drafts, rebuilds on every change
npm run admin     # http://127.0.0.1:4173, the content editor
npm run build     # -> dist/  (what gets deployed)
npm run check     # link integrity, CSP-safety, one <h1> per page, no external resources
```

## Writing content

`name.md` is English, `name.ar.md` is the Arabic version of the same page. If there is no Arabic file, the Arabic site shows the English text with a notice. Front matter fields (title, summary, date, tags…) are listed in `admin/schema.json`. Raw HTML in Markdown is escaped on purpose.

## The admin (the "backend")

`npm run admin` opens a local editor for downloads, guides, journey posts, research, wiki pages and About. It creates and edits the Markdown files, uploads download files into `src/downloads/`, previews Markdown, checks the build, and its **Publish** button runs `git add src`, `git commit`, `git push` with your own git login. It listens on `127.0.0.1` only, checks Host/Origin headers, and requires a per-run token, so nothing else on your machine or the web can use it.

The About-page timeline is the *Career timeline* collection: one entry per job, a role, organisation, period text, start date (for ordering) and a one-line description, in English and Arabic.

Free downloads: choose a category and type, upload the file (or paste an external link), tick/untick *draft*. Draft items are hidden on the live site and visible under `npm run dev`. To add a category or type, edit `resourceCategories` / `resourceTypes` in `site.json`.

### The online admin

`https://abdelfattah.site/admin/` is the same editor, online. Sign in once with a **fine-grained personal access token** (GitHub → Settings → Developer settings → Fine-grained tokens) limited to this repository with **Contents: read and write**. The token is kept in that browser only and sent only to `api.github.com`. Every Save, Delete and Upload becomes a commit on `main`, so the site rebuilds and goes live in about a minute (the **Deployments** link shows progress). It edits the same collections as the local admin, including the knowledge hub (node type, topics, connections), previews Markdown with GitHub's renderer, and uploads files (25 MB max) into `src/downloads/`. The page is not linked from the site, is `noindex`, is blocked in `robots.txt` and does nothing without a token that can write to the repository; **Sign out** forgets the token. It is built by `build/lib/admin-online.mjs` from `admin/ui/` plus `admin/ui/backend-github.js`.

## The knowledge map (Knowledge Hub)

The hub and every wiki home page show the wikis as a 3D network, with a switch for **Map** (the default), **Grid** and **List**. The choice is remembered in the browser. Only the three wikis are in the map.

- **Nodes.** A knowledge area is a big node (one per wiki, and each area is a cluster). A topic is a medium node. A page is a small node.
- **Bonds.** Nothing connects automatically except through topics. A page bonds to each topic written in its `tags`, a topic bonds to its area, and a page with no topics bonds to its area. Everything else is a bond you choose by hand with the `connections` field. There is no matching on page text.
- **One map for both languages.** A page is one node whose label switches with the language. A topic written in English and in Arabic is one node when the two languages list their tags **in the same order**. A topic can also be a page of its own (`node: tag`), and then any language's title, its slug or its `aliases` match it.
- **Admin.** In a wiki page: `node` picks Page or Topic, `tags` lists topics (existing ones are one click away), `aliases` gives a topic other names, and `connections` is a search box that adds bonds to any area, topic or page. A bond works from either end.
- **Built for thousands.** The build lays the map out in 3D (`build/lib/graph.mjs`), so the browser only draws it (`src/assets/js/map.js`, plain WebGL, no library). The layout is kept in `src/data/graph-layout.json`: pages that are already in it keep their place and new ones settle next to what they bond to, so the map grows instead of reshuffling. Commit that file with your content (the admin's Publish does). Tested at 6,000 pages: the first layout takes seconds, later builds well under a second.
- **List and Grid** show 30 pages per area and a "Show more" button that reads the rest from the same graph file.

## Services page

`/services/` (and `/ar/services/`) lists what you offer, why to work with you, how to engage and a pricing note: prices are agreed on contact and depend on the scope. The "Open for collaboration" pill on the home page links to it. Its text, in English and Arabic, is in `src/data/services.json` (services, "why work with me", engagement types and terms, pricing note, button). The page is built by `pages.services` in `build/lib/templates.mjs`, is in the search and the sitemap, and is not in the main menu.

## Contact mascot

A small sticky mascot sits on the left of every page. Clicking it opens message (WhatsApp), call (Calendly) and email as icon-only buttons (the mascot does not move; they slide out to the side on desktop and upwards on phone and tablet, and each shows its name in a tooltip), drawn in the mascot's style (`brand/mascot-icons.mjs`, files in `brand/mascot/contact/`). The links are put together in the browser from one encoded value, like the contact form's inbox. Set the number, inbox and the Calendly link in `src/data/site.json` under `contact` (`whatsapp`, `inbox`, `calendly`). While `calendly` is empty the call button is not shown.

## Deploying

Pushing to `main` runs `.github/workflows/static.yml`: install, build, check, then publish **only `dist/`** to GitHub Pages. Pull requests run the build and checks without deploying.

## Contact form

The form posts to the Formspree endpoint in `site.json → contact.formEndpoint`; Formspree emails each message to the inbox it was set up with. If you ever blank that setting, the form falls back to opening the visitor's mail app, pre-filled. The inbox address is stored base64-encoded in the page so basic scrapers do not harvest it.

## CV button

The header's **Download CV** button appears automatically once the file `src/downloads/Abdelfattah-Aboulfoutoh-CV.pdf` exists (path set in `site.json → cv.file`). With no file there is no button, so there is never a dead link. Replace the PDF any time and push.

## Fonts and brand

Tajawal is bundled and is the only font (English and Arabic, text and display). Icons: `build/lib/iconset.mjs` is the single source for the ~54 line icons (thin black line plus a yellow accent); the site draws them with a line weight set per section by `--icon-w` in `main.css`, and `brand/build-icons.mjs` exports them as the icon pack (`brand/icons/`: line, white line, mascot-style stickers, sheet). Social media kit (Ask AM! and personal): `brand/build-social.mjs` → `brand/social/` (README with bios and rules). Brand files are generated by `npm run brand`, in this order: `brand/build-logo.mjs` (name wordmark; writes `src/data/wordmark.json`), `brand/build-mascot.mjs` (mascot set, the logo set in `brand/logos/` with its contact sheet, the site's icons and social image; writes `src/data/mascot.json`), `brand/build-poses.mjs` (the 12 poses from `brand/poses.mjs`; also `npm run brand:poses`), `brand/build-print.mjs` (business card, letterhead; the editable Word letterhead is `npm run brand:letterhead`, needs python-docx) and `brand/build-covers.mjs` (download covers). The mascot is drawn in `brand/mascot-art.mjs` (traced shapes in `mascot-shapes.json`), the logo layouts and their use cases are in `brand/lockup.mjs`, the 16/32 px favicons in `brand/mascot-pixel.mjs`, contact details for the print files are in `brand/details.json`, and the Arabic name is outlined into `src/data/wordmark-ar.json` by `brand/arabic-name.py` (needs `uharfbuzz fonttools brotli`, run only when the name changes). The site's web manifest is generated by the site build from `site.json → app`; the brief for Claude Design is `brand/CLAUDE-DESIGN-BRIEF.md`.

## Security notes

Strict Content-Security-Policy via `<meta>` (scripts only from the same origin plus one hashed inline theme snippet; no inline styles or handlers), no third-party scripts, fonts or analytics, links to other sites carry `rel="noopener noreferrer"`, Markdown cannot inject HTML, and the admin only writes inside `src/`. GitHub Pages cannot send HTTP security headers, so `frame-ancestors` (clickjacking protection) cannot be set; put the domain behind Cloudflare if that matters.
