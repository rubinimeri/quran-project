/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useTheme } from "next-themes";
import { DownloadAyahButton } from "@/components/surah/ayah/download-ayah-button";

// The button reads `resolvedTheme` to pick the image palette; mock it so each
// test can drive a known theme.
jest.mock("next-themes", () => ({ useTheme: jest.fn() }));
const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;
function setTheme(resolvedTheme: string | undefined) {
  mockUseTheme.mockReturnValue({
    resolvedTheme,
  } as ReturnType<typeof useTheme>);
}

// jsdom implements neither Blob URLs nor anchor navigation; stub the pieces the
// download handler relies on so we can assert the flow without a real download.
const clickMock = jest.fn();
const createObjectURL = jest.fn(() => "blob:nur");
const revokeObjectURL = jest.fn();

beforeAll(() => {
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: createObjectURL,
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: revokeObjectURL,
  });
  Object.defineProperty(HTMLAnchorElement.prototype, "click", {
    configurable: true,
    value: clickMock,
  });
});

beforeEach(() => {
  clickMock.mockClear();
  createObjectURL.mockClear();
  revokeObjectURL.mockClear();
  setTheme("dark");
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      blob: () => Promise.resolve(new Blob(["png"], { type: "image/png" })),
    }),
  ) as unknown as typeof fetch;
});

describe("DownloadAyahButton", () => {
  it("fetches the ayah image and triggers a download with the right filename", async () => {
    render(<DownloadAyahButton surah={1} ayah={1} />);

    fireEvent.click(
      screen.getByRole("button", { name: /download this ayah as image/i }),
    );

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/ayah-image/1/1?theme=dark",
      ),
    );
    await waitFor(() => expect(clickMock).toHaveBeenCalledTimes(1));

    const anchor = clickMock.mock.instances[0] as HTMLAnchorElement;
    expect(anchor.download).toBe("nur-1-1-dark.png");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:nur");
  });

  it("requests the light image and filename when the theme is light", async () => {
    setTheme("light");
    render(<DownloadAyahButton surah={1} ayah={1} />);

    fireEvent.click(
      screen.getByRole("button", { name: /download this ayah as image/i }),
    );

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/ayah-image/1/1?theme=light",
      ),
    );
    await waitFor(() => expect(clickMock).toHaveBeenCalledTimes(1));

    const anchor = clickMock.mock.instances[0] as HTMLAnchorElement;
    expect(anchor.download).toBe("nur-1-1-light.png");
  });

  it("returns to the idle download icon after a successful download", async () => {
    const { container } = render(<DownloadAyahButton surah={2} ayah={255} />);

    fireEvent.click(
      screen.getByRole("button", { name: /download this ayah as image/i }),
    );

    // The check icon appears on success…
    await waitFor(() =>
      expect(container.querySelector(".tabler-icon-check")).toBeInTheDocument(),
    );
    // …then the button falls back to the download icon.
    await waitFor(
      () =>
        expect(
          container.querySelector(".tabler-icon-download"),
        ).toBeInTheDocument(),
      { timeout: 2500 },
    );
  });
});
