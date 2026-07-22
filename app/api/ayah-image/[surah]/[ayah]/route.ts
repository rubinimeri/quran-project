import { NextRequest } from "next/server";
import { ChapterId, VerseKey } from "@quranjs/api";

import quranClient from "@/lib/quran";
import { stripHtmlTags } from "@/lib/format";
import { renderAyahImage, type AyahImageTheme } from "@/lib/ayah-image";
// The base `@quranjs` Verse type omits `textQpcHafs`; the store type adds it
// (the field is returned at runtime whenever it's requested in `fields`).
import type { Verse } from "@/stores/ayah-list-store";

// `@napi-rs/canvas` is a native addon — it needs the Node runtime, not Edge.
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ surah: string; ayah: string }> },
) {
  const { surah, ayah } = await params;
  const surahNum = Number(surah);
  const ayahNum = Number(ayah);

  if (
    !Number.isInteger(surahNum) ||
    surahNum < 1 ||
    surahNum > 114 ||
    !Number.isInteger(ayahNum) ||
    ayahNum < 1
  ) {
    return new Response("Invalid surah or ayah", { status: 400 });
  }

  // The theme is an explicit part of the cache key (query string), so the two
  // variants of a verse cache independently. Unknown/missing values fall back
  // to the dark card.
  const theme: AyahImageTheme =
    request.nextUrl.searchParams.get("theme") === "light" ? "light" : "dark";

  try {
    const verseKey = `${surahNum}:${ayahNum}` as VerseKey;

    const [verse, chapter] = await Promise.all([
      quranClient.content.v4.verses.byKey(verseKey, {
        fields: { textQpcHafs: true },
        translations: [20],
        translationFields: { resourceName: true },
      }) as Promise<Verse>,
      quranClient.content.v4.chapters.get(String(surahNum) as ChapterId),
    ]);

    const arabic = verse.textQpcHafs;
    const translation = verse.translations?.[0]?.text;

    if (!arabic || !translation) {
      return new Response("Verse not found", { status: 404 });
    }

    const png = renderAyahImage({
      arabic,
      translation: stripHtmlTags(translation),
      surahName: chapter.nameSimple,
      verseKey,
      theme,
    });

    return new Response(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        // Cache hard in production; always re-render in dev so design tweaks
        // show up on reload instead of being served from the browser cache.
        "Cache-Control":
          process.env.NODE_ENV === "development"
            ? "no-store"
            : "public, max-age=31536000, immutable",
        "Content-Disposition": `inline; filename="nur-${surahNum}-${ayahNum}.png"`,
      },
    });
  } catch {
    return new Response("Failed to render ayah image", { status: 500 });
  }
}
