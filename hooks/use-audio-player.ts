"use client";

import { useCallback, useEffect, useRef } from "react";
import { fetchChapterAudio, verseIndexAt } from "@/lib/audio";
import { useRecitationStore } from "@/stores/recitation-store";
import { useReciterStore } from "@/stores/reciter-store";
import { useAudioPlayerStore } from "@/stores/audio-player-store";

type UseAudioPlayerParams = {
  chapter: string | number;
};

export function useAudioPlayer({ chapter }: UseAudioPlayerParams) {
  const {
    audioUrl,
    verses,
    perVerse,
    ready,
    loadError,
    index,
    playing,
    started,
    current,
    duration,
    failAudio,
    loadAudio,
    pause,
    play,
    setCurrent,
    setDuration,
    setIndex,
    startAt,
    advance,
    stop: stateStop,
  } = useAudioPlayerStore();

  const setCurrentVerse = useRecitationStore((s) => s.setCurrentVerse);
  const requestedVerse = useRecitationStore((s) => s.requestedVerse);
  const requestVerse = useRecitationStore((s) => s.requestVerse);

  const recitationId = useReciterStore((s) => s.recitationId);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Begin the target verse. Whole-surah mode seeks within the one file;
  // per-verse mode restarts the current element (its src is swapped by `index`).
  const playFromVerse = useCallback(
    (target: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      if (perVerse) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        const verse = verses[target];
        if (!verse) return;
        audio.currentTime = verse.startMs / 1000;
        audio.play().catch(() => {});
      }
    },
    [perVerse, verses],
  );

  // Fetch the chapter's recitation. Re-runs when the reciter changes so the new
  // voice replaces the audio; the store keeps `index`, so we resume on the same
  // ayah (handled by the re-seek / drive effects below).
  useEffect(() => {
    let cancelled = false;
    fetchChapterAudio(chapter, recitationId)
      .then((audio) => {
        if (!cancelled) loadAudio(audio);
      })
      .catch(() => {
        if (!cancelled) failAudio();
      });
    return () => {
      cancelled = true;
    };
  }, [chapter, recitationId, failAudio, loadAudio]);

  // Clear the shared highlight when the player unmounts (e.g. navigating away).
  useEffect(() => () => setCurrentVerse(undefined), [setCurrentVerse]);

  // Media element events. Whole-surah mode maps the playback position onto the
  // current verse and stops at the end; per-verse mode advances file by file.
  // Listeners re-attach when `verses`/`perVerse` change (reciter swap).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrent(audio.currentTime);
      if (!perVerse) {
        const next = verseIndexAt(verses, audio.currentTime * 1000);
        if (next !== useAudioPlayerStore.getState().index) setIndex(next);
      }
    };
    const onLoaded = () => {
      if (Number.isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onEnded = () => (perVerse ? advance() : stateStop());

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
  }, [perVerse, verses, advance, setCurrent, setIndex, setDuration, stateStop]);

  // Per-verse mode: the <audio src> swaps to `verses[index]`'s file. React
  // updates the DOM after this render, so we (re)start playback here, once the
  // new source is in place. Whole-surah mode keeps one stable src, so it opts
  // out (seeking is done imperatively instead).
  useEffect(() => {
    if (!perVerse || !playing) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, [index, playing, perVerse]);

  // Whole-surah mode: switching reciter swaps the source (a fresh file resets it
  // to 0). If we were playing, resume from the current verse's start in the new
  // file. Keyed on the URL so it fires only on a real swap.
  useEffect(() => {
    if (perVerse || !playing || !audioUrl) return;
    const audio = audioRef.current;
    const verse = verses[index];
    if (!audio || !verse) return;
    audio.currentTime = verse.startMs / 1000;
    audio.play().catch(() => {});
    // Only a new file (audioUrl) should re-seek; `index`/`verses`/`playing` are
    // read but must not re-trigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  // Publish the active verse so the list can highlight + follow it; clear it
  // whenever playback isn't running.
  useEffect(() => {
    if (started && verses[index]) {
      setCurrentVerse(verses[index].verseNumber);
    } else if (!started) {
      setCurrentVerse(undefined);
    }
  }, [index, started, verses, setCurrentVerse]);

  // Start playback at a specific ayah on request (tap-an-ayah-to-play). Deferred
  // to a frame so we're not setting state synchronously inside the effect.
  useEffect(() => {
    if (requestedVerse === undefined || verses.length === 0) return;
    const target = verses.findIndex((v) => v.verseNumber === requestedVerse);
    const frame = requestAnimationFrame(() => {
      requestVerse(undefined);
      if (target < 0) return;
      const sameVerse = target === index;
      startAt(target);
      // Whole-surah mode always seeks. Per-verse mode relies on the drive effect
      // when `index` changes; if it's the same verse (no index change), replay.
      if (!perVerse || sameVerse) playFromVerse(target);
    });
    return () => cancelAnimationFrame(frame);
  }, [
    requestedVerse,
    verses,
    requestVerse,
    index,
    perVerse,
    startAt,
    playFromVerse,
  ]);

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
      if (target < 0 || target >= verses.length) return;
      startAt(target);
      // Per-verse: `index` changed, so the drive effect plays the new file.
      if (!perVerse) playFromVerse(target);
    },
    [verses.length, index, perVerse, startAt, playFromVerse],
  );

  const handleSeek = useCallback(
    (value: number | readonly number[]) => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
      const next = typeof value === "number" ? value : value[0];
      audio.currentTime = next;
      setCurrent(next);
      if (!perVerse) setIndex(verseIndexAt(verses, next * 1000));
    },
    [setCurrent, setIndex, verses, perVerse],
  );

  // After releasing the seek slider, resume iff we were playing. `handleSeek`
  // pauses the element while scrubbing but leaves the `playing` flag set, so
  // this must fire on `playing` (not `!playing`) or a playing track stays stuck.
  const resumeAfterSeek = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !playing) return;
    audio.play().catch(() => {});
  }, [playing]);

  const src = perVerse ? verses[index]?.audioUrl : (audioUrl ?? undefined);

  return {
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
  };
}
