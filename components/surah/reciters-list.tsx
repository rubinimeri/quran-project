"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useReciterStore } from "@/stores/reciter-store";
import { type ReciterOption } from "@/lib/reciters";
import { cn } from "@/lib/utils";

type RecitersListProps = {
  reciters: ReciterOption[];
};

/**
 * The reciter picker as drawer content (no trigger): a single-choice radio list
 * bound to the persisted `reciter-store`, which the audio player already reads.
 */
export function RecitersList({ reciters }: RecitersListProps) {
  const recitationId = useReciterStore((s) => s.recitationId);
  const setRecitationId = useReciterStore((s) => s.setRecitationId);

  if (reciters.length === 0) {
    return (
      <p className="px-3 py-6 text-center text-muted-foreground/60">
        Couldn&rsquo;t load reciters.
      </p>
    );
  }

  // The persisted id may not exist in this list (e.g. API change); fall back to
  // the first available reciter so a valid option is always selected.
  const value = reciters.some((r) => r.id === recitationId)
    ? recitationId
    : reciters[0].id;

  return (
    <RadioGroup
      value={value}
      onValueChange={(next) => {
        if (typeof next === "string") setRecitationId(next);
      }}
      aria-label="Reciter"
      className="gap-1"
    >
      {reciters.map((reciter) => {
        const isSelected = reciter.id === value;
        return (
          <label
            key={reciter.id}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
              isSelected
                ? "bg-gold/10 ring-1 ring-inset ring-gold/30"
                : "hover:bg-muted/40",
            )}
          >
            <RadioGroupItem value={reciter.id} />
            <span className="min-w-0 flex-1 truncate text-sm text-foreground/90">
              {reciter.name}
            </span>
            <span className="shrink-0 text-xs text-gold-muted">
              {reciter.style}
            </span>
          </label>
        );
      })}
    </RadioGroup>
  );
}
