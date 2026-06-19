"use client";

import {
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
  IconX,
} from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { fetchVerseAudio, type VerseAudio } from "@/lib/audio";
import { useRecitation } from "@/components/recitation-context";

type AudioPlayerProps = {
  chapter: string | number;
  versesCount: number;
  surahName: string;
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioPlayer({
  chapter,
  versesCount,
  surahName,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioFiles, setAudioFiles] = useState<VerseAudio[]>([]);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  const { setCurrentVerse, requestedVerse, requestVerse } = useRecitation();

  // Mirror the active index so media events (fired async) read the latest value
  // without having to re-subscribe on every change.
  const indexRef = useRef(0);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  // Fetch every verse recitation for the chapter up front.
  useEffect(() => {
    let cancelled = false;
    fetchVerseAudio(chapter)
      .then((files) => {
        if (cancelled) return;
        setAudioFiles(files);
        setReady(files.length > 0);
        setLoadError(files.length === 0);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [chapter]);

  // Clear the shared highlight when the player unmounts (e.g. navigating away).
  useEffect(() => () => setCurrentVerse(undefined), [setCurrentVerse]);

  // Media element events. `ended` auto-advances to the next ayah.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrent(audio.currentTime);
    const onLoaded = () => {
      if (Number.isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onEnded = () => {
      const next = indexRef.current + 1;
      if (next < audioFiles.length) {
        setCurrent(0);
        setIndex(next);
      } else {
        setPlaying(false);
        setStarted(false);
        setCurrentVerse(undefined);
        setIndex(0);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("durationchange", onLoaded);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("durationchange", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioFiles.length, setCurrentVerse]);

  // Drive the element: whenever we're playing (or advance while playing), start
  // the current ayah's audio. Pausing is handled imperatively in togglePlay.
  useEffect(() => {
    if (!playing) return;
    audioRef.current?.play().catch(() => {});
  }, [index, playing]);

  // Publish the active verse so the list can highlight + follow it.
  useEffect(() => {
    if (started && audioFiles[index]) {
      setCurrentVerse(audioFiles[index].verseNumber);
    }
  }, [index, started, audioFiles, setCurrentVerse]);

  // Warm the next ayah's audio so the gap between verses stays short.
  useEffect(() => {
    const next = audioFiles[index + 1];
    if (!next) return;
    const pre = new Audio();
    pre.preload = "auto";
    pre.src = next.audioUrl;
  }, [index, audioFiles]);

  // Start playback at a specific ayah on request (tap-an-ayah-to-play). Deferred
  // to a frame so we're not setting state synchronously inside the effect.
  useEffect(() => {
    if (requestedVerse === undefined || audioFiles.length === 0) return;
    const target = audioFiles.findIndex(
      (f) => f.verseNumber === requestedVerse,
    );
    const frame = requestAnimationFrame(() => {
      requestVerse(undefined);
      if (target < 0) return;
      setStarted(true);
      setPlaying(true);
      setCurrent(0);
      if (target === indexRef.current) {
        const audio = audioRef.current;
        if (audio) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }
      } else {
        setIndex(target);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [requestedVerse, audioFiles, requestVerse]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio || !ready) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      setStarted(true);
      setPlaying(true);
      audio.play().catch(() => {});
    }
  }

  // Stop playback and return the player to its hidden, pre-playback state.
  function stop() {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setPlaying(false);
    setStarted(false);
    setCurrent(0);
    setIndex(0);
    setCurrentVerse(undefined);
  }

  const skip = useCallback(
    (delta: number) => {
      const target = indexRef.current + delta;
      if (target < 0 || target >= audioFiles.length) return;
      setStarted(true);
      setPlaying(true);
      setCurrent(0);
      setIndex(target);
    },
    [audioFiles.length],
  );

  function handleSeek(value: number | readonly number[]) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    const next = typeof value === "number" ? value : value[0];
    audio.currentTime = next;
    setCurrent(next);
  }

  function resumeAfterSeek() {
    const audio = audioRef.current;
    if (!audio || !playing) return;
    audio.play().catch(() => {});
  }

  const verseNumber = audioFiles[index]?.verseNumber ?? index + 1;
  const subtitle = loadError
    ? "Audio unavailable"
    : ready
      ? `Ayah ${verseNumber} of ${versesCount}`
      : "Loading recitation…";

  return (
    <>
      {/* Kept mounted across hide/show so playback state survives. */}
      <audio
        ref={audioRef}
        src={audioFiles[index]?.audioUrl}
        preload="metadata"
      />

      {/* The bar stays hidden until playback has started (tap an ayah to play). */}
      {started && (
        <div className="fixed bottom-0 inset-x-0 z-[60] border-t border-border/50 bg-card/80 backdrop-blur-md px-4 py-3">
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
                disabled={!ready || index >= audioFiles.length - 1}
                aria-label="Next ayah"
                variant="ghost"
                size="icon"
                className="rounded-full"
              >
                <IconPlayerSkipForward size={16} />
              </Button>
            </div>

            {/* Label */}
            <div className="flex flex-col min-w-0 shrink-0">
              <span className="text-xs font-medium text-foreground truncate">
                {surahName}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {subtitle}
              </span>
            </div>

            {/* Seek bar — scoped to the current ayah */}
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
              <span className="text-[10px] text-muted-foreground tabular-nums w-8 shrink-0">
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
