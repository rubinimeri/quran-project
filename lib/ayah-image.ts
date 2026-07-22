import { createCanvas, GlobalFonts, type SKRSContext2D } from "@napi-rs/canvas";
import path from "path";

/**
 * Server-side ayah → PNG renderer.
 *
 * `next/og`'s `ImageResponse` cannot shape complex RTL scripts, so we render
 * with `@napi-rs/canvas` (native Skia) which does real Arabic shaping. The
 * result matches the app's current theme: the dark "Lantern at Dusk" card
 * (deep-night ground, luminous gold verse) or the light "Dawn" card (warm
 * cream ground, deep amber verse) — each framed with a soft gold border, a
 * delicate divider, and the Nur wordmark as a masthead.
 */

export type AyahImageTheme = "light" | "dark";

type Palette = {
  background: string;
  verse: string; // Arabic verse + masthead + divider diamond (the gold hero)
  translation: string;
  reference: string; // muted gold footer
  frame: string;
  // Radial glow stops (center → mid → edge), pre-baked rgba strings.
  glow: readonly [string, string, string];
  // "r, g, b" triple so the divider hairlines can vary their own alpha.
  dividerRgb: string;
};

// DESIGN.md tokens are OKLCH; canvas fillStyle needs sRGB, so these are the
// theme tokens converted to hex (dark = hand-tuned "Lantern at Dusk", light =
// the "Dawn" `:root` tokens from `app/globals.css`, deepened for contrast on a
// pale ground).
const THEMES: Record<AyahImageTheme, Palette> = {
  dark: {
    background: "#030712", // --background
    verse: "#deb866", // --gold
    translation: "#d4d4d8", // --muted-foreground
    reference: "#a68c54", // --gold-muted
    frame: "rgba(166, 140, 84, 0.28)",
    glow: [
      "rgba(222, 184, 102, 0.13)",
      "rgba(222, 184, 102, 0.03)",
      "rgba(222, 184, 102, 0)",
    ],
    dividerRgb: "166, 140, 84",
  },
  light: {
    background: "#fdfcf9", // --background (Dawn)
    verse: "#a36e09", // --gold, deepened for contrast on cream
    translation: "#232a36", // near --foreground
    reference: "#815b1f", // --gold-muted
    frame: "rgba(129, 91, 31, 0.32)",
    glow: [
      "rgba(163, 110, 9, 0.12)",
      "rgba(163, 110, 9, 0.03)",
      "rgba(163, 110, 9, 0)",
    ],
    dividerRgb: "129, 91, 31",
  },
};

const SIZE = 1080;
const PADDING = 110;
const MAX_TEXT_WIDTH = SIZE - PADDING * 2;

const FONT_DIR = path.join(process.cwd(), "app/fonts");

// Register once at module load. `@napi-rs/canvas` reads the file synchronously
// and aliases it for `ctx.font`.
GlobalFonts.registerFromPath(
  path.join(FONT_DIR, "UthmanicHafs1Ver18.woff2"),
  "QuranHafs",
);
GlobalFonts.registerFromPath(
  path.join(FONT_DIR, "Satoshi-Variable.woff2"),
  "Satoshi",
);

type RenderAyahImageArgs = {
  arabic: string;
  translation: string;
  surahName: string;
  verseKey: string;
  theme: AyahImageTheme;
};

/** Greedily wrap `text` into lines that each fit within `maxWidth`. */
function wrapText(
  ctx: SKRSContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** A small four-point sparkle with concave sides, filled with `fillStyle`. */
function drawSparkle(
  ctx: SKRSContext2D,
  cx: number,
  cy: number,
  r: number,
): void {
  const w = r * 0.34; // waist — smaller pulls the points sharper
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.bezierCurveTo(cx + w, cy - w, cx + w, cy - w, cx + r, cy);
  ctx.bezierCurveTo(cx + w, cy + w, cx + w, cy + w, cx, cy + r);
  ctx.bezierCurveTo(cx - w, cy + w, cx - w, cy + w, cx - r, cy);
  ctx.bezierCurveTo(cx - w, cy - w, cx - w, cy - w, cx, cy - r);
  ctx.closePath();
  ctx.fill();
}

/** A centered separator: two hairlines fading toward a small gold diamond. */
function drawDivider(
  ctx: SKRSContext2D,
  cx: number,
  y: number,
  halfWidth: number,
  palette: Palette,
): void {
  ctx.save();
  const inner = 22;

  const left = ctx.createLinearGradient(cx - halfWidth, 0, cx, 0);
  left.addColorStop(0, `rgba(${palette.dividerRgb}, 0)`);
  left.addColorStop(1, `rgba(${palette.dividerRgb}, 0.55)`);
  ctx.strokeStyle = left;
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.moveTo(cx - halfWidth, y);
  ctx.lineTo(cx - inner, y);
  ctx.stroke();

  const right = ctx.createLinearGradient(cx, 0, cx + halfWidth, 0);
  right.addColorStop(0, `rgba(${palette.dividerRgb}, 0.55)`);
  right.addColorStop(1, `rgba(${palette.dividerRgb}, 0)`);
  ctx.strokeStyle = right;
  ctx.beginPath();
  ctx.moveTo(cx + inner, y);
  ctx.lineTo(cx + halfWidth, y);
  ctx.stroke();

  ctx.fillStyle = palette.verse;
  const d = 4.5;
  ctx.beginPath();
  ctx.moveTo(cx, y - d);
  ctx.lineTo(cx + d, y);
  ctx.lineTo(cx, y + d);
  ctx.lineTo(cx - d, y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Trace a rounded-rectangle path (the outer frame). */
function roundRectPath(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function renderAyahImage({
  arabic,
  translation,
  surahName,
  verseKey,
  theme,
}: RenderAyahImageArgs): Buffer {
  const palette = THEMES[theme];
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext("2d");

  // Ground.
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Soft gold glow from above, echoing `.surah-glow`.
  const glow = ctx.createRadialGradient(
    SIZE / 2,
    -SIZE * 0.15,
    0,
    SIZE / 2,
    -SIZE * 0.15,
    SIZE * 1.05,
  );
  glow.addColorStop(0, palette.glow[0]);
  glow.addColorStop(0.5, palette.glow[1]);
  glow.addColorStop(1, palette.glow[2]);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Subtle rounded gold frame.
  const inset = 40;
  roundRectPath(ctx, inset, inset, SIZE - inset * 2, SIZE - inset * 2, 44);
  ctx.strokeStyle = palette.frame;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = "center";

  // Masthead: the Nur wordmark, a sparkle + text centered near the top.
  ctx.textBaseline = "middle";
  ctx.font = "27px Satoshi";
  ctx.fontVariationSettings = '"wght" 500';
  ctx.letterSpacing = "1px";
  const markText = "Nur";
  const markWidth = ctx.measureText(markText).width;
  const sparkleR = 9;
  const markGap = 13;
  const markTotal = sparkleR * 2 + markGap + markWidth;
  const markStartX = SIZE / 2 - markTotal / 2;
  const markY = 108;
  ctx.fillStyle = palette.verse;
  drawSparkle(ctx, markStartX + sparkleR, markY, sparkleR);
  ctx.textAlign = "left";
  ctx.fillText(markText, markStartX + sparkleR * 2 + markGap, markY);
  ctx.letterSpacing = "0px";
  ctx.textAlign = "center";

  // Safe vertical band for the verse + divider + translation, clear of the
  // masthead and footer. Long verses (up to 2:282, the Qur'an's longest) are
  // auto-fit into it.
  const CONTENT_TOP = 196;
  const CONTENT_BOTTOM = SIZE - 176;
  const availableHeight = CONTENT_BOTTOM - CONTENT_TOP;

  // Shrink from the base sizes until the block fits; wrapping is remeasured each
  // step because line counts change with the font size. The floor is low enough
  // that even the longest verse resolves to a fitting size.
  const BASE = { arabic: 72, translation: 30, divider: 60 };
  const ARABIC_LEADING = 1.65;
  const TRANS_LEADING = 1.55;

  let arabicSize = BASE.arabic;
  let transSize = BASE.translation;
  let dividerBlock = BASE.divider;
  let arabicLines: string[] = [];
  let transLines: string[] = [];
  let groupHeight = 0;

  for (let scale = 1; scale >= 0.18; scale -= 0.02) {
    arabicSize = BASE.arabic * scale;
    transSize = BASE.translation * scale;
    dividerBlock = BASE.divider * Math.max(scale, 0.6);

    ctx.font = `${arabicSize}px QuranHafs`;
    ctx.direction = "rtl";
    ctx.fontVariationSettings = "normal";
    arabicLines = wrapText(ctx, arabic, MAX_TEXT_WIDTH);

    ctx.font = `${transSize}px Satoshi`;
    ctx.direction = "ltr";
    ctx.fontVariationSettings = '"wght" 500';
    transLines = wrapText(ctx, translation, MAX_TEXT_WIDTH);

    groupHeight =
      arabicLines.length * arabicSize * ARABIC_LEADING +
      dividerBlock +
      transLines.length * transSize * TRANS_LEADING;

    if (groupHeight <= availableHeight) break;
  }

  const arabicLineHeight = arabicSize * ARABIC_LEADING;
  const transLineHeight = transSize * TRANS_LEADING;
  let cursorY = CONTENT_TOP + Math.max(0, (availableHeight - groupHeight) / 2);

  // Arabic verse — the luminous gold hero.
  ctx.textBaseline = "top";
  ctx.font = `${arabicSize}px QuranHafs`;
  ctx.direction = "rtl";
  ctx.fontVariationSettings = "normal";
  ctx.fillStyle = palette.verse;
  for (const line of arabicLines) {
    ctx.fillText(line, SIZE / 2, cursorY);
    cursorY += arabicLineHeight;
  }

  // Divider between verse and translation.
  drawDivider(
    ctx,
    SIZE / 2,
    cursorY + dividerBlock / 2,
    Math.min(160, MAX_TEXT_WIDTH / 3),
    palette,
  );
  cursorY += dividerBlock;

  // Translation — softer ink, medium weight.
  ctx.font = `${transSize}px Satoshi`;
  ctx.direction = "ltr";
  ctx.fontVariationSettings = '"wght" 500';
  ctx.fillStyle = palette.translation;
  for (const line of transLines) {
    ctx.fillText(line, SIZE / 2, cursorY);
    cursorY += transLineHeight;
  }

  // Footer: surah reference in muted gold, letters tracked out.
  ctx.textBaseline = "middle";
  ctx.direction = "ltr";
  ctx.font = "22px Satoshi";
  ctx.fontVariationSettings = '"wght" 600';
  ctx.letterSpacing = "5px";
  ctx.fillStyle = palette.reference;
  const reference = `${surahName.toUpperCase()}   ${verseKey}`;
  // Nudge right by half the trailing letter-space so the tracked text stays
  // optically centered (spacing is added after each glyph, including the last).
  ctx.fillText(reference, SIZE / 2 + 2.5, SIZE - 104);
  ctx.letterSpacing = "0px";

  return canvas.toBuffer("image/png");
}
