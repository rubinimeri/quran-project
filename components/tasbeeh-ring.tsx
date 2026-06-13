const SIZE = 280;
const STROKE = 10;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

type TasbeehRingProps = {
  count: number;
  target: number | null;
  arabic: string;
  transliteration: string;
  rounds: number;
  onIncrement: () => void;
};

export function TasbeehRing({
  count,
  target,
  arabic,
  transliteration,
  rounds,
  onIncrement,
}: TasbeehRingProps) {
  const progress = target !== null ? Math.min(count / target, 1) : 1;
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const isInfinity = target === null;

  return (
    <div className="flex flex-col items-center gap-4">
      {rounds > 0 && (
        <span className="text-[10px] uppercase tracking-[0.3em] text-gold border border-gold/40 rounded-full px-3 py-1">
          Round {rounds + 1}
        </span>
      )}

      <button
        onClick={onIncrement}
        aria-label={`Count ${transliteration}. Current count: ${count}${target !== null ? ` of ${target}` : ""}`}
        className="relative flex items-center justify-center rounded-full transition-transform duration-85 active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 cursor-pointer"
        style={{ width: "min(80vw, 22rem)", height: "min(80vw, 22rem)" }}
      >
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="absolute inset-0 w-full h-full -rotate-90"
          aria-hidden
        >
          {/* Track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="oklch(0.8 0.11 85 / 0.12)"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={
              isInfinity ? "oklch(0.8 0.11 85 / 0.35)" : "oklch(0.8 0.11 85)"
            }
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={isInfinity ? 0 : dashOffset}
            style={{ transition: "stroke-dashoffset 0.2s ease" }}
          />
        </svg>

        {/* Center content */}
        <div className="flex flex-col items-center gap-2 z-10 select-none">
          <span
            className="text-sm text-gold-muted/80"
            style={{ fontFamily: "var(--font-arabic)" }}
            lang="ar"
            dir="rtl"
          >
            {arabic}
          </span>

          <div className="flex items-end gap-1">
            <span className="text-5xl font-light text-foreground leading-none tabular-nums">
              {count}
            </span>
            {target !== null && (
              <span className="text-2xl font-light text-muted-foreground/50 tabular-nums">
                /{target}
              </span>
            )}
          </div>

          <span className="text-xs text-muted-foreground tracking-wide mt-1">
            {transliteration}
          </span>
        </div>
      </button>
    </div>
  );
}
