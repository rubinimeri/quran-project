"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type RecitationContextValue = {
  /** Verse number currently being recited, or undefined when stopped. */
  currentVerse: number | undefined;
  setCurrentVerse: (verse: number | undefined) => void;
  /** Verse the player has been asked to start from (tap-an-ayah-to-play). */
  requestedVerse: number | undefined;
  requestVerse: (verse: number | undefined) => void;
};

const RecitationContext = createContext<RecitationContextValue | null>(null);

export function RecitationProvider({ children }: { children: ReactNode }) {
  const [currentVerse, setCurrentVerse] = useState<number | undefined>();
  const [requestedVerse, requestVerse] = useState<number | undefined>();

  const value = useMemo(
    () => ({ currentVerse, setCurrentVerse, requestedVerse, requestVerse }),
    [currentVerse, requestedVerse],
  );

  return (
    <RecitationContext.Provider value={value}>
      {children}
    </RecitationContext.Provider>
  );
}

export function useRecitation(): RecitationContextValue {
  const context = useContext(RecitationContext);
  if (!context) {
    throw new Error("useRecitation must be used within a RecitationProvider");
  }
  return context;
}
