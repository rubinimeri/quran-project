"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { DuaCard } from "./dua-card";
import { DUA_CATEGORIES, getDuasByCategory } from "@/lib/duas";

const STAGGER = [
  "",
  "delay-100",
  "delay-200",
  "delay-300",
  "delay-400",
  "delay-500",
];

export function DuaExplorer() {
  const [showTabFade, setShowTabFade] = useState(true);

  function handleTabScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    setShowTabFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pt-16 pb-24 flex flex-col items-center">
      {/* Arabic title — the first word: the lantern rising from dusk */}
      <h1
        className="lantern-rise delay-100 text-6xl sm:text-7xl leading-none text-gold"
        style={{ fontFamily: "var(--font-arabic)" }}
        lang="ar"
        dir="rtl"
      >
        دعاء
      </h1>

      {/* English name — supporting cluster settles together (delay-400) */}
      <p
        className="mt-6 fade-soft delay-400 text-3xl sm:text-4xl font-light tracking-[0.15em] text-foreground"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Du&apos;ā
      </p>

      {/* Subtitle */}
      <p className="mt-4 fade-soft delay-400 text-sm text-muted-foreground max-w-xs text-center leading-relaxed">
        A curated collection of authentic supplications for every moment of the
        day.
      </p>

      {/* Ornamental divider */}
      <div className="mt-6 fade-soft delay-400 flex items-center gap-3 w-full max-w-40">
        <Separator className="flex-1 bg-gold-muted/25" />
        <span className="text-gold-muted/60 text-xs">&#10070;</span>
        <Separator className="flex-1 bg-gold-muted/25" />
      </div>

      {/* Tabbed collection */}
      <Tabs
        defaultValue={DUA_CATEGORIES[0].id}
        className="mt-12 fade-soft delay-500 w-full"
      >
        {/* Tab bar — sticky below navbar, glass background covers scrolled content */}
        <div className="sticky top-14 z-10 -mx-4 px-4 bg-background/80 backdrop-blur-md relative">
          <TabsList
            className="w-full justify-start overflow-y-hidden overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-nowrap"
            onScroll={handleTabScroll}
          >
            {DUA_CATEGORIES.map(({ id, label }) => (
              <TabsTrigger key={id} value={id} className="shrink-0">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          {/* Fade gradient — mobile only (sm:hidden), clears when scrolled to end */}
          {showTabFade && (
            <div
              className="sm:hidden pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent"
              aria-hidden="true"
            />
          )}
        </div>

        {DUA_CATEGORIES.map(({ id }) => {
          const duas = getDuasByCategory(id);
          return (
            <TabsContent key={id} value={id} className="flex flex-col gap-4">
              {duas.length === 0 ? (
                <p className="pt-8 text-center text-sm text-muted-foreground leading-relaxed">
                  More supplications for this category are coming soon.
                </p>
              ) : (
                duas.map((dua, index) => (
                  <DuaCard
                    key={dua.id}
                    dua={dua}
                    className={`fade-up ${STAGGER[Math.min(index, STAGGER.length - 1)]}`}
                  />
                ))
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
