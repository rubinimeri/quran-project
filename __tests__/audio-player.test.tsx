/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { AudioPlayer } from "@/components/surah/audio-player";
import { useRecitationStore } from "@/stores/recitation-store";
import { useAudioPlayerStore } from "@/stores/audio-player-store";
import { fetchChapterAudio } from "../lib/audio";

// Keep the real pure helpers (verseIndexAt, CHAPTER_RECITER_ID); stub the fetch.
jest.mock("../lib/audio", () => ({
  ...jest.requireActual("../lib/audio"),
  fetchChapterAudio: jest.fn(),
}));

const mockFetch = fetchChapterAudio as jest.Mock;

const CHAPTER_AUDIO = {
  audioUrl: "https://example.com/1.mp3",
  perVerse: false,
  verses: [
    { verseNumber: 1, startMs: 0, endMs: 5000, segments: [] },
    { verseNumber: 2, startMs: 5000, endMs: 10000, segments: [] },
    { verseNumber: 3, startMs: 10000, endMs: 15000, segments: [] },
  ],
};

function CurrentVerse() {
  const currentVerse = useRecitationStore((s) => s.currentVerse);
  return <div data-testid="current-verse">{currentVerse ?? "none"}</div>;
}

// Mimics tapping an ayah's play button, which is what reveals the player.
function PlayVerseButton({ verse = 1 }: { verse?: number }) {
  const requestVerse = useRecitationStore((s) => s.requestVerse);
  return <button onClick={() => requestVerse(verse)}>play-verse</button>;
}

function renderPlayer() {
  return render(
    <>
      <CurrentVerse />
      <PlayVerseButton />
      <AudioPlayer chapter="1" versesCount={3} surahName="Al-Fatihah" />
    </>,
  );
}

// Reveal the player by requesting a verse, then wait for the bar to appear.
async function startPlayback() {
  fireEvent.click(screen.getByText("play-verse"));
  return screen.findByLabelText("Pause");
}

beforeAll(() => {
  // jsdom does not implement media playback.
  window.HTMLMediaElement.prototype.play = jest
    .fn()
    .mockResolvedValue(undefined);
  window.HTMLMediaElement.prototype.pause = jest.fn();
});

beforeEach(() => {
  mockFetch.mockResolvedValue(CHAPTER_AUDIO);
  // The stores are singletons; reset shared state between tests.
  useRecitationStore.setState({
    currentVerse: undefined,
    requestedVerse: undefined,
  });
  useAudioPlayerStore.setState({
    started: false,
    playing: false,
    index: 0,
    current: 0,
  });
});

describe("AudioPlayer", () => {
  it("stays hidden until a verse is played", async () => {
    renderPlayer();
    // Let the audio load; the bar must still be hidden with nothing playing.
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    expect(screen.queryByLabelText("Play")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Pause")).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("Stop and close player"),
    ).not.toBeInTheDocument();
  });

  it("appears and publishes the current verse once a verse is played", async () => {
    renderPlayer();
    await startPlayback();
    expect(screen.getByText("Ayah 1 of 3")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByTestId("current-verse")).toHaveTextContent("1"),
    );
  });

  it("jumps to the next ayah with the next button", async () => {
    renderPlayer();
    await startPlayback();
    fireEvent.click(screen.getByLabelText("Next ayah"));
    expect(await screen.findByText("Ayah 2 of 3")).toBeInTheDocument();
    expect(screen.getByTestId("current-verse")).toHaveTextContent("2");
  });

  it("hides the player when the surah ends", async () => {
    const { container } = renderPlayer();
    await startPlayback();
    const audio = container.querySelector("audio") as HTMLAudioElement;
    fireEvent(audio, new Event("ended"));
    await waitFor(() =>
      expect(screen.queryByLabelText("Pause")).not.toBeInTheDocument(),
    );
    expect(screen.getByTestId("current-verse")).toHaveTextContent("none");
  });

  it("disables the previous button on the first ayah", async () => {
    renderPlayer();
    await startPlayback();
    expect(screen.getByLabelText("Previous ayah")).toBeDisabled();
  });

  it("resumes playback after releasing the seek slider while playing", async () => {
    const { container } = renderPlayer();
    await startPlayback();
    const play = window.HTMLMediaElement.prototype.play as jest.Mock;
    // `handleSeek` pauses the element while scrubbing; only the release should
    // resume it. Clear prior calls so we assert on the release alone.
    play.mockClear();
    const slider = container.querySelector(
      '[data-slot="slider"]',
    ) as HTMLElement;
    fireEvent.pointerUp(slider);
    expect(play).toHaveBeenCalled();
    // Player stays visible/playing (not stuck).
    expect(screen.getByLabelText("Pause")).toBeInTheDocument();
  });

  it("hides the player and clears the verse when closed", async () => {
    renderPlayer();
    await startPlayback();
    fireEvent.click(screen.getByLabelText("Stop and close player"));
    await waitFor(() =>
      expect(screen.queryByLabelText("Pause")).not.toBeInTheDocument(),
    );
    expect(screen.queryByLabelText("Play")).not.toBeInTheDocument();
    expect(screen.getByTestId("current-verse")).toHaveTextContent("none");
  });
});

// Ayah-by-ayah reciters (e.g. Minshawi Mujawwad): one file per verse, so a
// verse ending advances to the next instead of stopping the surah.
const PER_VERSE_AUDIO = {
  audioUrl: null,
  perVerse: true,
  verses: [
    { verseNumber: 1, startMs: 0, endMs: 0, segments: [], audioUrl: "https://example.com/v1.mp3" },
    { verseNumber: 2, startMs: 0, endMs: 0, segments: [], audioUrl: "https://example.com/v2.mp3" },
    { verseNumber: 3, startMs: 0, endMs: 0, segments: [], audioUrl: "https://example.com/v3.mp3" },
  ],
};

describe("AudioPlayer (per-verse mode)", () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue(PER_VERSE_AUDIO);
  });

  it("advances to the next ayah when a verse ends", async () => {
    const { container } = renderPlayer();
    await startPlayback();
    expect(screen.getByText("Ayah 1 of 3")).toBeInTheDocument();
    const audio = container.querySelector("audio") as HTMLAudioElement;
    fireEvent(audio, new Event("ended"));
    expect(await screen.findByText("Ayah 2 of 3")).toBeInTheDocument();
    expect(screen.getByTestId("current-verse")).toHaveTextContent("2");
  });
});
