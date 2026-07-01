import { create } from "zustand";
import { persist } from "zustand/middleware";

import { CHAPTER_RECITER_ID } from "@/lib/audio";

export type ReciterState = {
  /** Chapter-reciter id of the chosen reciter. */
  recitationId: string;
  setRecitationId: (id: string) => void;
};

/**
 * Persisted so the chosen reciter carries across chapters and page reloads.
 * Kept separate from the transient verse-highlight state in `recitation-store`.
 */
export const useReciterStore = create<ReciterState>()(
  persist(
    (set) => ({
      recitationId: CHAPTER_RECITER_ID,
      setRecitationId: (id) => set({ recitationId: id }),
    }),
    { name: "nur-reciter" },
  ),
);
