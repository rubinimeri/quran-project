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
    <div className="flex-1 min-w-0 flex flex-wrap justify-center items-center gap-1.5 pb-1">
      {tasbeehs.map((t) => {
        const isActive = t.id === activeId;
        const isCustom = !t.isDefault;
        const isInf = t.id === INFINITY_ID;

        return (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={[
              "shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-[0.3rem] text-sm transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 group",
              isActive
                ? "border-gold/50 bg-gold/10 text-gold shadow-[0_0_16px_oklch(0.8_0.11_85/0.12)]"
                : "border-border/40 bg-card/30 text-muted-foreground hover:border-gold/30 hover:text-foreground",
            ].join(" ")}
          >
            {isInf ? <IconInfinity size={13} aria-hidden /> : null}
            <span className="whitespace-nowrap">
              {isInf ? "Free" : t.transliteration}
            </span>
            {t.target !== null && !isInf && (
              <span className="text-[10px] text-gold-muted/70">×{t.target}</span>
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
                className="ml-0.5 p-1 opacity-40 group-hover:opacity-70 group-focus-within:opacity-100 active:opacity-100 hover:opacity-100! transition-opacity text-destructive"
              >
                <IconTrash size={13} aria-hidden />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
