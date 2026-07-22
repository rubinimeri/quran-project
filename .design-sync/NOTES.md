# design-sync notes — Nur Design System

Project: **Nur Design System** (`778bc203-b090-4411-845a-871feaa1ed30`) · https://claude.ai/design/p/778bc203-b090-4411-845a-871feaa1ed30

## What this sync is

- This repo is a **Next.js app**, not a packaged design system: no Storybook, no `*.stories.*`, no `dist/`/library build.
- Current sync scope = **tokens/styles only** (chosen as a small trial). No components are synced. Output is `styles.css` + an empty-bodied `_ds_bundle.js` (the documented tokens-only shape).

## Repo-specific gotchas (a future sync needs these)

- **Empty entry forces tokens-only.** The build is run with `--entry ./.design-sync/tokens-src/empty-entry.js`. This module `export {}`s nothing, so component discovery finds zero exports and `source-kit.mjs` switches to tokens-only mode. **Without it**, synth-entry mode would scan `components/` and pull in every app component — not what we want. Keep passing this `--entry`.
- **`cssEntry` is a hand-authored extraction, not `app/globals.css` directly.** `app/globals.css` is Tailwind v4 source (`@import "tailwindcss"`, `@theme inline`, `@apply`, `@custom-variant`) and cannot ship standalone. The portable token + utility layer is extracted into `.design-sync/tokens-src/styles.css`. **This copy does NOT auto-track `app/globals.css`** — see Re-sync risks.
- **Font `@font-face` urls must point at the real files, relative to the token sheet.** In `styles.css` they are `url("../../app/fonts/<file>.woff2")` so `lib/css.mjs`'s `extractFonts` resolves them (relative to `.design-sync/tokens-src/`), copies the woff2 into `fonts/`, and rewrites to `./<file>.woff2` in `fonts/fonts.css`. Pitfalls that were hit and fixed: a bare `fonts/<file>.woff2` url gets dropped as unresolvable; using `cfg.extraFonts` with bare woff2 copies the file but leaves a dangling `@font-face` url. Do neither.
- **Comment hygiene in the token sheet.** The validator's `@import` scan is text-based and will flag a literal `@import "..."` even inside a CSS comment (`[CSS_IMPORT_MISSING]`). Don't write quoted `@import` strings in comments.
- **Always run build/validate/driver with `--no-render-check`.** There are zero component previews to render, and playwright/chromium is not installed. The render check is moot here; the flag is legitimate (not "accepting an unverified component bundle").
- **Commands** (from repo root):
  - build: `node .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules ./node_modules --entry ./.design-sync/tokens-src/empty-entry.js --out ./ds-bundle`
  - validate: `node .ds-sync/package-validate.mjs ./ds-bundle --no-render-check`
  - driver (re-sync): `node .ds-sync/resync.mjs --config .design-sync/config.json --node-modules ./node_modules --entry ./.design-sync/tokens-src/empty-entry.js --out ./ds-bundle --remote .design-sync/.cache/remote-sync.json --no-render-check`

## Known render warns

- `[RENDER_SKIPPED]` — expected/permanent while this stays tokens-only (no previews + no playwright). Not a new warn.
- `[FONT_REMOTE] "Amiri", "Cormorant Garamond"` — expected: these load from Google Fonts at runtime via the `@import` in `styles.css`.

## Re-sync risks (watch-list)

- **The token sheet is a manual mirror of `app/globals.css`.** If the app's OKLCH palette, radius scale, font vars, or the signature utility classes (`.surah-glow`, `.nur-kindle`, `.verse-active`, `.skeleton-shimmer`, `.tafsir-prose`, etc.) change in `app/globals.css`, `.design-sync/tokens-src/styles.css` will silently go stale. Re-extract by hand on any design-token change, then rebuild.
- **`conventions.md` enumerates token/class names.** If tokens are renamed/removed, re-validate the names in `.design-sync/conventions.md` against the fresh `_ds_bundle.css` (grep each) and fix drift before uploading.
- **Fonts:** Satoshi + UthmanicHafs ship from `app/fonts/`. Amiri + Cormorant Garamond are runtime remote (Google). If the app moves to self-hosting those, add `@font-face` for them in the token sheet.
- **Scope is a trial.** If components are ever added to the sync, the empty-entry trick must be reconsidered and the shape re-evaluated (likely per-component `componentSrcMap` pins, since there's no dist/Storybook).
