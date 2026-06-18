/**
 * @jest-environment node
 */

// Tests for the search API route logic and URL building
describe("Search href construction", () => {
  function buildHref(key: number | string, category: "surah" | "verse"): string {
    if (category === "surah") return `/${key}`;
    const keyStr = String(key);
    if (keyStr.includes(":")) {
      const [surahId, ayahId] = keyStr.split(":");
      return `/${surahId}?startingVerse=${ayahId}`;
    }
    return `/${keyStr}`;
  }

  describe("surah results", () => {
    it("builds href with surah number as path", () => {
      expect(buildHref(2, "surah")).toBe("/2");
    });

    it("handles all surah numbers 1-114", () => {
      expect(buildHref(1, "surah")).toBe("/1");
      expect(buildHref(114, "surah")).toBe("/114");
    });
  });

  describe("verse results", () => {
    it("includes startingVerse param from colon-separated key", () => {
      expect(buildHref("2:255", "verse")).toBe("/2?startingVerse=255");
    });

    it("includes startingVerse for multi-digit surah and verse", () => {
      expect(buildHref("18:107", "verse")).toBe("/18?startingVerse=107");
    });

    it("falls back to full key path when no colon", () => {
      expect(buildHref("255", "verse")).toBe("/255");
    });
  });
});

describe("Search response filtering", () => {
  type SearchResultItem = {
    resultType: string;
    key: number | string;
    name: string;
    arabic?: string;
  };

  function filterSurahs(navigation: SearchResultItem[]) {
    return navigation.filter((r) => r.resultType === "surah");
  }

  it("filters only surah results from navigation", () => {
    const navigation: SearchResultItem[] = [
      { resultType: "surah", key: 2, name: "Al-Baqarah", arabic: "البقرة" },
      { resultType: "juz", key: 1, name: "Juz 1" },
      { resultType: "surah", key: 3, name: "Ali 'Imran", arabic: "آل عمران" },
    ];
    const surahs = filterSurahs(navigation);
    expect(surahs).toHaveLength(2);
    expect(surahs[0].key).toBe(2);
    expect(surahs[1].key).toBe(3);
  });

  it("returns empty array when no surahs in navigation", () => {
    const navigation: SearchResultItem[] = [
      { resultType: "juz", key: 1, name: "Juz 1" },
    ];
    expect(filterSurahs(navigation)).toHaveLength(0);
  });

  it("preserves arabic field on surah results", () => {
    const navigation: SearchResultItem[] = [
      { resultType: "surah", key: 1, name: "Al-Fatihah", arabic: "الفاتحة" },
    ];
    const [first] = filterSurahs(navigation);
    expect(first.arabic).toBe("الفاتحة");
  });
});

describe("versePage helper", () => {
  function versePage(verseNumber: number): number {
    return Math.max(1, Math.ceil(verseNumber / 50));
  }

  it("verse 1 is on page 1", () => expect(versePage(1)).toBe(1));
  it("verse 50 is on page 1", () => expect(versePage(50)).toBe(1));
  it("verse 51 is on page 2", () => expect(versePage(51)).toBe(2));
  it("verse 250 is on page 5", () => expect(versePage(250)).toBe(5));
  it("clamps zero/negative to page 1", () => expect(versePage(0)).toBe(1));
});

describe("Ayah filtering from navigation", () => {
  type SearchResultItem = {
    resultType: string;
    key: number | string;
    name: string;
    arabic?: string;
  };

  function filterAyahs(navigation: SearchResultItem[]) {
    return navigation.filter((r) => r.resultType === "ayah");
  }

  it("filters only ayah results from navigation", () => {
    const navigation: SearchResultItem[] = [
      { resultType: "surah", key: 2, name: "Al-Baqarah" },
      { resultType: "ayah", key: "2:255", name: "Allah - there is no deity" },
      { resultType: "juz", key: 1, name: "Juz 1" },
      { resultType: "ayah", key: "1:1", name: "In the name of Allah" },
    ];
    const ayahs = filterAyahs(navigation);
    expect(ayahs).toHaveLength(2);
    expect(ayahs[0].key).toBe("2:255");
    expect(ayahs[1].key).toBe("1:1");
  });

  it("returns empty array when no ayahs in navigation", () => {
    const navigation: SearchResultItem[] = [
      { resultType: "surah", key: 1, name: "Al-Fatihah" },
      { resultType: "juz", key: 1, name: "Juz 1" },
    ];
    expect(filterAyahs(navigation)).toHaveLength(0);
  });

  it("preserves name (verse text) on ayah results", () => {
    const navigation: SearchResultItem[] = [
      { resultType: "ayah", key: "2:255", name: "Allah - there is no deity except Him" },
    ];
    const [first] = filterAyahs(navigation);
    expect(first.name).toBe("Allah - there is no deity except Him");
  });
});
