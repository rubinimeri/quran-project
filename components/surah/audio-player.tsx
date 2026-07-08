"use client";

import {
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
  IconX,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { formatTime } from "@/lib/format";

type AudioPlayerProps = {
  chapter: string | number;
  versesCount: number;
  surahName: string;
};

export function AudioPlayer({
  chapter,
  versesCount,
  surahName,
}: AudioPlayerProps) {
  const {
    audioRef,
    src,
    verses,
    ready,
    loadError,
    index,
    playing,
    started,
    current,
    duration,
    togglePlay,
    stop,
    skip,
    handleSeek,
    resumeAfterSeek,
  } = useAudioPlayer({ chapter });

  const verseNumber = verses[index]?.verseNumber ?? index + 1;
  const subtitle = loadError
    ? "Audio unavailable"
    : ready
      ? `Ayah ${verseNumber} of ${versesCount}`
      : "Loading recitation…";

  return (
    <>
      {/* Kept mounted across hide/show so playback state survives. */}
      <audio ref={audioRef} src={src ?? undefined} preload="metadata" />

      {/* The bar stays hidden until playback has started (tap an ayah to play). */}
      {started && (
        <div className="fixed bottom-0 inset-x-0 z-[60] border-t border-border/30 bg-background/70 backdrop-blur-md  px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            {/* Transport controls */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                onClick={() => skip(-1)}
                disabled={!ready || index === 0}
                aria-label="Previous ayah"
                variant="ghost"
                size="icon"
                className="rounded-full"
              >
                <IconPlayerSkipBack size={16} />
              </Button>

              <Button
                onClick={togglePlay}
                disabled={!ready}
                aria-label={playing ? "Pause" : "Play"}
                size="icon"
                className="rounded-full"
              >
                {playing ? (
                  <IconPlayerPause size={16} />
                ) : (
                  <IconPlayerPlay size={16} />
                )}
              </Button>

              <Button
                onClick={() => skip(1)}
                disabled={!ready || index >= verses.length - 1}
                aria-label="Next ayah"
                variant="ghost"
                size="icon"
                className="rounded-full"
              >
                <IconPlayerSkipForward size={16} />
              </Button>
            </div>

            {/* Label */}
            <div className="hidden sm:flex flex-col min-w-0 shrink-0">
              <span className="text-xs font-medium text-foreground truncate">
                {surahName}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {subtitle}
              </span>
            </div>

            {/* Seek bar — spans the whole surah (absolute position) */}
            <div className="flex-1 flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground tabular-nums text-right w-max">
                {formatTime(current)}
              </span>
              <Slider
                min={0}
                max={duration || 1}
                step={1}
                value={[current]}
                onValueChange={handleSeek}
                onPointerUp={resumeAfterSeek}
                disabled={!ready}
                aria-label="Seek"
              />
              <span className="text-[10px] text-muted-foreground tabular-nums w-max shrink-0">
                {formatTime(duration)}
              </span>
            </div>

            {/* Stop playback and hide the player */}
            <Button
              onClick={stop}
              aria-label="Stop and close player"
              variant="ghost"
              size="icon"
              className="rounded-full shrink-0 text-muted-foreground hover:text-gold"
            >
              <IconX size={16} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
