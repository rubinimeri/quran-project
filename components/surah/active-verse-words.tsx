"use client";
import type { WordSegment } from "@/lib/audio";
import { useAudioPlayerStore } from "@/stores/audio-player-store";
import { useMemo } from "react";
import { Word } from "./ayah";
import { WordSpan } from "./word-span";

/**
 * Word-by-word Arabic for the verse currently being recited. Mounted only for
 * the active ayah, so the high-frequency `current` playback-time subscription
 * re-renders a single verse on each audio tick rather than every ayah in the
 * surah.
 */
export function ActiveVerseWords({
  words,
  segments,
}: {
  words: Word[];
  segments: WordSegment[];
}) {
  const currentMs = useAudioPlayerStore((state) => state.current) * 1000;

  // Segments are keyed by their own word position (segment[0]), not by array
  // index: a verse can have fewer segments than words (two words can share one
  // timing), so indexing `segments[index]` drifts every word after the gap.
  // Look each word up by its `position` instead; skip any malformed segment.
  const segmentByWord = useMemo(() => {
    const map = new Map<number, WordSegment>();
    for (const segment of segments) {
      if (segment.length < 3) continue;
      map.set(segment[0], segment);
    }
    return map;
  }, [segments]);

  return (
    <>
      {words.map((word, index) => {
        const segment = segmentByWord.get(word.position);
        const highlighted =
          segment !== undefined &&
          currentMs >= segment[1] &&
          currentMs <= segment[2];
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
