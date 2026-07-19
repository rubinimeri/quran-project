import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";

type TafsirFooterProps = {
  verseNumber: number;
  versesCount: number;
  verseKey: string;
  onNavigate: (verseNumber: number) => void;
};

export function TafsirFooter({
  verseNumber,
  versesCount,
  verseKey,
  onNavigate,
}: TafsirFooterProps) {
  return (
    <div className="sticky bottom-0 z-10 mt-auto flex items-center justify-between border-t border-border/40 bg-card/90 px-4 py-3 backdrop-blur-sm">
      <Button
        variant="ghost"
        size="sm"
        aria-label="Previous verse"
        disabled={verseNumber <= 1}
        onClick={() => onNavigate(verseNumber - 1)}
        className="gap-1.5 text-muted-foreground hover:text-gold"
      >
        <IconArrowLeft size={16} />
        Previous
      </Button>

      <span className="font-mono text-xs text-gold/70">{verseKey}</span>

      <Button
        variant="ghost"
        size="sm"
        aria-label="Next verse"
        disabled={verseNumber >= versesCount}
        onClick={() => onNavigate(verseNumber + 1)}
        className="gap-1.5 text-muted-foreground hover:text-gold"
      >
        Next
        <IconArrowRight size={16} />
      </Button>
    </div>
  );
}
