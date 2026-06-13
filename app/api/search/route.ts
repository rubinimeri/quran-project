import { NextRequest, NextResponse } from "next/server";
import { SearchMode } from "@quranjs/api";

import quranClient from "@/lib/quran";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ result: { navigation: [], verses: [] } });
  }

  try {
    const response = await quranClient.search.query({
      query: q,
      mode: SearchMode.Quick,
      navigationalResultsNumber: 5,
      versesResultsNumber: 10,
    });

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Search failed", result: { navigation: [], verses: [] } },
      { status: 500 }
    );
  }
}
