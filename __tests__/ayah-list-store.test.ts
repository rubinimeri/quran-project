/**
 * @jest-environment node
 */

import { Verse } from "@quranjs/api";

import { createAyahListStore } from "../stores/ayah-list-store";
import { fetchVerses } from "../lib/verses";

jest.mock("../lib/verses", () => ({
  ...jest.requireActual("../lib/verses"),
  fetchVerses: jest.fn(),
}));

const mockFetch = fetchVerses as jest.Mock;

function verse(verseNumber: number): Verse {
  return { verseNumber } as unknown as Verse;
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe("createAyahListStore", () => {
  it("initialises highlightedVerse from startingVerse", () => {
    const store = createAyahListStore({
      chapter: "1",
      versesCount: 7,
      startingVerse: 3,
    });
    expect(store.getState().highlightedVerse).toBe(3);
    expect(store.getState().tafsirVerse).toBeNull();
  });

  describe("loadPage", () => {
    it("fetches and merges verses keyed by verse number", async () => {
      mockFetch.mockResolvedValue([verse(1), verse(2)]);
      const store = createAyahListStore({ chapter: "2", versesCount: 286 });

      await store.getState().loadPage(1);

      expect(mockFetch).toHaveBeenCalledWith("2", 1);
      expect(store.getState().versesByNumber.get(1)).toEqual(verse(1));
      expect(store.getState().versesByNumber.get(2)).toEqual(verse(2));
    });

    it("does not refetch a page that is already loaded", async () => {
      mockFetch.mockResolvedValue([verse(1)]);
      const store = createAyahListStore({ chapter: "1", versesCount: 7 });

      await store.getState().loadPage(1);
      await store.getState().loadPage(1);

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("dedupes concurrent in-flight requests for the same page", async () => {
      mockFetch.mockResolvedValue([verse(1)]);
      const store = createAyahListStore({ chapter: "1", versesCount: 7 });

      await Promise.all([
        store.getState().loadPage(1),
        store.getState().loadPage(1),
      ]);

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("ignores pages below 1", async () => {
      const store = createAyahListStore({ chapter: "1", versesCount: 7 });
      await store.getState().loadPage(0);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("records an error message when the fetch rejects", async () => {
      mockFetch.mockRejectedValue(new Error("boom"));
      const store = createAyahListStore({ chapter: "1", versesCount: 7 });

      await store.getState().loadPage(1);

      expect(store.getState().error).toBe("boom");
      // A failed page is not marked loaded, so it can be retried.
      mockFetch.mockResolvedValue([verse(1)]);
      await store.getState().loadPage(1);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("openTafsir", () => {
    it("opens the dialog and loads the verse's page for an in-range verse", async () => {
      mockFetch.mockResolvedValue([verse(1)]);
      const store = createAyahListStore({ chapter: "1", versesCount: 7 });

      store.getState().openTafsir(1);

      expect(store.getState().tafsirVerse).toBe(1);
      expect(mockFetch).toHaveBeenCalledWith("1", 1);
    });

    it("ignores out-of-range verses", () => {
      const store = createAyahListStore({ chapter: "1", versesCount: 7 });

      store.getState().openTafsir(0);
      store.getState().openTafsir(8);

      expect(store.getState().tafsirVerse).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
