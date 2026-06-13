"use client";

import { IconCopy, IconCheck } from "@tabler/icons-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type VerseActionsProps = {
  arabic: string;
  translations: string[];
};

export function VerseActions({ arabic, translations }: VerseActionsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = [arabic, ...translations].join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      onClick={handleCopy}
      aria-label="Copy verse"
      variant="ghost"
      size="icon-sm"
      className="left-0 rounded-full transition-opacity group-hover:opacity-100 focus-visible:opacity-100 text-muted-foreground hover:bg-gold/10 hover:text-gold"
    >
      {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
    </Button>
  );
}
