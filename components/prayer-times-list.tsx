import {
  IconSunrise,
  IconSun,
  IconSunset,
  IconSunset2,
  IconMoon,
} from "@tabler/icons-react";

import {
  PRAYER_META,
  PRAYER_ORDER,
  type ShownPrayer,
} from "@/lib/prayer-times";
import type { PrayerTimes } from "@/types/prayer-times";

const ICON_MAP: Record<string, React.ReactNode> = {
  sunrise: <IconSunrise size={16} />,
  sun: <IconSun size={16} />,
  sunset2: <IconSunset2 size={16} />,
  sunset: <IconSunset size={16} />,
  moon: <IconMoon size={16} />,
};

// Gentle staggered cascade as the prayer rows reveal, matching the dua list
// and ayah list rhythm.
const STAGGER = ["", "delay-100", "delay-200", "delay-300", "delay-400", "delay-500"];

type PrayerTimesListProps = {
  times: [keyof PrayerTimes, string][];
  nextPrayerName: keyof PrayerTimes;
};

export function PrayerTimesList({
  times,
  nextPrayerName,
}: PrayerTimesListProps) {
  return (
    <ul className="w-full max-w-md mx-auto flex flex-col gap-2">
      {PRAYER_ORDER.map((name, index) => {
        const entry = times.find(([n]) => n === name);
        if (!entry) return null;
        const [, time] = entry;
        const meta = PRAYER_META[name as ShownPrayer];
        const isNext = name === nextPrayerName;

        return (
          <li
            key={name}
            className={[
              "fade-up",
              STAGGER[Math.min(index, STAGGER.length - 1)],
              "relative flex items-center gap-4 rounded-xl border px-5 py-4 transition-all duration-300",
              isNext
                ? "border-gold/50 bg-gold/5 shadow-[0_0_20px_oklch(0.8_0.11_85/0.08)]"
                : "border-border/40 bg-card/30",
            ].join(" ")}
          >
            {/* Gold side bar on next prayer */}
            {isNext && (
              <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-gold/70" />
            )}

            {/* Icon */}
            <span className={isNext ? "text-gold" : "text-gold-muted/60"}>
              {ICON_MAP[meta.iconKey]}
            </span>

            {/* Names */}
            <div className="flex items-center justify-between flex-1 min-w-0">
              <span
                className={[
                  "text-base font-light leading-tight transition-colors",
                  isNext ? "text-gold" : "text-foreground",
                ].join(" ")}
                style={{ fontFamily: "var(--font-display)" }}
              >
                {name}
              </span>
              <span
                className="text-xs text-gold-muted/70 leading-none mt-0.5"
                style={{ fontFamily: "var(--font-arabic)" }}
                lang="ar"
                dir="rtl"
              >
                {meta.arabic}
              </span>
            </div>

            {/* Time + Next tag */}
            <div className="flex items-center gap-3 shrink-0">
              {isNext && (
                <span className="text-[9px] uppercase tracking-[0.2em] text-gold border border-gold/40 rounded-full px-2 py-0.5">
                  Next
                </span>
              )}
              <span
                className={[
                  "text-sm tabular-nums font-medium",
                  isNext ? "text-gold" : "text-muted-foreground",
                ].join(" ")}
              >
                {time}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
