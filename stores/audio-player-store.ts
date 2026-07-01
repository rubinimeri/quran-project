import { createStore } from "zustand/vanilla";
import { create, type StateCreator } from "zustand";

import { type VerseTiming } from "@/lib/audio";

type AudioPlayerState = {
  // The whole-surah recitation file, or null (per-verse mode / loading / error).
  audioUrl: string | null;
  // Per-verse timings, ordered by verse number. In per-verse mode each carries
  // its own file `audioUrl`.
  verses: VerseTiming[];
  // True when playback is ayah-by-ayah (one file per verse) rather than a single
  // whole-surah file.
  perVerse: boolean;
  // True once a recitation is available; false while loading or on failure.
  ready: boolean;
  loadError: boolean;
  // Index of the verse currently being recited (position in `verses`).
  index: number;
  playing: boolean;
  // True once playback has begun — reveals the player bar.
  started: boolean;
  // Position/length of the currently loaded file, in seconds.
  current: number;
  duration: number;
  loadAudio: (audio: {
    audioUrl: string | null;
    verses: VerseTiming[];
    perVerse: boolean;
  }) => void;
  failAudio: () => void;
  setCurrent: (current: number) => void;
  setDuration: (duration: number) => void;
  // Set by whole-surah playback (position → verse) and by seeking.
  setIndex: (index: number) => void;
  play: () => void;
  pause: () => void;
  // Begin (or restart) playback at a specific verse. The hook drives the element.
  startAt: (index: number) => void;
  // Per-verse mode: advance to the next verse, or reset when the surah ends.
  advance: () => void;
  // Stop playback and return to the hidden pre-playback state.
  stop: () => void;
};

// Shared so the singleton hook store and the vanilla test factory can't drift.
const initializer: StateCreator<AudioPlayerState> = (set, get) => ({
  audioUrl: null,
  verses: [],
  perVerse: false,
  ready: false,
  loadError: false,
  index: 0,
  playing: false,
  started: false,
  current: 0,
  duration: 0,

  loadAudio: ({ audioUrl, verses, perVerse }) =>
    set({
      audioUrl: audioUrl || null,
      verses,
      perVerse,
      ready: verses.length > 0,
      loadError: verses.length === 0,
    }),
  failAudio: () => set({ loadError: true }),
  setCurrent: (current) => set({ current }),
  setDuration: (duration) => set({ duration }),
  setIndex: (index) => set({ index }),
  play: () => set({ started: true, playing: true }),
  pause: () => set({ playing: false }),
  startAt: (index) => set({ started: true, playing: true, index }),

  advance: () => {
    const { index, verses } = get();
    const next = index + 1;
    if (next < verses.length) {
      set({ current: 0, index: next });
    } else {
      set({ playing: false, started: false, current: 0, index: 0 });
    }
  },

  stop: () => set({ playing: false, started: false, current: 0, index: 0 }),
});

export const useAudioPlayerStore = create<AudioPlayerState>(initializer);

export function createAudioPlayerStore() {
  return createStore<AudioPlayerState>(initializer);
}

export type AudioPlayerStore = ReturnType<typeof createAudioPlayerStore>;
