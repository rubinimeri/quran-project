import { createStore } from "zustand/vanilla";
import { Verse as V } from "@quranjs/api";

import { fetchVerses, versePage } from "@/lib/verses";

type AyahListConfig = {
  chapter: string | number;
  versesCount: number;
  startingVerse?: number;
};

export type Verse = V & {
  textQpcHafs?: string;
};

type AyahListState = {
  chapter: string | number;
  versesCount: number;
  versesByNumber: Map<number, Verse>;
  error: string | null;
  highlightedVerse: number | undefined;
  // The verse whose tafsir dialog is open (null when closed).
  tafsirVerse: number | null;
  // Non-reactive bookkeeping: which pages have loaded / are in flight. Mutated in
  // place inside loadPage; nothing subscribes to them.
  loadedPages: Set<number>;
  loadingPages: Set<number>;
  loadPage: (page: number) => Promise<void>;
  openTafsir: (verseNumber: number) => void;
  setTafsirVerse: (verse: number | null) => void;
  clearHighlight: () => void;
};

export function createAyahListStore({
  chapter,
  versesCount,
  startingVerse,
}: AyahListConfig) {
  return createStore<AyahListState>((set, get) => ({
    chapter,
    versesCount,
    versesByNumber: new Map(),
    error: null,
    highlightedVerse: startingVerse,
    tafsirVerse: null,
    loadedPages: new Set(),
    loadingPages: new Set(),

    loadPage: async (page) => {
      const { loadedPages, loadingPages, chapter } = get();
      if (page < 1 || loadedPages.has(page) || loadingPages.has(page)) {
        return;
      }
      loadingPages.add(page);
      try {
        const newVerses = await fetchVerses(chapter, page);
        loadedPages.add(page);
        set((state) => {
          const next = new Map(state.versesByNumber);
          for (const verse of newVerses) {
            next.set(verse.verseNumber, verse);
          }
          return { versesByNumber: next };
        });
      } catch (err) {
        set({
          error: err instanceof Error ? err.message : "Failed to load verses",
        });
      } finally {
        loadingPages.delete(page);
      }
    },

    // Open the tafsir dialog for a verse (also used for prev/next within it):
    // make sure the verse's page is loaded so the dialog header has its text.
    openTafsir: (verseNumber) => {
      const { versesCount, loadPage } = get();
      if (verseNumber < 1 || verseNumber > versesCount) return;
      set({ tafsirVerse: verseNumber });
      loadPage(versePage(verseNumber));
    },

    setTafsirVerse: (verse) => set({ tafsirVerse: verse }),
    clearHighlight: () => set({ highlightedVerse: undefined }),
  }));
}

export type AyahListStore = ReturnType<typeof createAyahListStore>;
