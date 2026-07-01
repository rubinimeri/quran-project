export function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, "").replace(/[0-9]/g, "");
}

/**
 * Format a duration in seconds as `H:MM:SS` once it reaches an hour (whole-surah
 * recitations run well past 60 minutes), otherwise `M:SS`.
 */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = s.toString().padStart(2, "0");
  return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}
