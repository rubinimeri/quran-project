import { GetVerseAudioResult } from "@/app/api/verse-audio/route";
import { Segment } from "@quranjs/api";

const API_URL = "/api/verse-audio";

/** Mishary Rashid Alafasy (verse-recitation id). */
export const RECITATION_ID = "7";

export type VerseAudio = {
  verseNumber: number;
  audioUrl: string;
  segments?: Segment[];
};

export function currentWordIndex(
  currentMs: number,
  [wordIndex, , startMs, endMs]: Segment,
) {}

export async function fetchVerseAudio(
  chapter: string | number,
  recitation: string = RECITATION_ID,
): Promise<VerseAudio[]> {
  const response = await fetch(
    `${API_URL}?chapter=${chapter}&recitation=${recitation}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch verse audio: ${response.status}`);
  }

  const data: GetVerseAudioResult = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.result.audioFiles;
}
