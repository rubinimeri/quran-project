"use client";

import { Ayah } from "./ayah";
import { TafsirDialog } from "./tafsir-dialog";
import { useAyahList } from "@/hooks/use-ayah-list";

type AyahListProps = {
  chapter: string | number;
  versesCount: number;
  surahName: string;
  startingVerse?: number;
};

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
    registerArticle,
    activeVerse,
  } = useAyahList({ chapter, versesCount, startingVerse });

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
          const articleRef = registerArticle(Boolean(verse));

          return verse ? (
            <Ayah
              className="px-4"
              key={verseNumber}
              verseNumber={verseNumber}
              textUthmani={verse.textUthmani ?? ""}
              highlighted={
                tafsirVerse === null && verseNumber === highlightedVerse
              }
              active={tafsirVerse === null && verseNumber === currentVerse}
              onPlay={() => requestVerse(verseNumber)}
              onOpenTafsir={() => openTafsir(verseNumber)}
              articleRef={articleRef}
              translations={
                verse.translations?.map((t) => ({
                  text: t.text,
                  resourceName: t.resourceName,
                })) ?? []
              }
            />
          ) : (
            <Ayah
              key={verseNumber}
              verseNumber={verseNumber}
              loading
              articleRef={articleRef}
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
