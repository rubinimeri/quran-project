import { create } from "zustand";

export type NavVisibilityState = {
  /** True when the auto-hiding navbar is scrolled off-screen. */
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
};

/**
 * Transient (not persisted) visibility flag shared between the navbar — which
 * writes it from its scroll handler — and the surah reading toolbar, which reads
 * it to rise to the top when the navbar hides. A zustand setter (rather than a
 * component `useState` dispatcher) also lets the navbar update it from inside an
 * effect without tripping the `react-hooks/set-state-in-effect` rule.
 */
export const useNavVisibilityStore = create<NavVisibilityState>((set) => ({
  hidden: false,
  setHidden: (hidden) => set({ hidden }),
}));
