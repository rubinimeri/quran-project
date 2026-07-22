"use client";

import { IconDownload, IconLoader2, IconCheck } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type DownloadStatus = "idle" | "loading" | "done";

type DownloadAyahButtonProps = {
  surah: number;
  ayah: number;
};

export function DownloadAyahButton({ surah, ayah }: DownloadAyahButtonProps) {
  const [status, setStatus] = useState<DownloadStatus>("idle");
  const { resolvedTheme } = useTheme();

  async function handleDownload() {
    if (status === "loading") return;

    // Match the image to the theme the user is viewing. `resolvedTheme`
    // resolves "system" to the actual light/dark; anything else falls back to
    // the dark card. The value is the query-string cache key for the render.
    const theme = resolvedTheme === "light" ? "light" : "dark";

    setStatus("loading");
    try {
      const res = await fetch(`/api/ayah-image/${surah}/${ayah}?theme=${theme}`);
      if (!res.ok) throw new Error("Failed to download ayah image");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `nur-${surah}-${ayah}-${theme}.png`;
      anchor.click();
      URL.revokeObjectURL(url);

      setStatus("done");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("idle");
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={status === "loading"}
      aria-label="Download this ayah as image"
      variant="ghost"
      size="icon-sm"
      className="rounded-full transition-opacity group-hover:opacity-100 focus-visible:opacity-100 text-muted-foreground hover:bg-gold/10 hover:text-gold"
    >
      {status === "loading" ? (
        <IconLoader2 size={14} className="animate-spin" />
      ) : status === "done" ? (
        <IconCheck size={14} />
      ) : (
        <IconDownload size={14} />
      )}
    </Button>
  );
}
