/**
 * @jest-environment node
 */

import { createAudioPlayerStore } from "@/stores/audio-player-store";
import { type VerseTiming } from "@/lib/audio";

function verse(verseNumber: number): VerseTiming {
  return {
    verseNumber,
    startMs: (verseNumber - 1) * 5000,
    endMs: verseNumber * 5000,
    segments: [],
  };
}

const AUDIO = {
  audioUrl: "https://example.com/1.mp3",
  verses: [verse(1), verse(2), verse(3)],
  perVerse: false,
};

describe("createAudioPlayerStore", () => {
  it("starts hidden with nothing loaded", () => {
    const store = createAudioPlayerStore();
    const s = store.getState();
    expect(s.started).toBe(false);
    expect(s.playing).toBe(false);
    expect(s.index).toBe(0);
    expect(s.ready).toBe(false);
    expect(s.audioUrl).toBeNull();
  });

  describe("loadAudio", () => {
    it("marks ready when a file and verses are present", () => {
      const store = createAudioPlayerStore();
      store.getState().loadAudio(AUDIO);
      const s = store.getState();
      expect(s.ready).toBe(true);
      expect(s.loadError).toBe(false);
      expect(s.audioUrl).toBe("https://example.com/1.mp3");
      expect(s.verses).toHaveLength(3);
    });

    it("marks a load error when no verses come back", () => {
      const store = createAudioPlayerStore();
      store.getState().loadAudio({ audioUrl: "", verses: [], perVerse: false });
      const s = store.getState();
      expect(s.ready).toBe(false);
      expect(s.loadError).toBe(true);
      expect(s.audioUrl).toBeNull();
    });

    it("marks ready in per-verse mode with a null whole-surah url", () => {
      const store = createAudioPlayerStore();
      store.getState().loadAudio({
        audioUrl: null,
        verses: [verse(1), verse(2)],
        perVerse: true,
      });
      const s = store.getState();
      expect(s.ready).toBe(true);
      expect(s.perVerse).toBe(true);
      expect(s.audioUrl).toBeNull();
    });
  });

  describe("startAt", () => {
    it("begins playback at the given ayah", () => {
      const store = createAudioPlayerStore();
      store.getState().loadAudio(AUDIO);
      store.getState().startAt(2);
      const s = store.getState();
      expect(s.started).toBe(true);
      expect(s.playing).toBe(true);
      expect(s.index).toBe(2);
    });
  });

  describe("setIndex", () => {
    it("moves the active verse (as whole-surah playback advances)", () => {
      const store = createAudioPlayerStore();
      store.getState().loadAudio(AUDIO);
      store.getState().startAt(0);
      store.getState().setIndex(1);
      expect(store.getState().index).toBe(1);
      expect(store.getState().started).toBe(true);
    });
  });

  describe("advance", () => {
    it("moves to the next verse when one remains (per-verse mode)", () => {
      const store = createAudioPlayerStore();
      store.getState().loadAudio(AUDIO);
      store.getState().startAt(0);
      store.getState().advance();
      expect(store.getState().index).toBe(1);
      expect(store.getState().started).toBe(true);
    });

    it("resets to the hidden state after the final verse", () => {
      const store = createAudioPlayerStore();
      store.getState().loadAudio(AUDIO);
      store.getState().startAt(2);
      store.getState().advance();
      const s = store.getState();
      expect(s.index).toBe(0);
      expect(s.started).toBe(false);
      expect(s.playing).toBe(false);
    });
  });

  describe("stop", () => {
    it("returns to the hidden pre-playback state", () => {
      const store = createAudioPlayerStore();
      store.getState().loadAudio(AUDIO);
      store.getState().startAt(1);
      store.getState().stop();
      const s = store.getState();
      expect(s.started).toBe(false);
      expect(s.playing).toBe(false);
      expect(s.index).toBe(0);
      expect(s.current).toBe(0);
    });
  });
});
