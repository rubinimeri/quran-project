export function playTick(enabled: boolean): void {
  if (!enabled || typeof window === "undefined") return;

  try {
    const AudioCtx =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
    osc.onended = () => void ctx.close();
  } catch {
    // AudioContext unavailable — silently ignore
  }

  try {
    navigator.vibrate?.(8);
  } catch {
    // vibrate unavailable — silently ignore
  }
}
