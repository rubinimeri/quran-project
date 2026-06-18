/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "@/components/theme-toggle";

const mockSetTheme = jest.fn();
let mockResolvedTheme = "dark";

jest.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: mockResolvedTheme,
    setTheme: mockSetTheme,
  }),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
    mockResolvedTheme = "dark";
  });

  it("renders a button", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("has an accessible label to switch to light when theme is dark", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: /switch to light/i })).toBeInTheDocument();
  });

  it("has an accessible label to switch to dark when theme is light", () => {
    mockResolvedTheme = "light";
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: /switch to dark/i })).toBeInTheDocument();
  });

  it("calls setTheme with 'light' when current theme is dark", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("calls setTheme with 'dark' when current theme is light", () => {
    mockResolvedTheme = "light";
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });
});
