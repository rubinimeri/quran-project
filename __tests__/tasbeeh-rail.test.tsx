/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { TasbeehRail } from "@/components/tasbeeh-rail";
import type { Tasbeeh } from "@/lib/tasbeeh";

const defaultTasbeeh: Tasbeeh = {
  id: "subhanallah",
  arabic: "سُبْحَانَ اللَّهِ",
  transliteration: "SubhanAllah",
  target: 33,
  isDefault: true,
};

const customTasbeeh: Tasbeeh = {
  id: "custom-1",
  arabic: "لا إله إلا الله",
  transliteration: "La ilaha illallah",
  target: 100,
};

describe("TasbeehRail mobile delete", () => {
  it("does not hide the delete control behind opacity-0 (touch devices have no hover)", () => {
    render(
      <TasbeehRail
        tasbeehs={[defaultTasbeeh, customTasbeeh]}
        activeId={defaultTasbeeh.id}
        onSelect={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    const deleteButton = screen.getByLabelText(`Delete ${customTasbeeh.transliteration}`);
    expect(deleteButton.className).not.toMatch(/\bopacity-0\b/);
  });

  it("renders no delete control for default tasbeehs", () => {
    render(
      <TasbeehRail
        tasbeehs={[defaultTasbeeh, customTasbeeh]}
        activeId={defaultTasbeeh.id}
        onSelect={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(
      screen.queryByLabelText(`Delete ${defaultTasbeeh.transliteration}`),
    ).not.toBeInTheDocument();
  });

  it("calls onDelete with the tasbeeh id and does not trigger onSelect", () => {
    const onSelect = jest.fn();
    const onDelete = jest.fn();

    render(
      <TasbeehRail
        tasbeehs={[defaultTasbeeh, customTasbeeh]}
        activeId={defaultTasbeeh.id}
        onSelect={onSelect}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByLabelText(`Delete ${customTasbeeh.transliteration}`));

    expect(onDelete).toHaveBeenCalledWith(customTasbeeh.id);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
