/**
 * @jest-environment node
 */

import { extractTafsir } from "@/lib/tafsir";

describe("extractTafsir", () => {
  it("returns null when the tafsir is undefined", () => {
    expect(extractTafsir(undefined)).toBeNull();
  });

  it("extracts text and resourceName", () => {
    const result = extractTafsir({
      text: "<p>In the name of Allah</p>",
      resourceName: "Ibn Kathir (Abridged)",
      verses: { "1:1": { id: 1 } },
    });

    expect(result).toMatchObject({
      text: "<p>In the name of Allah</p>",
      resourceName: "Ibn Kathir (Abridged)",
    });
  });

  it("defaults a missing text to an empty string", () => {
    const result = extractTafsir({ resourceName: "Ibn Kathir" });
    expect(result?.text).toBe("");
  });

  it("derives no range from a single covered verse", () => {
    const result = extractTafsir({
      text: "<p>commentary</p>",
      verses: { "2:6": { id: 13 } },
    });

    expect(result?.from).toBe("2:6");
    expect(result?.to).toBe("2:6");
  });

  it("derives from/to from the first and last covered verse", () => {
    const result = extractTafsir({
      text: "<p>commentary</p>",
      verses: { "2:1": { id: 8 }, "2:2": { id: 9 }, "2:5": { id: 12 } },
    });

    expect(result?.from).toBe("2:1");
    expect(result?.to).toBe("2:5");
  });

  it("orders the range numerically, not lexically (2:9 before 2:10)", () => {
    const result = extractTafsir({
      text: "<p>commentary</p>",
      verses: { "2:10": { id: 1 }, "2:9": { id: 2 }, "2:11": { id: 3 } },
    });

    expect(result?.from).toBe("2:9");
    expect(result?.to).toBe("2:11");
  });

  it("leaves from/to undefined when no verses are present", () => {
    const result = extractTafsir({ text: "<p>x</p>" });
    expect(result?.from).toBeUndefined();
    expect(result?.to).toBeUndefined();
  });
});
