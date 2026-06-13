export type Tasbeeh = {
  id: string;
  arabic: string;
  transliteration: string;
  target: number | null;
  isDefault?: boolean;
};

export type TasbeehState = {
  tasbeehs: Tasbeeh[];
  activeId: string;
  counts: Record<string, number>;
  rounds: Record<string, number>;
  soundEnabled: boolean;
};

export const STORAGE_KEY = "nur-tasbeeh-v1";
export const INFINITY_ID = "infinity";

export const DEFAULT_TASBEEHS: Tasbeeh[] = [
  { id: INFINITY_ID, arabic: "∞", transliteration: "Free Count", target: null, isDefault: true },
  { id: "subhanallah", arabic: "سُبْحَانَ اللَّهِ", transliteration: "SubhanAllah", target: 33, isDefault: true },
  { id: "alhamdulillah", arabic: "الْحَمْدُ لِلَّهِ", transliteration: "Alhamdulillah", target: 33, isDefault: true },
  { id: "allahu-akbar", arabic: "اللَّهُ أَكْبَرُ", transliteration: "Allahu Akbar", target: 34, isDefault: true },
  { id: "astaghfirullah", arabic: "أَسْتَغْفِرُ اللَّهَ", transliteration: "Astaghfirullah", target: 100, isDefault: true },
];

export const DEFAULT_STATE: TasbeehState = {
  tasbeehs: DEFAULT_TASBEEHS,
  activeId: INFINITY_ID,
  counts: {},
  rounds: {},
  soundEnabled: true,
};

export function incrementTasbeeh({
  count,
  rounds,
  target,
}: {
  count: number;
  rounds: number;
  target: number | null;
}): { count: number; rounds: number } {
  if (target === null) {
    return { count: count + 1, rounds };
  }
  if (count >= target) {
    return { count: 1, rounds: rounds + 1 };
  }
  return { count: count + 1, rounds };
}

export function createTasbeeh({
  arabic,
  transliteration,
  target,
}: {
  arabic: string;
  transliteration: string;
  target: number | null;
}): Tasbeeh {
  const trimmedArabic = arabic.trim();
  const trimmedTransliteration = transliteration.trim();
  const resolvedTarget = target !== null && target > 0 ? target : null;
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `tasbeeh-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return {
    id,
    arabic: trimmedArabic,
    transliteration: trimmedTransliteration,
    target: resolvedTarget,
  };
}

export function parseState(raw: string | null): TasbeehState {
  if (!raw) return DEFAULT_STATE;

  try {
    const parsed = JSON.parse(raw) as Partial<TasbeehState>;

    const customTasbeehs = Array.isArray(parsed.tasbeehs)
      ? parsed.tasbeehs.filter((t) => !DEFAULT_TASBEEHS.some((dt) => dt.id === t.id))
      : [];

    const tasbeehs = [...DEFAULT_TASBEEHS, ...customTasbeehs];

    const counts = typeof parsed.counts === "object" && parsed.counts !== null ? parsed.counts : {};
    const rounds = typeof parsed.rounds === "object" && parsed.rounds !== null ? parsed.rounds : {};

    const storedActiveId = typeof parsed.activeId === "string" ? parsed.activeId : null;
    const activeId =
      storedActiveId && tasbeehs.some((t) => t.id === storedActiveId)
        ? storedActiveId
        : tasbeehs[0].id;

    return {
      tasbeehs,
      activeId,
      counts,
      rounds,
      soundEnabled: typeof parsed.soundEnabled === "boolean" ? parsed.soundEnabled : true,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function loadState(): TasbeehState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    return parseState(localStorage.getItem(STORAGE_KEY));
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: TasbeehState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded or private browsing — silently ignore
  }
}
