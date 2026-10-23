# Fonts

- **Tajawal** (400/500/700, Latin + Arabic): already here, SIL Open Font License (`TAJAWAL-OFL-LICENSE.txt`). Used for all text.
- **Satoshi** (display: headings, your name, big numbers): **add the files here to switch it on.**
  1. Download it free from fontshare.com (Satoshi → Download family).
  2. Copy the `.woff2` files from the zip into this folder (`Satoshi-Variable.woff2`, or `Satoshi-Regular.woff2` / `Satoshi-Medium.woff2` / `Satoshi-Bold.woff2`). Keep the licence text next to them.
  3. Copy `Satoshi-Bold.otf` (or `.ttf`) into `brand/fonts/`, then run `node brand/build-logo.mjs` so the logo is redrawn in Satoshi too.

The build detects any file starting with `Satoshi` and ending in `.woff2`, adds the `@font-face`, and puts Satoshi first for headings. Satoshi has no Arabic, so Arabic headings keep using Tajawal Bold.
