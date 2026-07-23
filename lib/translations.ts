// Server-only translation fetching. This module imports the server `quranClient`
// (which reads QURAN_CLIENT_SECRET), so it must never be imported by a client
// component — only by server code such as `app/api/translations/route.ts`. The
// client-safe search/group helpers live in `lib/translation-groups.ts`.
import quranClient from "@/lib/quran";
import { VERSES_PER_PAGE } from "@/lib/verses";
import { type Translation, type TranslationField } from "@quranjs/api";

/** A single translation's text for one verse, plus its resource attribution. */
export type TranslationEntry = { text: string; resourceName?: string };

/**
 * Fetch one page of a translation resource for a surah as a bare `verseKey →
 * entry` map (e.g. `"2:255"`), with no Arabic or unrelated verse payload. The
 * `by_chapter` endpoint is paginated; `perPage` is fixed to `VERSES_PER_PAGE` so
 * translation page N covers exactly the same verses as verse page N in the
 * reader. Entries missing a `verseKey` are dropped since they can't be matched.
 */
export async function fetchTranslation(
  resourceId: number,
  chapterId: number,
  page: number,
): Promise<Record<string, TranslationEntry>> {
  const { translations } =
    (await quranClient.content.v4.raw.listSurahTranslations({
      path: { resource_id: resourceId, chapter_number: chapterId },
      // The by_chapter endpoint takes its extra columns under `fields`; the
      // `translationFields` param is silently ignored here (it returns only
      // id/resourceId/text). The library types `fields` as VerseField, but
      // verse_key/resource_name are TranslationFields, so we assert that shape.
      query: {
        page,
        perPage: VERSES_PER_PAGE,
        fields: { verseKey: true, resourceName: true } as Partial<
          Record<TranslationField, boolean>
        >,
      },
    })) as { translations: Translation[] };

  return Object.fromEntries(
    translations
      .filter((t) => t.verseKey)
      .map((t) => [
        t.verseKey!,
        { text: t.text, resourceName: t.resourceName },
      ]),
  );
}
