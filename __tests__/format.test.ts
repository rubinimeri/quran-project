import { formatTime, stripHtmlTags } from "@/lib/format";

describe("formatTime", () => {
  it("formats sub-minute durations as M:SS", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(5)).toBe("0:05");
    expect(formatTime(59)).toBe("0:59");
  });

  it("formats minutes as M:SS without an hour segment under an hour", () => {
    expect(formatTime(65)).toBe("1:05");
    expect(formatTime(600)).toBe("10:00");
    expect(formatTime(3599)).toBe("59:59");
  });

  it("rolls into H:MM:SS once it reaches an hour", () => {
    expect(formatTime(3600)).toBe("1:00:00");
    expect(formatTime(3661)).toBe("1:01:01");
    // Al-Baqarah runs past two hours — minutes no longer overflow.
    expect(formatTime(7543)).toBe("2:05:43");
  });

  it("floors fractional seconds", () => {
    expect(formatTime(90.9)).toBe("1:30");
  });

  it("guards against invalid input", () => {
    expect(formatTime(-1)).toBe("0:00");
    expect(formatTime(NaN)).toBe("0:00");
    expect(formatTime(Infinity)).toBe("0:00");
  });
});

describe("stripHtmlTags", () => {
  it("removes tags and footnote digits", () => {
    expect(stripHtmlTags('Merciful<sup foot_note="1">1</sup>.')).toBe(
      "Merciful.",
    );
  });
});
