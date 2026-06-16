import { NextRequest, NextResponse } from "next/server";

import quranClient from "@/lib/quran";
import { ChapterId } from "@quranjs/api";

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
        fields: { text_uthmani: true },
        translations: [88, 20],
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
