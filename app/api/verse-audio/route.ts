import { NextRequest, NextResponse } from "next/server";

import quranClient from "@/lib/quran";
import { ChapterId } from "@quranjs/api";
import { RECITATION_ID, VerseAudio } from "@/lib/audio";

export type GetVerseAudioResult = {
  result: { audioFiles: VerseAudio[] };
  error?: string;
};

const PER_PAGE = 50;

export async function GET(request: NextRequest) {
  const chapter = request.nextUrl.searchParams.get("chapter")?.trim();
  const recitation =
    request.nextUrl.searchParams.get("recitation")?.trim() || RECITATION_ID;

  if (!chapter) {
    return NextResponse.json({ result: { audioFiles: [] } });
  }

  try {
    const audioFiles: VerseAudio[] = [];
    let page = 1;
    let totalPages = 1;

    // Walk every page so the player has the whole chapter up front (Al-Baqarah
    // alone spans several pages of verse recitations).
    do {
      const { audioFiles: files, pagination } =
        await quranClient.content.v4.audio.verseRecitation.byChapter(
          chapter as ChapterId,
          recitation,
          { perPage: PER_PAGE, page, fields: { segments: true } },
        );

      for (const file of files) {
        const verseNumber = Number(file.verseKey.split(":")[1]);
        if (verseNumber) {
          audioFiles.push({
            verseNumber,
            audioUrl: file.audioUrl,
            segments: file.segments,
          });
        }
      }

      totalPages = pagination.totalPages;
      page += 1;
    } while (page <= totalPages);

    audioFiles.sort((a, b) => a.verseNumber - b.verseNumber);

    return NextResponse.json({ result: { audioFiles } });
  } catch {
    return NextResponse.json(
      { error: "Failed to get verse audio", result: { audioFiles: [] } },
      { status: 500 },
    );
  }
}
