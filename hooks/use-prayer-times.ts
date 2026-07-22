import { useState, useEffect } from "react";
import { getNextPrayer } from "@/lib/prayer-times";

import type {
  PrayerTimes,
  HijriDate,
  GregorianDate,
} from "@/types/prayer-times";

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

async function fetchPrayerTimes(
  lat?: number,
  lng?: number,
): Promise<ApiPayload> {
  const params = lat != null && lng != null ? `?lat=${lat}&lng=${lng}` : "";
  const res = await fetch(`/api/prayer-times${params}`);
  if (!res.ok) throw new Error("api error");
  return res.json() as Promise<ApiPayload>;
}

export function usePrayerTimes() {
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

  return { state, nextPrayer };
}
