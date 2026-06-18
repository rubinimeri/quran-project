"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { IconSun, IconMoon } from "@tabler/icons-react";

const noopSubscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // `false` on the server and during the first client render, `true` after
  // hydration — avoids a theme mismatch without setState-in-effect.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={
        mounted
          ? isDark
            ? "Switch to light theme"
            : "Switch to dark theme"
          : "Toggle theme"
      }
      className="w-8 h-8 flex items-center justify-center text-muted-foreground/70 hover:text-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-full motion-safe:transition-colors"
    >
      {mounted ? (
        isDark ? (
          <IconSun size={18} aria-hidden />
        ) : (
          <IconMoon size={18} aria-hidden />
        )
      ) : (
        <IconSun size={18} aria-hidden />
      )}
    </button>
  );
}
