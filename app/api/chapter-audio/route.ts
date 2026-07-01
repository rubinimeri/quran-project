import { NextRequest, NextResponse } from "next/server";

import quranClient from "@/lib/quran";
import { ChapterId } from "@quranjs/api";
import {
  CHAPTER_RECITER_ID,
  type ChapterAudio,
  type VerseTiming,
  type WordSegment,
} from "@/lib/audio";

export type ChapterAudioResult = {
  result: ChapterAudio;
  error?: string;
};

// The SDK's `ChapterRecitation` type omits the per-verse `timestamps` that the
// API returns with `segments: true`, so we declare the runtime shape here to
// read it without `any`.
type RawTimestamp = {
  verseKey: string;
  timestampFrom: number;
  timestampTo: number;
  segments?: number[][];
};
type RecitationWithTimestamps = {
  audioUrl: string;
  timestamps?: RawTimestamp[];
};

// A `verse:<id>` reciter uses the verse-recitation id-space and plays ayah by
// ayah, for reciters with no gapless whole-surah file (e.g. Minshawi Mujawwad).
const VERSE_PREFIX = "verse:";
const PER_PAGE = 10;

const EMPTY: ChapterAudio = { audioUrl: null, verses: [], perVerse: false };

export async function GET(request: NextRequest) {
  const chapter = request.nextUrl.searchParams.get("chapter")?.trim();
  const reciter =
    request.nextUrl.searchParams.get("reciter")?.trim() || CHAPTER_RECITER_ID;

  if (!chapter) {
    return NextResponse.json({ result: EMPTY });
  }

  try {
    if (reciter.startsWith(VERSE_PREFIX)) {
      const verses = await fetchVerseByVerse(
        chapter as ChapterId,
        reciter.slice(VERSE_PREFIX.length),
      );
      return NextResponse.json({
        result: { audioUrl: null, verses, perVerse: true },
      });
    }

    const recitation = (await quranClient.content.v4.audio.chapterRecitation.get(
      reciter,
      chapter as ChapterId,
      { segments: true },
    )) as unknown as RecitationWithTimestamps;

    const verses: VerseTiming[] = (recitation.timestamps ?? [])
      .map((t) => {
        const verseNumber = Number(t.verseKey.split(":")[1]);
        // Segments occasionally arrive malformed (e.g. a stray `[1]`); keep only
        // well-formed `[wordPosition, fromMs, toMs]` triples.
        const segments: WordSegment[] = (t.segments ?? [])
          .filter((s) => s.length >= 3)
          .map((s) => [s[0], s[1], s[2]] as WordSegment);
        return {
          verseNumber,
          startMs: t.timestampFrom,
          endMs: t.timestampTo,
          segments,
        };
      })
      .filter((v) => v.verseNumber > 0)
      .sort((a, b) => a.verseNumber - b.verseNumber);

    return NextResponse.json({
      result: { audioUrl: recitation.audioUrl, verses, perVerse: false },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to get chapter audio", result: EMPTY },
      { status: 500 },
    );
  }
}

// Walk every page of the verse-recitation list, normalizing each verse to its
// own file plus relative word segments (`[wordNumber, fromMs, toMs]`).
async function fetchVerseByVerse(
  chapter: ChapterId,
  recitationId: string,
): Promise<VerseTiming[]> {
  const verses: VerseTiming[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const { audioFiles, pagination } =
      await quranClient.content.v4.audio.verseRecitation.byChapter(
        chapter,
        recitationId,
        { perPage: PER_PAGE, page, fields: { segments: true } },
      );

    for (const file of audioFiles) {
      const verseNumber = Number(file.verseKey.split(":")[1]);
      if (!verseNumber) continue;
      // Verse-recitation segments are 4-tuples `[ordinal, wordNumber, from, to]`.
      const segments: WordSegment[] = (file.segments ?? [])
        .filter((s) => s.length >= 4)
        .map((s) => [s[1], s[2], s[3]] as WordSegment);
      verses.push({
        verseNumber,
        startMs: 0,
        endMs: 0,
        segments,
        audioUrl: file.audioUrl,
      });
    }

    totalPages = pagination.totalPages;
    page += 1;
  } while (page <= totalPages);

  verses.sort((a, b) => a.verseNumber - b.verseNumber);
  return verses;
}
