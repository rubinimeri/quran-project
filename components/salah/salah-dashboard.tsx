"use client";

import { useEffect, useState } from "react";

import PrayerCountdown from "./prayer-countdown";
import { PrayerTimesList } from "./prayer-times-list";
import { SalahHeader } from "./salah-header";
import { getNextPrayer } from "@/lib/prayer-times";
import type { PrayerTimes, PrayerTimesResponse } from "@/types/prayer-times";

type SuccessData = Extract<PrayerTimesResponse, { data: { timings: PrayerTimes } }>;
type HijriDate = SuccessData["data"]["date"]["hijri"];
type GregorianDate = SuccessData["data"]["date"]["gregorian"];

type ApiPayload = {
  timings: [keyof PrayerTimes, string][];
  tomorrowFajr: ["Fajr", string];
  hijri: HijriDate;
  gregorian: GregorianDate;
  timezone: string;
};

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: ApiPayload; usedFallback: boolean };

async function fetchPrayerTimes(lat?: number, lng?: number): Promise<ApiPayload> {
  const params =
    lat != null && lng != null ? `?lat=${lat}&lng=${lng}` : "";
  const res = await fetch(`/api/prayer-times${params}`);
  if (!res.ok) throw new Error("api error");
  return res.json() as Promise<ApiPayload>;
}

export function SalahDashboard() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [nextPrayer, setNextPrayer] = useState<keyof PrayerTimes | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load(lat?: number, lng?: number, fallback = false) {
      try {
        const data = await fetchPrayerTimes(lat, lng);
        if (cancelled) return;
        setState({ status: "ready", data, usedFallback: fallback });
        setNextPrayer(getNextPrayer(data.timings, new Date()));
      } catch {
        if (cancelled) return;
        setState({ status: "error" });
      }
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      load(undefined, undefined, true);
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => load(pos.coords.latitude, pos.coords.longitude, false),
        () => load(undefined, undefined, true),
        { timeout: 8000 },
      );
    }

    return () => {
      cancelled = true;
    };
  }, []);

  // Refresh the next-prayer highlight every 60 s
  useEffect(() => {
    if (state.status !== "ready") return;
    const timings = state.data.timings;
    const id = setInterval(() => {
      setNextPrayer(getNextPrayer(timings, new Date()));
    }, 60_000);
    return () => clearInterval(id);
  }, [state]);

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
