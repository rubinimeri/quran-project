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

function renderPlayer() {
  return render(
    <RecitationProvider>
      <CurrentVerse />
      <AudioPlayer chapter="1" versesCount={3} surahName="Al-Fatihah" />
    </RecitationProvider>,
  );
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
  it("shows a loading subtitle until verse audio resolves", async () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    renderPlayer();
    expect(screen.getByText("Loading recitation…")).toBeInTheDocument();
    expect(screen.getByLabelText("Play")).toBeDisabled();
  });

  it("labels the first ayah once audio is ready", async () => {
    renderPlayer();
    expect(await screen.findByText("Ayah 1 of 3")).toBeInTheDocument();
    expect(screen.getByLabelText("Play")).toBeEnabled();
  });

  it("publishes the current verse when playback starts", async () => {
    renderPlayer();
    await screen.findByText("Ayah 1 of 3");
    fireEvent.click(screen.getByLabelText("Play"));
    await waitFor(() =>
      expect(screen.getByTestId("current-verse")).toHaveTextContent("1"),
    );
  });

  it("advances to the next ayah with the next button", async () => {
    renderPlayer();
    await screen.findByText("Ayah 1 of 3");
    fireEvent.click(screen.getByLabelText("Next ayah"));
    expect(await screen.findByText("Ayah 2 of 3")).toBeInTheDocument();
    expect(screen.getByTestId("current-verse")).toHaveTextContent("2");
  });

  it("auto-advances to the next ayah when one ends", async () => {
    const { container } = renderPlayer();
    await screen.findByText("Ayah 1 of 3");
    fireEvent.click(screen.getByLabelText("Play"));
    const audio = container.querySelector("audio") as HTMLAudioElement;
    fireEvent(audio, new Event("ended"));
    expect(await screen.findByText("Ayah 2 of 3")).toBeInTheDocument();
  });

  it("disables the previous button on the first ayah", async () => {
    renderPlayer();
    await screen.findByText("Ayah 1 of 3");
    expect(screen.getByLabelText("Previous ayah")).toBeDisabled();
  });
});
