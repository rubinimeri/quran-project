"use client";

import { Fragment, memo, useEffect, useRef, useState } from "react";
import { stripHtmlTags } from "@/lib/format";
import { Separator } from "@/components/ui/separator";
import { VerseActions } from "./verse-actions";
import { IconBook } from "@tabler/icons-react";
import { useAudioPlayerStore } from "@/stores/audio-player-store";
import { Segment, Word } from "@quranjs/api";

type AyahTranslation = {
  text: string;
  resourceName?: string;
};

type AyahProps = {
  verseNumber: number;
  loading?: boolean;
  textUthmani?: string;
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
  highlighted = false,
  handleWordClick,
}: {
  text?: string;
  highlighted?: boolean;
  handleWordClick?: () => void;
}) {
  return (
    <span
      onClick={() => (handleWordClick ? handleWordClick() : null)}
      className={`cursor-pointer ${highlighted ? "text-gold" : "hover:text-gold"}`}
    >
      {text + " "}
    </span>
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

  return (
    <>
      {words.map((word, index) => {
        const segment: Segment | undefined = segments[index];
        const highlighted =
          segment !== undefined &&
          currentMs >= segment[2] &&
          currentMs <= segment[3];
        return (
          <WordSpan
            key={index}
            text={word.textUthmani}
            highlighted={highlighted}
          />
        );
      })}
    </>
  );
}

function AyahBase({
  verseNumber,
  loading = false,
  textUthmani = "",
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
  const [wordAudioUrl, setWordAudioUrl] = useState<string | undefined>(
    undefined,
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !wordAudioUrl) return;

    let cancelled = false;

    console.log(wordAudioUrl);
    const playAudio = async () => {
      try {
        await audio.play();
      } catch (err: unknown) {
        // Ignore interruptions caused by a newer load/play
        if (!cancelled && err instanceof Error && err.name !== "AbortError") {
          console.error("Audio playing blocked: ", err);
        }
      }
    };

    playAudio();

    return () => {
      cancelled = true;
      audio.pause(); // stop the current one cleanly before the next effect run
    };
  }, [wordAudioUrl]);

  function handleWordClick(url: string) {
    setWordAudioUrl(url);
  }
  let arabic;
  if (active && words && segments) {
    arabic = <ActiveVerseWords words={words} segments={segments} />;
  } else if (words) {
    arabic = words.map((word, index) => (
      <Fragment key={index}>
        <audio ref={audioRef} src={wordAudioUrl} preload="metadata" />
        <WordSpan
          key={index}
          text={word.textUthmani}
          handleWordClick={() => handleWordClick(BASE_URL + word.audioUrl)}
        />
      </Fragment>
    ));
  } else {
    arabic = textUthmani;
  }

  return (
    <article
      aria-busy={loading || undefined}
      aria-current={!asHeader && active ? "true" : undefined}
      className={`${className} rounded-4xl ${!asHeader && highlighted ? "verse-active" : ""} ${!asHeader && active ? "verse-active" : ""} group relative flex flex-col gap-5 ${asHeader ? "pb-6" : "py-8 border-b border-border/40 last:border-0"}`}
    >
      {/* Verse number medallion */}
      <div className={`${loading ? "px-4" : "px-0"} flex items-center gap-3`}>
        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-gold/40 text-gold text-xs font-semibold shrink-0">
          {verseNumber}
        </div>
        <Separator className="flex-1 bg-gold-muted/15" />

        {!loading && (
          <VerseActions
            arabic={textUthmani}
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
            className="text-right text-2xl sm:text-3xl md:text-4xl leading-[2.2] text-foreground font-medium"
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
