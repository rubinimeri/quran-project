import { type RecitationResource } from "@quranjs/api";

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

/** Human label for a reciter, e.g. `Mishary Rashid Alafasy · Murattal`. */
export function reciterLabel(reciter: {
  reciterName?: string;
  style?: string | null;
}): string {
  const name = reciter.reciterName?.trim() ?? "";
  const style = reciter.style?.trim() || DEFAULT_STYLE;
  return `${name} · ${style}`;
}

/**
 * Normalize the raw recitations list into Select-ready options: drop entries
 * missing an id or reciter name, stringify the id, and default the style.
 */
export function toReciterOptions(
  recitations: RecitationResource[],
): ReciterOption[] {
  return recitations
    .filter(
      (r): r is RecitationResource & { id: number; reciterName: string } =>
        typeof r.id === "number" && Boolean(r.reciterName?.trim()),
    )
    .map((r) => ({
      id: String(r.id),
      name: r.reciterName.trim(),
      style: r.style?.trim() || DEFAULT_STYLE,
    }));
}
