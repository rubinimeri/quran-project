import { create } from "zustand";

export type RecitationState = {
  /** Verse number currently being recited, or undefined when stopped. */
  currentVerse: number | undefined;
  setCurrentVerse: (verse: number | undefined) => void;
  /** Verse the player has been asked to start from (tap-an-ayah-to-play). */
  requestedVerse: number | undefined;
  requestVerse: (verse: number | undefined) => void;
};

export const useRecitationStore = create<RecitationState>((set) => ({
  currentVerse: undefined,
  setCurrentVerse: (verse) => set({ currentVerse: verse }),
  requestedVerse: undefined,
  requestVerse: (verse) => set({ requestedVerse: verse }),
}));
