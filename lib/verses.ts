import { Verse } from "@quranjs/api";

import { GetVersesResult } from "@/app/api/verses/route";

const API_URL = "/api/verses";

export async function fetchVerses(
  chapter: string | number,
  page: number,
): Promise<Verse[]> {
  const response = await fetch(`${API_URL}?chapter=${chapter}&page=${page}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch verses: ${response.status}`);
  }

  const data: GetVersesResult = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.result.verses;
}
