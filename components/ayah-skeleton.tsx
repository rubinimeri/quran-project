import { Separator } from "@/components/ui/separator";

function Bar({ className }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-md ${className ?? ""}`} />;
}

export function AyahSkeleton() {
  return (
    <div
      className="flex flex-col gap-5 py-8 border-b border-border/40 last:border-0"
      aria-hidden="true"
    >
      {/* Verse number medallion + divider */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full border border-gold/20 shrink-0" />
        <Separator className="flex-1 bg-gold-muted/15" />
      </div>

      {/* Arabic block — right-aligned, given the most room */}
      <div className="flex flex-col items-end gap-3">
        <Bar className="h-7 w-3/4" />
        <Bar className="h-7 w-5/6" />
      </div>

      {/* Translation — eyebrow label + lines of varied width */}
      <div className="flex flex-col gap-3">
        <Bar className="h-3 w-24" />
        <Bar className="h-4 w-full" />
        <Bar className="h-4 w-11/12" />
        <Bar className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function AyahListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <section className="mt-6" aria-busy="true" aria-label="Loading verses">
      {Array.from({ length: count }).map((_, i) => (
        <AyahSkeleton key={i} />
      ))}
    </section>
  );
}
