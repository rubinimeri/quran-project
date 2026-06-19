/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { AudioPlayer } from "@/components/audio-player";
import {
  RecitationProvider,
  useRecitation,
} from "@/components/recitation-context";
import { fetchVerseAudio } from "../lib/audio";

jest.mock("../lib/audio", () => ({
  RECITATION_ID: "7",
  fetchVerseAudio: jest.fn(),
}));

const mockFetch = fetchVerseAudio as jest.Mock;

const AUDIO_FILES = [
  { verseNumber: 1, audioUrl: "https://example.com/1.mp3" },
  { verseNumber: 2, audioUrl: "https://example.com/2.mp3" },
  { verseNumber: 3, audioUrl: "https://example.com/3.mp3" },
];

function CurrentVerse() {
  const { currentVerse } = useRecitation();
  return <div data-testid="current-verse">{currentVerse ?? "none"}</div>;
}

// Mimics tapping an ayah's play button, which is what reveals the player.
function PlayVerseButton({ verse = 1 }: { verse?: number }) {
  const { requestVerse } = useRecitation();
  return <button onClick={() => requestVerse(verse)}>play-verse</button>;
}

function renderPlayer() {
  return render(
    <RecitationProvider>
      <CurrentVerse />
      <PlayVerseButton />
      <AudioPlayer chapter="1" versesCount={3} surahName="Al-Fatihah" />
    </RecitationProvider>,
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
  mockFetch.mockResolvedValue(AUDIO_FILES);
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

  it("advances to the next ayah with the next button", async () => {
    renderPlayer();
    await startPlayback();
    fireEvent.click(screen.getByLabelText("Next ayah"));
    expect(await screen.findByText("Ayah 2 of 3")).toBeInTheDocument();
    expect(screen.getByTestId("current-verse")).toHaveTextContent("2");
  });

  it("auto-advances to the next ayah when one ends", async () => {
    const { container } = renderPlayer();
    await startPlayback();
    const audio = container.querySelector("audio") as HTMLAudioElement;
    fireEvent(audio, new Event("ended"));
    expect(await screen.findByText("Ayah 2 of 3")).toBeInTheDocument();
  });

  it("disables the previous button on the first ayah", async () => {
    renderPlayer();
    await startPlayback();
    expect(screen.getByLabelText("Previous ayah")).toBeDisabled();
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
