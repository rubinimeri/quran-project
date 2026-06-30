"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Virtuoso } from "react-virtuoso";

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

// Skeleton ayahs rendered on the server and until hydration, before Virtuoso
// mounts (see below). Enough to fill a viewport so there's no short flash.
const SSR_SKELETON_COUNT = 8;

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
    getVerseHandlers,
    activeVerse,
    virtuosoRef,
    onRangeChanged,
    initialTopMostItemIndex,
  } = useAyahList({ chapter, versesCount, startingVerse });
  const audioFiles = useAudioPlayerStore((state) => state.audioFiles);

  // Virtuoso reaches for browser-only APIs (requestAnimationFrame, window) in its
  // render/measure path, which throws during SSR. It also can't measure on the
  // server, so there's nothing to gain from server-rendering it. Mount it only
  // after hydration; until then render a skeleton scaffold. useSyncExternalStore
  // returns false on the server and the initial client render (keeping hydration
  // in sync) and true once mounted — without setState-in-effect.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Virtuoso renders only the visible window; itemContent maps a list index to
  // its verse (index + 1), rendering a skeleton until that verse's page loads.
  const renderAyah = useCallback(
    (index: number) => {
      const verseNumber = index + 1;
      const verse = versesByNumber.get(verseNumber);

      if (!verse) {
        return <Ayah verseNumber={verseNumber} loading />;
      }

      const handlers = getVerseHandlers(verseNumber);
      return (
        <Ayah
          className="px-4"
          chapter={chapter as number}
          verseNumber={verseNumber}
          textQpcHafs={verse.textQpcHafs ?? ""}
          highlighted={tafsirVerse === null && verseNumber === highlightedVerse}
          active={tafsirVerse === null && verseNumber === currentVerse}
          words={verse.words}
          segments={audioFiles[index]?.segments}
          onPlay={handlers.onPlay}
          onOpenTafsir={handlers.onOpenTafsir}
          translations={verse.translations ?? EMPTY_TRANSLATIONS}
        />
      );
    },
    [
      versesByNumber,
      audioFiles,
      highlightedVerse,
      currentVerse,
      tafsirVerse,
      getVerseHandlers,
    ],
  );

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
        {mounted ? (
          <Virtuoso
            useWindowScroll
            ref={virtuosoRef}
            totalCount={versesCount}
            // Items above the deep-link target have never been measured, so
            // Virtuoso estimates them at defaultItemHeight and corrects scroll the
            // moment each one is first rendered. A large TOP overscan renders (and
            // measures) those items well before they reach the visible edge, so
            // the correction happens off-screen instead of as visible jitter. A
            // realistic estimate keeps the residual corrections small.
            defaultItemHeight={560}
            increaseViewportBy={{ top: 2400, bottom: 800 }}
            initialTopMostItemIndex={initialTopMostItemIndex}
            rangeChanged={onRangeChanged}
            computeItemKey={(index) => index + 1}
            itemContent={renderAyah}
          />
        ) : (
          <>
            {Array.from({ length: SSR_SKELETON_COUNT }, (_, i) => (
              <Ayah key={i} verseNumber={i + 1} loading />
            ))}
          </>
        )}
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
        textQpcHafs={activeVerse?.textQpcHafs}
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
