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
        "In the name of Allah, the Entirely Merciful1, the Especially Merciful.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/<sup/)).not.toBeInTheDocument();
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
