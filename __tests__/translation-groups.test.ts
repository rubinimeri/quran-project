import {
  filterTranslations,
  groupTranslationsByLanguage,
} from "@/lib/translation-groups";
import type { TranslationResource } from "@quranjs/api";

const t = (
  id: number,
  name: string,
  languageName: string,
  authorName?: string,
): TranslationResource => ({ id, name, languageName, authorName });

const translations: TranslationResource[] = [
  t(20, "Saheeh International", "english", "Saheeh International"),
  t(85, "Abdul Haleem", "english", "M.A.S. Abdel Haleem"),
  t(97, "Fadel Soliman", "english", "Bridges"),
  t(158, "Muhammad Junagarhi", "urdu", "Muhammad Junagarhi"),
  t(45, "Abu Rida", "german", "Abu Rida Muhammad"),
];

describe("filterTranslations", () => {
  it("returns the same list for an empty query", () => {
    expect(filterTranslations(translations, "")).toBe(translations);
    expect(filterTranslations(translations, "   ")).toBe(translations);
  });

  it("matches by translation name, case-insensitively", () => {
    expect(filterTranslations(translations, "saheeh")).toEqual([
      t(20, "Saheeh International", "english", "Saheeh International"),
    ]);
  });

  it("matches by language name", () => {
    expect(filterTranslations(translations, "URDU")).toEqual([
      t(158, "Muhammad Junagarhi", "urdu", "Muhammad Junagarhi"),
    ]);
  });

  it("matches by author name", () => {
    expect(filterTranslations(translations, "bridges")).toEqual([
      t(97, "Fadel Soliman", "english", "Bridges"),
    ]);
  });

  it("returns nothing when neither field matches", () => {
    expect(filterTranslations(translations, "zzz")).toEqual([]);
  });
});

describe("groupTranslationsByLanguage", () => {
  it("groups by language and sorts languages alphabetically", () => {
    const groups = groupTranslationsByLanguage(translations);
    expect(groups.map((g) => g.language)).toEqual([
      "english",
      "german",
      "urdu",
    ]);
  });

  it("sorts items within a group by name", () => {
    const groups = groupTranslationsByLanguage(translations);
    const english = groups.find((g) => g.language === "english");
    expect(english?.items.map((i) => i.name)).toEqual([
      "Abdul Haleem",
      "Fadel Soliman",
      "Saheeh International",
    ]);
  });

  it("drops entries missing an id or name", () => {
    const withGaps: TranslationResource[] = [
      { name: "No id", languageName: "english" },
      { id: 5, languageName: "english" },
      { id: 6, name: "   ", languageName: "english" },
      t(20, "Saheeh International", "english"),
    ];
    const groups = groupTranslationsByLanguage(withGaps);
    expect(groups).toEqual([
      { language: "english", items: [t(20, "Saheeh International", "english")] },
    ]);
  });

  it("places entries without a language in an 'Other' group, last", () => {
    const withOther: TranslationResource[] = [
      { id: 1, name: "Nameless Tongue" },
      t(20, "Saheeh International", "english"),
    ];
    const groups = groupTranslationsByLanguage(withOther);
    expect(groups.map((g) => g.language)).toEqual(["english", "Other"]);
  });
});
