"use client";

import { useAudioPlayerStore } from "@/stores/audio-player-store";
import { Ayah } from "./ayah";
import { TafsirDialog } from "./tafsir-dialog";
import { useAyahList } from "@/hooks/use-ayah-list";

type AyahListProps = {
  chapter: string | number;
  versesCount: number;
  surahName: string;
  startingVerse?: number;
};

// Stable reference for verses without translations, so a memoized Ayah doesn't
// re-render on a fresh `[]` each list render.
const EMPTY_TRANSLATIONS: { text: string; resourceName?: string }[] = [];

export function AyahList({
  chapter,
  versesCount,
  surahName,
  startingVerse,
}: AyahListProps) {
  const {
    error,
    versesByNumber,
    highlightedVerse,
    tafsirVerse,
    setTafsirVerse,
    currentVerse,
    requestVerse,
    openTafsir,
    observeArticle,
    unobserveArticle,
    getVerseHandlers,
    activeVerse,
  } = useAyahList({ chapter, versesCount, startingVerse });
  const audioFiles = useAudioPlayerStore((state) => state.audioFiles);

  if (error) {
    return (
      <section className="mt-6 flex justify-center py-12">
        <span className="text-sm text-destructive">{error}</span>
      </section>
    );
  }

  return (
    <>
      <section className="mt-6">
        {Array.from({ length: versesCount }, (_, i) => {
          const verseNumber = i + 1;
          const verse = versesByNumber.get(verseNumber);

          if (!verse) {
            return (
              <Ayah
                key={verseNumber}
                verseNumber={verseNumber}
                loading
                articleRef={observeArticle}
              />
            );
          }

          const handlers = getVerseHandlers(verseNumber);
          return (
            <Ayah
              className="px-4"
              key={verseNumber}
              verseNumber={verseNumber}
              textUthmani={verse.textUthmani ?? ""}
              highlighted={
                tafsirVerse === null && verseNumber === highlightedVerse
              }
              active={tafsirVerse === null && verseNumber === currentVerse}
              words={verse.words}
              segments={audioFiles[i]?.segments}
              onPlay={handlers.onPlay}
              onOpenTafsir={handlers.onOpenTafsir}
              articleRef={unobserveArticle}
              translations={verse.translations ?? EMPTY_TRANSLATIONS}
            />
          );
        })}
      </section>

      <TafsirDialog
        open={tafsirVerse !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setTafsirVerse(null);
        }}
        chapter={chapter}
        surahName={surahName}
        verseNumber={tafsirVerse ?? 1}
        versesCount={versesCount}
        textUthmani={activeVerse?.textUthmani}
        translations={activeVerse?.translations?.map((t) => ({
          text: t.text,
          resourceName: t.resourceName,
        }))}
        active={tafsirVerse !== null && tafsirVerse === currentVerse}
        onPlay={
          tafsirVerse !== null ? () => requestVerse(tafsirVerse) : undefined
        }
        onNavigate={openTafsir}
      />
    </>
  );
}
