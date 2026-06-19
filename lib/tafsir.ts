import { GetTafsirResult } from "@/app/api/tafsir/route";

const API_URL = "/api/tafsir";

/**
 * The tafsir sources surfaced as tabs in the dialog. Names are the short forms
 * we display — they are intentionally ours, not the API's verbose titles.
 */
export const TAFSIRS = [
  { id: 169, name: "Ibn Kathir" },
  { id: 168, name: "Ma'arif al-Qur'an" },
  { id: 817, name: "Tazkirul Quran" },
] as const;

/** Ibn Kathir (Abridged), English — the default tab. */
export const DEFAULT_TAFSIR_ID = TAFSIRS[0].id;

/**
 * Shape of a single tafsir as returned by the `listAyahTafsirs` endpoint. The
 * `verses` map's keys are the ayat this commentary entry covers — its first and
 * last give the grouped range.
 */
export type AyahTafsir = {
  text?: string;
  resourceName?: string;
  verses?: Record<string, unknown>;
};

export type TafsirContent = {
  text: string;
  resourceName?: string;
  /** First/last verse key the commentary covers (e.g. "2:1" / "2:5"). */
  from?: string;
  to?: string;
};

function compareVerseKeys(a: string, b: string): number {
  const [aChapter, aVerse] = a.split(":").map(Number);
  const [bChapter, bVerse] = b.split(":").map(Number);
  return aChapter - bChapter || aVerse - bVerse;
}

/**
 * Normalise a raw `listAyahTafsirs` tafsir into the shape the UI needs.
 * Returns null when no tafsir is present; defaults a missing `text` to "" and
 * derives the covered verse range from the `verses` map.
 */
export function extractTafsir(tafsir?: AyahTafsir): TafsirContent | null {
  if (!tafsir) {
    return null;
  }

  const keys = Object.keys(tafsir.verses ?? {}).sort(compareVerseKeys);

  return {
    text: tafsir.text ?? "",
    resourceName: tafsir.resourceName,
    from: keys[0],
    to: keys[keys.length - 1],
  };
}

export async function fetchTafsir(
  verseKey: string,
  tafsirId: number = DEFAULT_TAFSIR_ID,
): Promise<TafsirContent | null> {
  const response = await fetch(
    `${API_URL}?verseKey=${verseKey}&tafsir=${tafsirId}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch tafsir: ${response.status}`);
  }

  const data: GetTafsirResult = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.result.tafsir;
}
