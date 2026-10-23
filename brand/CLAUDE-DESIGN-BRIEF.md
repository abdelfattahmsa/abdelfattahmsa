# Brand brief for Claude Design: Abdelfattah M. (AM)

**Goal:** turn the starter identity in this package into a complete **brand identity document + brand guidelines + production assets** for the personal brand of Abdelfattah M. Aboulfoutoh.

**How to use this package:** attach this file, the `logo/` folder (SVGs + PNGs + `tests.html` / `png/logo-test-sheet.png`), `design-tokens.json`, and the two reference images (see `reference/README.md`). Everything below is a starting point to build on, not a finished system. Where this brief says *open*, make a recommendation and flag it.

---

## 1. Who and what

| | |
|---|---|
| Name | **Abdelfattah Mohammed Sameer Aboulfoutoh**. Short forms: *Abdelfattah*, *AM*, *Abdelfattah M.* |
| Based in | Cairo, Egypt |
| Positioning | **Engineer. System Builder. Product Architect.** |
| One-liner | *Bridging physical infrastructure with digital solutions: designing structured, scalable systems for life, work, and technology.* |
| Domains | Engineering & construction management (project controls) · software & product development · data analysis & systems architecture |
| Role of the brand | The *signal* for a group of ventures: it builds the trust and audience that discovers Kyberia Tech and Peridot Holding. It is a personal brand, **not** a company brand. |
| Audience | Engineers, project/construction professionals, founders and builders, designers and developers, hiring managers and clients, in **English and Arabic** |
| Where it appears | abdelfattah.site (site + knowledge hub + free downloads), LinkedIn, GitHub, X, Instagram, Behance, Medium, ResearchGate, CV / cover letters, email, slides |
| Content pillars | Engineering insight · Product building · Systems thinking |

**Voice.** Use: systems, precision, building, engineering, compounding, endurance, maker. Avoid: influencer framing, hustle culture, growth-hack language. Tone is calm, exact, structured, confident without being loud. Copy is concise (Arabic runs 30–40% longer than English).

**Product context (for realistic mockups).** The site is a personal space combining a portfolio with wikis (Engineering, Developer, Design), research, a journey blog, free downloads (Claude skills/prompts, Notion & spreadsheet templates, website, CV and cover-letter templates) and behind-the-scenes guides.

## 2. Design language (what the logo and UI are based on)

Derived from the first reference image (a grid of black-and-white geometric logos):

- **Pure black and white**, one colour per mark. No gradients, shadows or outlines.
- **Basic geometry only**: semicircles, circles, rectangles, triangles. Every curve is a true circle; every edge is straight.
- **Negative space does the work**: the shape is carved, not drawn.
- **Heavy, blocky weight**; modular, grid-built; quiet and confident.
- Wordmarks are bold grotesque sans-serif, often tracked-out capitals.

The **second reference image** (a handwritten *mf.* monogram above a widely tracked capital name) is the model for the **current logo**: a brush-pen signature monogram with the name stacked underneath. (An earlier geometric "Am" monogram was rejected and removed.)

UI language for the website, which the brand should also use: **circular frames for buttons and icons**, very simple 1.75-stroke line icons, pill-shaped text buttons, generous space, no decoration.

## 3. The logo as it exists now

**Concept.** A brush-pen signature monogram in capitals, **AM.**, with a rising flourish and a full stop, and the full name **ABDELFATTAH ABOULFOUTOH** set underneath in widely tracked capitals. It should feel personal, confident and fast, the opposite of corporate, which suits a personal brand.

**Construction.** Hand-placed pen centre-lines, swept with a flat nib held at −28° (so down-strokes are thick and up-strokes thin), a brush swell on the flourish, an 11° lean, then converted to one clean filled outline (no strokes, no effects). Source of truth: `build-signature.mjs` + `pen.mjs`, which regenerate every file. It is a *drawing*: refine it by editing the point lists, or redraw it by hand in a vector tool if you can improve on it.

**Files in `logo/`**

| File | Use |
|---|---|
| `am-signature.svg`, `am-signature-white.svg` | The signature alone, black / white |
| `am-lockup.svg`, `am-lockup-white.svg` | Signature with the name stacked beneath (headers, letterhead, email, slides) |
| `am-badge.svg`, `am-badge-white.svg` | Solid circle with the signature knocked out (true transparency): avatars, stamps |
| `am-favicon.svg` | Yellow disc + black **bold master** ("AM", no flourish or full stop) for ≤ 32 px |
| `png/` | Exports: signatures and lockups 2000 px, badges 1024, favicons 16/32/48/180/192/512, OG image 1200×630 |
| `tests.html`, `png/logo-test-sheet.png` | The test sheet |

The website header uses the **bold** weight at ~30 px tall; the regular weight is for large display use.

**Testing results (honest).**

| Test | Result |
|---|---|
| Single-colour (black, white, on yellow, on grey, on a busy gradient) | Pass |
| Reversal / knock-out badge on imagery | Pass |
| Squint / blur (silhouette stays a leaning "AM" with a rising tail) | Pass |
| Greyscale and 1-bit threshold | Pass |
| Icon masks (circle, squircle, square) | Pass |
| Small sizes, regular signature: clear from **24 px** tall; at 16 px the hairline flourish goes grey but the letters still read | Pass ≥ 24 px |
| Favicon (bold master): reads as "AM" at 16 px, crisp at 32 px | Pass |
| Unintended readings | Reads "AM." | 

**Known weak spots:** the flourish is a hairline and fades under 24 px; a hand pixel-hinted 16×16 favicon would be crisper; the geometry is generated, so a human type/lettering designer may improve stroke rhythm and the join between the A and the M.

## 4. Typography

| Role | Font | Notes |
|---|---|---|
| All text (UI, body, Arabic and Latin) | **Tajawal** (400 / 500 / 700) | Open Font License, self-hosted. Supports Arabic and Latin. |
| Display / headings / name | **Heming** | **Not yet in the project.** Reported as a free monospaced sans-serif by Ádám Görzsöny, variable weight. The "by Awwwards" attribution could not be verified and no official download or licence text was found, so confirm the licence before using it. It is expected to be **Latin-only**, so Arabic display text falls back to **Tajawal Bold**. |

The name line in the current lockups is **Tajawal Medium outlines, capitals, +36% tracking**. It is an interim stand-in. **Redraw it in Heming once the file is obtained**, and design an **Arabic lockup** (عبدالفتاح أبو الفتوح) that balances with the signature; an Arabic signature in the same brush spirit (or a calligraphic treatment) is welcome.

## 5. Colour

Strictly black and white with **one** accent.

| Token | Value | Use |
|---|---|---|
| Black | `#000000` | Dark theme background, light theme text, logo |
| White | `#FFFFFF` | Light theme background, dark theme text, logo |
| Surface (dark / light) | `#0B0B0B` / `#F7F7F7` | Cards, drawers |
| Surface 2 | `#161616` / `#ECECEC` | Hover, chips |
| Muted text | `#A6A6A6` / `#595959` | Secondary text (≥ 4.5:1 on its background) |
| Line | `#252525` / `#E1E1E1` | Hairlines |
| Line strong | `#4D4D4D` / `#A8A8A8` | Circle and input borders |
| **Accent yellow** | **`#FFCC00`** | **Minimal use only** |

**Yellow rules.** Allowed: keyboard focus ring, the small "current page" dot, text-selection highlight, hover on a primary button, the favicon / app-icon disc, a single rule in social cards. **Never**: body text, large fills, text on white (fails contrast), more than one yellow element per view.

**Venture colours** (separate brands; shown only as grey-scale marks that light up on hover): Kyberia Tech `#FF2F92` (neon pink; note the older design-system doc says green `#7EB731`, so confirm), Kyberia Labs `#159E97`, Kyberia Studio `#6636D9`, Peridot Holding `#7EB731`. The current venture marks are **placeholders** (asterisk family + a gem); replace with the real marks.

## 6. UI components to document

Circular icon buttons (44 px, 1 px border, invert on hover), pill text buttons (48 px, primary = inverted, hover = yellow), search pill (58 px), chips, cards (large radius ~32 px, 1 px line), rows, side drawer (hub navigation, opens from the start edge, mirrored in RTL), two themes (Dark default, Light), full **RTL** (Arabic) via logical properties, motion ≤ 300 ms with reduced-motion respected, 44 px minimum targets, WCAG 2.2 AA (the site passes axe with 0 violations in both themes and languages).

Icons: 24-px grid, 1.75 stroke, round caps and joins, filled brand glyphs only for social networks. Tokens: `design-tokens.json`.

## 7. Deliverables requested

**A. Brand identity document + guidelines** (PDF and/or HTML), covering: brand story and positioning · voice and vocabulary (EN + AR) · logo anatomy, clear space (current: ¼ of the signature's height on all sides), minimum sizes (regular signature 24 px screen / 12 mm print; bold master and favicon below that), lockups, colour and one-colour rules, misuse (don'ts) · Arabic lockup rules · typography (Tajawal + Heming) with scale · colour system and accessibility pairs · iconography · layout and UI language (circular frames) · motion · imagery and diagram style (black/white, geometric, high-contrast) · how personal brand relates to Kyberia and Peridot (never mix colours; ventures appear grey until hovered) · templates guidance · dos and don'ts.

**B. Assets**

1. Final logo suite (SVG + PNG): signature, lockup in **English and Arabic**, badge, one-colour, reversed; outlined text (no font dependencies). Offer a horizontal lockup variant if one is useful.
2. Favicon / app icon set including a **hand pixel-hinted 16×16 and 32×32** (the current bold master is legible at 16 px but a hinted version would be crisper), `apple-touch-icon` 180, Android 192/512, maskable variants.
3. Social: avatars (LinkedIn, GitHub, X, Instagram, Behance, Medium, ResearchGate), banners (LinkedIn 1584×396, X 1500×500), GitHub social preview 1280×640, **Open Graph 1200×630** (a basic one exists), email signature.
4. Stationery: business card (85×55), letterhead, CV header block, cover-letter header, slide master (16:9) with title / section / content layouts, Notion page cover + icon set.
5. Download-thumbnail system: a consistent cover style for free downloads (Claude skills / prompts, Notion templates, spreadsheet templates, website templates, CV and cover-letter templates), 4:3, black/white, category glyphs in the circular-frame style.
6. A simple pattern / texture built from the signature's strokes (flourish, A apex, M peaks) for backgrounds.

## 8. Open items and risks (please address or flag)

1. **Heming**: obtain, confirm licence, then redraw the name line. Latin-only expected, so design the Arabic counterpart.
2. **Stroke quality**: the signature is generated from point lists. Please review rhythm, the A/M join, the cross-stroke and the flourish, and refine or redraw as needed.
3. **Name choice**: the lockup uses first + family name (ABDELFATTAH ABOULFOUTOH). Decide whether formal use should include the middle initial "M." or a two-line / split layout like the reference.
4. **Hinted favicon** (16×16, 32×32) and a **bolder small-size master** for 16–24 px use.
5. **Venture marks** are placeholders; Kyberia Tech's colour (pink vs green) is inconsistent across sources.
6. **Distinctiveness**: run a quick check against similar "AM" signature marks before finalising.

## 9. Constraints

Black and white first; yellow minimal; no gradients, drop shadows, 3D or glossy effects; no stock-photo styling; Arabic is a first-class language (RTL, Tajawal); everything must work in one colour and at small sizes; keep it **very simple**.

---

*Package contents:* `CLAUDE-DESIGN-BRIEF.md` (this file), `design-tokens.json`, `logo/` (SVG, PNG, tests), `build-signature.mjs` + `pen.mjs` (regenerate all logo files), `reference/README.md`.
