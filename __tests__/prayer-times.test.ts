import { filterPrayerTimes, getNextPrayer } from "@/lib/prayer-times";
import type { PrayerTimes } from "@/types/prayer-times";

const SAMPLE_TIMINGS: PrayerTimes = {
  Imsak: "04:10",
  Fajr: "04:20",
  Sunrise: "06:00",
  Dhuhr: "12:00",
  Asr: "15:30",
  Sunset: "18:00",
  Maghrib: "18:05",
  Isha: "19:30",
  Midnight: "00:00",
  Firstthird: "22:00",
  Lastthird: "02:00",
};

describe("filterPrayerTimes", () => {
  it("returns exactly 7 entries", () => {
    const result = filterPrayerTimes(SAMPLE_TIMINGS);
    expect(result).toHaveLength(7);
  });

  it("includes Imsak, Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha", () => {
    const result = filterPrayerTimes(SAMPLE_TIMINGS);
    const names = result.map(([name]) => name);
    expect(names).toContain("Imsak");
    expect(names).toContain("Fajr");
    expect(names).toContain("Sunrise");
    expect(names).toContain("Dhuhr");
    expect(names).toContain("Asr");
    expect(names).toContain("Maghrib");
    expect(names).toContain("Isha");
  });

  it("excludes Midnight, Sunset, Firstthird, Lastthird", () => {
    const result = filterPrayerTimes(SAMPLE_TIMINGS);
    const names = result.map(([name]) => name);
    expect(names).not.toContain("Midnight");
    expect(names).not.toContain("Sunset");
    expect(names).not.toContain("Firstthird");
    expect(names).not.toContain("Lastthird");
  });

  it("returns entries in canonical order: Imsak, Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha", () => {
    const result = filterPrayerTimes(SAMPLE_TIMINGS);
    expect(result.map(([name]) => name)).toEqual([
      "Imsak",
      "Fajr",
      "Sunrise",
      "Dhuhr",
      "Asr",
      "Maghrib",
      "Isha",
    ]);
  });

  it("preserves the time strings from the input", () => {
    const result = filterPrayerTimes(SAMPLE_TIMINGS);
    expect(result.find(([n]) => n === "Fajr")?.[1]).toBe("04:20");
    expect(result.find(([n]) => n === "Isha")?.[1]).toBe("19:30");
  });
});

describe("getNextPrayer", () => {
  const times: [keyof PrayerTimes, string][] = [
    ["Imsak", "04:10"],
    ["Fajr", "04:20"],
    ["Sunrise", "06:00"],
    ["Dhuhr", "12:00"],
    ["Asr", "15:30"],
    ["Maghrib", "18:05"],
    ["Isha", "19:30"],
  ];

  it("returns the first prayer that has not yet started", () => {
    // 11:00 — before Dhuhr
    const now = new Date("2026-01-01T11:00:00");
    expect(getNextPrayer(times, now)).toBe("Dhuhr");
  });

  it("returns the current prayer if it just started (edge: exactly on the minute)", () => {
    // exactly at Dhuhr time
    const now = new Date("2026-01-01T12:00:00");
    expect(getNextPrayer(times, now)).toBe("Asr");
  });

  it("returns Imsak when all prayers for the day have passed (wraps around)", () => {
    // after Isha
    const now = new Date("2026-01-01T23:00:00");
    expect(getNextPrayer(times, now)).toBe("Imsak");
  });

  it("returns Fajr when before Fajr but after Imsak", () => {
    const now = new Date("2026-01-01T04:15:00");
    expect(getNextPrayer(times, now)).toBe("Fajr");
  });

  it("returns Imsak when before the first prayer of the day", () => {
    const now = new Date("2026-01-01T03:00:00");
    expect(getNextPrayer(times, now)).toBe("Imsak");
  });
});
