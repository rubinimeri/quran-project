"use client";

import type { Chapter } from "@quranjs/api";

import { ReciterSelect } from "@/components/reciter-select";
import { SurahNavDrawer } from "@/components/surah-nav-drawer";
import { useNavVisibilityStore } from "@/stores/nav-visibility-store";
import { type ReciterOption } from "@/lib/reciters";

type SurahToolbarProps = {
  chapters: Chapter[];
  reciters: ReciterOption[];
  currentSurahId: number;
  versesCount: number;
};

export function SurahToolbar({
  chapters,
  reciters,
  currentSurahId,
  versesCount,
}: SurahToolbarProps) {
  const hidden = useNavVisibilityStore((s) => s.hidden);

  return (
    // Sticks directly below the navbar (top-14 == navbar h-14). When the navbar
    // hides it slides up by the same 3.5rem to sit at the top and stay visible.
    // transform is applied after sticky layout, so the stick point is unchanged.
    <div
      className={`sticky top-14 z-30 border-b border-border/30 bg-background/70 backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${
        hidden ? "-translate-y-14" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between gap-3 px-4">
        <SurahNavDrawer
          chapters={chapters}
          currentSurahId={currentSurahId}
          versesCount={versesCount}
        />
        <ReciterSelect reciters={reciters} className="justify-end" hideLabel />
      </div>
    </div>
  );
}
