# Fonts

- **Tajawal** (400/500/700, Latin + Arabic): bundled here, SIL Open Font License (`TAJAWAL-OFL-LICENSE.txt`). Used for all text.
- **Satoshi** (display: headings, your name, the logo): Indian Type Foundry Free Font License. The licence does not allow distributing the font files through a repository or public server, so **the font files are git-ignored and never committed**.

## Local use
Copy `Satoshi-Variable.woff2` into this folder (and `Satoshi-Bold.otf` into `brand/fonts/`). The build detects any `Satoshi*.woff2` here, adds the `@font-face`, preloads it and puts Satoshi first for headings. Run `node brand/build-logo.mjs` to redraw the logo in Satoshi.

## Live site (GitHub Actions)
1. Run `npm run fonts:pack` locally. It writes `.secrets/SATOSHI_WOFF2_B64_1.txt` and `_2.txt` (the font split in two, because a secret is limited to 48 KB).
2. In the repo, Settings, Secrets and variables, Actions: create `SATOSHI_WOFF2_B64_1` and `SATOSHI_WOFF2_B64_2` with the contents of those files.
3. The deploy workflow rebuilds the font from the secrets before `npm run build`. Without the secrets the site falls back to Tajawal.

Satoshi has no Arabic, so Arabic headings use Tajawal Bold.
