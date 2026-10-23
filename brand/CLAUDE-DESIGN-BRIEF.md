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

The **second reference image** (a handwritten *mf.* monogram above a tracked capital name) was tried as a brush-signature monogram and then set aside: the owner prefers a **clean typographic logo set in the website font**.

UI language for the website, which the brand should also use: **circular frames for buttons and icons**, very simple 1.75-stroke line icons, pill-shaped text buttons, generous space, no decoration.

## 3. The logo as it exists now

**Concept.** The owner's name, **Abdelfattah** over **Aboulfoutoh**, stacked on two lines, set in the website's display font. Plain, confident, no ornament. An **AM** badge and favicon use the same typeface.

**Construction.** Two lines of text converted to outlines: bold, −1.2% tracking, leading = 1.2× cap height, left-aligned. Source of truth: `build-logo.mjs`, which regenerates every file. It currently uses **Tajawal Bold** (bundled). When the Satoshi files are added to `brand/fonts/` it switches to **Satoshi Bold** automatically.

**Files in `logo/`**

| File | Use |
|---|---|
| `am-wordmark.svg`, `am-wordmark-white.svg` | The stacked name, black / white (site header, letterhead, email, slides) |
| `am-badge.svg`, `am-badge-white.svg` | Solid circle with **AM** knocked out (true transparency): avatars, stamps |
| `am-favicon.svg` | Yellow disc + black **AM** for ≤ 32 px |
| `png/` | Exports: wordmark 2000 px, badges 1024, favicons 16/32/48/180/192/512, OG image 1200×630 |
| `tests.html`, `png/logo-test-sheet.png` | The test sheet |

**Testing results (honest).**

| Test | Result |
|---|---|
| Single-colour (black, white, on yellow, on grey, on a busy gradient) | Pass |
| Reversal / knock-out badge | Pass |
| Squint / blur and 1-bit threshold | Pass |
| Small sizes: wordmark clear from **26 px** tall (site header: 34 px, 26 px on phones); crowded below ~22 px | Pass ≥ 26 px |
| Favicon: crisp at 32 px; at 16×16 (1×) the "AM" is soft but recognisable | **Marginal at 16 px** |

**Known weak spots:** typeface is interim until Satoshi is added; no Arabic version; the 16×16 favicon would benefit from hand pixel-hinting.

## 4. Typography

| Role | Font | Notes |
|---|---|---|
| All text (UI, body, Arabic and Latin) | **Tajawal** (400 / 500 / 700) | Open Font License, self-hosted. Supports Arabic and Latin. |
| Display / headings / name / logo | **Satoshi** | Free from fontshare.com (Indian Type Foundry licence). **Files not yet added**, so headings and the logo currently use Tajawal. Satoshi is Latin-only, so Arabic display text stays **Tajawal Bold**. |

Related brand (for context only): the **Kyberia** guidelines use Spline Sans (display), Satoshi (reading), Spline Sans Mono (labels) and IBM Plex Sans Arabic. The personal brand deliberately differs: black and white, Tajawal + Satoshi.

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

**Venture colours** (from the Kyberia brand guidelines; ventures show as grey until hovered on the site): Kyberia Tech `#FF2F92`, Kyberia Labs `#2D6BFF`, Kyberia Studios `#FF7A1A`. The three Kyberia lockups on the site are the **real vector logos taken from the guideline PDF** (never redrawn). Peridot Holding has no logo in that document, so it appears as text only, in `#7EB731` on hover.

## 6. UI components to document

Circular icon buttons (44 px, 1 px border, invert on hover), pill text buttons (48 px, primary = inverted, hover = yellow), search pill (58 px), chips, cards (large radius ~32 px, 1 px line), rows, side drawer (hub navigation, opens from the start edge, mirrored in RTL), two themes (Dark default, Light), full **RTL** (Arabic) via logical properties, motion ≤ 300 ms with reduced-motion respected, 44 px minimum targets, WCAG 2.2 AA (the site passes axe with 0 violations in both themes and languages).

Icons: 24-px grid, 1.75 stroke, round caps and joins, filled brand glyphs only for social networks. Tokens: `design-tokens.json`.

## 7. Deliverables requested

**A. Brand identity document + guidelines** (PDF and/or HTML), covering: brand story and positioning · voice and vocabulary (EN + AR) · logo anatomy, clear space (current: one cap-height on all sides), minimum sizes (wordmark 26 px on screen; AM badge below that), lockups, colour and one-colour rules, misuse (don'ts) · Arabic lockup rules · typography (Tajawal + Heming) with scale · colour system and accessibility pairs · iconography · layout and UI language (circular frames) · motion · imagery and diagram style (black/white, geometric, high-contrast) · how personal brand relates to Kyberia and Peridot (never mix colours; ventures appear grey until hovered) · templates guidance · dos and don'ts.

**B. Assets**

1. Final logo suite (SVG + PNG): wordmark in **English and Arabic**, AM badge, one-colour, reversed; outlined text (no font dependencies). Offer a single-line (horizontal) variant if one is useful.
2. Favicon / app icon set including a **hand pixel-hinted 16×16 and 32×32** (the current auto-scaled one is soft at 16 px), `apple-touch-icon` 180, Android 192/512, maskable variants.
3. Social: avatars (LinkedIn, GitHub, X, Instagram, Behance, Medium, ResearchGate), banners (LinkedIn 1584×396, X 1500×500), GitHub social preview 1280×640, **Open Graph 1200×630** (a basic one exists), email signature.
4. Stationery: business card (85×55), letterhead, CV header block, cover-letter header, slide master (16:9) with title / section / content layouts, Notion page cover + icon set.
5. Download-thumbnail system: a consistent cover style for free downloads (Claude skills / prompts, Notion templates, spreadsheet templates, website templates, CV and cover-letter templates), 4:3, black/white, category glyphs in the circular-frame style.
6. A simple pattern / texture for backgrounds, built from the letterforms of the name.

## 8. Open items and risks (please address or flag)

1. **Satoshi**: add the files, then regenerate the wordmark (`node brand/build-logo.mjs`). Design an **Arabic** lockup (عبدالفتاح أبو الفتوح) to sit beside it.
2. **Hinted favicon** (16×16, 32×32): the auto-scaled "AM" is soft at 16 px.
3. **Peridot Holding** has no logo yet (text only on the site).
4. **Distinctiveness**: a plain typographic logo is easy to execute and easy to confuse. Consider one ownable detail (a custom letterform, a cut, a signature alternate) without losing the plain character.
5. **Name choice**: the lockup uses first + family name; decide whether formal use includes the middle initial "M.".

## 9. Constraints

Black and white first; yellow minimal; no gradients, drop shadows, 3D or glossy effects; no stock-photo styling; Arabic is a first-class language (RTL, Tajawal); everything must work in one colour and at small sizes; keep it **very simple**.

---

*Package contents:* `CLAUDE-DESIGN-BRIEF.md` (this file), `design-tokens.json`, `logo/` (SVG, PNG, tests), `build-logo.mjs` (regenerates all logo files), `reference/README.md`.
