# Untangle: decision log

One question, asked of every piece of the repository: **should these pieces change together?**
Line numbers refer to the code as it was before this refactor (commit `db2ba2c`).

Scope chosen: untangle, plus **Comments** (remove comments that only restate the code) and
**Tests** (remove tests that would not catch a real bug, fix the ones that fail without one).

Safety net: `npm run build` output (`dist/`), `npm run check`, and the output of every brand
generator (`npm run brand`, `brand/arabic-name.py`, `brand/build-letterhead-docx.py`) were
snapshotted before any change and diffed after.

## 1. Problems

### Hidden links (must change together, nothing says so)

- `build/build.mjs:148-161` (search index) and `build/lib/templates.mjs:51-91, 325-545` (pages, drawer) each spell out every section's URL (`/hub/research/`, `/hub/journey/`, `/resources/guides/`, `/resources/downloads/`, `/hub/<wiki>/`).
- `build/lib/content.mjs:301-334` hard-codes each content folder; `admin/schema.json` repeats every folder as `dir`.
- `admin/schema.json` hard-codes the three wikis as `wiki-engineering`, `wiki-developer`, `wiki-design`; `src/data/site.json → wikis` is the real list; `content.mjs:305` lists whatever folders exist; `build.mjs:108` keeps a fourth list (`wikiIcons`).
- `templates.mjs:54, 331, 355` and `build.mjs:149` each fall back to `{ pages: [], index: null }` for a wiki in `site.json` that has no folder, because the two lists can disagree.
- The language set `en`/`ar` and everything derived from it is spread out: `content.mjs:246` (`LANGS`, exported, unused), `content.mjs:267` (file-name regex), `admin/server.mjs:27,58,71` (own `LANGS`, own file-name rules), `build.mjs:127`, `check.mjs:63` (`['', 'ar/']`), `templates.mjs:12-13, 23, 95, 137, 161, 169, 109`, `admin/ui/admin.js:99-101`.
- `templates.mjs:104` decides the language button label by comparing a translated string to `'English'`.
- `build/lib/util.mjs:232` `normalise()` and `src/assets/js/main.js:16` `normalise()` are two copies that must stay identical, or search stops matching its own index.
- `src/assets/css/main.css:109-111` hard-codes the header logo aspect ratios (`168/184`, `554/163`, `411/222`) copied from the generated `build/lib/mascot.json`, `build/lib/mark-path.json` and `brand/mascot/arabic-name.json`. Regenerating the wordmark (e.g. with Satoshi, or with Tajawal as here: 518/142) silently distorts the header.
- `build/lib/icons.mjs:193` lists the social glyphs to put in the sprite; `site.json → socials` is the list the pages render. Add a network to one and the icon is missing.
- `build/build.mjs:95,97` hard-codes `https://formspree.io` in the CSP; `site.json → contact.formEndpoint` is the setting that decides it.
- The URL ↔ source-file rule for downloads (`/downloads/x` is `src/downloads/x`) is re-derived in `content.mjs:321`, `build.mjs:70-73`, `build.mjs:79-82` (CV), `admin/server.mjs:198-213` (three times) and `admin/schema.json` (`dir`, `urlPrefix`).
- `build/lib/templates.mjs:4` (`THEME_INIT`, inline theme script) and `src/assets/js/main.js:25-31` share the `theme` storage key and values, in different folders.
- `build/build.mjs:14-15` and `build/check.mjs:7` take their configuration from `process.env.OUT_DIR` / `BUILD_DRAFTS` read at import time; `build/dev.mjs:94` sets the env var to steer them. `BUILD_DRAFTS` is set by nothing.
- `brand/build-mascot.mjs:121`, `brand/build-print.mjs:132` read `build/lib/mark-path.json`, written by `brand/build-logo.mjs:105`; `build-mascot.mjs:148` reads `brand/mascot/arabic-name.json`. Generated data the site and the brand both consume is scattered over `build/lib/`, `brand/mascot/` and `src/data/`.
- `brand/build-print.mjs:217` reads `brand/mascot/am-lockup.svg` from disk, so it only works after `build-mascot.mjs` ran.
- `brand/build-covers.mjs:264-267` parses the pose SVG files back from disk, so it only works after `mascot-poses.mjs` ran.
- `brand/build-logo.mjs:101-104` writes the site icons and `og.png`; `brand/build-mascot.mjs:202-205` overwrites the same files. Correct only because of the order in `package.json → brand`; running `build-logo.mjs` alone puts the old AM badge back on the site.
- `brand/build-mascot.mjs:217-226` writes `site.webmanifest` with the site name and the tagline copied from `site.json`.
- `brand/mascot-poses.mjs:207` redraws the hard-hat geometry already defined in `brand/mascot-art.mjs:42`.
- Satoshi detection differs per script: `build-logo.mjs:22` (regex, any of otf/ttf/woff), `build-covers.mjs:249` (exact `Satoshi-Bold.otf`), `build-print.mjs` (never).
- Owner details (name, phone, e-mail, web, address) are typed in `brand/build-print.mjs:159-166` and again, pre-formatted, in `brand/build-letterhead-docx.py:15`.
- Colours: `YELLOW/INK/PAPER` defined in `build-logo.mjs:17` and `mascot-art.mjs:3-5`; RGB copies in `mascot-pixel.mjs:38`.
- The name `Abdelfattah Aboulfoutoh` is typed as `TITLE` in `build-logo.mjs:52`, `build-mascot.mjs:16`, `build-print.mjs:14`, and again in the manifest.
- The two lockups (`build-mascot.mjs:135-143`, `build-print.mjs:141-150`) are the same geometry (name height per 200 units of head, gap 18 % of height) written twice.
- `admin/ui/admin.js:93` (`state.c === 'downloads'`), `:90-91` (`f.name === 'date'`, `f.name === 'status'`) keep per-collection defaults in the UI code, away from the schema that defines those fields.
- `admin/ui/admin.js:167, 205` and `admin/server.mjs:77` each know that wikis have a special `_index` page; `content.mjs:309` is the rule.
- `.claude/launch.json` serves the repository root on port 3000, which is not the site; the site is `npm run dev` on 4000.

### Needless links (tied together, change for different reasons)

- `build/build.mjs:122,137-163` builds the search index from the templates' private helpers (`T`, `L`, `u` returned by `createTemplates`).
- `build/lib/icons.mjs:188` takes `markPath` as a parameter but reads `mascot.json` and `arabic-name.json` itself from fixed paths.
- `brand/build-covers.mjs:240` (brand library) imports `STROKE` from the site's `build/lib/icons.mjs`: acceptable, icons are shared design, kept.
- `admin/server.mjs:43` reads `x.label.en` (English hard-wired) to build select options.

### Surplus

- Dead code: `content.mjs:337` (`LANGS` export), `icons.mjs:221` (`hasIcon`), `util.mjs:211` (`copyDir` `filter` parameter), `templates.mjs:577` (`pick` returned), `templates.mjs:202` (`backHref`, `kind` parameters), `templates.mjs:28` (`brandClass` wrapper), `admin/server.mjs:197-201` (`/api/files`, never called), `admin/schema.json` (`file.dir`), `brand/mascot-art.mjs:118` (`svgDoc` `size` parameter), `brand/mascot-poses.mjs:57-58` (`grip`/`hold` hand kinds nobody uses), `mascot-poses.mjs:50` (`kind` parameter of `handG`), `brand/arabic-name.py:30-35, 63-65` (outline computed twice, unused inner function).
- Dead data: 17 i18n keys nobody reads (`theme.dark`, `theme.light`, `hub.all`, `hub.updated`, `hub.back`, `hub.in`, `about.title`, `about.lead`, `res.open`, `dl.filter`, `dl.back`, `dl.included`, `contact.email.label`, `footer.built`, `lang.name`, `about.credentials`, `tl.present`); `site.json → ventures[].kyberia`; the downloads `featured` field (schema + one file), rendered nowhere.
- `templates.mjs:98` `k === 'hub' ? 'hub' : k` is a no-op.
- Content in code: the JSON-LD job title and address (`templates.mjs:291-292`).

### Special cases

- `templates.mjs:205, 250, 332, 362` show a Draft badge for `status: draft`; `templates.mjs:482, 528` for `draft: true`; `admin/server.mjs:78` for either. In a drafts build a hidden journey post gets no badge, a hidden download does.
- `templates.mjs:316` (About) does not wrap an English fallback in `lang="en" dir="ltr"`, while articles (`:220`), wiki intros (`:358`) and downloads (`:530`) do.
- `build.mjs:154` uses the English tags of wiki pages in the Arabic index; every other section uses the page's own language.
- `content.mjs:285` dates every item by `date || start || updated`: `start` exists only for career, `updated` only for wikis.
- `icons.mjs:214` adds the Arabic logo only if its file exists, but `templates.mjs:109` always uses it.
- `icons.mjs:196` replaces the packaged Medium glyph (kept: the package's glyph is wrong).
- `admin/server.mjs:104` validates the field named `url` (an `if` for one field name).
- `build.mjs:175, 178` copy `favicon.ico` and `CNAME` only if present (kept: CNAME is optional; favicon.ico is generated and committed, so its `if` goes).
- `brand/build-covers.mjs:254-262` silently draws a cover without glyph or pose for a category it does not know.

### Comments and tests

- Comments restating code or out of date: "optional Heming @font-face" (`build.mjs:33`, `main.css:3,19`: the font is Satoshi), "(16 poses)" (`mascot-poses.mjs:1`, there are 20), "core, design and research" (`mascot-poses.mjs:227`, also engineering and developer), "Placeholders until final brand marks are supplied" (`icons.mjs:176`), and section-divider comments that only name the next line.
- Tests: the repository has no test suite. `build/check.mjs` (post-build checks) is the only automated check; each of its checks can fail on a real regression, so none were removed.

## 2. Fixes (each above the problems it solves)

- **One table of content collections** (`build/lib/content.mjs → collections(site)`): folder, URL base, date field, ordering, search type and whether it has a wiki `_index`, for every collection, with the wikis generated from `site.json → wikis` (which now also carries each wiki's icon). Content loading, pages, the drawer, the search index and the admin all read it, and every loaded item carries its own `url`.
  - search index and templates each spell out every section's URL
  - `content.mjs` hard-codes folders; `admin/schema.json` repeats them as `dir`
  - schema hard-codes the three wikis; `wikiIcons` is a fourth list
  - `{ pages: [], index: null }` fallbacks
  - `date || start || updated`
  - `_index` known in three places
  - admin.js `state.c.indexOf('wiki-')`
- **One language module** (`build/lib/i18n.mjs`): the languages, their direction, URL prefix, locales and font subset, plus `T`, `L`, `u`, `otherLang` and the content file-name rule. The language button shows the other language's `lang.short` string. The admin receives the languages from the server.
  - language set spread over nine files
  - button label by comparing to `'English'`
  - `admin/server.mjs` reads `label.en`
- **The search index is its own module** (`build/lib/search.mjs`), built from the collection table and the language module. It owns the normalisation rules and generates the browser's copy of `normalise()` into `main.js` at build time.
  - two hand-kept copies of `normalise()`
  - search index built from the templates' private helpers
  - wiki pages use English tags in the Arabic index
- **One rule for drafts** (`isDraft`/`isHidden` in `content.mjs`) and one badge helper.
  - badge for `status` in some places, `draft` in others, either in the admin
- **One rule for site files** (`build/lib/paths.mjs`): the repository paths, and `srcFileFor(url)` for files served from `src/` (downloads, the CV). Admin uploads use the same constants.
  - downloads URL ↔ file rule re-derived in six places
- **The data the site takes from the brand lives in `src/data/`** (`wordmark.json`, `wordmark-ar.json`, `mascot.json`, next to `kyberia.json`); the build derives the header-logo aspect ratios from it and builds the sprite from `site.json → socials`.
  - aspect ratios hard-coded in `main.css`
  - social glyph list separate from `site.json → socials`
  - `icons.mjs` reads two of its four inputs itself; the Arabic logo `if`
  - generated data scattered over `build/lib/`, `brand/mascot/`, `src/data/`
- **The site build owns site files**: `site.webmanifest` is generated from `site.json` (new `app` block); `build-logo.mjs` no longer writes into `src/`; the CSP's form origin comes from `contact.formEndpoint`; the JSON-LD person comes from `site.json → person`; the inline theme script lives next to `main.js` in `src/assets/js/theme-init.js`.
  - manifest written by a brand script, with copied name and tagline
  - `build-logo.mjs` and `build-mascot.mjs` overwrite the same site files
  - CSP hard-codes formspree
  - JSON-LD job title in a template
  - `theme` key split across folders
- **`build({ outDir, drafts })` takes options**; the CLI (and `check.mjs`) parse `--out`/`--drafts`.
  - configuration via environment read at import time; `BUILD_DRAFTS` set by nothing
- **A shared brand toolkit** (`brand/lib.mjs`): paths, colours, the name, fonts (one Satoshi rule), SVG documents, PNG rendering, the lockup geometry and the owner details (`brand/details.json`, also read by the Word letterhead script). Poses are a module (`brand/poses.mjs`) that the poses writer and the covers both import; the hat is defined once in `mascot-art.mjs`; print draws the lockup in memory.
  - Satoshi detection differs per script
  - owner details typed twice
  - colours and the name typed in several scripts
  - two lockups with the same geometry
  - print reads `am-lockup.svg`, covers parse pose files from disk
  - hat geometry copied into the poses
- **The admin schema describes fields completely**: `default` values, a `url` field type, and the collection's `index` flag, so the admin code has no per-collection or per-field-name cases.
  - `if (state.c === 'downloads')`, `f.name === 'date'`, `f.name === 'status'`
  - `if (f.name === 'url')`
- **The About page uses the same prose helper as every other page.**
  - About does not mark an English fallback as English
- **Delete what nothing uses** (dead code and data listed under Surplus), and the comments listed above; fix `.claude/launch.json` to run the dev server.
- **Make a missing cover mapping an error**, not a blank cover.
  - covers silently skip unknown categories

### Kept on purpose

- `brand/design-tokens.json` repeats the CSS tokens. It is a hand-off document for an external design tool and says the CSS is the source of truth.
- The Medium glyph override in `icons.mjs`: the packaged glyph is broken; the comment says so.
- `CNAME` is copied only if present: it is genuinely optional.
- The home page's own search (no overlay, no search button): a page type, not a special case.

## 3. Output after the refactor

See the commit messages and the final section of this log (added at the end of the work).
