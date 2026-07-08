"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconBook, IconNotes, IconSearch, IconX } from "@tabler/icons-react";

import {
  Dialog,
  DialogClose,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "@/lib/utils";

type SearchResultItem = {
  resultType: string;
  key: number | string;
  name: string;
  arabic?: string;
};

type SearchResponse = {
  result?: {
    navigation: SearchResultItem[];
  };
};

type FlatResult = SearchResultItem & {
  href: string;
  category: "surah" | "verse";
};

type SearchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function buildHref(
  item: SearchResultItem,
  category: "surah" | "verse",
): string {
  if (category === "surah") return `/${item.key}`;
  const keyStr = String(item.key);
  if (keyStr.includes(":")) {
    const [surahId, ayahId] = keyStr.split(":");
    return `/${surahId}?startingVerse=${ayahId}`;
  }
  return `/${keyStr}`;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmedQuery = query.trim();

  useEffect(() => {
    if (!trimmedQuery) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmedQuery)}`,
          { signal: controller.signal },
        );
        const data: SearchResponse = await res.json();
        setResults(data);
        setFocusedIndex(-1);
      } catch {
        if (!controller.signal.aborted) setResults(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmedQuery]);

  const surahs: FlatResult[] = trimmedQuery
    ? (results?.result?.navigation
        .filter((r) => r.resultType === "surah")
        .map((r) => ({
          ...r,
          href: buildHref(r, "surah"),
          category: "surah" as const,
        })) ?? [])
    : [];

  const verses: FlatResult[] = trimmedQuery
    ? (results?.result?.navigation
        .filter((r) => r.resultType === "ayah")
        .map((r) => ({
          ...r,
          href: buildHref(r, "verse"),
          category: "verse" as const,
        })) ?? [])
    : [];

  const allResults: FlatResult[] = [...surahs, ...verses];
  const hasResults = surahs.length > 0 || verses.length > 0;
  const isLoading = trimmedQuery ? loading : false;
  const showEmpty =
    trimmedQuery.length > 0 && !isLoading && !hasResults && results !== null;

  function navigate(href: string) {
    router.push(href);
    onOpenChange(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, allResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      navigate(allResults[focusedIndex].href);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Popup
          className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4"
          onKeyDown={handleKeyDown}
          onClick={() => onOpenChange(false)}
        >
          <div
            className="w-full max-w-2xl bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-foreground/5 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input row */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40">
              {isLoading ? (
                <div className="w-4 h-4 shrink-0 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
              ) : (
                <IconSearch
                  size={16}
                  className="text-muted-foreground/60 shrink-0"
                />
              )}
              <input
                ref={inputRef}
                autoFocus
                onFocus={(e) => e.currentTarget.select()}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search surahs, verses…"
                className="w-full flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/40 outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setFocusedIndex(-1);
                    inputRef.current?.focus();
                  }}
                  className="text-[10px] uppercase tracking-wider text-muted-foreground/50 hover:text-muted-foreground transition-colors px-1.5 py-0.5 border border-border/40 rounded"
                >
                  Clear
                </button>
              )}
              <Button
                variant={"outline"}
                size={"icon-xs"}
                onClick={() => onOpenChange(false)}
              >
                <IconX className="text-gold-muted" />
              </Button>
            </div>

            {/* Results list */}
            {(hasResults || showEmpty) && (
              <div className="max-h-[60vh] overflow-y-auto overscroll-contain py-2">
                {showEmpty && (
                  <p className="px-5 py-6 text-sm text-muted-foreground/60 text-center">
                    No results for{" "}
                    <span className="text-foreground/70">
                      &ldquo;{query}&rdquo;
                    </span>
                  </p>
                )}

                {surahs.length > 0 && (
                  <section>
                    <div className="px-5 py-2 flex items-center gap-2">
                      <IconBook
                        size={11}
                        className="text-muted-foreground/40"
                      />
                      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50 font-medium">
                        Surahs
                      </span>
                    </div>
                    {surahs.map((item, i) => (
                      <ResultRow
                        key={`surah-${item.key}`}
                        focused={focusedIndex === i}
                        onHover={() => setFocusedIndex(i)}
                        onClick={() => navigate(item.href)}
                      >
                        <span className="mt-0.5 text-sm font-mono text-gold/80 w-7 text-right shrink-0">
                          {item.key}
                        </span>
                        <span className="text-sm text-foreground/90 truncate flex-1">
                          {item.name}
                        </span>
                        {item.arabic && (
                          <span
                            className="text-base text-muted-foreground/70 shrink-0 font-arabic"
                            lang="ar"
                            dir="rtl"
                          >
                            {item.arabic}
                          </span>
                        )}
                      </ResultRow>
                    ))}
                  </section>
                )}

                {verses.length > 0 && (
                  <section className={cn(surahs.length > 0 && "mt-1")}>
                    <div className="px-5 py-2 flex items-center gap-2">
                      <IconNotes
                        size={11}
                        className="text-muted-foreground/40"
                      />
                      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50 font-medium">
                        Verses
                      </span>
                    </div>
                    {verses.map((item, i) => {
                      const globalIndex = surahs.length + i;
                      return (
                        <ResultRow
                          key={`verse-${item.key}`}
                          focused={focusedIndex === globalIndex}
                          onHover={() => setFocusedIndex(globalIndex)}
                          onClick={() => navigate(item.href)}
                          stacked
                        >
                          <span className="verse-key">{item.key}</span>
                          <span
                            className="verse-text"
                            dangerouslySetInnerHTML={{ __html: item.name }}
                          />
                        </ResultRow>
                      );
                    })}
                  </section>
                )}
              </div>
            )}

            {/* Empty query hint */}
            {!trimmedQuery && (
              <div className="px-5 py-5 text-center">
                <p className="text-sm text-muted-foreground/40">
                  Search by surah name, number, or verse text
                </p>
              </div>
            )}

            {/* Keyboard shortcut footer */}
            {hasResults && (
              <div className="flex items-center gap-4 px-5 py-2.5 border-t border-border/30 bg-muted/10">
                <KbdHint keys={["↑", "↓"]} label="navigate" />
                <KbdHint keys={["↵"]} label="open" />
                <KbdHint keys={["Esc"]} label="close" />
              </div>
            )}
          </div>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}

type ResultRowProps = {
  focused: boolean;
  onHover: () => void;
  onClick: () => void;
  children: React.ReactNode;
  stacked?: boolean;
};

function ResultRow({
  focused,
  onHover,
  onClick,
  children,
  stacked = false,
}: ResultRowProps) {
  return (
    <button
      type="button"
      onMouseEnter={onHover}
      onClick={onClick}
      className={cn(
        "w-full px-5 py-2.5 text-left transition-colors cursor-pointer border-l-2",
        stacked
          ? "flex flex-col items-start gap-0.5"
          : "flex items-center gap-3",
        focused
          ? "bg-muted/60 border-gold/60"
          : "border-transparent hover:bg-muted/30",
      )}
    >
      {children}
    </button>
  );
}

type KbdHintProps = {
  keys: string[];
  label: string;
};

function KbdHint({ keys, label }: KbdHintProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-1">
        {keys.map((k) => (
          <kbd
            key={k}
            className="px-1.5 py-0.5 text-[9px] font-mono rounded border border-border/50 bg-muted/30 text-muted-foreground/60"
          >
            {k}
          </kbd>
        ))}
      </div>
      <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
