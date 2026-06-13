"use client";

import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";

import { createTasbeeh, type Tasbeeh } from "@/lib/tasbeeh";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

type AddTasbeehDialogProps = {
  onAdd: (tasbeeh: Tasbeeh) => void;
};

export function AddTasbeehDialog({ onAdd }: AddTasbeehDialogProps) {
  const [open, setOpen] = useState(false);
  const [arabic, setArabic] = useState("");
  const [transliteration, setTransliteration] = useState("");
  const [targetRaw, setTargetRaw] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!arabic.trim() || !transliteration.trim()) return;

    const targetNum = parseInt(targetRaw, 10);
    const target = !targetRaw.trim() || isNaN(targetNum) || targetNum <= 0 ? null : targetNum;

    const tasbeeh = createTasbeeh({ arabic, transliteration, target });
    onAdd(tasbeeh);
    setArabic("");
    setTransliteration("");
    setTargetRaw("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Add new tasbeeh" />
        }
      >
        <IconPlus size={16} />
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle
            className="text-xl font-light"
            style={{ fontFamily: "var(--font-display)" }}
          >
            New Tasbeeh
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field>
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground" htmlFor="tasbeeh-arabic">
              Arabic
            </label>
            <Input
              id="tasbeeh-arabic"
              value={arabic}
              onChange={(e) => setArabic(e.target.value)}
              placeholder="اللَّهُ أَكْبَرُ"
              dir="rtl"
              lang="ar"
              style={{ fontFamily: "var(--font-arabic)", fontSize: "1.1rem" }}
              required
              autoComplete="off"
            />
          </Field>

          <Field>
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground" htmlFor="tasbeeh-translit">
              Transliteration
            </label>
            <Input
              id="tasbeeh-translit"
              value={transliteration}
              onChange={(e) => setTransliteration(e.target.value)}
              placeholder="Allahu Akbar"
              required
              autoComplete="off"
            />
          </Field>

          <Field>
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground" htmlFor="tasbeeh-target">
              Repetitions{" "}
              <span className="normal-case text-muted-foreground/60">(leave blank for ∞)</span>
            </label>
            <Input
              id="tasbeeh-target"
              type="number"
              min={1}
              value={targetRaw}
              onChange={(e) => setTargetRaw(e.target.value)}
              placeholder="33"
              autoComplete="off"
            />
          </Field>

          <DialogFooter className="mt-2">
            <DialogClose>Cancel</DialogClose>
            <Button type="submit" disabled={!arabic.trim() || !transliteration.trim()}>
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
