import { notFound } from "next/navigation";
import quranClient from "@/lib/quran";
import { SurahHeader } from "@/components/surah-header";
import { SurahNav } from "@/components/surah-nav";
import { Ayah } from "@/components/ayah";
import { AudioPlayer } from "@/components/audio-player";

const MISHARY_RECITER_ID = "7";

export default async function SurahPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = parseInt(id, 10);

  if (isNaN(numericId) || numericId < 1 || numericId > 114) {
    notFound();
  }

  const chapterId = String(numericId) as Parameters<
    typeof quranClient.content.v4.chapters.get
  >[0];

  const [chapter, verses, audio] = await Promise.all([
    quranClient.content.v4.chapters.get(chapterId).catch(() => null),
    quranClient.content.v4.verses
      .byChapter(chapterId, {
        fields: { text_uthmani: true },
        translations: [88, 20],
      })
      .catch(() => null),
    quranClient.content.v4.audio.chapterRecitation
      .get(MISHARY_RECITER_ID, chapterId)
      .catch(() => null),
  ]);

  if (!chapter || !verses) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Failed to load surah.</p>
      </main>
    );
  }

  return (
    <main className="surah-glow min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-4">
        <SurahNav currentId={numericId} />

        <SurahHeader
          id={numericId}
          nameSimple={chapter.nameSimple}
          nameArabic={chapter.nameArabic}
          translatedName={chapter.translatedName.name}
          versesCount={chapter.versesCount}
          revelationPlace={chapter.revelationPlace}
          bismillahPre={chapter.bismillahPre}
        />

        <section className="mt-6">
          {verses.map((verse) => (
            <Ayah
              key={verse.id}
              verseNumber={verse.verseNumber}
              textUthmani={verse.textUthmani ?? ""}
              translations={
                verse.translations?.map((t) => ({
                  text: t.text,
                  resourceName: t.resourceName,
                })) ?? []
              }
            />
          ))}
        </section>

        <SurahNav currentId={numericId} />
      </div>

      {audio && (
        <AudioPlayer audioUrl={audio.audioUrl} surahName={chapter.nameSimple} />
      )}
    </main>
  );
}
