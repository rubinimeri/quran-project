import { NextRequest, NextResponse } from "next/server";

import {
  DEFAULT_LOCATION,
  filterPrayerTimes,
  getPrayerTimes,
} from "@/lib/prayer-times";
import type { PrayerTimesResponse } from "@/types/prayer-times";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");

  const latitude = latParam ? Number(latParam) : DEFAULT_LOCATION.latitude;
  const longitude = lngParam ? Number(lngParam) : DEFAULT_LOCATION.longitude;

  const [todayRes, tomorrowRes] = await Promise.all([
    getPrayerTimes({ latitude, longitude, daysToAdd: 0 }),
    getPrayerTimes({ latitude, longitude, daysToAdd: 1 }),
  ]);

  const todaySuccess = todayRes as Extract<
    PrayerTimesResponse,
    { data: { timings: unknown } }
  >;
  const tomorrowSuccess = tomorrowRes as Extract<
    PrayerTimesResponse,
    { data: { timings: unknown } }
  >;

  const timings = filterPrayerTimes(todaySuccess.data.timings);
  const tomorrowFajr: ["Fajr", string] = [
    "Fajr",
    tomorrowSuccess.data.timings.Fajr,
  ];

  return NextResponse.json({
    timings,
    tomorrowFajr,
    hijri: todaySuccess.data.date.hijri,
    gregorian: todaySuccess.data.date.gregorian,
    timezone: todaySuccess.data.meta.timezone,
  });
}
