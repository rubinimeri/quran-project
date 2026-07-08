import { Separator } from "@/components/ui/separator";

type SurahHeaderProps = {
  id: number;
  nameSimple: string;
  nameArabic: string;
  translatedName: string;
  versesCount: number;
  revelationPlace: string;
  bismillahPre: boolean;
};

export function SurahHeader({
  id,
  nameSimple,
  nameArabic,
  translatedName,
  versesCount,
  revelationPlace,
  bismillahPre,
}: SurahHeaderProps) {
  return (
    <header className="flex flex-col items-center text-center pt-12 pb-8 gap-4">
      {/* Eyebrow — settles in early and quiet */}
      <p className="fade-soft delay-100 text-xs uppercase tracking-[0.25em] text-gold-muted font-sans">
        Surah {id} &middot; {revelationPlace} &middot; {versesCount} Ayahs
      </p>

      {/* Arabic name — the lantern rising from dusk (signature reveal) */}
      <h1
        className="lantern-rise delay-200 text-6xl leading-tight text-gold"
        style={{ fontFamily: "var(--font-arabic)" }}
        lang="ar"
        dir="rtl"
      >
        {nameArabic}
      </h1>

      {/* English name — supporting cluster settles together (delay-400) */}
      <h2
        className="fade-soft delay-400 text-3xl font-light tracking-wide text-foreground"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {nameSimple}
      </h2>

      {/* Translated meaning */}
      <p className="fade-soft delay-400 text-sm text-muted-foreground">
        {translatedName}
      </p>

      {/* Ornamental divider */}
      <div className="fade-soft delay-400 flex items-center gap-3 mt-2 w-full max-w-xs">
        <Separator className="flex-1 bg-gold-muted/30" />
        <span className="text-gold-muted text-xs">&#10070;</span>
        <Separator className="flex-1 bg-gold-muted/30" />
      </div>

      {/* Bismillah */}
      {bismillahPre && (
        <p
          className="fade-soft delay-500 text-2xl text-gold-muted/80 mt-1"
          style={{ fontFamily: "var(--font-quran)" }}
          lang="ar"
          dir="rtl"
        >
          بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </p>
      )}
    </header>
  );
}
