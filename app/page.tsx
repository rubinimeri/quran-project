import quranClient from "@/lib/quran";
import { HomeHero } from "@/components/home-hero";
import { DailyVerse } from "@/components/daily-verse";
import { SurahExplorer } from "@/components/surah-explorer";

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

  console.log(dailyVerse);

  return (
    <main className="flex flex-col gap-16 pb-24">
      <HomeHero />

      {dailyVerse && surahName && (
        <DailyVerse verse={dailyVerse} surahName={surahName} />
      )}

      {chapters && juzs && <SurahExplorer chapters={chapters} juzs={juzs} />}

      {!chapters && (
        <p className="text-center text-muted-foreground text-sm py-12">
          Could not load surahs. Please try again.
        </p>
      )}
    </main>
  );
}
