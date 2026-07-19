"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { IconList, IconSearch } from "@tabler/icons-react";
import type { Chapter } from "@quranjs/api";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAudioPlayerStore } from "@/stores/audio-player-store";
import { filterChapters, filterVerseNumbers } from "@/lib/surah-nav";
import { cn } from "@/lib/utils";

type SurahNavDrawerProps = {
  chapters: Chapter[];
  currentSurahId: number;
  versesCount: number;
};

export function SurahNavDrawer({
  chapters,
  currentSurahId,
  versesCount,
}: SurahNavDrawerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("surahs");
  const [surahQuery, setSurahQuery] = useState("");
  const [verseQuery, setVerseQuery] = useState("");

  // ≥ sm → a tall panel from the left; below → a bottom sheet (one-handed).
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const direction = isDesktop ? "left" : "bottom";

  // The verse the reader is currently on: the playing ayah, else the deep-link.
  const started = useAudioPlayerStore((s) => s.started);
  const playingIndex = useAudioPlayerStore((s) => s.index);
  const searchParams = useSearchParams();
  const startingVerse = Number(searchParams.get("startingVerse"));
  const currentVerse = started
    ? playingIndex + 1
    : Number.isInteger(startingVerse) && startingVerse >= 1
      ? startingVerse
      : null;

  const currentName =
    chapters.find((c) => c.id === currentSurahId)?.nameSimple ?? "Surah";

  const filteredChapters = filterChapters(chapters, surahQuery);
  const filteredVerses = filterVerseNumbers(versesCount, verseQuery);

  const activeRowRef = useRef<HTMLAnchorElement>(null);

  // Bring the current surah/verse into view each time the drawer opens or the
  // active tab changes, so the reader lands on where they are.
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      activeRowRef.current?.scrollIntoView({ block: "center" });
    });
    return () => cancelAnimationFrame(frame);
  }, [open, tab]);

  return (
    <Drawer
      key={direction}
      direction={direction}
      open={open}
      onOpenChange={setOpen}
    >
      <DrawerTrigger
        aria-label="Open surah navigation"
        className="group flex h-9 items-center gap-2 rounded-full border border-gold/20 bg-input/30 pl-3 pr-3.5 text-sm text-foreground transition-colors hover:border-gold/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
      >
        <IconList
          className="size-4 shrink-0 text-gold-muted/70 transition-colors group-hover:text-gold"
          aria-hidden
        />
        <span className="max-w-32 truncate">{currentName}</span>
      </DrawerTrigger>

      <DrawerContent className="data-[vaul-drawer-direction=bottom]:h-[78vh] data-[vaul-drawer-direction=left]:w-[22rem]">
        <div className="flex h-full min-h-0 flex-col">
          <DrawerHeader className="px-2 pb-2 md:text-left">
            <DrawerTitle className="text-lg font-light tracking-wide text-gold font-display">
              Navigate
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              Jump to another surah or to a verse in the current surah.
            </DrawerDescription>
          </DrawerHeader>

          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as string)}
            className="flex min-h-0 flex-1 flex-col px-2"
          >
            <TabsList className="shrink-0 self-start">
              <TabsTrigger value="surahs">Surahs</TabsTrigger>
              <TabsTrigger value="verses">Verses</TabsTrigger>
            </TabsList>

            {/* Surahs */}
            <TabsContent
              value="surahs"
              className="flex min-h-0 flex-1 flex-col pt-4"
            >
              <SearchInput
                value={surahQuery}
                onChange={setSurahQuery}
                placeholder="Search surahs by name or number…"
              />
              <ul className="mt-3 min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain pr-1">
                {chapters.length === 0 ? (
                  <EmptyLine>Couldn&rsquo;t load surahs.</EmptyLine>
                ) : filteredChapters.length === 0 ? (
                  <EmptyLine>
                    No surah matches &ldquo;{surahQuery}&rdquo;.
                  </EmptyLine>
                ) : (
                  filteredChapters.map((c) => {
                    const isCurrent = c.id === currentSurahId;
                    return (
                      <li key={c.id}>
                        <Link
                          ref={isCurrent ? activeRowRef : undefined}
                          href={`/${c.id}`}
                          onClick={() => setOpen(false)}
                          aria-current={isCurrent ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                            isCurrent
                              ? "bg-gold/10 ring-1 ring-inset ring-gold/30"
                              : "hover:bg-muted/40",
                          )}
                        >
                          <span
                            className={cn(
                              "w-7 shrink-0 text-right font-mono text-sm",
                              isCurrent ? "text-gold" : "text-gold/70",
                            )}
                          >
                            {c.id}
                          </span>
                          <span className="flex-1 truncate text-sm text-foreground/90">
                            {c.nameSimple}
                          </span>
                          <span
                            className="shrink-0 text-base text-muted-foreground/70 font-arabic"
                            lang="ar"
                            dir="rtl"
                          >
                            {c.nameArabic}
                          </span>
                        </Link>
                      </li>
                    );
                  })
                )}
              </ul>
            </TabsContent>

            {/* Verses */}
            <TabsContent
              value="verses"
              className="flex min-h-0 flex-1 flex-col pt-4"
            >
              <SearchInput
                value={verseQuery}
                onChange={setVerseQuery}
                placeholder="Go to verse number…"
                inputMode="numeric"
              />
              <div className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
                {filteredVerses.length === 0 ? (
                  <EmptyLine>
                    No verse matches &ldquo;{verseQuery}&rdquo;.
                  </EmptyLine>
                ) : (
                  <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
                    {filteredVerses.map((n) => {
                      const isCurrent = n === currentVerse;
                      return (
                        <Link
                          key={n}
                          ref={isCurrent ? activeRowRef : undefined}
                          href={`/${currentSurahId}?startingVerse=${n}`}
                          onClick={() => setOpen(false)}
                          aria-current={isCurrent ? "page" : undefined}
                          className={cn(
                            "flex h-10 items-center justify-center rounded-lg font-mono text-sm tabular-nums transition-colors",
                            isCurrent
                              ? "bg-gold/15 text-gold ring-1 ring-inset ring-gold/40"
                              : "bg-muted/30 text-foreground/80 hover:bg-muted/50 hover:text-gold",
                          )}
                        >
                          {n}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  inputMode?: "text" | "numeric";
};

function SearchInput({
  value,
  onChange,
  placeholder,
  inputMode = "text",
}: SearchInputProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-input/20 px-3">
      <IconSearch
        size={15}
        className="shrink-0 text-muted-foreground/60"
        aria-hidden
      />
      <input
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full flex-1 bg-transparent py-2.5 text-base text-foreground outline-none placeholder:text-muted-foreground/50"
      />
    </div>
  );
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 py-6 text-center text-muted-foreground/60">{children}</p>
  );
}
