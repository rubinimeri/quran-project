"use client";

import PrayerCountdown from "./prayer-countdown";
import { PrayerTimesList } from "./prayer-times-list";
import { SalahHeader } from "./salah-header";
import { usePrayerTimes } from "@/hooks/use-prayer-times";

export function SalahDashboard() {
  const { state, nextPrayer } = usePrayerTimes();

  if (state.status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <span
          className="text-3xl text-gold-muted/50 animate-pulse font-arabic"
          lang="ar"
        >
          صلاة
        </span>
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40">
          Finding prayer times&hellip;
        </p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
        <p className="text-sm text-muted-foreground">
          Prayer times could not be loaded. Please try again later.
        </p>
      </div>
    );
  }

  const { data, usedFallback } = state;
  const resolvedNext = nextPrayer ?? data.timings[0][0];

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg mx-auto px-4 pb-16">
      <SalahHeader
        timezone={data.timezone}
        hijriDay={data.hijri.day}
        hijriMonth={data.hijri.month.en}
        hijriYear={data.hijri.year}
        gregorianDate={data.gregorian.date}
        usedFallback={usedFallback}
      />

      {usedFallback && (
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 -mt-4">
          Showing times for Skopje, MK
        </p>
      )}

      <PrayerCountdown
        prayerTimes={data.timings}
        tomorrowsFajrPrayer={data.tomorrowFajr}
      />

      <PrayerTimesList times={data.timings} nextPrayerName={resolvedNext} />
    </div>
  );
}
