import { reciterLabel, toReciterOptions, DEFAULT_STYLE } from "@/lib/reciters";
import type { RecitationResource } from "@quranjs/api";

describe("reciterLabel", () => {
  it("joins reciter name and style with a middot", () => {
    expect(reciterLabel({ reciterName: "Abdul Basit", style: "Mujawwad" })).toBe(
      "Abdul Basit · Mujawwad",
    );
  });

  it("falls back to Murattal when style is missing", () => {
    expect(reciterLabel({ reciterName: "Mishary Alafasy" })).toBe(
      "Mishary Alafasy · Murattal",
    );
    expect(
      reciterLabel({ reciterName: "Mishary Alafasy", style: undefined }),
    ).toBe(`Mishary Alafasy · ${DEFAULT_STYLE}`);
    expect(reciterLabel({ reciterName: "Mishary Alafasy", style: "" })).toBe(
      "Mishary Alafasy · Murattal",
    );
  });
});

describe("toReciterOptions", () => {
  it("stringifies the id and defaults a null style to Murattal", () => {
    const raw: RecitationResource[] = [
      { id: 7, reciterName: "Mishary Rashid Alafasy", style: undefined },
      { id: 2, reciterName: "Abdul Basit", style: "Mujawwad" },
    ];

    expect(toReciterOptions(raw)).toEqual([
      { id: "7", name: "Mishary Rashid Alafasy", style: "Murattal" },
      { id: "2", name: "Abdul Basit", style: "Mujawwad" },
    ]);
  });

  it("drops entries missing an id or reciter name", () => {
    const raw: RecitationResource[] = [
      { reciterName: "No Id" },
      { id: 3 },
      { id: 4, reciterName: "  " },
      { id: 5, reciterName: "Valid", style: "Murattal" },
    ];

    expect(toReciterOptions(raw)).toEqual([
      { id: "5", name: "Valid", style: "Murattal" },
    ]);
  });
});
