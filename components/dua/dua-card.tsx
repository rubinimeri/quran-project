import type { Dua } from "@/lib/duas";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type DuaCardProps = {
  dua: Dua;
  className?: string;
};

export function DuaCard({ dua, className }: DuaCardProps) {
  return (
    <article
      className={cn(
        "relative rounded-2xl border border-gold/20 bg-card/40 px-6 py-8 flex flex-col gap-5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-gold/40 hover:bg-card/60",
        className,
      )}
    >
      {/* Decorative corner glyph */}
      <span className="absolute top-4 right-5 text-gold-muted/20 text-2xl select-none">
        ❖
      </span>

      {/* Arabic — the reverent centerpiece */}
      <p
        className="text-right text-2xl sm:text-3xl leading-[2.1] text-foreground pl-6 font-quran"
        lang="ar"
        dir="rtl"
      >
        {dua.arabic}
      </p>

      {/* Translation — the meaning, the line that leads for every reader */}
      <p className="text-base sm:text-lg text-foreground/90 leading-relaxed text-pretty">
        {dua.translation}
      </p>

      {/* Transliteration — a quieter pronunciation aid beneath the meaning */}
      <p className="text-sm text-gold-muted/90 leading-relaxed">
        {dua.transliteration}
      </p>

      {/* Occasions — when to recite, rendered only when present */}
      {dua.occasions && (
        <p className="text-xs text-muted-foreground/80 leading-relaxed -mt-1">
          {dua.occasions}
        </p>
      )}

      {/* Reference — a manuscript-style citation, distinct from the label system */}
      <div className="flex items-center gap-2.5">
        <Separator className="w-6 bg-gold/40 shrink" />
        <cite
          className="text-base not-italic tracking-wide text-gold-muted shrink-0 font-display"
        >
          {dua.reference}
        </cite>
      </div>
    </article>
  );
}
