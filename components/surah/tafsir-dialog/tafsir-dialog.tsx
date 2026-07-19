"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ayah } from "@/components/surah/ayah";
import { TAFSIRS } from "@/lib/tafsir";
import { useTafsir } from "@/hooks/use-tafsir";
import { TafsirFooter } from "./tafsir-footer";
import { TafsirSkeleton } from "./tafsir-skeleton";
import { TafsirError } from "./tafsir-error";
import { TafsirEmpty } from "./tafsir-empty";
import { IconX } from "@tabler/icons-react";

type AyahTranslation = { text: string; resourceName?: string };

type TafsirDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapter: string | number;
  surahName: string;
  verseNumber: number;
  versesCount: number;
  /** The header ayah; undefined while its page is still loading. */
  textQpcHafs?: string;
  translations?: AyahTranslation[];
  /** Play this ayah's recitation (wires the header's play action). */
  onPlay?: () => void;
  /** Whether this ayah is the one currently being recited. */
  active?: boolean;
  onNavigate: (verseNumber: number) => void;
};

export function TafsirDialog({
  open,
  onOpenChange,
  chapter,
  surahName,
  verseNumber,
  versesCount,
  textQpcHafs,
  translations = [],
  onPlay,
  active = false,
  onNavigate,
}: TafsirDialogProps) {
  const {
    verseKey,
    content,
    text,
    tafsirId,
    sourceName,
    error,
    loading,
    hasRange,
    showEmpty,
    verseLoaded,
    retry,
    setTafsirId,
  } = useTafsir(chapter, verseNumber, textQpcHafs || "", open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          "flex flex-col max-w-5xl bg-card rounded-2xl h-full max-h-[85vh] sm:w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain border border-gold/15 shadow-[0_0_44px_oklch(0.8_0.11_85_/_0.07)] scrollbar-thin scrollbar-thumb-gold-muted/60 py-0 px-0"
        }
      >
        <DialogTitle className="sr-only">
          Tafsir — {surahName} {verseKey}
        </DialogTitle>

        {/* Ayah header — close sits in its own row so it never overlaps the
              verse actions inside the reused Ayah. */}
        <div className="sticky top-0 z-10 shrink-0 px-6 py-3 bg-card ">
          <div className="flex justify-end">
            <DialogClose
              variant={"ghost"}
              className={
                "rounded-full p-2 hover:text-gold hover:bg-gold/10 focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors text-muted-foreground"
              }
            >
              <IconX size={16} />
            </DialogClose>
          </div>
        </div>

        {verseLoaded ? (
          <Ayah
            className="px-6"
            asHeader
            verseNumber={verseNumber}
            textQpcHafs={text}
            translations={translations}
            onPlay={onPlay}
            active={active}
          />
        ) : (
          <Ayah asHeader loading verseNumber={verseNumber} />
        )}

        {/* Source tabs */}
        <div className="shrink-0 px-6 pt-4 overflow-x-auto scrollbar-none">
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
          <p className="px-6 pt-3 text-sm text-gold-muted font-display">
            Commentary on verses {content!.from}–{content!.to}
          </p>
        )}
        {/* Tafsir body — flows inside the whole-popup scroll. */}
        <div className="px-6 py-5">
          {loading ? (
            <TafsirSkeleton />
          ) : error ? (
            <TafsirError onRetry={retry} />
          ) : showEmpty ? (
            <TafsirEmpty sourceName={sourceName} />
          ) : (
            <div
              className="tafsir-prose mx-auto"
              dangerouslySetInnerHTML={{ __html: content!.text }}
            />
          )}
        </div>

        {/* Prev / next footer — sticky so it follows the user down the scroll. */}
        <TafsirFooter
          onNavigate={onNavigate}
          verseKey={verseKey}
          verseNumber={verseNumber}
          versesCount={versesCount}
        />
      </DialogContent>
    </Dialog>
  );
}
