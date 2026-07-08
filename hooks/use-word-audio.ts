import { useRef, useCallback } from "react";

const BASE_URL = "https://audio.qurancdn.com"; // no trailing slash
const pad = (n: number) => String(n).padStart(3, "0");

export function useWordAudio(chapter: number, verse: number) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(
    async (position: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      const url = `${BASE_URL}/wbw/${pad(chapter)}_${pad(verse)}_${pad(position)}.mp3`;
      if (audio.src !== url) audio.src = url;
      audio.currentTime = 0;

      try {
        await audio.play();
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Audio playback blocked:", err);
        }
      }
    },
    [chapter, verse],
  );

  return { audioRef, play };
}
