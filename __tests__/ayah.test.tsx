/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Ayah } from "@/components/ayah";
import { useAudioPlayerStore } from "@/stores/audio-player-store";

const mockTranslations = [
  {
    text: 'In the name of Allah, the Entirely Merciful<sup foot_note="1">1</sup>, the Especially Merciful.',
    resourceName: "Saheeh International",
  },
  {
    text: "In the name of God, the Most Gracious, the Most Merciful.",
    resourceName: "Mustafa Khattab",
  },
];

// Word-by-word data: each word carries its CDN audio path and translation,
// which drive the click-to-play and click-to-show-tooltip behaviour.
const mockWords = [
  {
    position: 1,
    textQpcHafs: "بِسْمِ",
    audioUrl: "wbw/001_001_001.mp3",
    translation: { text: "In (the) name" },
  },
  {
    position: 2,
    textQpcHafs: "ٱللَّهِ",
    audioUrl: "wbw/001_001_002.mp3",
    translation: { text: "(of) Allah" },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
] as any;

// jsdom implements neither HTMLMediaElement.play nor ResizeObserver; the
// former backs word audio, the latter is instantiated by the Base UI tooltip.
const playMock = jest.fn(() => Promise.resolve());

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  global.ResizeObserver =
    ResizeObserverStub as unknown as typeof ResizeObserver;
  Object.defineProperty(window.HTMLMediaElement.prototype, "play", {
    configurable: true,
    writable: true,
    value: playMock,
  });
});

beforeEach(() => {
  playMock.mockClear();
});

afterEach(() => {
  // Reset the shared playback position so highlight tests don't leak.
  useAudioPlayerStore.setState({ current: 0 });
});

describe("Ayah", () => {
  it("renders the verse number", () => {
    render(
      <Ayah
        verseNumber={1}
        textQpcHafs="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
        translations={mockTranslations}
      />,
    );
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders the Arabic text", () => {
    render(
      <Ayah
        verseNumber={1}
        textQpcHafs="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
        translations={mockTranslations}
      />,
    );
    expect(
      screen.getByText("بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"),
    ).toBeInTheDocument();
  });

  it("renders both translation source labels", () => {
    render(
      <Ayah
        verseNumber={1}
        textQpcHafs="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
        translations={mockTranslations}
      />,
    );
    expect(screen.getByText("Saheeh International")).toBeInTheDocument();
    expect(screen.getByText("Mustafa Khattab")).toBeInTheDocument();
  });

  it("strips HTML tags from translation text", () => {
    render(
      <Ayah
        verseNumber={1}
        textQpcHafs="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
        translations={mockTranslations}
      />,
    );
    expect(
      screen.getByText(
        "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/<sup/)).not.toBeInTheDocument();
  });

  it("renders the Arabic verse text in the Quran (QPC HAFS) font", () => {
    render(
      <Ayah
        verseNumber={1}
        textQpcHafs="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
        translations={mockTranslations}
      />,
    );
    const arabic = screen.getByText("بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ");
    expect(arabic.style.fontFamily).toContain("--font-quran");
  });

  it("marks the active (currently reciting) verse", () => {
    const { container } = render(
      <Ayah
        verseNumber={1}
        textQpcHafs="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
        translations={mockTranslations}
        active
      />,
    );
    const article = container.querySelector("article");
    expect(article).toHaveClass("verse-active");
    expect(article).toHaveAttribute("aria-current", "true");
  });

  it("fires onOpenTafsir when the Tafsirs button is clicked", () => {
    const onOpenTafsir = jest.fn();
    render(
      <Ayah
        verseNumber={1}
        textQpcHafs="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
        translations={mockTranslations}
        onOpenTafsir={onOpenTafsir}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /tafsir/i }));
    expect(onOpenTafsir).toHaveBeenCalledTimes(1);
  });

  it("keeps the verse actions and marks the tafsir trigger active in the dialog header", () => {
    render(
      <Ayah
        asHeader
        verseNumber={1}
        textQpcHafs="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
        translations={mockTranslations}
        onPlay={jest.fn()}
      />,
    );
    // The tafsir trigger is still present, but flagged as the active source.
    const tafsirButton = screen.getByRole("button", { name: /tafsir/i });
    expect(tafsirButton).toHaveAttribute("aria-pressed", "true");
    // Full verse actions remain available at the top.
    expect(
      screen.getByRole("button", { name: /copy verse/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /play this ayah/i }),
    ).toBeInTheDocument();
  });

  it("never highlights the dialog header, even when the verse is playing", () => {
    const { container } = render(
      <Ayah
        asHeader
        active
        verseNumber={1}
        textQpcHafs="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
        translations={mockTranslations}
        onPlay={jest.fn()}
      />,
    );
    const article = container.querySelector("article");
    expect(article).not.toHaveClass("verse-active");
    expect(article).not.toHaveAttribute("aria-current");
  });

  it("renders word-by-word Arabic when words are provided", () => {
    render(
      <Ayah
        verseNumber={1}
        words={[
          { position: 1, textQpcHafs: "بِسْمِ", translation: { text: "In (the) name" } },
          { position: 2, textQpcHafs: "ٱللَّهِ", translation: { text: "(of) Allah" } },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ] as any}
        translations={mockTranslations}
      />,
    );
    expect(screen.getByText(/بِسْمِ/)).toBeInTheDocument();
    expect(screen.getByText(/ٱللَّهِ/)).toBeInTheDocument();
  });

  it("plays the clicked word's audio from the CDN", async () => {
    render(
      <Ayah verseNumber={1} words={mockWords} translations={mockTranslations} />,
    );

    fireEvent.click(screen.getByText(/بِسْمِ/));

    await waitFor(() => expect(playMock).toHaveBeenCalledTimes(1));
    const played = playMock.mock.instances[0] as unknown as HTMLAudioElement;
    expect(played.src).toBe("https://audio.qurancdn.com/wbw/001_001_001.mp3");
  });

  it("shows the word translation in a tooltip only after the word is clicked", async () => {
    render(
      <Ayah verseNumber={1} words={mockWords} translations={mockTranslations} />,
    );

    // Closed by default — the translation is not in the document.
    expect(screen.queryByText("In (the) name")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText(/بِسْمِ/));

    expect(await screen.findByText("In (the) name")).toBeInTheDocument();
  });

  it("does not open the translation tooltip on hover", () => {
    render(
      <Ayah verseNumber={1} words={mockWords} translations={mockTranslations} />,
    );

    const word = screen.getByText(/بِسْمِ/);
    fireEvent.pointerEnter(word);
    fireEvent.mouseOver(word);

    expect(screen.queryByText("In (the) name")).not.toBeInTheDocument();
  });

  it("highlights the reciting word by segment word-number, not array index", () => {
    // Word 2 has no timing segment (e.g. it shares one with another word).
    // The segment for word 3 must still highlight word 3 — not word 2.
    const words = [
      { position: 1, textQpcHafs: "WORD_ONE" },
      { position: 2, textQpcHafs: "WORD_TWO" },
      { position: 3, textQpcHafs: "WORD_THREE" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any;
    // [segmentOrdinal, wordNumber, startMs, endMs] — note word 2 is skipped.
    const segments = [
      [0, 1, 0, 1000],
      [1, 3, 1000, 2000],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any;

    // 1.5s -> 1500ms, inside word 3's [1000, 2000] window.
    useAudioPlayerStore.setState({ current: 1.5 });

    render(
      <Ayah
        verseNumber={1}
        active
        words={words}
        segments={segments}
        translations={mockTranslations}
      />,
    );

    expect(screen.getByText("WORD_THREE")).toHaveClass("text-gold");
    expect(screen.getByText("WORD_TWO")).not.toHaveClass("text-gold");
  });

  it("renders the second translation text", () => {
    render(
      <Ayah
        verseNumber={1}
        textQpcHafs="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
        translations={mockTranslations}
      />,
    );
    expect(
      screen.getByText(
        "In the name of God, the Most Gracious, the Most Merciful.",
      ),
    ).toBeInTheDocument();
  });
});
