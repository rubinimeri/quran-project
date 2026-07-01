export const NAVBAR_TOP_OFFSET = 80; // always visible near the top
export const NAVBAR_SCROLL_DELTA = 8; // ignore sub-pixel / jitter scrolls

/**
 * Decide whether the auto-hiding navbar should be hidden after a scroll event.
 * Scrolling down hides it, scrolling up reveals it, and it stays visible near
 * the top of the page. Sub-delta jitter preserves the previous state.
 */
export function shouldHideNavbar({
  currentY,
  lastY,
  wasHidden,
}: {
  currentY: number;
  lastY: number;
  wasHidden: boolean;
}): boolean {
  if (currentY <= NAVBAR_TOP_OFFSET) return false; // near top → show
  if (Math.abs(currentY - lastY) < NAVBAR_SCROLL_DELTA) return wasHidden; // jitter → unchanged
  return currentY > lastY; // down → hide, up → show
}

/** True for surah reader routes like `/2` or `/114`. */
export function isSurahPath(pathname: string): boolean {
  return /^\/\d+$/.test(pathname);
}
