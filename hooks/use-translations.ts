"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

import { useTranslationsStore } from "@/stores/translations-store";
import { type TranslationEntry } from "@/lib/translations";
import { type GetTranslationResult } from "@/app/api/translations/route";

// Stable empty ref for verses with no selected translation, so a memoized Ayah
// doesn't re-render on a fresh `[]`.
const EMPTY: TranslationEntry[] = [];

/**
 * Owns the selected translations' content for one chapter. The translation
 * endpoint paginates, so content is loaded a page at a time (aligned to the verse
 * pages the reader scrolls through): the ayah list calls `loadTranslationsPage`
 * as it loads each verse page. Returns a lookup that maps a verse key ("2:255")
 * to its selected translations (in selection order) with stable array
 * references.
 *
 * Anchor this in an always-mounted place (the ayah list), not the settings
 * drawer, so translations load with the page rather than when the drawer opens.
 */
export function useTranslations(chapter: string | number) {
  const selectedIds = useTranslationsStore((s) => s.selectedIds);
  const byResource = useTranslationsStore((s) => s.byResource);
  const setTranslations = useTranslationsStore((s) => s.setTranslations);

  // Guards duplicate concurrent fetches for the same (resource, chapter, page)
  // while one is pending; the store's `loaded` map guards against refetching a
  // combo across mounts. The ref persists through Strict Mode's remount, so its
  // double-invoke doesn't fire the same request twice.
  const inFlight = useRef(new Set<string>());
  // Pages the reader has reached, so a newly-checked translation can backfill
  // exactly those pages (and no unseen ones).
  const requestedPages = useRef(new Set<number>());

  // Fetch one page of every selected translation that isn't already loaded/in
  // flight. Read `selectedIds`/`loaded` from the store rather than closing over
  // them: a completing fetch flips `loaded`, and subscribing would re-run callers
  // and could cancel sibling requests still in flight.
  const loadTranslationsPage = useCallback(
    (page: number) => {
      requestedPages.current.add(page);
      const { selectedIds, loaded } = useTranslationsStore.getState();
      for (const id of selectedIds) {
        const key = `${id}:${chapter}:${page}`;
        if (loaded[key] || inFlight.current.has(key)) continue;
        inFlight.current.add(key);
        fetch(
          `/api/translations?resourceId=${id}&chapter=${chapter}&page=${page}`,
        )
          .then((res) => res.json() as Promise<GetTranslationResult>)
          .then((data) =>
            setTranslations(id, chapter, page, data.result.translations),
          )
          .catch(() => {})
          .finally(() => inFlight.current.delete(key));
      }
    },
    [chapter, setTranslations],
  );

  // When the reader checks a new translation, backfill it for every page already
  // visited. `loaded` skips the pages other resources already have, so only the
  // newcomer actually fetches.
  useEffect(() => {
    for (const page of requestedPages.current) loadTranslationsPage(page);
  }, [selectedIds, loadTranslationsPage]);

  // Precompute each verse's translations (in selection order) once per selection/
  // content change, so the arrays keep a stable reference across list renders and
  // memoized Ayahs don't re-render.
  const byVerseKey = useMemo(() => {
    const map: Record<string, TranslationEntry[]> = {};
    for (const id of selectedIds) {
      const entries = byResource[id];
      if (!entries) continue;
      for (const [verseKey, entry] of Object.entries(entries)) {
        (map[verseKey] ??= []).push(entry);
      }
    }
    return map;
  }, [selectedIds, byResource]);

  const getVerseTranslations = useCallback(
    (verseKey: string): TranslationEntry[] => byVerseKey[verseKey] ?? EMPTY,
    [byVerseKey],
  );

  return { getVerseTranslations, loadTranslationsPage };
}
