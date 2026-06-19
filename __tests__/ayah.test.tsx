/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { Ayah } from "@/components/ayah";

const mockTranslations = [
  {
    text: "In the name of Allah, the Entirely Merciful<sup foot_note=\"1\">1</sup>, the Especially Merciful.",
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

  it("defers off-screen rendering of loading skeletons", () => {
    const { container } = render(<Ayah verseNumber={1} loading />);
    expect(container.querySelector("article")).toHaveClass("ayah-cv");
  });

  it("defers off-screen rendering of loaded verses too", () => {
    const { container } = render(
      <Ayah
        verseNumber={1}
        textUthmani="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
        translations={mockTranslations}
      />,
    );
    expect(container.querySelector("article")).toHaveClass("ayah-cv");
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
