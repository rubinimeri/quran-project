import { createStore } from "zustand/vanilla";

import { type VerseAudio } from "@/lib/audio";

type AudioPlayerState = {
  audioFiles: VerseAudio[];
  // True once recitation files are available; false while loading or on failure.
  ready: boolean;
  loadError: boolean;
  // Index of the ayah currently loaded into the audio element.
  index: number;
  playing: boolean;
  // True once playback has begun — reveals the player bar.
  started: boolean;
  // Position/length of the current ayah's audio, in seconds.
  current: number;
  duration: number;
  loadAudio: (files: VerseAudio[]) => void;
  failAudio: () => void;
  setCurrent: (current: number) => void;
  setDuration: (duration: number) => void;
  play: () => void;
  pause: () => void;
  // Begin (or restart) playback at a specific ayah.
  startAt: (index: number) => void;
  // Move to the next ayah, or reset to the hidden pre-playback state at the end.
  advance: () => void;
  // Stop playback and return to the hidden pre-playback state.
  stop: () => void;
};

export function createAudioPlayerStore() {
  return createStore<AudioPlayerState>((set, get) => ({
    audioFiles: [],
    ready: false,
    loadError: false,
    index: 0,
    playing: false,
    started: false,
    current: 0,
    duration: 0,

    loadAudio: (files) =>
      set({
        audioFiles: files,
        ready: files.length > 0,
        loadError: files.length === 0,
      }),
    failAudio: () => set({ loadError: true }),
    setCurrent: (current) => set({ current }),
    setDuration: (duration) => set({ duration }),
    play: () => set({ started: true, playing: true }),
    pause: () => set({ playing: false }),
    startAt: (index) => set({ started: true, playing: true, current: 0, index }),

    advance: () => {
      const { index, audioFiles } = get();
      const next = index + 1;
      if (next < audioFiles.length) {
        set({ current: 0, index: next });
      } else {
        set({ playing: false, started: false, index: 0 });
      }
    },

    stop: () => set({ playing: false, started: false, current: 0, index: 0 }),
  }));
}

export type AudioPlayerStore = ReturnType<typeof createAudioPlayerStore>;
