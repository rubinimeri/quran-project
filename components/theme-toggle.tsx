"use client";

import { useTheme } from "next-themes";
import { IconSun, IconMoon } from "@tabler/icons-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="w-8 h-8 flex items-center justify-center text-muted-foreground/70 hover:text-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-full motion-safe:transition-colors"
    >
      {isDark ? <IconSun size={18} aria-hidden /> : <IconMoon size={18} aria-hidden />}
    </button>
  );
}
