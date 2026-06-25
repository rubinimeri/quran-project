import { Verse } from "@quranjs/api";

import { GetVersesResult } from "@/app/api/verses/route";

const API_URL = "/api/verses";

export const VERSES_PER_PAGE = 10;

export function versePage(verseNumber: number): number {
  return Math.max(1, Math.ceil(verseNumber / VERSES_PER_PAGE));
}

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
