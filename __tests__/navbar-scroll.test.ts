import {
  shouldHideNavbar,
  isSurahPath,
  NAVBAR_TOP_OFFSET,
  NAVBAR_SCROLL_DELTA,
} from "@/lib/navbar-scroll";

describe("shouldHideNavbar", () => {
  it("stays visible near the top regardless of direction", () => {
    expect(
      shouldHideNavbar({ currentY: 0, lastY: 500, wasHidden: true }),
    ).toBe(false);
    expect(
      shouldHideNavbar({
        currentY: NAVBAR_TOP_OFFSET,
        lastY: 0,
        wasHidden: true,
      }),
    ).toBe(false);
  });

  it("hides when scrolling down past the offset", () => {
    expect(
      shouldHideNavbar({
        currentY: NAVBAR_TOP_OFFSET + 200,
        lastY: NAVBAR_TOP_OFFSET + 100,
        wasHidden: false,
      }),
    ).toBe(true);
  });

  it("shows when scrolling up", () => {
    expect(
      shouldHideNavbar({
        currentY: NAVBAR_TOP_OFFSET + 100,
        lastY: NAVBAR_TOP_OFFSET + 200,
        wasHidden: true,
      }),
    ).toBe(false);
  });

  it("preserves the previous state on sub-delta jitter", () => {
    const base = NAVBAR_TOP_OFFSET + 300;
    const jitter = NAVBAR_SCROLL_DELTA - 1;
    expect(
      shouldHideNavbar({
        currentY: base + jitter,
        lastY: base,
        wasHidden: true,
      }),
    ).toBe(true);
    expect(
      shouldHideNavbar({
        currentY: base + jitter,
        lastY: base,
        wasHidden: false,
      }),
    ).toBe(false);
  });
});

describe("isSurahPath", () => {
  it("matches numeric surah routes", () => {
    expect(isSurahPath("/2")).toBe(true);
    expect(isSurahPath("/114")).toBe(true);
  });

  it("rejects non-surah routes", () => {
    expect(isSurahPath("/")).toBe(false);
    expect(isSurahPath("/salah")).toBe(false);
    expect(isSurahPath("/2/x")).toBe(false);
    expect(isSurahPath("/2?startingVerse=3")).toBe(false);
  });
});
