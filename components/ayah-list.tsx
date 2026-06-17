"use client";

import { useEffect, useState, useRef } from "react";

import { Ayah } from "./ayah";
import { AyahSkeleton, AyahListSkeleton } from "./ayah-skeleton";
import { fetchVerses } from "@/lib/verses";
import { Verse } from "@quranjs/api";

export function AyahList({ chapter }: { chapter: string | number }) {
  const [verses, setVerses] = useState<Verse[] | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const verseRefs = useRef<HTMLDivElement[]>([]);
  const isFetching = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function load() {
      setPage(1);
      setVerses(null);
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchVerses(chapter, 1);
        setVerses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load verses");
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [chapter]);

  useEffect(() => {
    const last = verseRefs.current[verseRefs.current.length - 1];
    if (!last) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || isFetching.current) return;
        observer.unobserve(entry.target);
        isFetching.current = true;
        setIsFetchingMore(true);

        try {
          const newVerses = await fetchVerses(chapter, page + 1);
          if (newVerses.length === 0) return;
          setVerses((prev) => (prev ? [...prev, ...newVerses] : newVerses));
          setPage((p) => p + 1);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to load verses",
          );
        } finally {
          isFetching.current = false;
          setIsFetchingMore(false);
        }
      },
      { rootMargin: "0px 0px 600px 0px" },
    );

    observer.observe(last);
    return () => observer.disconnect();
  }, [verses, page, chapter]);

  if (isLoading) {
    return <AyahListSkeleton />;
  }

  if (error) {
    return (
      <section className="mt-6 flex justify-center py-12">
        <span className="text-sm text-destructive">{error}</span>
      </section>
    );
  }

  return (
    <section className="mt-6">
      {verses &&
        verses.map((verse, index) => (
          <Ayah
            ref={verseRefs}
            key={verse.id}
            id={index}
            verseNumber={verse.verseNumber}
            textUthmani={verse.textUthmani ?? ""}
            translations={
              verse.translations?.map((t) => ({
                text: t.text,
                resourceName: t.resourceName,
              })) ?? []
            }
          />
        ))}
      {isFetchingMore && <AyahSkeleton />}
    </section>
  );
}
