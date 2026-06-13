import Link from "next/link";
import type { Chapter } from "@quranjs/api";

type SurahCardProps = {
  chapter: Chapter;
};

export function SurahCard({ chapter }: SurahCardProps) {
  const { id, nameSimple, nameArabic, translatedName, versesCount } = chapter;

  return (
    <Link href={`/${id}`} className="group block">
      <article className="relative flex items-center gap-3 rounded-xl border border-border/40 bg-card/30 px-4 py-3.5 transition-all duration-200 hover:border-gold/40 hover:bg-card/60 hover:-translate-y-px hover:shadow-[0_4px_24px_oklch(0.8_0.11_85/0.06)]">
        {/* Number medallion */}
        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-gold/30 text-gold-muted text-xs font-semibold shrink-0 group-hover:border-gold/60 group-hover:text-gold transition-colors">
          {id}
        </div>

        {/* English info */}
        <div className="flex flex-col min-w-0 flex-1">
          <span
            className="text-base font-light leading-tight text-foreground group-hover:text-gold transition-colors truncate"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {nameSimple}
          </span>
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 truncate mt-0.5">
            {translatedName.name} &middot; {versesCount} ayahs
          </span>
        </div>

        {/* Arabic name */}
        <div className="flex flex-col items-end shrink-0">
          <span
            className="text-lg leading-none text-gold-muted group-hover:text-gold transition-colors"
            style={{ fontFamily: "var(--font-arabic)" }}
            lang="ar"
            dir="rtl"
          >
            {nameArabic}
          </span>
        </div>
      </article>
    </Link>
  );
}
