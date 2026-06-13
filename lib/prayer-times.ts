import { format, addDays } from "date-fns";

import type { PrayerTimes, PrayerTimesResponse } from "@/types/prayer-times";

export const HIDDEN_PRAYER_TIMES: (keyof PrayerTimes)[] = [
  "Midnight",
  "Sunset",
  "Firstthird",
  "Lastthird",
];

export const PRAYER_ORDER = [
  "Imsak",
  "Fajr",
  "Sunrise",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
] as const satisfies (keyof PrayerTimes)[];

export type ShownPrayer = (typeof PRAYER_ORDER)[number];

export const PRAYER_META: Record<
  ShownPrayer,
  { arabic: string; iconKey: string }
> = {
  Imsak: { arabic: "الإمساك", iconKey: "sunrise" },
  Fajr: { arabic: "الفجر", iconKey: "sunrise" },
  Sunrise: { arabic: "الشروق", iconKey: "sunrise" },
  Dhuhr: { arabic: "الظهر", iconKey: "sun" },
  Asr: { arabic: "العصر", iconKey: "sunset2" },
  Maghrib: { arabic: "المغرب", iconKey: "sunset" },
  Isha: { arabic: "العشاء", iconKey: "moon" },
};

export const DEFAULT_LOCATION = {
  latitude: 41.9961,
  longitude: 21.4316,
  label: "Skopje, MK",
};

export const CALCULATION_METHOD = 3;

export async function getPrayerTimes({
  latitude,
  longitude,
  daysToAdd = 0,
}: {
  latitude: number;
  longitude: number;
  daysToAdd?: number;
}): Promise<PrayerTimesResponse> {
  const date = format(addDays(new Date(), daysToAdd), "dd-MM-yyyy");
  const url = `https://api.aladhan.com/v1/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=${CALCULATION_METHOD}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Aladhan API error: ${res.status}`);
  return res.json() as Promise<PrayerTimesResponse>;
}

export function filterPrayerTimes(
  timings: PrayerTimes,
): [keyof PrayerTimes, string][] {
  return PRAYER_ORDER.map((name) => [name, timings[name]]);
}

export function getNextPrayer(
  times: [keyof PrayerTimes, string][],
  now: Date,
): keyof PrayerTimes {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (const [name, time] of times) {
    const [hStr, mStr] = time.split(":");
    const prayerMinutes = Number(hStr) * 60 + Number(mStr);
    if (prayerMinutes > nowMinutes) return name;
  }

  // All prayers have passed — wrap to the first
  return times[0][0];
}
