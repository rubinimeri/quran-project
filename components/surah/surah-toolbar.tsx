"use client";

import type { Chapter, TranslationResource } from "@quranjs/api";

import { AyahSettings } from "./ayah-settings";
import { SurahNavDrawer } from "./surah-nav-drawer";
import { useNavVisibilityStore } from "@/stores/nav-visibility-store";
import { type ReciterOption } from "@/lib/reciters";
import { cn } from "@/lib/utils";

type SurahToolbarProps = {
  chapters: Chapter[];
  reciters: ReciterOption[];
  translations: TranslationResource[];
  currentSurahId: number;
  versesCount: number;
};

export function SurahToolbar({
  chapters,
  reciters,
  translations,
  currentSurahId,
  versesCount,
}: SurahToolbarProps) {
  const hidden = useNavVisibilityStore((s) => s.hidden);

  return (
    // Sticks directly below the navbar (top-14 == navbar h-14). When the navbar
    // hides it slides up by the same 3.5rem to sit at the top and stay visible.
    // transform is applied after sticky layout, so the stick point is unchanged.
    <div
      className={cn(
        "sticky top-14 z-30 border-b border-border/30 bg-background/70 backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
        hidden ? "-translate-y-14" : "translate-y-0",
      )}
    >
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between gap-3 px-4">
        <SurahNavDrawer
          chapters={chapters}
          currentSurahId={currentSurahId}
          versesCount={versesCount}
        />
        <AyahSettings reciters={reciters} translations={translations} />
      </div>
    </div>
  );
}
