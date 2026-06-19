"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { Ayah } from "./ayah";
import { fetchVerses, versePage } from "@/lib/verses";
import { useRecitation } from "@/components/recitation-context";
import { Verse } from "@quranjs/api";

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type AyahListProps = {
  chapter: string | number;
  versesCount: number;
  startingVerse?: number;
};

export function AyahList({
  chapter,
  versesCount,
  startingVerse,
}: AyahListProps) {
  const [versesByNumber, setVersesByNumber] = useState<Map<number, Verse>>(
    new Map(),
  );
  const [error, setError] = useState<string | null>(null);
  const [highlightedVerse, setHighlightedVerse] = useState<number | undefined>(
    startingVerse,
  );

  const { currentVerse, requestVerse } = useRecitation();
  // True while we should keep the reciting ayah centred; a manual scroll turns
  // it off until recitation advances to the next ayah.
  const followingRecitation = useRef(false);

  const loadedPages = useRef<Set<number>>(new Set());
  const loadingPages = useRef<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasScrolledToTarget = useRef(false);
  // While anchoring, keep the target verse pinned at the offset it landed on, so
  // verses loading in above it (taller than their skeletons) don't push it away.
  // Released the moment the user scrolls themselves.
  const anchorTop = useRef<number | null>(null);
  const isAnchoring = useRef(false);

  const loadPage = useCallback(
    async (page: number) => {
      if (
        page < 1 ||
        loadedPages.current.has(page) ||
        loadingPages.current.has(page)
      ) {
        return;
      }
      loadingPages.current.add(page);
      try {
        const newVerses = await fetchVerses(chapter, page);
        loadedPages.current.add(page);
        setVersesByNumber((prev) => {
          const next = new Map(prev);
          for (const verse of newVerses) {
            next.set(verse.verseNumber, verse);
          }
          return next;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load verses");
      } finally {
        loadingPages.current.delete(page);
      }
    },
    [chapter],
  );

  // Load the starting page on mount. AyahList is remounted (via a `key` on the
  // surah + target) when either changes, so all state resets naturally. The load
  // is deferred to after the first paint so the skeleton scaffold renders first.
  useEffect(() => {
    if (!startingVerse) {
      window.scrollTo(0, 0);
    }
    const page = startingVerse ? versePage(startingVerse) : 1;
    const frame = requestAnimationFrame(() => loadPage(page));
    return () => cancelAnimationFrame(frame);
  }, [startingVerse, loadPage]);

  // One observer for the whole list; placeholders register themselves via the
  // callback ref below and trigger their page to load as they near the viewport.
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

    const timer = setTimeout(() => setHighlightedVerse(undefined), 2600);
    return () => clearTimeout(timer);
  }, [versesByNumber, startingVerse]);

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
  useEffect(() => {
    if (currentVerse === undefined) return;
    followingRecitation.current = true;
    const frame = requestAnimationFrame(() => {
      loadPage(versePage(currentVerse));
      loadPage(versePage(currentVerse + 1));
    });
    return () => cancelAnimationFrame(frame);
  }, [currentVerse, loadPage]);

  // Centre the reciting ayah once it's mounted — but only while following.
  useEffect(() => {
    if (currentVerse === undefined || !followingRecitation.current) return;
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
  }, [currentVerse, versesByNumber]);

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

  if (error) {
    return (
      <section className="mt-6 flex justify-center py-12">
        <span className="text-sm text-destructive">{error}</span>
      </section>
    );
  }

  return (
    <section className="mt-6">
      {Array.from({ length: versesCount }, (_, i) => {
        const verseNumber = i + 1;
        const verse = versesByNumber.get(verseNumber);

        // Observe placeholders so their page loads as they near the viewport;
        // stop observing once the real verse is in place.
        const articleRef = (el: HTMLElement | null) => {
          if (!el) return;
          if (verse) observerRef.current?.unobserve(el);
          else observerRef.current?.observe(el);
        };

        return verse ? (
          <Ayah
            key={verseNumber}
            verseNumber={verseNumber}
            textUthmani={verse.textUthmani ?? ""}
            highlighted={verseNumber === highlightedVerse}
            active={verseNumber === currentVerse}
            onPlay={() => requestVerse(verseNumber)}
            articleRef={articleRef}
            translations={
              verse.translations?.map((t) => ({
                text: t.text,
                resourceName: t.resourceName,
              })) ?? []
            }
          />
        ) : (
          <Ayah
            key={verseNumber}
            verseNumber={verseNumber}
            loading
            articleRef={articleRef}
          />
        );
      })}
    </section>
  );
}
