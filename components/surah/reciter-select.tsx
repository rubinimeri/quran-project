"use client";

import { IconMicrophone } from "@tabler/icons-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReciterStore } from "@/stores/reciter-store";
import { type ReciterOption } from "@/lib/reciters";
import { cn } from "@/lib/utils";

type ReciterSelectProps = {
  reciters: ReciterOption[];
  /** Overrides the default centered layout (e.g. to fit the reading toolbar). */
  className?: string;
  /** Hide the "Reciter" text label, leaving the mic icon to convey purpose. */
  hideLabel?: boolean;
};

export function ReciterSelect({
  reciters,
  className,
  hideLabel = false,
}: ReciterSelectProps) {
  const recitationId = useReciterStore((s) => s.recitationId);
  const setRecitationId = useReciterStore((s) => s.setRecitationId);

  if (reciters.length === 0) return null;

  // The persisted id may not exist in this list (e.g. API change); fall back to
  // the first available reciter so the trigger always shows a valid selection.
  const value = reciters.some((r) => r.id === recitationId)
    ? recitationId
    : reciters[0].id;
  const selected = reciters.find((r) => r.id === value);

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        className ?? "fade-soft mt-6 justify-center px-4",
      )}
    >
      <span
        id="reciter-label"
        className={cn(
          "text-xs uppercase tracking-[0.2em] text-gold-muted",
          hideLabel && "sr-only",
        )}
      >
        Reciter
      </span>

      <Select
        value={value}
        onValueChange={(next) => {
          if (typeof next === "string") setRecitationId(next);
        }}
      >
        <SelectTrigger
          aria-labelledby="reciter-label"
          className="min-w-0 border-gold/20 bg-input/30 transition-colors hover:border-gold/40 sm:min-w-56"
        >
          <IconMicrophone
            className="size-4 shrink-0 text-gold-muted/50"
            aria-hidden
          />
          <SelectValue className={"hidden sm:flex"}>
            {selected ? (
              <span className="hidden sm:flex items-baseline gap-1.5 truncate">
                <span className="text-foreground">{selected.name}</span>
                <span className="text-gold-muted">· {selected.style}</span>
              </span>
            ) : null}
          </SelectValue>
        </SelectTrigger>

        <SelectContent className={"w-max"}>
          {reciters.map((reciter) => (
            <SelectItem key={reciter.id} value={reciter.id}>
              <span className="text-foreground">{reciter.name}</span>
              <span className="ml-auto text-gold-muted"> {reciter.style}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
