"use client";

import { memo } from "react";
import { stripHtmlTags } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { VerseActions } from "./verse-actions";
import { IconBook } from "@tabler/icons-react";
import { type WordSegment } from "@/lib/audio";
import { Word as W } from "@quranjs/api";
import { ActiveVerseWords } from "./active-verse-words";
import { WordSpan } from "./word-span";
import { AyahSkeleton } from "./ayah-skeleton";
import { useWordAudio } from "@/hooks/use-word-audio";

export type Word = W & {
  textQpcHafs?: string;
};

type AyahTranslation = {
  text: string;
  resourceName?: string;
};

type AyahProps = {
  verseNumber: number;
  chapter?: number;
  loading?: boolean;
  textQpcHafs?: string;
  translations?: AyahTranslation[];
  highlighted?: boolean;
  active?: boolean;
  words?: Word[];
  segments?: WordSegment[];
  onPlay?: () => void;
  onOpenTafsir?: () => void;
  className?: string;
  /**
   * Render as the header inside the tafsir dialog: hide the verse actions
   * (play, copy, tafsir trigger) and the active/highlight states.
   */
  asHeader?: boolean;
};

// TODO: make this component more readable
function AyahBase({
  chapter,
  verseNumber,
  loading = false,
  textQpcHafs = "",
  translations = [],
  highlighted = false,
  active = false,
  words,
  segments,
  onPlay,
  onOpenTafsir,
  asHeader = false,
  className,
}: AyahProps) {
  const { audioRef, play } = useWordAudio(chapter || 0, verseNumber);

  function renderArabic() {
    if (active && words && segments)
      return <ActiveVerseWords words={words} segments={segments} />;
    if (words && chapter)
      return (
        <>
          <audio ref={audioRef} preload="metadata" />
          {words.map((word, index) => (
            <WordSpan
              key={index}
              text={word.textQpcHafs}
              handleWordClick={
                word.audioUrl ? () => play(word.position) : undefined
              }
              textTranslation={word.translation.text}
            />
          ))}
        </>
      );
    return textQpcHafs;
  }

  return (
    <article
      aria-busy={loading || undefined}
      aria-current={!asHeader && active ? "true" : undefined}
      className={cn(
        className,
        "rounded-4xl group relative flex flex-col gap-5",
        !asHeader && highlighted && "verse-active",
        !asHeader && active && "verse-active",
        asHeader ? "pb-6" : "py-8 border-b border-border/40 last:border-0",
        !loading && "fade-up",
      )}
    >
      {/* Verse number medallion */}
      <div className={cn("flex items-center gap-3", loading ? "px-4" : "px-0")}>
        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-gold/40 text-gold text-xs font-semibold shrink-0">
          {verseNumber}
        </div>
        <Separator className="flex-1 bg-gold-muted/15" />

        {!loading && (
          <VerseActions
            arabic={textQpcHafs}
            translations={translations.map((t) => stripHtmlTags(t.text))}
            chapter={chapter}
            verseNumber={verseNumber}
            onPlay={onPlay}
            active={active}
          />
        )}
      </div>

      {loading ? (
        <AyahSkeleton />
      ) : (
        <>
          {/* Arabic text */}
          <p
            className="text-right text-3xl md:text-4xl leading-[1.6] text-foreground font-medium font-quran"
            lang="ar"
            dir="rtl"
          >
            {/* 
              We need the currentMs of the player, and then compare that currentMs to startMs & endMs
              of the segments, if within those two values then highlight the corresponding word
              */}
            {renderArabic()}
          </p>

          {/* Translations */}
          <div className="flex flex-col gap-4">
            {translations.map((t, i) => (
              <div key={i} className="flex flex-col gap-1">
                <p className="font-medium leading-relaxed">
                  {stripHtmlTags(t.text)}
                </p>
                {t.resourceName && (
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
                    {t.resourceName}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Tafsir — active (gold) when this ayah's tafsir is already open */}
          <button
            type="button"
            onClick={onOpenTafsir}
            aria-pressed={asHeader || undefined}
            aria-label={`Read tafsir for verse ${verseNumber}`}
            className={cn(
              "text-sm font-medium w-max flex items-center gap-1 py-1 transition-colors focus-visible:opacity-100",
              asHeader ? "text-gold" : "text-muted-foreground hover:text-gold",
            )}
          >
            <IconBook size={16} />
            Tafsirs
          </button>
        </>
      )}
    </article>
  );
}

export const Ayah = memo(AyahBase);
