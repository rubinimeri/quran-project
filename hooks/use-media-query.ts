"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * SSR-safe media-query subscription. Returns `false` on the server and the
 * initial client render (keeping hydration in sync), then the live match once
 * mounted — without setState-in-effect. Mirrors the mount-gate pattern in
 * `ayah-list`.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
