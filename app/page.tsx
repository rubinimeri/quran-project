import PrayerCountdown from "@/components/prayer-countdown";
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
import { format } from "date-fns";

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

async function getPrayerTimes(daysToAdd = 0): Promise<PrayerTimesResponse> {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  console.log(format(date, "dd-MM-yyyy"));

  const response = await fetch(
    `https://api.aladhan.com/v1/timingsByCity/${format(date, "dd-MM-yyyy")}?city=Skopje&country=MK`,
    {
      method: "GET",
    },
  );

  return await response.json();
}

const ERROR_CODE = 400;

export default async function Page() {
  const prayerTimes = await getPrayerTimes();
  const tomorrowsPrayerTimes = await getPrayerTimes(1);

  if (
    prayerTimes.code === ERROR_CODE ||
    typeof prayerTimes.data === "string" ||
    tomorrowsPrayerTimes.code === ERROR_CODE ||
    typeof tomorrowsPrayerTimes.data === "string"
  )
    return <Card>Error getting prayer times!</Card>;

  const filteredPrayerTimes = (
    Object.entries(prayerTimes.data.timings) as [keyof PrayerTimes, string][]
  )
    .filter(([prayer]) => !HIDDEN_PRAYER_TIMES.includes(prayer))
    .sort(([, a], [, b]) => a.localeCompare(b));

  console.log(tomorrowsPrayerTimes);

  return (
    <main className="p-4 flex flex-col items-center justify-center gap-8">
      <h1 className="text-center font-extrabold text-2xl">Salah</h1>
      <PrayerCountdown
        prayerTimes={filteredPrayerTimes}
        tomorrowsFajrPrayer={["Fajr", prayerTimes.data.timings.Fajr]}
      />
      <Card className="bg-card/30 max-w-sm w-full">
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
