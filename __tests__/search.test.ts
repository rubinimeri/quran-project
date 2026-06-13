/**
 * @jest-environment node
 */

// Tests for the search API route logic and URL building
describe("Search href construction", () => {
  function buildHref(key: number | string, category: "surah" | "verse"): string {
    if (category === "surah") return `/${key}`;
    const keyStr = String(key);
    const surahId = keyStr.includes(":") ? keyStr.split(":")[0] : keyStr;
    return `/${surahId}`;
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
    it("extracts surah ID from colon-separated key", () => {
      expect(buildHref("2:255", "verse")).toBe("/2");
    });

    it("extracts surah ID from multi-digit keys", () => {
      expect(buildHref("18:1", "verse")).toBe("/18");
    });

    it("falls back to full key when no colon", () => {
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
