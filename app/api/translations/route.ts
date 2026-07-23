import { NextRequest, NextResponse } from "next/server";

import { fetchTranslation, type TranslationEntry } from "@/lib/translations";

export type GetTranslationResult = {
  result: { translations: Record<string, TranslationEntry> };
  error?: string;
};

export async function GET(request: NextRequest) {
  const resourceId = Number(
    request.nextUrl.searchParams.get("resourceId")?.trim(),
  );
  const chapter = Number(request.nextUrl.searchParams.get("chapter")?.trim());
  const page = Number(request.nextUrl.searchParams.get("page")?.trim()) || 1;

  if (!resourceId || !chapter) {
    return NextResponse.json({ result: { translations: {} } });
  }

  try {
    const translations = await fetchTranslation(resourceId, chapter, page);
    return NextResponse.json({ result: { translations } });
  } catch {
    return NextResponse.json(
      { error: "Failed to get translation", result: { translations: {} } },
      { status: 500 },
    );
  }
}
