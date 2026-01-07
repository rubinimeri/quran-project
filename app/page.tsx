"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatISO } from "date-fns";
import { useEffect, useState } from "react";

export default function Page() {
  const [prayerTimes, setPrayerTimes] = useState(null);

  useEffect(() => {
    const fetchPrayerTimes = () => {
      fetch(
        `${process.env.PRAYER_TIMES_API_BASE_URL}/timingsByCity/${formatISO(new Date())}?city=Skopje`,
        {
          method: "GET",
        },
      );
    };
  }, []);

  return (
    <main className="grid min-h-screen place-items-center">
      <Card className="size-100 text-center">
        <CardHeader>
          <CardTitle>Quran Project</CardTitle>
          <CardDescription>
            Read the mercy Allah sent to humanity!
          </CardDescription>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
    </main>
  );
}
