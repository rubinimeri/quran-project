import { Card, CardContent } from "@/components/ui/card";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { PrayerTimes, PrayerTimesResponse } from "@/types/prayer-times";
import {
  IconMoon,
  IconSun,
  IconSunrise,
  IconSunset,
  IconSunset2,
} from "@tabler/icons-react";
import { formatISO } from "date-fns";

const HIDDEN_PRAYER_TIMES = ["Midnight", "Sunset", "Firstthird", "Lastthird"];

const prayerTimesIcons: Partial<Record<keyof PrayerTimes, React.JSX.Element>> =
  {
    Imsak: <IconSunrise className="text-blue-900" />,
    Fajr: <IconSunrise className="text" />,
    Sunrise: <IconSunrise className="text-orange-300" />,
    Dhuhr: <IconSun className="text-yellow-600" />,
    Asr: <IconSunset2 className="text-text-" />,
    Maghrib: <IconSunset />,
    Isha: <IconMoon />,
  };

async function getPrayerTimes(): Promise<PrayerTimesResponse> {
  const response = await fetch(
    `https://api.aladhan.com/v1/timingsByCity/${formatISO(new Date())}?city=Skopje&country=MK`,
    {
      method: "GET",
    },
  );

  return await response.json();
}

const ERROR_CODE = 400;

export default async function Page() {
  const prayerTimes = await getPrayerTimes();

  if (prayerTimes.code === ERROR_CODE || typeof prayerTimes.data === "string")
    return <Card>Error getting prayer times!</Card>;

  const filteredPrayerTimes = (
    Object.entries(prayerTimes.data.timings) as [keyof PrayerTimes, string][]
  )
    .filter(([prayer]) => !HIDDEN_PRAYER_TIMES.includes(prayer))
    .sort(([, a], [, b]) => a.localeCompare(b));

  return (
    <main className="p-4">
      <Card className="bg-card/30 max-w-sm mx-auto">
        <CardContent>
          {filteredPrayerTimes.map(([prayer, value]) => (
            <Item key={prayer}>
              <ItemMedia>{prayerTimesIcons[prayer]}</ItemMedia>
              <ItemContent>
                <ItemTitle>{prayer}</ItemTitle>
              </ItemContent>
              <h2 className="text-lg font-bold">{value}</h2>
            </Item>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
