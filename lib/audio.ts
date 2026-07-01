import type { ChapterAudioResult } from "@/app/api/chapter-audio/route";

const API_URL = "/api/chapter-audio";

/** Mishary Rashid Alafasy (chapter-reciter id). */
export const CHAPTER_RECITER_ID = "7";

/**
 * A word's timing in the whole-surah recitation: `[wordPosition, fromMs, toMs]`,
 * absolute in the gapless file's own timeline.
 */
export type WordSegment = [position: number, fromMs: number, toMs: number];

/**
 * A verse's span within the recitation. In whole-surah mode `startMs`/`endMs`
 * are absolute in the single file. In per-verse mode each verse has its own
 * `audioUrl` and segment times are relative to that file.
 */
export type VerseTiming = {
  verseNumber: number;
  startMs: number;
  endMs: number;
  segments: WordSegment[];
  /** Per-verse file (per-verse mode only). */
  audioUrl?: string;
};

/**
 * A chapter's recitation. `perVerse` distinguishes the two playback models:
 * one gapless whole-surah file (`audioUrl` set) vs. one file per verse
 * (`audioUrl` null; each verse carries its own).
 */
export type ChapterAudio = {
  audioUrl: string | null;
  verses: VerseTiming[];
  perVerse: boolean;
};

/**
 * Index of the verse being recited at `ms` in the whole-surah timeline. Returns
 * 0 before the first verse and the last verse's index past the end, so playback
 * always maps to a valid ayah. `verses` must be ordered by `startMs` ascending.
 */
export function verseIndexAt(verses: VerseTiming[], ms: number): number {
  if (verses.length === 0) return 0;
  let index = 0;
  for (let i = 0; i < verses.length; i++) {
    if (ms >= verses[i].startMs) index = i;
    else break;
  }
  return index;
}

export async function fetchChapterAudio(
  chapter: string | number,
  reciter: string = CHAPTER_RECITER_ID,
): Promise<ChapterAudio> {
  const response = await fetch(
    `${API_URL}?chapter=${chapter}&reciter=${reciter}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch chapter audio: ${response.status}`);
  }

  const data: ChapterAudioResult = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.result;
}
