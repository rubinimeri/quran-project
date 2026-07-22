"use client";

import {
  IconCopy,
  IconCheck,
  IconPlayerPlay,
  IconVolume,
} from "@tabler/icons-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DownloadAyahButton } from "./download-ayah-button";

type VerseActionsProps = {
  arabic: string;
  translations: string[];
  chapter?: number;
  verseNumber: number;
  onPlay?: () => void;
  active?: boolean;
};

export function VerseActions({
  arabic,
  translations,
  chapter,
  verseNumber,
  onPlay,
  active = false,
}: VerseActionsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = [arabic, ...translations].join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-1">
      {onPlay && (
        <Button
          onClick={onPlay}
          aria-label={active ? "Now playing this ayah" : "Play this ayah"}
          variant="ghost"
          size="icon-sm"
          className={cn(
            "rounded-full transition-opacity focus-visible:opacity-100 hover:bg-gold/10 hover:text-gold",
            active
              ? "text-gold opacity-100"
              : "text-muted-foreground group-hover:opacity-100",
          )}
        >
          {active ? <IconVolume size={14} /> : <IconPlayerPlay size={14} />}
        </Button>
      )}

      <Button
        onClick={handleCopy}
        aria-label="Copy verse"
        variant="ghost"
        size="icon-sm"
        className="left-0 rounded-full transition-opacity group-hover:opacity-100 focus-visible:opacity-100 text-muted-foreground hover:bg-gold/10 hover:text-gold"
      >
        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
      </Button>

      {chapter && (
        <DownloadAyahButton surah={chapter} ayah={verseNumber} />
      )}
    </div>
  );
}
