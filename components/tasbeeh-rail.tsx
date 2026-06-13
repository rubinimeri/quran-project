import { IconInfinity, IconTrash } from "@tabler/icons-react";

import type { Tasbeeh } from "@/lib/tasbeeh";
import { INFINITY_ID } from "@/lib/tasbeeh";

type TasbeehRailProps = {
  tasbeehs: Tasbeeh[];
  activeId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

export function TasbeehRail({
  tasbeehs,
  activeId,
  onSelect,
  onDelete,
}: TasbeehRailProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <p className="text-[9px] uppercase tracking-[0.3em] text-gold-muted/60 mb-2 px-1">
        Suggested
      </p>
      <div className="flex grow gap-2 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-thin">
        {tasbeehs.map((t) => {
          const isActive = t.id === activeId;
          const isCustom = !t.isDefault;
          const isInf = t.id === INFINITY_ID;

          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={[
                "snap-start shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 group",
                isActive
                  ? "border-gold/60 bg-gold/10 text-gold"
                  : "border-border/40 bg-card/30 text-muted-foreground hover:border-gold/30 hover:text-foreground",
              ].join(" ")}
            >
              {isInf ? <IconInfinity size={13} aria-hidden /> : null}
              <span className="whitespace-nowrap">
                {isInf ? "Free" : t.transliteration}
              </span>
              {t.target !== null && !isInf && (
                <span className="text-[10px] opacity-60">×{t.target}</span>
              )}
              {isCustom && (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Delete ${t.transliteration}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(t.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      onDelete(t.id);
                    }
                  }}
                  className="ml-0.5 opacity-0 group-hover:opacity-70 group-focus-within:opacity-70 hover:opacity-100! transition-opacity text-destructive"
                >
                  <IconTrash size={11} aria-hidden />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
