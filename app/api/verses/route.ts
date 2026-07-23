import { NextRequest, NextResponse } from "next/server";

import quranClient from "@/lib/quran";
import { ChapterId, Verse } from "@quranjs/api";
import { VERSES_PER_PAGE } from "@/lib/verses";

export type GetVersesResult = {
  result: { verses: Verse[] };
  error?: string;
};

export async function GET(request: NextRequest) {
  const chapter = request.nextUrl.searchParams.get("chapter")?.trim();
  const page = Number(request.nextUrl.searchParams.get("page")?.trim());

  if (!chapter || !page) {
    return NextResponse.json({ result: { verses: [] } });
  }

  try {
    const verses = await quranClient.content.v4.verses.byChapter(
      chapter as ChapterId,
      {
        page: Number(page),
        fields: { textUthmani: true, textQpcHafs: true },
        perPage: VERSES_PER_PAGE,
        words: true,
        wordFields: {
          textUthmani: true,
          textQpcHafs: true,
        },
      },
    );

    return NextResponse.json({ result: { verses } });
  } catch {
    return NextResponse.json(
      { error: "Failed to get verses", result: { verses: [] } },
      { status: 500 },
    );
  }
}
