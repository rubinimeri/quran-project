import {
  DUAS,
  DUA_CATEGORIES,
  getDuasByCategory,
  type DuaCategory,
} from "@/lib/duas";

const VALID_CATEGORY_IDS = new Set<DuaCategory>(
  DUA_CATEGORIES.map((category) => category.id),
);

describe("getDuasByCategory", () => {
  it("returns only duas belonging to the requested category", () => {
    for (const { id } of DUA_CATEGORIES) {
      const result = getDuasByCategory(id);
      expect(result.every((dua) => dua.category === id)).toBe(true);
    }
  });

  it("returns a non-empty list for every category", () => {
    for (const { id } of DUA_CATEGORIES) {
      expect(getDuasByCategory(id).length).toBeGreaterThan(0);
    }
  });

  it("partitions the full dataset across categories without loss", () => {
    const total = DUA_CATEGORIES.reduce(
      (sum, { id }) => sum + getDuasByCategory(id).length,
      0,
    );
    expect(total).toBe(DUAS.length);
  });
});

describe("DUAS dataset integrity", () => {
  it("assigns every dua a valid category", () => {
    for (const dua of DUAS) {
      expect(VALID_CATEGORY_IDS.has(dua.category)).toBe(true);
    }
  });

  it("gives every dua non-empty arabic, translation, and reference", () => {
    for (const dua of DUAS) {
      expect(dua.arabic.trim().length).toBeGreaterThan(0);
      expect(dua.transliteration.trim().length).toBeGreaterThan(0);
      expect(dua.translation.trim().length).toBeGreaterThan(0);
      expect(dua.reference.trim().length).toBeGreaterThan(0);
    }
  });

  it("uses unique ids across all duas", () => {
    const ids = DUAS.map((dua) => dua.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("occasions is a non-empty string when defined", () => {
    for (const dua of DUAS) {
      if (dua.occasions !== undefined) {
        expect(dua.occasions.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
