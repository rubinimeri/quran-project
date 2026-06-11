/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import PrayerCountdown from "@/components/prayer-countdown";
import { PrayerTimes } from "@/types/prayer-times";
import { act } from "react";

const prayerTimes = [
  ["Fajr", "03:47"],
  ["Dhuhr", "12:38"],
  ["Asr", "16:32"],
  ["Maghrib", "20:05"],
  ["Isha", "21:56"],
] as [keyof PrayerTimes, string][];

const tomorrowsFajrPrayer = ["Fajr", "03:46"] as ["Fajr", string];

describe("PrayerCountdown", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-01-01T12:38:00"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });
  it("renders a countdown", () => {
    render(
      <PrayerCountdown
        prayerTimes={prayerTimes}
        tomorrowsFajrPrayer={tomorrowsFajrPrayer}
      />,
    );
    const timer = screen.getByText("03:54:00");
    expect(timer).toBeInTheDocument();
  });
  it("counts down to the next prayer after current one finishes", () => {
    render(
      <PrayerCountdown
        prayerTimes={prayerTimes}
        tomorrowsFajrPrayer={tomorrowsFajrPrayer}
      />,
    );
    act(() => {
      const MS_TO_NEXT_PRAYER = 3.9 * 3600000;
      jest.advanceTimersByTime(MS_TO_NEXT_PRAYER);
    });

    const timer = screen.getByText("03:33:00");
    expect(timer).toBeInTheDocument();
  });
  it("counts down to fajr when time is before first prayer", () => {
    jest.setSystemTime(new Date("2026-01-01T01:00:00"));
    render(
      <PrayerCountdown
        prayerTimes={prayerTimes}
        tomorrowsFajrPrayer={tomorrowsFajrPrayer}
      />,
    );
    // 03:47 - 01:00 = 02:47:00
    expect(screen.getByText("02:47:00")).toBeInTheDocument();
  });
  it("counts down to tomorrows fajr prayer after isha finishes", () => {
    jest.setSystemTime(new Date("2026-01-01T21:55:00"));
    render(
      <PrayerCountdown
        prayerTimes={prayerTimes}
        tomorrowsFajrPrayer={tomorrowsFajrPrayer}
      />,
    );
    act(() => {
      jest.advanceTimersByTime(60000);
    });

    const timer = screen.getByText("05:50:00");
    expect(timer).toBeInTheDocument();
  });
});
