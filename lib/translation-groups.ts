import { type TranslationResource } from "@quranjs/api";

/** A language heading with its translations, ready for the grouped checkbox list. */
export type TranslationGroup = {
  language: string;
  items: TranslationResource[];
};

/** Group label for translations whose `languageName` is missing. Sorted last. */
const OTHER_LANGUAGE = "Other";

/**
 * Filter the available translations for the settings search box. Matches the
 * query (case-insensitive substring) against the translation name, the author
 * name, or the language name. An empty query returns the list unchanged.
 */
export function filterTranslations(
  translations: TranslationResource[],
  query: string,
): TranslationResource[] {
  const q = query.trim().toLowerCase();
  if (!q) return translations;
  return translations.filter((t) =>
    Boolean(
      t.name?.toLowerCase().includes(q) ||
        t.authorName?.toLowerCase().includes(q) ||
        t.languageName?.toLowerCase().includes(q),
    ),
  );
}

/**
 * Group the translations by language for the checkbox list. Drops entries
 * missing an id or name (they can't be selected or rendered), sorts each
 * group's items by name, and orders the groups alphabetically by language —
 * with the catch-all "Other" group always last.
 */
export function groupTranslationsByLanguage(
  translations: TranslationResource[],
): TranslationGroup[] {
  const valid = translations.filter(
    (t): t is TranslationResource & { id: number; name: string } =>
      typeof t.id === "number" && Boolean(t.name?.trim()),
  );

  const byLanguage = new Map<string, TranslationResource[]>();
  for (const t of valid) {
    const language = t.languageName?.trim() || OTHER_LANGUAGE;
    const items = byLanguage.get(language) ?? [];
    items.push(t);
    byLanguage.set(language, items);
  }

  return Array.from(byLanguage, ([language, items]) => ({
    language,
    items: items.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")),
  })).sort((a, b) => {
    if (a.language === OTHER_LANGUAGE) return 1;
    if (b.language === OTHER_LANGUAGE) return -1;
    return a.language.localeCompare(b.language);
  });
}
