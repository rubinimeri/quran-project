"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "zustand";
import type { ListRange, VirtuosoHandle } from "react-virtuoso";

import { versePage } from "@/lib/verses";
import { useRecitationStore } from "@/stores/recitation-store";
import { createAyahListStore } from "@/stores/ayah-list-store";

// Virtuoso scrolls with the document (useWindowScroll), so a scrolled-to verse
// lands at the very top of the viewport — under the sticky 56px (h-14) navbar.
// Pull it down by the navbar height plus a little breathing room.
const SCROLL_OFFSET = 77;

type UseAyahListParams = {
  chapter: string | number;
  versesCount: number;
  startingVerse?: number;
};

export function useAyahList({
  chapter,
  versesCount,
  startingVerse,
}: UseAyahListParams) {
  // Per-instance store: AyahList is remounted (via a `key` on the surah + target)
  // when either changes, so a fresh store is created and all state resets.
  const [store] = useState(() =>
    createAyahListStore({ chapter, versesCount, startingVerse }),
  );

  const versesByNumber = useStore(store, (s) => s.versesByNumber);
  const error = useStore(store, (s) => s.error);
  const highlightedVerse = useStore(store, (s) => s.highlightedVerse);
  const tafsirVerse = useStore(store, (s) => s.tafsirVerse);
  const loadPage = useStore(store, (s) => s.loadPage);
  const openTafsir = useStore(store, (s) => s.openTafsir);
  const setTafsirVerse = useStore(store, (s) => s.setTafsirVerse);

  const currentVerse = useRecitationStore((s) => s.currentVerse);
  const requestVerse = useRecitationStore((s) => s.requestVerse);
  // True while we should keep the reciting ayah centred; a manual scroll turns
  // it off until recitation advances to the next ayah.
  const followingRecitation = useRef(false);

  // Virtuoso owns the scroll position; we drive programmatic scrolls (recitation
  // following) through its handle.
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const hasStartedHighlightTimer = useRef(false);
  // True once the reader takes over with their own scroll, after which we stop
  // re-pinning the deep-linked target onto its landing spot.
  const hasUserScrolled = useRef(false);

  // Load the starting page on mount so the target verse's real content arrives
  // (and the highlight timer can fire). Deferred to after first paint so the
  // skeleton scaffold renders first. Virtuoso owns the initial scroll position
  // via initialTopMostItemIndex, so we no longer scroll here.
  useEffect(() => {
    const page = startingVerse ? versePage(startingVerse) : 1;
    const frame = requestAnimationFrame(() => loadPage(page));
    return () => cancelAnimationFrame(frame);
  }, [startingVerse, loadPage]);

  // Fetch the pages covering Virtuoso's rendered range, plus one page on either
  // side. The neighbour prefetch is what keeps reverse scrolling smooth: the page
  // just above the viewport is already loaded, so items enter the top overscan at
  // their real height instead of swapping skeleton -> taller real content above
  // the viewport (which would force Virtuoso to retro-correct the scroll = jank).
  // loadPage is idempotent, so calling it on every range change is cheap.
  const onRangeChanged = useCallback(
    ({ startIndex, endIndex }: ListRange) => {
      const maxPage = versePage(versesCount);
      const first = Math.max(1, versePage(startIndex + 1) - 1);
      const last = Math.min(maxPage, versePage(endIndex + 1) + 1);
      for (let page = first; page <= last; page++) loadPage(page);
    },
    [loadPage, versesCount],
  );

  // Where Virtuoso starts: at the target verse (offset clear of the navbar) or
  // the top. Built here so SCROLL_OFFSET has a single home.
  const initialTopMostItemIndex = startingVerse
    ? {
        index: startingVerse - 1,
        align: "start" as const,
        offset: -SCROLL_OFFSET,
      }
    : 0;

  // Once the target verse's real content is in place, start the highlight-clear
  // timer. The highlight itself is just the `verse-active` class and needs no
  // scrolling — Virtuoso already landed us on the verse.
  useEffect(() => {
    if (!startingVerse || hasStartedHighlightTimer.current) return;
    if (!versesByNumber.has(startingVerse)) return;
    hasStartedHighlightTimer.current = true;
    const timer = setTimeout(() => store.getState().clearHighlight(), 2600);
    return () => clearTimeout(timer);
  }, [versesByNumber, startingVerse, store]);

  // Snap the deep-linked target back to its landing spot. initialTopMostItemIndex
  // only positions at mount, so as verses above the target swap skeleton -> real
  // (taller) content — or the Arabic font swaps in and reflows them — the target
  // would otherwise drift down. Re-pin only until the reader scrolls themselves,
  // and never while recitation is driving the scroll.
  const repinTarget = useCallback(() => {
    if (!startingVerse || hasUserScrolled.current) return;
    if (currentVerse !== undefined) return;
    virtuosoRef.current?.scrollToIndex({
      index: startingVerse - 1,
      align: "start",
      offset: -SCROLL_OFFSET,
    });
  }, [startingVerse, currentVerse]);

  // Re-pin each time a page lands above the target (versesByNumber grows).
  useEffect(() => {
    if (!startingVerse || !versesByNumber.has(startingVerse)) return;
    repinTarget();
  }, [versesByNumber, startingVerse, repinTarget]);

  // Re-pin once the mushaf font has loaded, since the fallback -> font swap
  // reflows every ayah and shifts the target.
  useEffect(() => {
    if (!startingVerse) return;
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) repinTarget();
    });
    return () => {
      cancelled = true;
    };
  }, [startingVerse, repinTarget]);

  // The reader's own scroll releases the target — from then on it stays where
  // they leave it. (Programmatic scrollToIndex fires `scroll`, not these input
  // events, so re-pinning never trips this.)
  useEffect(() => {
    if (!startingVerse) return;
    const release = () => {
      hasUserScrolled.current = true;
    };
    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchmove", release, { passive: true });
    window.addEventListener("keydown", release);
    return () => {
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchmove", release);
      window.removeEventListener("keydown", release);
    };
  }, [startingVerse]);

  // Stable per-verse play/tafsir handlers, cached by verse number, so memoized
  // Ayahs don't re-render just because the list rebuilt their callbacks.
  // requestVerse/openTafsir are stable zustand actions, safe to close over once.
  const handlerCache = useRef(
    new Map<number, { onPlay: () => void; onOpenTafsir: () => void }>(),
  );
  const getVerseHandlers = useCallback(
    (verseNumber: number) => {
      let handlers = handlerCache.current.get(verseNumber);
      if (!handlers) {
        handlers = {
          onPlay: () => requestVerse(verseNumber),
          onOpenTafsir: () => openTafsir(verseNumber),
        };
        handlerCache.current.set(verseNumber, handlers);
      }
      return handlers;
    },
    [requestVerse, openTafsir],
  );

  // When recitation moves to a new ayah, re-enable following and make sure its
  // page (and the next) are loaded so the verse is mounted before we scroll.
  // Skipped while the tafsir dialog is open: playing from there must not make
  // the page behind chase the reciter.
  useEffect(() => {
    if (currentVerse === undefined || tafsirVerse !== null) return;
    followingRecitation.current = true;
    const frame = requestAnimationFrame(() => {
      loadPage(versePage(currentVerse));
      loadPage(versePage(currentVerse + 1));
    });
    return () => cancelAnimationFrame(frame);
  }, [currentVerse, tafsirVerse, loadPage]);

  // Centre the reciting ayah once it's mounted — but only while following and
  // never while the tafsir dialog is open.
  useEffect(() => {
    if (currentVerse === undefined || !followingRecitation.current) return;
    if (tafsirVerse !== null) return;
    if (!versesByNumber.has(currentVerse)) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    virtuosoRef.current?.scrollToIndex({
      index: currentVerse - 1,
      align: "start",
      behavior: prefersReduced ? "auto" : "smooth",
      offset: -SCROLL_OFFSET,
    });
  }, [currentVerse, tafsirVerse, versesByNumber]);

  // A manual scroll stops the page from chasing the reciter until the next ayah.
  useEffect(() => {
    const release = () => {
      followingRecitation.current = false;
    };
    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchmove", release, { passive: true });
    window.addEventListener("keydown", release);
    return () => {
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchmove", release);
      window.removeEventListener("keydown", release);
    };
  }, []);

  const activeVerse =
    tafsirVerse !== null ? versesByNumber.get(tafsirVerse) : undefined;

  return {
    error,
    versesByNumber,
    highlightedVerse,
    tafsirVerse,
    setTafsirVerse,
    currentVerse,
    requestVerse,
    openTafsir,
    getVerseHandlers,
    activeVerse,
    virtuosoRef,
    onRangeChanged,
    initialTopMostItemIndex,
  };
}
