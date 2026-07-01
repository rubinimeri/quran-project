import { filterChapters, filterVerseNumbers } from "@/lib/surah-nav";
import type { Chapter } from "@quranjs/api";

const chapter = (id: number, nameSimple: string): Chapter =>
  ({ id, nameSimple }) as Chapter;

const chapters: Chapter[] = [
  chapter(1, "Al-Fatihah"),
  chapter(2, "Al-Baqarah"),
  chapter(4, "An-Nisa"),
  chapter(20, "Ta-Ha"),
];

describe("filterChapters", () => {
  it("returns every chapter for an empty query", () => {
    expect(filterChapters(chapters, "")).toBe(chapters);
    expect(filterChapters(chapters, "   ")).toBe(chapters);
  });

  it("matches by name, case-insensitively", () => {
    expect(filterChapters(chapters, "nisa")).toEqual([chapter(4, "An-Nisa")]);
    expect(filterChapters(chapters, "AL-")).toEqual([
      chapter(1, "Al-Fatihah"),
      chapter(2, "Al-Baqarah"),
    ]);
  });

  it("matches by chapter number prefix", () => {
    expect(filterChapters(chapters, "2")).toEqual([
      chapter(2, "Al-Baqarah"),
      chapter(20, "Ta-Ha"),
    ]);
    expect(filterChapters(chapters, "4")).toEqual([chapter(4, "An-Nisa")]);
  });

  it("returns nothing when neither name nor number matches", () => {
    expect(filterChapters(chapters, "zzz")).toEqual([]);
  });
});

describe("filterVerseNumbers", () => {
  it("returns all verse numbers for an empty query", () => {
    expect(filterVerseNumbers(3, "")).toEqual([1, 2, 3]);
    expect(filterVerseNumbers(3, "  ")).toEqual([1, 2, 3]);
  });

  it("filters by numeric prefix", () => {
    expect(filterVerseNumbers(30, "2")).toEqual([
      2, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
    ]);
    expect(filterVerseNumbers(300, "255")).toEqual([255]);
  });

  it("returns nothing for a non-numeric query", () => {
    expect(filterVerseNumbers(10, "abc")).toEqual([]);
  });

  it("handles a zero or negative count", () => {
    expect(filterVerseNumbers(0, "")).toEqual([]);
    expect(filterVerseNumbers(-5, "")).toEqual([]);
  });
});
