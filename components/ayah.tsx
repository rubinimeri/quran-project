"use client";

import { memo, useMemo, useRef, useState } from "react";
import { stripHtmlTags } from "@/lib/format";
import { Separator } from "@/components/ui/separator";
import { VerseActions } from "./verse-actions";
import { IconBook } from "@tabler/icons-react";
import { useAudioPlayerStore } from "@/stores/audio-player-store";
import { Segment, Word as W } from "@quranjs/api";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Word = W & {
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
  segments?: Segment[];
  onPlay?: () => void;
  onOpenTafsir?: () => void;
  className?: string;
  /**
   * Render as the header inside the tafsir dialog: hide the verse actions
   * (play, copy, tafsir trigger) and the active/highlight states.
   */
  asHeader?: boolean;
};

function Bar({ className }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-md ${className ?? ""}`} />;
}

const BASE_URL = "https://audio.qurancdn.com/";

function WordSpan({
  text,
  textTranslation,
  highlighted = false,
  handleWordClick,
}: {
  text?: string;
  textTranslation?: string;
  highlighted?: boolean;
  handleWordClick?: () => void;
}) {
  // Controlled so the tooltip opens only on click. Hover/focus opens are
  // ignored (we drop `open === true` from onOpenChange), while pointer-leave
  // and Escape still close it.
  const [open, setOpen] = useState(false);

  // Highlight-only words (shown while a verse is being recited) are not
  // interactive — render plain text so they aren't focusable or announced
  // as controls.
  if (!handleWordClick) {
    return (
      <span className={highlighted ? "text-gold" : undefined}>
        {text + " "}
      </span>
    );
  }

  return (
    <Tooltip open={open} onOpenChange={(next) => next || setOpen(false)}>
      <TooltipTrigger
        onClick={(e) => {
          handleWordClick();
          setOpen(true);
          e.currentTarget.focus();
        }}
        className={`cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus:text-gold active:text-gold ${highlighted ? "text-gold" : "hover:text-gold"}`}
      >
        {text}
        &nbsp;
      </TooltipTrigger>
      <TooltipContent>{textTranslation}</TooltipContent>
    </Tooltip>
  );
}

/**
 * Word-by-word Arabic for the verse currently being recited. Mounted only for
 * the active ayah, so the high-frequency `current` playback-time subscription
 * re-renders a single verse on each audio tick rather than every ayah in the
 * surah.
 */
function ActiveVerseWords({
  words,
  segments,
}: {
  words: Word[];
  segments: Segment[];
}) {
  const currentMs = useAudioPlayerStore((state) => state.current) * 1000;

  // Recitation segments are keyed by their own word number (segment[1]), not by
  // array position: a verse can have fewer segments than words (two words can
  // share one timing segment), so indexing `segments[index]` drifts every word
  // after the gap. Look each word up by its `position` instead.
  const segmentByWord = useMemo(() => {
    const map = new Map<number, Segment>();
    for (const segment of segments) map.set(segment[1], segment);
    return map;
  }, [segments]);

  return (
    <>
      {words.map((word, index) => {
        const segment = segmentByWord.get(word.position);
        const highlighted =
          segment !== undefined &&
          currentMs >= segment[2] &&
          currentMs <= segment[3];
        return (
          <WordSpan
            key={index}
            text={word.textQpcHafs}
            highlighted={highlighted}
          />
        );
      })}
    </>
  );
}

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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleWordClick = async (url: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Only reload if the source actually changed
    if (audio.src !== url) {
      audio.src = url;
    }
    audio.currentTime = 0; // always restart from the beginning

    try {
      await audio.play();
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Audio playing blocked: ", err);
      }
    }
  };

  const createAudioUrl = (
    chapter: string,
    verseNumber: string,
    wordIndex: string,
  ) =>
    `${BASE_URL}/wbw/${chapter.padStart(3, "0")}_${verseNumber.padStart(3, "0")}_${wordIndex.padStart(3, "0")}.mp3`;

  let arabic;
  if (active && words && segments) {
    arabic = <ActiveVerseWords words={words} segments={segments} />;
  } else if (words) {
    arabic = (
      <>
        {/* One shared player for the whole verse — each word swaps its src. */}
        <audio ref={audioRef} preload="metadata" />
        {words.map((word, index) => (
          <WordSpan
            key={index}
            text={word.textQpcHafs}
            // Non-word glyphs (e.g. the verse-end marker) have no audio, so
            // they render as plain, non-interactive text.
            handleWordClick={
              word.audioUrl
                ? () =>
                    handleWordClick(
                      createAudioUrl(
                        String(chapter),
                        String(verseNumber),
                        String(word.position),
                      ),
                    )
                : undefined
            }
            textTranslation={word.translation.text}
          />
        ))}
      </>
    );
  } else {
    arabic = textQpcHafs;
  }

  return (
    <article
      aria-busy={loading || undefined}
      aria-current={!asHeader && active ? "true" : undefined}
      className={`${className} rounded-4xl ${!asHeader && highlighted ? "verse-active" : ""} ${!asHeader && active ? "verse-active" : ""} group relative flex flex-col gap-5 ${asHeader ? "pb-6" : "py-8 border-b border-border/40 last:border-0"} ${!loading ? "fade-up" : ""}`}
    >
      {/* Verse number medallion */}
      <div className={`${loading ? "px-4" : "px-0"} flex items-center gap-3`}>
        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-gold/40 text-gold text-xs font-semibold shrink-0">
          {verseNumber}
        </div>
        <Separator className="flex-1 bg-gold-muted/15" />

        {!loading && (
          <VerseActions
            arabic={textQpcHafs}
            translations={translations.map((t) => stripHtmlTags(t.text))}
            onPlay={onPlay}
            active={active}
          />
        )}
      </div>

      {loading ? (
        <>
          {/* Arabic block — right-aligned, given the most room */}
          <div className="px-4 flex flex-col items-end gap-3">
            <Bar className="h-7 w-3/4" />
            <Bar className="h-7 w-5/6" />
          </div>

          {/* Translation — eyebrow label + lines of varied width */}
          <div className="px-4 flex flex-col gap-3">
            <Bar className="h-3 w-24" />
            <Bar className="h-4 w-full" />
            <Bar className="h-4 w-11/12" />
            <Bar className="h-4 w-2/3" />
          </div>
        </>
      ) : (
        <>
          {/* Arabic text */}
          <p
            className="text-right text-3xl md:text-4xl leading-[1.6] text-foreground font-medium"
            style={{ fontFamily: "var(--font-quran)" }}
            lang="ar"
            dir="rtl"
          >
            {/* 
              We need the currentMs of the player, and then compare that currentMs to startMs & endMs
              of the segments, if within those two values then highlight the corresponding word
              */}
            {arabic}
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
            className={`text-sm font-medium w-max flex items-center gap-1 py-1 transition-colors focus-visible:opacity-100 ${
              asHeader ? "text-gold" : "text-muted-foreground hover:text-gold"
            }`}
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
