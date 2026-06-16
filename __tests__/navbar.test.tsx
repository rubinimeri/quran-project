/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { Navbar } from "@/components/navbar";

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: jest.fn() }),
}));

describe("Navbar mobile navigation", () => {
  it("does not render the mobile overlay by default", () => {
    render(<Navbar />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the overlay and reveals the destination links when the toggle is pressed", () => {
    render(<Navbar />);
    fireEvent.click(screen.getByLabelText(/toggle menu/i));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("link", { name: "Read" })).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "Salah" })).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "Du'ā" })).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "Tasbeeh" })).toBeInTheDocument();
  });

  it("flips aria-expanded on the toggle when opened", () => {
    render(<Navbar />);
    const toggle = screen.getByLabelText(/toggle menu/i);
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("closes the overlay when Escape is pressed and restores focus to the toggle", () => {
    render(<Navbar />);
    const toggle = screen.getByLabelText(/toggle menu/i);
    fireEvent.click(toggle);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(toggle).toHaveFocus();
  });

  it("closes the overlay when a link inside it is clicked", () => {
    render(<Navbar />);
    fireEvent.click(screen.getByLabelText(/toggle menu/i));
    const dialog = screen.getByRole("dialog");

    fireEvent.click(within(dialog).getByRole("link", { name: "Salah" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
