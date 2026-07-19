import {
  DEFAULT_TAFSIR_ID,
  TafsirContent,
  TAFSIRS,
  fetchTafsir,
} from "@/lib/tafsir";
import { useState, useRef, useEffect, useCallback } from "react";

export function useTafsir(
  chapter: string | number,
  verseNumber: number,
  text: string,
  open: boolean,
) {
  const [tafsirId, setTafsirId] = useState<number>(DEFAULT_TAFSIR_ID);
  const [content, setContent] = useState<TafsirContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Cache fetched (verse, source) results so re-clicking a tab or stepping back
  // to a verse is instant.
  const cache = useRef<Map<string, TafsirContent | null>>(new Map());

  const verseKey = `${chapter}:${verseNumber}`;
  const sourceName = TAFSIRS.find((t) => t.id === tafsirId)?.name ?? "";
  const verseLoaded = text !== undefined;
  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!open) return;

    const cacheKey = `${verseKey}:${tafsirId}`;
    const cached = cache.current.get(cacheKey);
    if (cached !== undefined) {
      setContent(cached);
      setLoading(false);
      setError(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    fetchTafsir(verseKey, tafsirId)
      .then((result) => {
        if (cancelled) return;
        cache.current.set(cacheKey, result);
        setContent(result);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, verseKey, tafsirId, reloadKey]);

  const hasRange =
    content?.from !== undefined &&
    content?.to !== undefined &&
    content.from !== content.to;

  const showEmpty = !loading && !error && !content?.text;

  return {
    verseKey,
    verseLoaded,
    text,
    tafsirId,
    setTafsirId,
    hasRange,
    content,
    loading,
    error,
    retry,
    showEmpty,
    sourceName,
  };
}
