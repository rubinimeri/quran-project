import { verseIndexAt, type VerseTiming } from "@/lib/audio";

const verse = (verseNumber: number, startMs: number, endMs: number): VerseTiming => ({
  verseNumber,
  startMs,
  endMs,
  segments: [],
});

describe("verseIndexAt", () => {
  const verses = [verse(1, 0, 6090), verse(2, 6090, 11680), verse(3, 11680, 16000)];

  it("returns 0 for an empty timeline", () => {
    expect(verseIndexAt([], 5000)).toBe(0);
  });

  it("returns the first verse before it starts", () => {
    expect(verseIndexAt(verses, -100)).toBe(0);
    expect(verseIndexAt(verses, 0)).toBe(0);
  });

  it("maps a position within a verse to that verse", () => {
    expect(verseIndexAt(verses, 3000)).toBe(0);
    expect(verseIndexAt(verses, 8000)).toBe(1);
    expect(verseIndexAt(verses, 12000)).toBe(2);
  });

  it("treats a verse's exact start as that verse", () => {
    expect(verseIndexAt(verses, 6090)).toBe(1);
    expect(verseIndexAt(verses, 11680)).toBe(2);
  });

  it("clamps to the last verse past the end", () => {
    expect(verseIndexAt(verses, 99999)).toBe(2);
  });
});
