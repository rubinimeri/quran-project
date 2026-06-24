"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useStore } from "zustand";

import { versePage } from "@/lib/verses";
import { useRecitationStore } from "@/stores/recitation-store";
import { createAyahListStore } from "@/stores/ayah-list-store";

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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

  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasScrolledToTarget = useRef(false);
  // While anchoring, keep the target verse pinned at the offset it landed on, so
  // verses loading in above it (taller than their skeletons) don't push it away.
  // Released the moment the user scrolls themselves.
  const anchorTop = useRef<number | null>(null);
  const isAnchoring = useRef(false);

  // Ref callbacks for a verse's article element. Stable identities (one for
  // placeholders, one for loaded verses) so React doesn't detach/re-observe
  // every article on each list render — passing a fresh closure per verse made
  // the IntersectionObserver re-measure the whole list on any state change.
  // Placeholders register so their page loads as they near the viewport; once
  // the real verse is in place it stops being observed.
  const observeArticle = useCallback((el: HTMLElement | null) => {
    if (el) observerRef.current?.observe(el);
  }, []);
  const unobserveArticle = useCallback((el: HTMLElement | null) => {
    if (el) observerRef.current?.unobserve(el);
  }, []);

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

  // Load the starting page on mount. The load is deferred to after the first
  // paint so the skeleton scaffold renders first.
  useEffect(() => {
    if (!startingVerse) {
      window.scrollTo(0, 0);
    }
    const page = startingVerse ? versePage(startingVerse) : 1;
    const frame = requestAnimationFrame(() => loadPage(page));
    return () => cancelAnimationFrame(frame);
  }, [startingVerse, loadPage]);

  // One observer for the whole list; placeholders register themselves via the
  // callback ref above and trigger their page to load as they near the viewport.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const page = Number((entry.target as HTMLElement).dataset.page);
          if (page) loadPage(page);
        }
      },
      { rootMargin: "600px 0px 600px 0px" },
    );
    observerRef.current = observer;
    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [loadPage]);

  // After the starting page's verses are in place, jump to + highlight the
  // target. Instant (not smooth) so we can record its landed offset and pin it.
  useEffect(() => {
    if (!startingVerse || hasScrolledToTarget.current) return;
    if (!versesByNumber.has(startingVerse)) return;

    const el = document.getElementById(`verse-${startingVerse}`);
    if (!el) return;
    hasScrolledToTarget.current = true;
    el.scrollIntoView({ block: "start" });
    anchorTop.current = el.getBoundingClientRect().top;
    isAnchoring.current = true;

    const timer = setTimeout(() => store.getState().clearHighlight(), 2600);
    return () => clearTimeout(timer);
  }, [versesByNumber, startingVerse, store]);

  // Release the anchor as soon as the user initiates their own scroll, so later
  // upward loads don't yank them back to the target.
  useEffect(() => {
    if (!startingVerse) return;
    const release = () => {
      isAnchoring.current = false;
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

  // When a page loads above the target, the target shifts down; re-pin it to the
  // offset it landed on. Runs before paint to avoid a visible jump. No-op for
  // pages loaded below the target (its offset is unchanged).
  useIsomorphicLayoutEffect(() => {
    if (!isAnchoring.current || anchorTop.current === null || !startingVerse) {
      return;
    }
    const el = document.getElementById(`verse-${startingVerse}`);
    if (!el) return;
    const delta = el.getBoundingClientRect().top - anchorTop.current;
    if (delta !== 0) window.scrollBy(0, delta);
  }, [versesByNumber, startingVerse]);

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
    const el = document.getElementById(`verse-${currentVerse}`);
    if (!el) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start",
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
    observeArticle,
    unobserveArticle,
    getVerseHandlers,
    activeVerse,
  };
}
