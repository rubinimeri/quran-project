/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { VirtuosoMockContext } from "react-virtuoso";
import { Verse } from "@quranjs/api";

import { AyahList } from "../components/surah/ayah/ayah-list";
import { fetchVerses } from "../lib/verses";

jest.mock("../lib/verses", () => ({
  ...jest.requireActual("../lib/verses"),
  fetchVerses: jest.fn(),
}));

// Translations load over the network via useTranslations; this list test is
// about skeleton/verse rendering, so stub the hook to keep it fetch-free.
jest.mock("../hooks/use-translations", () => ({
  useTranslations: () => ({
    getVerseTranslations: () => [],
    loadTranslationsPage: () => {},
  }),
}));

const mockFetch = fetchVerses as jest.Mock;

// jsdom has no ResizeObserver; Virtuoso instantiates one even under the mock
// context. A no-op stub is enough since VirtuosoMockContext supplies sizes.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
beforeAll(() => {
  global.ResizeObserver =
    ResizeObserverStub as unknown as typeof ResizeObserver;
});

function verse(verseNumber: number): Verse {
  return {
    verseNumber,
    textQpcHafs: `ARABIC_${verseNumber}`,
    translations: [{ text: `Translation ${verseNumber}`, resourceName: "Test" }],
  } as unknown as Verse;
}

function renderList(props: { startingVerse?: number }) {
  return render(
    <VirtuosoMockContext.Provider value={{ viewportHeight: 800, itemHeight: 400 }}>
      <AyahList
        chapter="2"
        versesCount={286}
        surahName="Al-Baqarah"
        {...props}
      />
    </VirtuosoMockContext.Provider>,
  );
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe("AyahList", () => {
  it("renders skeletons first, then real verses once the page loads", async () => {
    mockFetch.mockResolvedValue([verse(1), verse(2), verse(3)]);

    const { container } = renderList({});

    // Before the fetch resolves, the visible slots are loading skeletons.
    expect(container.querySelector('article[aria-busy="true"]')).not.toBeNull();

    // Once page 1 arrives, the skeleton swaps to the real verse text.
    expect(await screen.findByText("ARABIC_1")).toBeInTheDocument();
  });

  it("loads the page covering the starting verse on mount", async () => {
    mockFetch.mockResolvedValue([]);

    renderList({ startingVerse: 51 });

    // Verse 51 lives on page 2 (50 verses per page).
    await waitFor(() => expect(mockFetch).toHaveBeenCalledWith("2", 2));
  });

  it("does not fetch page 1 from Virtuoso's transient startup range when deep-linking", async () => {
    // Verse 240 lives on page 5. Virtuoso reports a top-anchored range on mount
    // before it jumps to the target; onRangeChanged must ignore it so only the
    // target's page is fetched, not page 1.
    mockFetch.mockResolvedValue([verse(240)]);

    renderList({ startingVerse: 240 });

    await waitFor(() => expect(mockFetch).toHaveBeenCalledWith("2", 5));
    expect(mockFetch).not.toHaveBeenCalledWith("2", 1);
  });
});
