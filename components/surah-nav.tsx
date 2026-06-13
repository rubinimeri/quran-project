import Link from "next/link";

import { Button } from "@/components/ui/button";

type SurahNavProps = {
  currentId: number;
};

const linkClass =
  "text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-gold";

export function SurahNav({ currentId }: SurahNavProps) {
  const hasPrev = currentId > 1;
  const hasNext = currentId < 114;

  return (
    <nav className="flex items-center justify-between w-full max-w-2xl mx-auto py-6">
      {/* Back to index */}
      <Button
        variant="ghost"
        size="sm"
        className={linkClass}
        render={<Link href="/" />}
      >
        ← All Surahs
      </Button>

      {/* Prev / Next */}
      <div className="flex items-center gap-2">
        {hasPrev ? (
          <Button
            variant="ghost"
            size="sm"
            className={linkClass}
            render={<Link href={`/${currentId - 1}`} />}
          >
            ← {currentId - 1}
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className={linkClass} disabled>
            ← 1
          </Button>
        )}

        <span className="text-gold-muted/40 text-xs">&#10070;</span>

        {hasNext ? (
          <Button
            variant="ghost"
            size="sm"
            className={linkClass}
            render={<Link href={`/${currentId + 1}`} />}
          >
            {currentId + 1} →
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className={linkClass} disabled>
            114 →
          </Button>
        )}
      </div>
    </nav>
  );
}
