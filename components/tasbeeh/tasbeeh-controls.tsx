import { IconRotate, IconVolume, IconVolumeOff } from "@tabler/icons-react";

type TasbeehControlsProps = {
  onReset: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
};

export function TasbeehControls({ onReset, soundEnabled, onToggleSound }: TasbeehControlsProps) {
  return (
    <div className="flex items-center gap-6 justify-center">
      <button
        onClick={onReset}
        className="flex flex-col items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-lg p-1"
        aria-label="Reset counter"
      >
        <span className="flex items-center justify-center w-10 h-10 rounded-full border border-border/40 bg-card/30 hover:border-gold/30 transition-colors">
          <IconRotate size={18} aria-hidden />
        </span>
        <span className="text-[9px] uppercase tracking-[0.2em]">Reset</span>
      </button>

      <button
        onClick={onToggleSound}
        className="flex flex-col items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-lg p-1"
        aria-label={soundEnabled ? "Disable sound and haptic" : "Enable sound and haptic"}
      >
        <span
          className={[
            "flex items-center justify-center w-10 h-10 rounded-full border transition-colors",
            soundEnabled
              ? "border-gold/40 bg-gold/8 text-gold"
              : "border-border/40 bg-card/30",
          ].join(" ")}
        >
          {soundEnabled ? (
            <IconVolume size={18} aria-hidden />
          ) : (
            <IconVolumeOff size={18} aria-hidden />
          )}
        </span>
        <span className="text-[9px] uppercase tracking-[0.2em]">
          {soundEnabled ? "Sound on" : "Sound off"}
        </span>
      </button>
    </div>
  );
}

