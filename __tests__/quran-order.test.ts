import {
  sortChapters,
  sortByRevelation,
  groupChaptersByJuz,
} from "@/lib/quran-order";
import type { Chapter, Juz } from "@quranjs/api";

// Minimal Chapter stubs
const makeChapter = (
  id: number,
  revelationOrder: number,
): Partial<Chapter> => ({
  id,
  revelationOrder,
  nameSimple: `Chapter ${id}`,
  nameArabic: `Arabic ${id}`,
  translatedName: { name: `Translated ${id}`, language_name: "english" },
  versesCount: 7,
  revelationPlace: "makkah",
  bismillahPre: true,
  pages: [1, 1],
});

// Revelation orders deliberately cross id order (e.g. surah 4 was revealed before 2).
const chapters = [
  makeChapter(1, 5),
  makeChapter(2, 92),
  makeChapter(3, 87),
  makeChapter(4, 89),
] as Chapter[];

const juzs = [
  {
    id: 1,
    juzNumber: 1,
    verseMapping: { 1: "1-7", 2: "1-141" },
    firstVerseId: 1,
    lastVerseId: 148,
    versesCount: 148,
  },
  {
    id: 2,
    juzNumber: 2,
    verseMapping: { 2: "142-252" },
    firstVerseId: 149,
    lastVerseId: 400,
    versesCount: 252,
  },
] as Juz[];

describe("sortChapters", () => {
  it("returns ascending order by id", () => {
    const result = sortChapters([...chapters], "asc");
    expect(result.map((c) => c.id)).toEqual([1, 2, 3, 4]);
  });

  it("returns descending order by id", () => {
    const result = sortChapters([...chapters], "desc");
    expect(result.map((c) => c.id)).toEqual([4, 3, 2, 1]);
  });
});

describe("sortByRevelation", () => {
  it("returns ascending revelation order", () => {
    const result = sortByRevelation([...chapters], "asc");
    expect(result.map((c) => c.revelationOrder)).toEqual([5, 87, 89, 92]);
    expect(result.map((c) => c.id)).toEqual([1, 3, 4, 2]);
  });

  it("returns descending revelation order", () => {
    const result = sortByRevelation([...chapters], "desc");
    expect(result.map((c) => c.revelationOrder)).toEqual([92, 89, 87, 5]);
    expect(result.map((c) => c.id)).toEqual([2, 4, 3, 1]);
  });

  it("differs from standard id ordering when revelation order diverges", () => {
    const byId = sortChapters([...chapters], "asc").map((c) => c.id);
    const byRev = sortByRevelation([...chapters], "asc").map((c) => c.id);
    expect(byId).not.toEqual(byRev);
  });
});

describe("groupChaptersByJuz", () => {
  it("groups chapters under the correct juz", () => {
    const groups = groupChaptersByJuz(chapters, juzs, "asc");
    const juz1 = groups.find((g) => g.juzNumber === 1);
    const juz2 = groups.find((g) => g.juzNumber === 2);

    expect(juz1?.chapters.map((c) => c.id)).toContain(1);
    expect(juz1?.chapters.map((c) => c.id)).toContain(2);
    expect(juz2?.chapters.map((c) => c.id)).toContain(2);
  });

  it("a chapter spanning two juzs appears in both groups", () => {
    const groups = groupChaptersByJuz(chapters, juzs, "asc");
    const chapterTwoCount = groups.filter((g) =>
      g.chapters.some((c) => c.id === 2),
    ).length;
    expect(chapterTwoCount).toBe(2);
  });

  it("respects asc sort within each group", () => {
    const groups = groupChaptersByJuz(chapters, juzs, "asc");
    const juz1 = groups.find((g) => g.juzNumber === 1)!;
    const ids = juz1.chapters.map((c) => c.id);
    expect(ids).toEqual([...ids].sort((a, b) => a - b));
  });

  it("respects desc sort within each group", () => {
    const groups = groupChaptersByJuz(chapters, juzs, "desc");
    const juz1 = groups.find((g) => g.juzNumber === 1)!;
    const ids = juz1.chapters.map((c) => c.id);
    expect(ids).toEqual([...ids].sort((a, b) => b - a));
  });
});
