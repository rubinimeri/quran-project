"use client";

import { PrayerTimes } from "@/types/prayer-times";
import { useState } from "react";
import Countdown, { CountdownRenderProps } from "react-countdown";

function timeToSecondsConverter(time: string) {
  const parts = time.split(":").map(Number);
  const [hours, minutes, seconds = 0] = parts;

  return hours * 3600 + minutes * 60 + seconds;
}

function getTimeToNextPrayer(
  prayerTimes: [keyof PrayerTimes, string][],
  tomorrowsFajrPrayer: ["Fajr", string],
) {
  const date = new Date();

  function getTimeToMidnight() {
    // Clone the current time and set it to 24:00:00 (Midnight)
    const midnight = new Date(date);
    midnight.setHours(24, 0, 0, 0);

    return (Number(midnight) - Number(date)) / 1000;
  }

  const secondsAfterMidnight =
    date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();

  const nextPrayerTime = prayerTimes.find(
    ([, prayerTime]) =>
      secondsAfterMidnight < timeToSecondsConverter(prayerTime),
  );

  // TODO: Handle edge case when time is past Isha: return imsak for tomorrow
  if (!nextPrayerTime) {
    return (
      Date.now() +
      (getTimeToMidnight() + timeToSecondsConverter(tomorrowsFajrPrayer[1])) *
        1000
    );
  }

  return (
    Date.now() +
    (timeToSecondsConverter(nextPrayerTime[1]) - secondsAfterMidnight) * 1000
  );
}

const renderer = ({
  days,
  hours,
  minutes,
  seconds,
  completed,
}: CountdownRenderProps) => {
  if (completed) {
    return (
      <span className="text-6xl font-light tabular-nums text-gold tracking-tight">
        00:00:00
      </span>
    );
  }

  const totalHours = days * 24 + hours;

  return (
    <div className="text-6xl font-light tabular-nums text-gold tracking-tight">
      {String(totalHours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
      {String(seconds).padStart(2, "0")}
    </div>
  );
};

export default function PrayerCountdown({
  prayerTimes,
  tomorrowsFajrPrayer,
}: {
  prayerTimes: [keyof PrayerTimes, string][];
  tomorrowsFajrPrayer: ["Fajr", string];
}) {
  const [timeToNextPrayer, setTimeToNextPrayer] = useState(() =>
    getTimeToNextPrayer(prayerTimes, tomorrowsFajrPrayer),
  );

  function onTimerComplete() {
    setTimeToNextPrayer(getTimeToNextPrayer(prayerTimes, tomorrowsFajrPrayer));
  }

  return (
    <div className="fade-soft delay-300 flex flex-col items-center gap-3 text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-gold-muted font-sans">
        Next prayer in
      </p>
      <Countdown
        date={timeToNextPrayer}
        renderer={renderer}
        onComplete={onTimerComplete}
      />
    </div>
  );
}
