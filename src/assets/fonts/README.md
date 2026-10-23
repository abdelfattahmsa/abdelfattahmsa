# Fonts

- **Tajawal** (400/500/700, Latin + Arabic): already here, SIL Open Font License (`TAJAWAL-OFL-LICENSE.txt`).
- **Heming** (display): **add the file here to enable it.** Save a WOFF2 named like `Heming-Variable.woff2` (any filename starting with `Heming` and ending in `.woff2` is picked up). The build then adds the `@font-face` and switches headings and the name to Heming automatically. No other change needed.

Before adding it: check the licence that ships with the font. The only listing found describes it as free for personal and commercial use, but that is a third-party blurb. Keep the licence text next to the font file. If you only have TTF/OTF, convert to WOFF2 first (e.g. `npx woff2_compress` or fonttools). Heming is expected to be Latin-only, so Arabic headings continue to use Tajawal Bold.
