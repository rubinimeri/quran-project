import { create } from "zustand";
import { persist } from "zustand/middleware";

import { type TranslationEntry } from "@/lib/translations";

export type TranslationsState = {
  /** Resource ids of the translations shown beneath each ayah. */
  selectedIds: number[];
  toggle: (id: number) => void;
  setIds: (ids: number[]) => void;

  /**
   * Fetched translation text, keyed `resourceId → verseKey → entry`. Verse keys
   * embed the chapter ("2:255"), so one flat map per resource holds multiple
   * chapters without collision. Volatile — not persisted.
   */
  byResource: Record<number, Record<string, TranslationEntry>>;
  /**
   * `${resourceId}:${chapter}:${page}` markers so each resource/chapter/page is
   * fetched at most once. The translation endpoint paginates, so loading is
   * tracked per page (aligned to the verse pages the reader scrolls through).
   */
  loaded: Record<string, boolean>;
  setTranslations: (
    resourceId: number,
    chapter: string | number,
    page: number,
    entries: Record<string, TranslationEntry>,
  ) => void;
};

/**
 * `selectedIds` is persisted so the reader's chosen translations carry across
 * chapters and reloads (mirroring `reciter-store`); the fetched content
 * (`byResource` / `loaded`) is left volatile. Defaults to the two ids the reader
 * has always shown.
 */
export const useTranslationsStore = create<TranslationsState>()(
  persist(
    (set) => ({
      selectedIds: [20, 57],
      toggle: (id) =>
        set((state) => ({
          selectedIds: state.selectedIds.includes(id)
            ? state.selectedIds.filter((existing) => existing !== id)
            : [...state.selectedIds, id],
        })),
      setIds: (ids) => set({ selectedIds: ids }),

      byResource: {},
      loaded: {},
      setTranslations: (resourceId, chapter, page, entries) =>
        set((state) => ({
          byResource: {
            ...state.byResource,
            [resourceId]: { ...state.byResource[resourceId], ...entries },
          },
          loaded: {
            ...state.loaded,
            [`${resourceId}:${chapter}:${page}`]: true,
          },
        })),
    }),
    {
      name: "nur-translations",
      partialize: (state) => ({ selectedIds: state.selectedIds }),
    },
  ),
);
