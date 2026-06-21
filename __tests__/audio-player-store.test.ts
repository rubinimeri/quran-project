/**
 * @jest-environment node
 */

import { createAudioPlayerStore } from "@/stores/audio-player-store";
import { type VerseAudio } from "@/lib/audio";

function file(verseNumber: number): VerseAudio {
  return {
    verseNumber,
    audioUrl: `https://example.com/${verseNumber}.mp3`,
  } as VerseAudio;
}

describe("createAudioPlayerStore", () => {
  it("starts hidden with nothing loaded", () => {
    const store = createAudioPlayerStore();
    const s = store.getState();
    expect(s.started).toBe(false);
    expect(s.playing).toBe(false);
    expect(s.index).toBe(0);
    expect(s.ready).toBe(false);
  });

  describe("loadAudio", () => {
    it("marks ready when files are present", () => {
      const store = createAudioPlayerStore();
      store.getState().loadAudio([file(1), file(2)]);
      expect(store.getState().ready).toBe(true);
      expect(store.getState().loadError).toBe(false);
      expect(store.getState().audioFiles).toHaveLength(2);
    });

    it("marks a load error when no files come back", () => {
      const store = createAudioPlayerStore();
      store.getState().loadAudio([]);
      expect(store.getState().ready).toBe(false);
      expect(store.getState().loadError).toBe(true);
    });
  });

  describe("startAt", () => {
    it("begins playback at the given ayah", () => {
      const store = createAudioPlayerStore();
      store.getState().loadAudio([file(1), file(2), file(3)]);
      store.getState().startAt(2);
      const s = store.getState();
      expect(s.started).toBe(true);
      expect(s.playing).toBe(true);
      expect(s.index).toBe(2);
      expect(s.current).toBe(0);
    });
  });

  describe("advance", () => {
    it("moves to the next ayah when one remains", () => {
      const store = createAudioPlayerStore();
      store.getState().loadAudio([file(1), file(2), file(3)]);
      store.getState().startAt(0);
      store.getState().advance();
      expect(store.getState().index).toBe(1);
      expect(store.getState().started).toBe(true);
    });

    it("resets to the hidden state after the final ayah", () => {
      const store = createAudioPlayerStore();
      store.getState().loadAudio([file(1), file(2)]);
      store.getState().startAt(1);
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
      store.getState().loadAudio([file(1), file(2)]);
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
