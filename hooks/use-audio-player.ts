"use client";

import { useCallback, useEffect, useRef } from "react";
import { fetchVerseAudio } from "@/lib/audio";
import { useRecitationStore } from "@/stores/recitation-store";
import { useAudioPlayerStore } from "@/stores/audio-player-store";

type UseAudioPlayerParams = {
  chapter: string | number;
};

export function useAudioPlayer({ chapter }: UseAudioPlayerParams) {
  const {
    audioFiles,
    ready,
    loadError,
    index,
    playing,
    started,
    current,
    duration,
    failAudio,
    advance,
    loadAudio,
    pause,
    play,
    setCurrent,
    setDuration,
    startAt,
    stop: stateStop,
  } = useAudioPlayerStore();

  const setCurrentVerse = useRecitationStore((s) => s.setCurrentVerse);
  const requestedVerse = useRecitationStore((s) => s.requestedVerse);
  const requestVerse = useRecitationStore((s) => s.requestVerse);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch every verse recitation for the chapter up front.
  useEffect(() => {
    let cancelled = false;
    fetchVerseAudio(chapter)
      .then((files) => {
        if (cancelled) return;
        loadAudio(files);
      })
      .catch(() => {
        if (!cancelled) failAudio();
      });
    return () => {
      cancelled = true;
    };
  }, [chapter, failAudio, loadAudio]);

  // Clear the shared highlight when the player unmounts (e.g. navigating away).
  useEffect(() => () => setCurrentVerse(undefined), [setCurrentVerse]);

  // Media element events. `ended` auto-advances to the next ayah. Listeners are
  // attached once; the actions read the latest store state when they fire.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrent(audio.currentTime);
    const onLoaded = () => {
      if (Number.isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onEnded = () => advance();

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
  }, [advance, setCurrent, setDuration]);

  // Drive the element: whenever we're playing (or advance while playing), start
  // the current ayah's audio. Pausing is handled imperatively in togglePlay.
  useEffect(() => {
    if (!playing) return;
    audioRef.current?.play().catch(() => {});
  }, [index, playing]);

  // Publish the active verse so the list can highlight + follow it; clear it
  // whenever playback isn't running.
  useEffect(() => {
    if (started && audioFiles[index]) {
      setCurrentVerse(audioFiles[index].verseNumber);
    } else if (!started) {
      setCurrentVerse(undefined);
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
      startAt(target);
      // Same ayah already loaded: the drive effect won't re-fire, so replay it.
      if (target === index) {
        const audio = audioRef.current;
        if (audio) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [requestedVerse, audioFiles, requestVerse, index, startAt]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !ready) return;
    if (playing) {
      audio.pause();
      pause();
    } else {
      play();
      audio.play().catch(() => {});
    }
  }, [pause, play, playing, ready]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    stateStop();
  }, [stateStop]);

  const skip = useCallback(
    (delta: number) => {
      const target = index + delta;
      if (target < 0 || target >= audioFiles.length) return;
      startAt(target);
    },
    [audioFiles.length, index, startAt],
  );

  const handleSeek = useCallback(
    (value: number | readonly number[]) => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
      const next = typeof value === "number" ? value : value[0];
      audio.currentTime = next;
      setCurrent(next);
    },
    [setCurrent],
  );

  const resumeAfterSeek = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || playing) return;
    audio.play().catch(() => {});
  }, [playing]);

  return {
    audioRef,
    audioFiles,
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
  };
}
