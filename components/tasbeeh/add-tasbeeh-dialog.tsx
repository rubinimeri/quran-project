"use client";

import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";

import { createTasbeeh, type Tasbeeh } from "@/lib/tasbeeh";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

const MAX_TEXT_LENGTH = 60;
const MAX_TARGET = 99999;

export function AddTasbeehDialog({ onAdd }: AddTasbeehDialogProps) {
  const [open, setOpen] = useState(false);
  const [arabic, setArabic] = useState("");
  const [transliteration, setTransliteration] = useState("");
  const [targetRaw, setTargetRaw] = useState("");

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setArabic("");
      setTransliteration("");
      setTargetRaw("");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!arabic.trim() || !transliteration.trim()) return;

    const targetNum = parseInt(targetRaw, 10);
    const target =
      !targetRaw.trim() ||
      isNaN(targetNum) ||
      targetNum <= 0 ||
      targetNum > MAX_TARGET
        ? null
        : targetNum;

    const tasbeeh = createTasbeeh({ arabic, transliteration, target });
    onAdd(tasbeeh);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <button
            type="button"
            aria-label="Add new tasbeeh"
            className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full border border-border/40 bg-card/30 text-gold-muted transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-gold/30 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 self-start"
          />
        }
      >
        <IconPlus size={16} aria-hidden />
      </DialogTrigger>

      <DialogContent className=" rounded-2xl border border-gold/20 bg-card/95 px-6 py-8 ring-0 shadow-[0_0_20px_var(--glow-sm)]">
        <span
          className="absolute top-4 right-5 text-gold-muted/20 text-2xl select-none"
          aria-hidden
        >
          ❖
        </span>

        <DialogHeader className="gap-2">
          <DialogTitle
            className="text-2xl font-normal pr-6 text-balance"
            style={{ fontFamily: "var(--font-display)" }}
          >
            New Tasbeeh
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            A new dhikr to carry through the day.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* TODO: Make this into a label + input comonent */}
          <Field>
            <label
              className="text-xs font-medium text-muted-foreground"
              htmlFor="tasbeeh-arabic"
            >
              Arabic
            </label>
            <Input
              id="tasbeeh-arabic"
              className="placeholder:text-muted-foreground/70 placeholder:text-sm text-sm rounded-lg"
              value={arabic}
              onChange={(e) => setArabic(e.target.value)}
              placeholder="اللَّهُ أَكْبَرُ"
              dir="rtl"
              lang="ar"
              style={{
                fontFamily: "var(--font-arabic)",
                fontSize: "1.35rem",
                lineHeight: 1.8,
              }}
              required
              autoComplete="off"
              maxLength={MAX_TEXT_LENGTH}
            />
          </Field>

          <Field>
            <label
              className="text-xs font-medium text-muted-foreground"
              htmlFor="tasbeeh-translit"
            >
              Transliteration
            </label>
            <Input
              id="tasbeeh-translit"
              className="rounded-lg placeholder:text-muted-foreground/70"
              value={transliteration}
              onChange={(e) => setTransliteration(e.target.value)}
              placeholder="Allahu Akbar"
              required
              autoComplete="off"
              maxLength={MAX_TEXT_LENGTH}
            />
          </Field>

          <Field>
            <label
              className="text-xs font-medium text-muted-foreground"
              htmlFor="tasbeeh-target"
            >
              Repetitions{" "}
              <span className="normal-case text-muted-foreground/60">
                (leave blank for ∞)
              </span>
            </label>
            <Input
              id="tasbeeh-target"
              type="number"
              className="placeholder:text-muted-foreground/70 rounded-lg tabular-nums [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              min={1}
              max={MAX_TARGET}
              value={targetRaw}
              onChange={(e) => setTargetRaw(e.target.value)}
              placeholder="33"
              autoComplete="off"
            />
          </Field>

          <DialogFooter className="mt-2">
            <DialogClose>Cancel</DialogClose>
            <Button
              type="submit"
              disabled={!arabic.trim() || !transliteration.trim()}
            >
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
