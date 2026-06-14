import { NextRequest, NextResponse } from "next/server";
import type { SearchResponse } from "@quranjs/api";

import quranClient from "@/lib/quran";

// quranClient.search.query() has a bug: QuranSearch.search() calls fetcher.fetch()
// which uses contentBaseUrl ("https://apis.quran.foundation") instead of the correct
// search base ("https://apis.quran.foundation/search"). Using the raw operation routes
// through request("search", ...) which resolves to the right URL.
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ result: { navigation: [], verses: [] } });
  }

  try {
    const response = (await quranClient.search.raw.searchControllerSearch({
      query: { query: q, size: 20 },
    })) as SearchResponse;

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Search failed", result: { navigation: [], verses: [] } },
      { status: 500 }
    );
  }
}
