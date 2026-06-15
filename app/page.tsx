import quranClient from "@/lib/quran";
import { HomeHero } from "@/components/home-hero";
import { DailyVerse } from "@/components/daily-verse";
import { SurahExplorer } from "@/components/surah-explorer";
import { SearchMode } from "@quranjs/api";

export default async function Page() {
  const [chapters, juzs, dailyVerse] = await Promise.all([
    quranClient.content.v4.chapters.list().catch(() => null),
    quranClient.content.v4.juzs.list().catch(() => null),
    quranClient.content.v4.verses
      .random({
        fields: { chapterId: true, text_uthmani: true },
        translations: [88],
      })
      .catch(() => null),
  ]);

  const surahName =
    dailyVerse && chapters
      ? (chapters.find((c) => c.id === Number(dailyVerse.chapterId))
          ?.nameSimple ?? "")
      : "";

  return (
    <main className="flex flex-col gap-16 pb-24">
      <HomeHero />

      {dailyVerse && surahName && (
        <DailyVerse verse={dailyVerse} surahName={surahName} />
      )}

      {chapters && juzs && (
        <SurahExplorer
          chapters={chapters}
          // API returns double the data so had to use this filter to get every second juz
          juzs={[...juzs].filter((juz, index) => index % 2 !== 0)}
        />
      )}

      {!chapters && (
        <p className="text-center text-muted-foreground text-sm py-12">
          Could not load surahs. Please try again.
        </p>
      )}
    </main>
  );
}
