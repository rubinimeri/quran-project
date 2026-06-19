import { NextRequest, NextResponse } from "next/server";

import quranClient from "@/lib/quran";
import {
  AyahTafsir,
  DEFAULT_TAFSIR_ID,
  extractTafsir,
  TafsirContent,
} from "@/lib/tafsir";

export type GetTafsirResult = {
  result: { tafsir: TafsirContent | null };
  error?: string;
};

export async function GET(request: NextRequest) {
  const verseKey = request.nextUrl.searchParams.get("verseKey")?.trim();
  const tafsirId =
    Number(request.nextUrl.searchParams.get("tafsir")?.trim()) ||
    DEFAULT_TAFSIR_ID;

  if (!verseKey) {
    return NextResponse.json({ result: { tafsir: null } });
  }

  try {
    // The `listAyahTafsirs` endpoint (unlike the inline verses option) returns
    // the resource name and the `verses` map we derive the covered range from.
    const response = (await quranClient.content.v4.raw.listAyahTafsirs({
      path: { resource_id: tafsirId, ayah_key: verseKey },
    })) as { tafsir?: AyahTafsir };

    return NextResponse.json({
      result: { tafsir: extractTafsir(response.tafsir) },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to get tafsir", result: { tafsir: null } },
      { status: 500 },
    );
  }
}
