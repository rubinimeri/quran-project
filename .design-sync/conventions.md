# Nur Design System — token & style conventions

Nur is a warm, devotional Quran-reading aesthetic: **deep-night grounds with luminous amber-gold light** ("Lantern at Dusk" in dark, "Morning Light / Dawn" in light). Calm and reverent — never a SaaS dashboard. This is a **token + style layer** (no components in this sync): style with the CSS custom properties and utility classes below.

## Theming (light / dark)

All tokens are CSS custom properties defined twice: on `:root` (light "Dawn") and on `.dark` (dark "Lantern at Dusk"). **Dark mode is opt-in via a `.dark` ancestor class** — put `class="dark"` on a wrapper (or `<html>`) and every `var(--*)` below re-resolves. Reference tokens through `var(--token)`; never hard-code hex — the OKLCH values shift between themes.

```html
<div class="dark">
  <section class="surah-glow" style="color: var(--foreground); font-family: var(--font-sans)">
    <h1 style="font-family: var(--font-display); color: var(--gold)">Al-Fatihah</h1>
    <button class="nur-kindle" style="background: var(--gold); color: var(--primary-foreground); border-radius: var(--radius-lg)">
      Begin
    </button>
  </section>
</div>
```

## Color tokens (`var(--*)`)

Surfaces & text: `--background` `--foreground` · `--card` `--card-foreground` · `--popover` `--popover-foreground` · `--muted` `--muted-foreground` · `--accent` `--accent-foreground` · `--secondary` `--secondary-foreground`.

Brand & intent: `--primary` `--primary-foreground` · **`--gold` `--gold-muted`** (the signature accent — gold IS the brand; use it sparingly as the single accent) · `--destructive`.

Lines & focus: `--border` `--input` `--ring`.

Glow shadows: `--glow-sm` `--glow-md` (gold, theme-aware — use in `box-shadow`).

Charts: `--chart-1`…`--chart-5`. Sidebar: `--sidebar*`. Tasbeeh ring: `--tasbeeh-arc-start` `--tasbeeh-arc-end` `--tasbeeh-track`.

## Radius

`--radius` (0.45rem base) with a derived scale: `--radius-sm` `--radius-md` `--radius-lg` `--radius-xl` `--radius-2xl` `--radius-3xl` `--radius-4xl`.

## Typography

Four families, referenced as vars: `--font-sans` (Satoshi — UI/body) · `--font-display` (Cormorant Garamond — headings) · `--font-arabic` (Amiri) · `--font-quran` (UthmanicHafs — Quranic verse text). Satoshi and UthmanicHafs ship in `fonts/`; Amiri and Cormorant load from Google Fonts.

## Utility classes

Surfaces & motion (all self-contained, gold-aware):

- **`.surah-glow`** — the signature backdrop: a soft radial gold dawn-glow over `--background` (adds teal moonlight in dark).
- **`.nur-kindle`** — hero CTA interaction: gold glow blooms and the element lifts on hover, dips on press, holds a focus halo.
- **`.verse-active`** — steady gold tint for the currently-reciting item. **`.verse-highlight`** — a gold ring that pulses then fades (deep-linked verse).
- **`.skeleton-shimmer`** — loading placeholder with a single gold light sweeping across.
- **`.fade-up` · `.fade-soft` · `.lantern-rise`** — entrance reveals (pair with `.delay-100`…`.delay-500`). `.lantern-rise` is the signature hero reveal (rise + de-blur).
- **`.tafsir-prose`** — long-form commentary typography. **`.verse-key` / `.verse-text`** — search-result rows.

All motion respects `prefers-reduced-motion`.

## Where the truth lives

The full token definitions and utility CSS are in **`styles.css`** (which `@import`s `_ds_bundle.css` for the token/style body and `fonts/fonts.css` for `@font-face`). Read those before styling — they are authoritative.
