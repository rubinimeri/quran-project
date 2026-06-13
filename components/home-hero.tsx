import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function HomeHero() {
  return (
    <section className="surah-glow w-full flex flex-col items-center text-center px-4 pt-20 pb-16 gap-6">
      {/* Eyebrow */}
      <p className="fade-up delay-100 text-xs uppercase tracking-[0.3em] text-gold-muted font-sans">
        The Noble Qur&apos;an
      </p>

      {/* Arabic title */}
      <h1
        className="mt-6 fade-up delay-200 text-7xl sm:text-8xl leading-none text-gold"
        style={{ fontFamily: "var(--font-arabic)" }}
        lang="ar"
        dir="rtl"
      >
        ٱلْقُرْءَان
      </h1>

      {/* App name */}
      <div className="fade-up delay-300 flex flex-col items-center gap-1">
        <p
          className="text-4xl sm:text-5xl font-light tracking-[0.15em] text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Nur
        </p>
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground/60">
          نور &middot; Light
        </p>
      </div>

      {/* Subtitle */}
      <p className="fade-up delay-400 text-sm text-muted-foreground max-w-xs leading-relaxed">
        Read, reflect, and recite the words of Allah. A modern home for the
        eternal Qur&apos;an.
      </p>

      {/* Ornamental divider */}
      <div className="fade-up delay-400 flex items-center gap-3 w-full max-w-40">
        <Separator className="flex-1 bg-gold-muted/25" />
        <span className="text-gold-muted/60 text-xs">&#10070;</span>
        <Separator className="flex-1 bg-gold-muted/25" />
      </div>

      {/* CTA */}
      <div className="fade-up delay-500">
        <Button
          size="lg"
          className="rounded-full px-8 tracking-wide text-sm uppercase"
          render={<Link href="/1" />}
          nativeButton={false}
        >
          Start Reading
        </Button>
      </div>
    </section>
  );
}
