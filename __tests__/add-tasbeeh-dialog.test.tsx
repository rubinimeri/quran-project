/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { AddTasbeehDialog } from "@/components/tasbeeh/add-tasbeeh-dialog";

function openDialog() {
  fireEvent.click(screen.getByLabelText("Add new tasbeeh"));
}

describe("AddTasbeehDialog", () => {
  it("clears the form when cancelled without submitting", () => {
    render(<AddTasbeehDialog onAdd={jest.fn()} />);

    openDialog();
    fireEvent.change(screen.getByLabelText("Arabic"), {
      target: { value: "سُبْحَانَ اللَّهِ" },
    });
    fireEvent.change(screen.getByLabelText("Transliteration"), {
      target: { value: "SubhanAllah" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    openDialog();

    expect(screen.getByLabelText("Arabic")).toHaveValue("");
    expect(screen.getByLabelText("Transliteration")).toHaveValue("");
  });

  it("does not call onAdd when cancelled", () => {
    const onAdd = jest.fn();
    render(<AddTasbeehDialog onAdd={onAdd} />);

    openDialog();
    fireEvent.change(screen.getByLabelText("Arabic"), {
      target: { value: "سُبْحَانَ اللَّهِ" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onAdd).not.toHaveBeenCalled();
  });
});
