import Link from "next/link";
import type { Verse } from "@/stores/ayah-list-store";

import { stripHtmlTags } from "@/lib/format";
import { Separator } from "@/components/ui/separator";

type DailyVerseProps = {
  verse: Verse;
  surahName: string;
};

export function DailyVerse({ verse, surahName }: DailyVerseProps) {
  const chapterId = Number(verse.chapterId);
  const translation = verse.translations?.[0];

  return (
    <section className="w-full max-w-2xl mx-auto px-4">
      {/* Section label */}
      <div className="flex items-center gap-3 mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-gold-muted shrink-0">
          Daily Light
        </p>
        <Separator className="flex-1 bg-gold-muted/20" />
      </div>

      {/* Card */}
      <div className="relative rounded-2xl border border-gold/20 bg-card/40 px-6 py-8 flex flex-col gap-6">
        {/* Decorative corner glyph */}
        <span className="absolute top-4 right-5 text-gold-muted/20 text-2xl select-none">
          ❖
        </span>

        {/* Arabic */}
        <p
          className="text-right text-2xl sm:text-3xl line-clamp-2 leading-[1.6] text-foreground"
          style={{ fontFamily: "var(--font-quran)" }}
          lang="ar"
          dir="rtl"
        >
          {verse.textQpcHafs}
        </p>

        {/* Translation */}
        {translation && (
          <div className="flex flex-col gap-1">
            {translation.resourceName && (
              <span className="text-[10px] linec-clamp-3 uppercase tracking-[0.2em] text-gold-muted">
                {translation.resourceName}
              </span>
            )}
            <p className="text-sm text-muted-foreground leading-relaxed italic">
              &ldquo;{stripHtmlTags(translation.text)}&rdquo;
            </p>
          </div>
        )}

        {/* Reference */}
        <Link
          href={`/${chapterId}?startingVerse=${verse.verseNumber}`}
          className="flex items-center gap-2 group"
        >
          <Separator className="w-6 bg-gold/40 shrink group-hover:bg-gold transition-colors" />
          <span className="text-xs shrink-0 uppercase tracking-[0.2em] text-gold-muted group-hover:text-gold transition-colors">
            {surahName} &middot; {verse.verseNumber}
          </span>
        </Link>
      </div>
    </section>
  );
}
