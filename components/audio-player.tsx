"use client";

import { IconPlayerPlay, IconPlayerPause } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

type AudioPlayerProps = {
  audioUrl: string;
  surahName: string;
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioPlayer({ audioUrl, surahName }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrent(audio.currentTime);
    const onLoadedMetadata = () => {
      if (Number.isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onEnded = () => setPlaying(false);

    // Seed state in case metadata loaded before this effect ran.
    if (audio.readyState >= 1) {
      onLoadedMetadata();
      setCurrent(audio.currentTime);
    }

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onLoadedMetadata);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onLoadedMetadata);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying((p) => !p);
  }

  function startPlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.play();
      setPlaying(true);
    }
  }

  function handleSeek(value: number | readonly number[]) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    const next = typeof value === "number" ? value : value[0];
    audio.currentTime = next;
    setCurrent(next);
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 border-t border-border/50 bg-card/80 backdrop-blur-md px-4 py-3">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="max-w-2xl mx-auto flex items-center gap-4">
        {/* Play / Pause */}
        <Button
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
          size="icon"
          className="rounded-full shrink-0"
        >
          {playing ? (
            <IconPlayerPause size={16} />
          ) : (
            <IconPlayerPlay size={16} />
          )}
        </Button>

        {/* Label */}
        <div className="flex flex-col min-w-0 shrink-0">
          <span className="text-xs font-medium text-foreground truncate">
            {surahName}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Mishary Rashid Alafasy
          </span>
        </div>

        {/* Seek bar */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground tabular-nums w-8 text-right shrink-0">
            {formatTime(current)}
          </span>
          <Slider
            min={0}
            max={duration || 1}
            step={1}
            value={[current]}
            onValueChange={handleSeek}
            onPointerUp={startPlay}
            aria-label="Seek"
            className=""
          />
          <span className="text-[10px] text-muted-foreground tabular-nums w-8 shrink-0">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
