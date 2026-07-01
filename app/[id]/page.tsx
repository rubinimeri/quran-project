import { notFound } from "next/navigation";
import quranClient from "@/lib/quran";
import { SurahHeader } from "@/components/surah-header";
import { SurahNav } from "@/components/surah-nav";
import { AudioPlayer } from "@/components/audio-player";
import { AyahList } from "@/components/ayah-list";
import { SurahToolbar } from "@/components/surah-toolbar";
import { toChapterReciterOptions } from "@/lib/reciters";
import { Suspense } from "react";

export default async function SurahPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ startingVerse?: string }>;
}) {
  const { id } = await params;
  const { startingVerse: startingVerseRaw } = await searchParams;
  const numericId = parseInt(id, 10);

  if (isNaN(numericId) || numericId < 1 || numericId > 114) {
    notFound();
  }

  const chapterId = String(numericId) as Parameters<
    typeof quranClient.content.v4.chapters.get
  >[0];

  const [chapter, chapterReciters, chapters] = await Promise.all([
    quranClient.content.v4.chapters.get(chapterId).catch(() => null),
    quranClient.content.v4.resources.chapterReciters.list().catch(() => []),
    quranClient.content.v4.chapters.list().catch(() => []),
  ]);
  const reciters = toChapterReciterOptions(chapterReciters);

  const parsedStartingVerse = Number(startingVerseRaw);
  const startingVerse =
    startingVerseRaw &&
    Number.isInteger(parsedStartingVerse) &&
    parsedStartingVerse >= 1 &&
    chapter &&
    parsedStartingVerse <= chapter.versesCount
      ? parsedStartingVerse
      : undefined;

  if (!chapter) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Failed to load surah.</p>
      </main>
    );
  }

  return (
    <main className="surah-glow min-h-screen pb-24">
      <SurahToolbar
        chapters={chapters}
        reciters={reciters}
        currentSurahId={numericId}
        versesCount={chapter.versesCount}
      />

      <div className="max-w-5xl mx-auto ">
        <SurahHeader
          id={numericId}
          nameSimple={chapter.nameSimple}
          nameArabic={chapter.nameArabic}
          translatedName={chapter.translatedName.name}
          versesCount={chapter.versesCount}
          revelationPlace={chapter.revelationPlace}
          bismillahPre={chapter.bismillahPre}
        />

        <Suspense>
          <AyahList
            key={`${numericId}-${startingVerse ?? ""}`}
            chapter={chapterId}
            versesCount={chapter.versesCount}
            surahName={chapter.nameSimple}
            startingVerse={startingVerse}
          />
        </Suspense>

        <SurahNav currentId={numericId} />
      </div>

      <Suspense>
        <AudioPlayer
          chapter={chapterId}
          versesCount={chapter.versesCount}
          surahName={chapter.nameSimple}
        />
      </Suspense>
    </main>
  );
}
