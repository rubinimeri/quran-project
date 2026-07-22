import { useState } from "react";
import {
  TooltipContent,
  Tooltip,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function WordSpan({
  text,
  textTranslation,
  highlighted = false,
  handleWordClick,
}: {
  text?: string;
  textTranslation?: string;
  highlighted?: boolean;
  handleWordClick?: () => void;
}) {
  // Controlled so the tooltip opens only on click. Hover/focus opens are
  // ignored (we drop `open === true` from onOpenChange), while pointer-leave
  // and Escape still close it.
  const [open, setOpen] = useState(false);

  // Highlight-only words (shown while a verse is being recited) are not
  // interactive — render plain text so they aren't focusable or announced
  // as controls.
  if (!handleWordClick) {
    return (
      <span className={cn(highlighted && "text-gold")}>
        {text + " "}
      </span>
    );
  }

  return (
    <Tooltip open={open} onOpenChange={(next) => next || setOpen(false)}>
      <TooltipTrigger
        onClick={(e) => {
          handleWordClick();
          setOpen(true);
          e.currentTarget.focus();
        }}
        className={cn(
          "cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus:text-gold active:text-gold",
          highlighted ? "text-gold" : "hover:text-gold",
        )}
      >
        {text}
        &nbsp;
      </TooltipTrigger>
      <TooltipContent>{textTranslation}</TooltipContent>
    </Tooltip>
  );
}
