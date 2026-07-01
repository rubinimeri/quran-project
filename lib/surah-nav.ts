import { type Chapter } from "@quranjs/api";

/**
 * Filter the 114 chapters for the surah-navigation drawer. Matches the query
 * against the chapter's simple name (case-insensitive substring) or its number
 * (prefix). An empty query returns every chapter unchanged.
 */
export function filterChapters(chapters: Chapter[], query: string): Chapter[] {
  const q = query.trim().toLowerCase();
  if (!q) return chapters;
  return chapters.filter(
    (c) => c.nameSimple.toLowerCase().includes(q) || String(c.id).startsWith(q),
  );
}

/**
 * The verse numbers `1..versesCount` filtered by a numeric query (prefix match).
 * An empty query returns all numbers; a non-numeric query returns none.
 */
export function filterVerseNumbers(
  versesCount: number,
  query: string,
): number[] {
  const all = Array.from({ length: Math.max(0, versesCount) }, (_, i) => i + 1);
  const q = query.trim();
  if (!q) return all;
  if (!/^\d+$/.test(q)) return [];
  return all.filter((n) => String(n).startsWith(q));
}
