/**
 * @jest-environment jsdom
 */

jest.mock("../lib/quran", () => ({
  __esModule: true,
  default: {
    content: { v4: { raw: { listSurahTranslations: jest.fn() } } },
  },
}));

import quranClient from "../lib/quran";
import { fetchTranslation } from "../lib/translations";
import { useTranslationsStore } from "../stores/translations-store";

const mockList = quranClient.content.v4.raw.listSurahTranslations as jest.Mock;

describe("fetchTranslation", () => {
  beforeEach(() => mockList.mockReset());

  it("maps the raw response to a verseKey → { text, resourceName } record", async () => {
    mockList.mockResolvedValue({
      translations: [
        { text: "In the name of Allah", resourceName: "Saheeh", verseKey: "1:1" },
        { text: "All praise", resourceName: "Saheeh", verseKey: "1:2" },
      ],
    });

    await expect(fetchTranslation(20, 1, 1)).resolves.toEqual({
      "1:1": { text: "In the name of Allah", resourceName: "Saheeh" },
      "1:2": { text: "All praise", resourceName: "Saheeh" },
    });

    expect(mockList).toHaveBeenCalledWith({
      path: { resource_id: 20, chapter_number: 1 },
      query: {
        page: 1,
        perPage: 10,
        fields: { verseKey: true, resourceName: true },
      },
    });
  });

  it("drops entries missing a verseKey", async () => {
    mockList.mockResolvedValue({
      translations: [
        { text: "keep me", verseKey: "2:255" },
        { text: "no key, drop me" },
      ],
    });

    await expect(fetchTranslation(20, 2, 1)).resolves.toEqual({
      "2:255": { text: "keep me", resourceName: undefined },
    });
  });
});

describe("translations-store", () => {
  const initial = useTranslationsStore.getState();

  beforeEach(() => {
    useTranslationsStore.setState(
      { selectedIds: [20, 57], byResource: {}, loaded: {} },
      false,
    );
  });

  it("defaults to the two ids the reader has always shown", () => {
    expect(initial.selectedIds).toEqual([20, 57]);
  });

  it("toggle adds an unselected id and removes a selected one", () => {
    useTranslationsStore.getState().toggle(85);
    expect(useTranslationsStore.getState().selectedIds).toEqual([20, 57, 85]);

    useTranslationsStore.getState().toggle(20);
    expect(useTranslationsStore.getState().selectedIds).toEqual([57, 85]);
  });

  it("setTranslations merges entries under the resource and marks the page loaded", () => {
    const store = useTranslationsStore.getState();
    store.setTranslations(20, 2, 1, { "2:1": { text: "Alif Lam Meem" } });
    store.setTranslations(20, 2, 1, { "2:2": { text: "This is the Book" } });

    const state = useTranslationsStore.getState();
    expect(state.byResource[20]).toEqual({
      "2:1": { text: "Alif Lam Meem" },
      "2:2": { text: "This is the Book" },
    });
    expect(state.loaded["20:2:1"]).toBe(true);
  });

  it("merges successive pages into one resource map, marking each page loaded", () => {
    const store = useTranslationsStore.getState();
    store.setTranslations(20, 2, 1, { "2:1": { text: "page one" } });
    store.setTranslations(20, 2, 2, { "2:11": { text: "page two" } });

    const state = useTranslationsStore.getState();
    expect(state.byResource[20]).toEqual({
      "2:1": { text: "page one" },
      "2:11": { text: "page two" },
    });
    expect(state.loaded["20:2:1"]).toBe(true);
    expect(state.loaded["20:2:2"]).toBe(true);
  });
});
