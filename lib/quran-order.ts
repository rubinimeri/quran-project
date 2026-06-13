import type { Chapter, Juz } from "@quranjs/api";

export type SortOrder = "asc" | "desc";

export function sortChapters(chapters: Chapter[], order: SortOrder): Chapter[] {
  return [...chapters].sort((a, b) =>
    order === "asc" ? a.id - b.id : b.id - a.id,
  );
}

export function sortByRevelation(
  chapters: Chapter[],
  order: SortOrder,
): Chapter[] {
  return [...chapters].sort((a, b) =>
    order === "asc"
      ? a.revelationOrder - b.revelationOrder
      : b.revelationOrder - a.revelationOrder,
  );
}

export type JuzGroup = {
  juzNumber: number;
  chapters: Chapter[];
};

export function groupChaptersByJuz(
  chapters: Chapter[],
  juzs: Juz[],
  order: SortOrder,
): JuzGroup[] {
  const chapterById = new Map(chapters.map((c) => [c.id, c]));

  const sorted = [...juzs].sort((a, b) =>
    order === "asc" ? a.juzNumber - b.juzNumber : b.juzNumber - a.juzNumber,
  );

  return sorted.map((juz) => {
    const chapterIds = Object.keys(juz.verseMapping).map(Number);
    const grouped = chapterIds
      .map((id) => chapterById.get(id))
      .filter((c, index): c is Chapter => c !== undefined);

    const sortedGroup = grouped.sort((a, b) =>
      order === "asc" ? a.id - b.id : b.id - a.id,
    );

    return { juzNumber: juz.juzNumber, chapters: sortedGroup };
  });
}
