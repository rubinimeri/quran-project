---
name: Nur — The Noble Qur'an
description: A warm, luminous home for the Qur'an and daily Islamic practice.
colors:
  gold: "oklch(0.8 0.11 85)"
  gold-muted: "oklch(0.65 0.08 85)"
  night: "oklch(0.13 0.028 261.692)"
  surface: "oklch(0.21 0.034 264.665)"
  ink: "oklch(0.985 0.002 247.839)"
  ink-muted: "oklch(0.707 0.022 261.325)"
  teal-glow: "oklch(0.7 0.15 162)"
  hairline: "oklch(1 0 0 / 10%)"
  destructive: "oklch(0.704 0.191 22.216)"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2.25rem, 7vw, 4.5rem)"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "0.15em"
  arabic:
    fontFamily: "Amiri, Scheherazade, serif"
    fontSize: "clamp(1.75rem, 6vw, 4.5rem)"
    fontWeight: 400
    lineHeight: 2.1
    letterSpacing: "normal"
  body:
    fontFamily: "Satoshi, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Satoshi, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.2em"
rounded:
  sm: "calc(0.45rem - 4px)"
  md: "calc(0.45rem - 2px)"
  lg: "0.45rem"
  xl: "calc(0.45rem + 4px)"
  2xl: "calc(0.45rem + 8px)"
  4xl: "calc(0.45rem + 16px)"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.night}"
    rounded: "{rounded.4xl}"
    padding: "0 32px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.night}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.4xl}"
  devotional-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "32px 24px"
  search-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    height: "32px"
---

# Design System: Nur — The Noble Qur'an

## 1. Overview

**Creative North Star: "The Lantern at Dusk"**

Nur is a warm light held in deep night. The whole system rests on a single image: a lantern glowing gold against a blue-black evening sky — luminous, intimate, unhurried. The surface is a deep night (`oklch(0.13 0.028 261.692)`), and warmth arrives the way it does after sunset: not from a bright page, but from a small, deliberate source of gold light. This is why "Nur" (light) is the brand's literal anchor — illumination is the identity, carried by gold accents, gentle radial glows, and serif elegance, never by ornamental clutter.

The register is **brand**: the feel leads. Nur should be the Qur'an app someone keeps because it is beautiful and calm, not merely functional. Every screen is a frame for scripture and worship — the Arabic and its meaning take center stage, and the interface recedes around them. Density is low by design: generous whitespace and slow, exponential motion create the reflective space worship needs. The system is **warm without compromising reverence** and **welcoming to every level**, from the lifelong reciter to someone opening a Qur'an for the first time.

This system explicitly rejects the **generic SaaS dashboard** — no stat-card grids, no KPI tiles, no charty "analytics" framing. Counters and prayer times are devotional instruments, not data widgets. It equally rejects the **austere, intimidating** register of cold, gatekeeping religiosity, and the cluttered, ad-heavy density of legacy Quran apps. If a screen could pass for an admin panel or a metrics dashboard, it has failed.

**Key Characteristics:**
- Deep-night ground with a single luminous gold light source.
- Serif-led, editorial calm; Arabic script given room to breathe.
- Tonal depth and gentle glow instead of hard shadows.
- Slow, exponential fade-up motion; never bouncy, never busy.
- Whitespace as reverence; the words always come first.

## 2. Colors

A deep nocturnal ground lit by a single warm gold, with a cool teal used only as ambient light in the background.

### Primary
- **Lantern Gold** (`oklch(0.8 0.11 85)`): The brand's light source and only true accent. Used for headings and the wordmark, primary buttons, active states, ornamental glyphs (❖), reference labels, and hairline accent borders on devotional cards. Its warmth carries the entire brand — spend it deliberately.
- **Muted Gold** (`oklch(0.65 0.08 85)`): The quieter half of the gold voice. Section labels, transliteration text, secondary ornament, and divider lines. Where Lantern Gold shines, Muted Gold whispers.

### Secondary
- **Teal Glow** (`oklch(0.7 0.15 162)`): Never a foreground color. It exists only as a soft radial wash in the page background (`surah-glow`), suggesting moonlight behind the lantern. Forbidden as a text, button, or border color.

### Neutral
- **Deep Night** (`oklch(0.13 0.028 261.692)`): The body background. A blue-black evening, not pure black — it has just enough chroma toward indigo to feel like dusk rather than void.
- **Surface** (`oklch(0.21 0.034 264.665)`): Raised devotional cards and panels, almost always at reduced opacity (`/40`) so the night shows through like glass.
- **Ink** (`oklch(0.985 0.002 247.839)`): Primary readable text — off-white, never pure white, for comfort across long reading sessions.
- **Ink Muted** (`oklch(0.707 0.022 261.325)`): Translations, secondary copy, inactive navigation. Verify it clears 4.5:1 on the night ground; nudge toward Ink if a passage is long-form.
- **Hairline** (`oklch(1 0 0 / 10%)`): Borders and dividers — a 10% white whisper, never a solid gray line.

### Named Rules
**The One Light Rule.** Gold is the only accent. There is exactly one light source on screen; if a second competing accent appears (a colored badge, a blue link, a green "success"), the lantern metaphor breaks. Status and emphasis are carried by gold, weight, and opacity — not by a second hue.

**The Glass-Over-Night Rule.** Cards never sit on an opaque fill. Surfaces are the night seen through glass (`bg-surface/40`–`/60`); the dusk always shows through.

## 3. Typography

**Display Font:** Cormorant Garamond (with Georgia, serif)
**Arabic Font:** Amiri (with Scheherazade, serif)
**Body / Label Font:** Satoshi (with system-ui, sans-serif)

**Character:** A serif-led, editorial pairing. Cormorant Garamond brings high-contrast, light-weight elegance to English headings and the wordmark; Amiri carries the Qur'anic Arabic with classical naskh grace; Satoshi — a warm geometric-grotesque — handles UI text, labels, and translations with quiet, friendly neutrality. The contrast axis is serif-display against grotesque-sans — never two similar sans-serifs.

### Hierarchy
- **Display** (Cormorant Garamond, 300, `clamp(2.25rem, 7vw, 4.5rem)`, line-height 1, letter-spacing 0.15em): Hero titles and the "Nur" wordmark. Airy, generously tracked, unhurried.
- **Arabic** (Amiri, 400/700, `clamp(1.75rem, 6vw, 4.5rem)`, line-height 2.1, RTL): Qur'anic verses, duas, and dhikr. The protagonist of every screen — always given the most room.
- **Headline** (Cormorant Garamond, 400–500, `1.5rem–2rem`): Section and page titles in reading views.
- **Body** (Satoshi, 400, `0.875rem`, line-height 1.6): Translations and supporting copy. Often italic for quoted meaning. Cap measure at 65–75ch.
- **Label** (Satoshi, 500, `0.75rem`, letter-spacing 0.2em, uppercase): Section eyebrows, reference citations, nav links. The wide-tracked small-caps voice.

### Named Rules
**The Arabic-Breathes Rule.** Arabic script is never set tighter than line-height 2.0. Diacritics must never crowd. When in doubt, add vertical room — legibility of the sacred text is non-negotiable.

**The Meaning-Leads Rule.** Where a sacred line is paired with its translation, the meaning is set upright (never italic), at full Ink contrast, and larger than the transliteration. The Arabic stays the visual centerpiece by size; the meaning stays the most *legible* line. The phonetic transliteration is always the quietest of the three. We welcome every level by never burying what the words mean.

**The Citation-Apart Rule.** Source references are set in the Cormorant serif, normal-case — never in the uppercase wide-tracked label voice used for eyebrows and tabs. One typographic device per role; the label costume is not reused for citations.

## 4. Elevation

Nur is **flat by tonal layering, lit by glow** — not by drop shadows. Depth comes from three moves: translucent surfaces over the night (`bg-surface/40`), 10%-white hairline borders (`ring-1` / `border`), and soft radial gradients in the page background (`surah-glow`). Hard dark drop shadows are absent by design — a lantern casts light, not heavy shade.

### Shadow Vocabulary
- **Lantern Glow** (`box-shadow: 0 0 20px oklch(0.8 0.11 85 / 0.08)`): A faint gold halo on focused or featured elements. Ambient, never structural — it suggests light spilling from the element, not a card floating above a page.
- **Inset Highlight** (`box-shadow: inset 0 1px 1px rgba(255,255,255,0.10)`): An optional top inner highlight to give a glass surface a lit upper edge.

### Named Rules
**The No-Hard-Shadow Rule.** Forbidden: `shadow-md`, `shadow-lg`, or any `rgba(0,0,0,...)` drop shadow. Elevation is glow and tone. If a surface needs separation, deepen the glass or add a hairline — never a dark shadow.

## 5. Components

### Buttons
- **Shape:** Fully rounded pill (`rounded-4xl`, `calc(0.45rem + 16px)` ≈ 23px).
- **Primary:** Lantern Gold fill with Deep Night text (`bg-primary` → gold, `text-primary-foreground`). Default height 40px (`lg`), generous horizontal padding (≥32px on CTAs).
- **Hover / Focus:** Subtle opacity shift on hover (`hover:bg-primary/80`); a 3px focus ring (`focus-visible:ring-ring/50`). Transitions use an exponential ease-out, never linear.
- **Ghost:** Transparent with Ink-Muted text, hovering to Lantern Gold — the default for nav links and low-emphasis actions. Uppercase, wide-tracked label type.
- **Outline / Secondary:** Hairline border over translucent input fill; used sparingly for secondary affordances.

### Cards / Containers
- **Corner Style:** `rounded-2xl` (`calc(0.45rem + 8px)`).
- **Background:** The night seen through glass — `bg-surface/40`, deepening to `/60` on hover.
- **Border:** A gold hairline (`border-gold/20`), brightening to `border-gold/40` on hover.
- **Shadow Strategy:** None by default; an optional Lantern Glow on featured cards (see Elevation).
- **Internal Padding:** Generous — `px-6 py-8` (24px / 32px) on devotional cards.

### Signature Component — The Devotional Card
Nur's defining surface (used for the daily verse and each du'ā). A glass plate of night carrying sacred text:
- A decorative gold glyph (❖) anchored in a top corner at low opacity (`text-gold-muted/20`).
- Arabic set right-aligned and RTL in Amiri, large with breathing line-height — the reverent centerpiece.
- **The meaning leads.** The translation sits directly beneath the Arabic, upright (never italic), near-Ink (`text-foreground/90`), and larger (`text-base`/`text-lg`) than the transliteration — it is the line every reader, especially a learner, should read first.
- Transliteration is a quieter pronunciation aid below the meaning: smaller (`text-sm`), Muted Gold at reduced opacity.
- A reference footer: a short gold rule (`Separator`) beside a **Cormorant serif, normal-case** citation (`cite`) in Muted Gold — a manuscript-style attribution, deliberately distinct from the uppercase wide-tracked label system used for eyebrows and tabs.

### Inputs / Fields
- **Style:** Translucent surface fill (`bg-muted/20`), hairline border (`border-border/40`), `rounded-lg`, compact (32px) height.
- **Focus:** Border brightens toward the link/ring color; no hard outline.
- **Search:** Presented as a quiet trigger with an inline ⌘K hint, opening a dialog — search is invited, not shouted.

### Navigation
- **Style:** A sticky, translucent top bar (`bg-background/70 backdrop-blur-md`) with a single hairline bottom border. The "Nur" wordmark (Cormorant) sits beside its Arabic form (نور) in Muted Gold.
- **Links:** Ghost buttons in uppercase, wide-tracked label type; Ink-Muted at rest, Lantern Gold on hover. Hidden below `sm`, where the centered search remains.

### Ornamental Divider
A recurring signature: two hairline rules flanking a small gold glyph (`❖` / `❖`). Used to close hero sections and separate movements. Decoration earns its place only as this restrained, symmetrical mark.

## 6. Do's and Don'ts

### Do:
- **Do** keep gold as the single light source — one accent, spent deliberately (The One Light Rule).
- **Do** set surfaces as glass over night (`bg-surface/40`–`/60`), with gold hairline borders.
- **Do** give Arabic the most room on any screen; line-height ≥ 2.0, never crowd diacritics.
- **Do** convey depth with glow and tone, not shadow (Lantern Glow, hairlines, `surah-glow`).
- **Do** use slow, exponential fade-up entrances with `prefers-reduced-motion` fallbacks; stagger lists, don't apply one identical reflex everywhere.
- **Do** keep off-white Ink for text (never pure white) and verify Ink-Muted clears 4.5:1 on the night ground.

### Don't:
- **Don't** make any screen read as a **generic SaaS dashboard** — no stat-card grids, KPI tiles, big-number hero metrics, or charty framing. Counters and prayer times are devotional, not analytics.
- **Don't** drift **austere or intimidating** — no cold, severe, gatekeeping religiosity. Warmth is mandatory.
- **Don't** introduce a second accent hue. No blue links, green "success," or colored status chips; status is gold, weight, and opacity.
- **Don't** use teal as a foreground color — it lives only in the background glow.
- **Don't** use hard drop shadows (`shadow-md`/`shadow-lg`/`rgba(0,0,0,...)`). Forbidden.
- **Don't** clutter with ornament; the only sanctioned decoration is the ❖ glyph and the ornamental divider.
- **Don't** let the interface compete with the text — the words come first, always.
