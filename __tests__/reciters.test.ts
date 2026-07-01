import {
  toChapterReciterOptions,
  EXTRA_VERSE_RECITERS,
  DEFAULT_STYLE,
} from "@/lib/reciters";
import type { ChapterReciterResource } from "@quranjs/api";

// The chapter-reciter resource carries a nested `style` at runtime that the SDK
// type omits, so cast the fixtures to the resource type.
const reciter = (r: {
  id?: number;
  name?: string;
  style?: { name?: string } | null;
}): ChapterReciterResource => r as unknown as ChapterReciterResource;

// The hardcoded ayah-by-ayah extras (e.g. Minshawi Mujawwad) are always appended.
const withoutExtras = (options: { id: string }[]) =>
  options.filter((o) => !EXTRA_VERSE_RECITERS.some((e) => e.id === o.id));

describe("toChapterReciterOptions", () => {
  it("stringifies the id and reads the nested style name", () => {
    const raw = [
      reciter({ id: 7, name: "Mishari Rashid al-`Afasy", style: { name: "Murattal" } }),
      reciter({ id: 2, name: "Abdul Basit", style: { name: "Mujawwad" } }),
    ];

    // Sorted alphabetically by name (Abdul Basit before Mishari).
    expect(withoutExtras(toChapterReciterOptions(raw))).toEqual([
      { id: "2", name: "Abdul Basit", style: "Mujawwad" },
      { id: "7", name: "Mishari Rashid al-`Afasy", style: "Murattal" },
    ]);
  });

  it("defaults the style when it is missing or empty", () => {
    const raw = [
      reciter({ id: 1, name: "No Style" }),
      reciter({ id: 3, name: "Empty Style", style: { name: "  " } }),
      reciter({ id: 4, name: "Null Style", style: null }),
    ];

    expect(withoutExtras(toChapterReciterOptions(raw))).toEqual([
      { id: "3", name: "Empty Style", style: DEFAULT_STYLE },
      { id: "1", name: "No Style", style: DEFAULT_STYLE },
      { id: "4", name: "Null Style", style: DEFAULT_STYLE },
    ]);
  });

  it("drops entries missing an id or name", () => {
    const raw = [
      reciter({ name: "No Id" }),
      reciter({ id: 3 }),
      reciter({ id: 5, name: "  " }),
      reciter({ id: 6, name: "Valid", style: { name: "Murattal" } }),
    ];

    expect(withoutExtras(toChapterReciterOptions(raw))).toEqual([
      { id: "6", name: "Valid", style: "Murattal" },
    ]);
  });

  it("appends the ayah-by-ayah extras (Minshawi Mujawwad) sorted in", () => {
    const options = toChapterReciterOptions([]);
    expect(options).toEqual(EXTRA_VERSE_RECITERS);
    expect(options).toContainEqual({
      id: "verse:8",
      name: "Mohamed Siddiq al-Minshawi",
      style: "Mujawwad",
    });
  });

  it("returns a fully sorted list (extras interleaved by name)", () => {
    const raw = [
      reciter({ id: 7, name: "Zayd", style: { name: "Murattal" } }),
      reciter({ id: 2, name: "Aisha", style: { name: "Murattal" } }),
    ];
    const names = toChapterReciterOptions(raw).map((o) => o.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
});
