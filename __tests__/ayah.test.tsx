/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { Ayah } from "@/components/ayah";

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

describe("Ayah", () => {
  it("renders the verse number", () => {
    render(
      <Ayah
        verseNumber={1}
        textUthmani="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
        translations={mockTranslations}
      />,
    );
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders the Arabic text", () => {
    render(
      <Ayah
        verseNumber={1}
        textUthmani="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
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
        textUthmani="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
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
        textUthmani="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
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
        textUthmani="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
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
        textUthmani="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
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
        textUthmani="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
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
        textUthmani="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
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
        textUthmani="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
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
          { position: 1, textUthmani: "بِسْمِ" },
          { position: 2, textUthmani: "ٱللَّهِ" },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ] as any}
        translations={mockTranslations}
      />,
    );
    expect(screen.getByText(/بِسْمِ/)).toBeInTheDocument();
    expect(screen.getByText(/ٱللَّهِ/)).toBeInTheDocument();
  });

  it("renders the second translation text", () => {
    render(
      <Ayah
        verseNumber={1}
        textUthmani="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
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
