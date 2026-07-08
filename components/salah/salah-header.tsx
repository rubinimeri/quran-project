import { Separator } from "@/components/ui/separator";

type SalahHeaderProps = {
  timezone: string;
  hijriDay: string;
  hijriMonth: string;
  hijriYear: string;
  gregorianDate: string;
  usedFallback: boolean;
};

export function SalahHeader({
  timezone,
  hijriDay,
  hijriMonth,
  hijriYear,
  gregorianDate,
  usedFallback,
}: SalahHeaderProps) {
  const locationLabel = usedFallback ? "Skopje, MK" : timezone;

  return (
    <header className="flex flex-col items-center text-center pt-12 pb-8 gap-4">
      {/* Eyebrow — settles in early and quiet */}
      <p className="fade-soft delay-100 text-xs uppercase tracking-[0.25em] text-gold-muted font-sans">
        Prayer Times &middot; {locationLabel}
      </p>

      {/* Arabic title — the lantern rising from dusk (signature reveal) */}
      <h1
        className="lantern-rise delay-200 text-6xl leading-tight text-gold font-arabic"
        lang="ar"
        dir="rtl"
      >
        صلاة
      </h1>

      {/* English title — supporting cluster settles together (delay-400) */}
      <h2
        className="fade-soft delay-400 text-3xl font-light tracking-wide text-foreground font-display"
      >
        Salah
      </h2>

      {/* Hijri date */}
      <div className="fade-soft delay-400 flex flex-col items-center gap-0.5">
        <p className="text-sm text-gold-muted/90">
          {hijriDay} {hijriMonth} {hijriYear} AH
        </p>
        <p className="text-xs text-muted-foreground/60">{gregorianDate}</p>
      </div>

      {/* Ornamental divider */}
      <div className="fade-soft delay-400 flex items-center gap-3 mt-2 w-full max-w-xs">
        <Separator className="flex-1 bg-gold-muted/30" />
        <span className="text-gold-muted text-xs">&#10070;</span>
        <Separator className="flex-1 bg-gold-muted/30" />
      </div>
    </header>
  );
}
