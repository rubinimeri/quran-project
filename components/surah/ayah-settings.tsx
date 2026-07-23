"use client";

import { useState } from "react";
import { IconAdjustmentsHorizontal } from "@tabler/icons-react";
import { type TranslationResource } from "@quranjs/api";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecitersList } from "./reciters-list";
import { TranslationsList } from "./translations-list";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useTranslationsStore } from "@/stores/translations-store";
import { type ReciterOption } from "@/lib/reciters";

type AyahSettingsProps = {
  reciters: ReciterOption[];
  translations: TranslationResource[];
};

/**
 * Reading preferences in a drawer: a bottom sheet on mobile, a right-hand panel
 * on desktop. Replaces the inline reciter dropdown in the surah toolbar.
 */
export function AyahSettings({ reciters, translations }: AyahSettingsProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("reciter");

  // ≥ sm → a tall panel from the right; below → a bottom sheet (one-handed).
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const direction = isDesktop ? "right" : "bottom";

  const hasTranslations = useTranslationsStore((s) => s.selectedIds.length) > 0;

  return (
    <Drawer
      key={direction}
      direction={direction}
      open={open}
      onOpenChange={setOpen}
    >
      <DrawerTrigger
        aria-label="Open reading settings"
        className="group relative flex size-9 items-center justify-center rounded-full border border-gold/20 bg-input/30 text-foreground transition-colors hover:border-gold/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
      >
        <IconAdjustmentsHorizontal
          className="size-4 text-gold-muted/70 transition-colors group-hover:text-gold"
          aria-hidden
        />
        {hasTranslations ? (
          <span
            className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-gold"
            aria-hidden
          />
        ) : null}
      </DrawerTrigger>

      <DrawerContent className="data-[vaul-drawer-direction=bottom]:h-[85vh] data-[vaul-drawer-direction=right]:w-[30rem] data-[vaul-drawer-direction=right]:sm:max-w-[90vw]">
        <div className="flex h-full min-h-0 flex-col">
          <DrawerHeader className="px-2 pb-2 md:text-left">
            <DrawerTitle className="font-display text-lg font-light tracking-wide text-gold">
              Settings
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              Choose the reciter and the translations shown beneath each verse.
            </DrawerDescription>
          </DrawerHeader>

          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as string)}
            className="flex h-full flex-1 flex-col px-2 overflow-y-auto"
          >
            <TabsList className="shrink-0 self-start">
              <TabsTrigger value="reciter">Reciter</TabsTrigger>
              <TabsTrigger value="translations">Translations</TabsTrigger>
            </TabsList>

            <TabsContent
              value="reciter"
              className="flex-1 overflow-y-auto overscroll-contain pr-1 pt-4"
            >
              <RecitersList reciters={reciters} />
            </TabsContent>

            <TabsContent
              value="translations"
              className="flex min-h-0 flex-1 flex-col pt-4"
            >
              <TranslationsList translations={translations} />
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
