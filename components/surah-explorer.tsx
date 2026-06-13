"use client";

import { useState } from "react";
import type { Chapter, Juz } from "@quranjs/api";
import { IconArrowUp, IconArrowDown } from "@tabler/icons-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SurahCard } from "@/components/surah-card";
import {
  sortChapters,
  sortByRevelation,
  groupChaptersByJuz,
  type SortOrder,
} from "@/lib/quran-order";

type SurahExplorerProps = {
  chapters: Chapter[];
  juzs: Juz[];
};

export function SurahExplorer({ chapters, juzs }: SurahExplorerProps) {
  const [order, setOrder] = useState<SortOrder>("asc");

  const sortedByIndex = sortChapters(chapters, order);
  const sortedByRevelation = sortByRevelation(chapters, order);
  const juzGroups = groupChaptersByJuz(chapters, juzs, order);

  return (
    <section className="w-full max-w-6xl mx-auto px-4">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <p className="text-xs uppercase tracking-[0.25em] text-gold-muted shrink-0">
          Explore
        </p>
        <Separator className="flex-1 bg-gold-muted/20" />
      </div>

      <Tabs defaultValue="surah">
        {/* Tabs + sort row */}
        <div className="flex items-center justify-between gap-4 mb-1">
          <TabsList>
            <TabsTrigger value="surah">Surah</TabsTrigger>
            <TabsTrigger value="juz">Juz</TabsTrigger>
            <TabsTrigger value="revelation">Revelation</TabsTrigger>
          </TabsList>

          {/* Sort toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOrder((o) => (o === "asc" ? "desc" : "asc"))}
            className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-gold gap-1.5"
          >
            {order === "asc" ? (
              <IconArrowUp size={13} />
            ) : (
              <IconArrowDown size={13} />
            )}
            {order === "asc" ? "Asc" : "Desc"}
          </Button>
        </div>

        {/* Surah tab — standard order */}
        <TabsContent value="surah">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {sortedByIndex.map((chapter) => (
              <SurahCard key={chapter.id} chapter={chapter} />
            ))}
          </div>
        </TabsContent>

        {/* Juz tab — grouped by juz */}
        <TabsContent value="juz">
          <div className="flex flex-col gap-10">
            {juzGroups.map(({ juzNumber, chapters: juzChapters }, index) => (
              <div key={index}>
                {/* Juz label */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs uppercase tracking-[0.25em] text-gold-muted shrink-0">
                    Juz {juzNumber}
                  </span>
                  <Separator className="flex-1 bg-gold-muted/15" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {juzChapters.map((chapter) => (
                    <SurahCard
                      key={`${juzNumber}-${chapter.id}`}
                      chapter={chapter}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Revelation tab */}
        <TabsContent value="revelation">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {sortedByRevelation.map((chapter) => (
              <SurahCard key={chapter.id} chapter={chapter} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
