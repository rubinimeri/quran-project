import { type ChapterReciterResource } from "@quranjs/api";

/** Fallback recitation style when a reciter has none set. */
export const DEFAULT_STYLE = "Murattal";

/**
 * A reciter option ready for the Select: the id is stringified (Select values
 * are strings) and the style is always populated.
 */
export type ReciterOption = {
  id: string;
  name: string;
  style: string;
};

// The chapter-reciter resource carries a nested `style` at runtime that the SDK
// type omits, so we widen it locally (no `any`).
type ChapterReciterWithStyle = ChapterReciterResource & {
  style?: { name?: string } | null;
};

/**
 * Reciters we surface in the dropdown that have no gapless whole-surah file, so
 * they play ayah by ayah instead. The `verse:` prefix marks the id as belonging
 * to the verse-recitation id-space; the audio route branches on it.
 */
export const EXTRA_VERSE_RECITERS: ReciterOption[] = [
  { id: "verse:8", name: "Mohamed Siddiq al-Minshawi", style: "Mujawwad" },
];

/**
 * Normalize the chapter-reciters list into Select-ready options: drop entries
 * missing an id or name, stringify the id, default the style, append the
 * ayah-by-ayah extras, and sort alphabetically by name (then style).
 */
export function toChapterReciterOptions(
  reciters: ChapterReciterResource[],
): ReciterOption[] {
  const options = reciters
    .filter(
      (r): r is ChapterReciterResource & { id: number; name: string } =>
        typeof r.id === "number" && Boolean(r.name?.trim()),
    )
    .map((r) => ({
      id: String(r.id),
      name: r.name.trim(),
      style:
        (r as ChapterReciterWithStyle).style?.name?.trim() || DEFAULT_STYLE,
    }));

  return [...options, ...EXTRA_VERSE_RECITERS].sort(
    (a, b) => a.name.localeCompare(b.name) || a.style.localeCompare(b.style),
  );
}
