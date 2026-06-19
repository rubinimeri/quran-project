"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { IconArrowLeft, IconArrowRight, IconX } from "@tabler/icons-react";

import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Ayah } from "@/components/ayah";
import {
  DEFAULT_TAFSIR_ID,
  fetchTafsir,
  TAFSIRS,
  TafsirContent,
} from "@/lib/tafsir";

type AyahTranslation = { text: string; resourceName?: string };

type TafsirDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapter: string | number;
  surahName: string;
  verseNumber: number;
  versesCount: number;
  /** The header ayah; undefined while its page is still loading. */
  textUthmani?: string;
  translations?: AyahTranslation[];
  /** Play this ayah's recitation (wires the header's play action). */
  onPlay?: () => void;
  /** Whether this ayah is the one currently being recited. */
  active?: boolean;
  onNavigate: (verseNumber: number) => void;
};

function Bar({ className }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-md ${className ?? ""}`} />;
}

export function TafsirDialog({
  open,
  onOpenChange,
  chapter,
  surahName,
  verseNumber,
  versesCount,
  textUthmani,
  translations = [],
  onPlay,
  active = false,
  onNavigate,
}: TafsirDialogProps) {
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
  const verseLoaded = textUthmani !== undefined;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Popup
          className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] h-full w-full sm:w-[calc(100vw-2rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto overscroll-contain rounded-2xl border border-gold/15 bg-card ring-1 ring-foreground/5 shadow-[0_0_44px_oklch(0.8_0.11_85_/_0.07)] outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 duration-150 motion-reduce:animate-none scrollbar-thin scrollbar-thumb-gold-muted/60"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">
            Tafsir — {surahName} {verseKey}
          </DialogTitle>

          {/* Ayah header — close sits in its own row so it never overlaps the
              verse actions inside the reused Ayah. */}
          <div className="sticky top-0 z-10 mt-auto shrink-0 px-6 py-3 bg-card ">
            <div className="flex justify-end">
              <DialogPrimitive.Close
                aria-label="Close"
                className="-mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-gold/10 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <IconX size={16} />
              </DialogPrimitive.Close>
            </div>
          </div>

          {verseLoaded ? (
            <Ayah
              asHeader
              verseNumber={verseNumber}
              textUthmani={textUthmani}
              translations={translations}
              onPlay={onPlay}
              active={active}
            />
          ) : (
            <Ayah asHeader loading verseNumber={verseNumber} />
          )}

          {/* Source tabs */}
          <div className="shrink-0 px-6 pt-4 overflow-x-auto">
            <Tabs
              value={String(tafsirId)}
              onValueChange={(value) => setTafsirId(Number(value))}
            >
              <TabsList className="w-max justify-start overflow-y-hidden pb-0.5">
                {TAFSIRS.map((t) => (
                  <TabsTrigger key={t.id} value={String(t.id)}>
                    {t.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {hasRange && (
            <p
              className="px-6 pt-3 text-sm text-gold-muted"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              Commentary on verses {content!.from}–{content!.to}
            </p>
          )}
          {/* Tafsir body — flows inside the whole-popup scroll. */}
          <div className="px-6 py-5">
            {loading ? (
              <div className="flex flex-col gap-3" aria-busy>
                <Bar className="h-5 w-1/3" />
                <Bar className="h-4 w-full" />
                <Bar className="h-4 w-11/12" />
                <Bar className="h-4 w-full" />
                <Bar className="h-4 w-4/5" />
                <Bar className="mt-3 h-4 w-full" />
                <Bar className="h-4 w-3/4" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  Couldn&rsquo;t load the tafsir.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReloadKey((k) => k + 1)}
                >
                  Try again
                </Button>
              </div>
            ) : showEmpty ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No commentary available for this verse in {sourceName}.
              </p>
            ) : (
              <div
                className="tafsir-prose mx-auto"
                dangerouslySetInnerHTML={{ __html: content!.text }}
              />
            )}
          </div>

          {/* Prev / next footer — sticky so it follows the user down the scroll. */}
          <div className="sticky bottom-0 z-10 mt-auto flex items-center justify-between border-t border-border/40 bg-card/90 px-4 py-3 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="sm"
              aria-label="Previous verse"
              disabled={verseNumber <= 1}
              onClick={() => onNavigate(verseNumber - 1)}
              className="gap-1.5 text-muted-foreground hover:text-gold"
            >
              <IconArrowLeft size={16} />
              Previous
            </Button>

            <span className="font-mono text-xs text-gold/70">{verseKey}</span>

            <Button
              variant="ghost"
              size="sm"
              aria-label="Next verse"
              disabled={verseNumber >= versesCount}
              onClick={() => onNavigate(verseNumber + 1)}
              className="gap-1.5 text-muted-foreground hover:text-gold"
            >
              Next
              <IconArrowRight size={16} />
            </Button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
