"use client";

import { useEffect, useRef, useState } from "react";

import {
  DEFAULT_STATE,
  INFINITY_ID,
  incrementTasbeeh,
  loadState,
  saveState,
  type Tasbeeh,
  type TasbeehState,
} from "@/lib/tasbeeh";
import { playTick } from "@/lib/tick";
import { Separator } from "@/components/ui/separator";
import { AddTasbeehDialog } from "./add-tasbeeh-dialog";
import { TasbeehControls } from "./tasbeeh-controls";
import { TasbeehRail } from "./tasbeeh-rail";
import { TasbeehRing } from "./tasbeeh-ring";

export function TasbeehDashboard() {
  const [state, setState] = useState<TasbeehState>(DEFAULT_STATE);
  const hasHydrated = useRef(false);

  useEffect(() => {
    const sync = () => setState(loadState());
    window.addEventListener("storage", sync);
    sync();
    hasHydrated.current = true;
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    if (hasHydrated.current) saveState(state);
  }, [state]);

  const active = state.tasbeehs.find((t) => t.id === state.activeId) ?? state.tasbeehs[0];
  const count = state.counts[active.id] ?? 0;
  const rounds = state.rounds[active.id] ?? 0;

  function handleIncrement() {
    playTick(state.soundEnabled);
    const next = incrementTasbeeh({ count, rounds, target: active.target });
    setState((s) => ({
      ...s,
      counts: { ...s.counts, [active.id]: next.count },
      rounds: { ...s.rounds, [active.id]: next.rounds },
    }));
  }

  function handleReset() {
    setState((s) => ({
      ...s,
      counts: { ...s.counts, [active.id]: 0 },
      rounds: { ...s.rounds, [active.id]: 0 },
    }));
  }

  function handleSelect(id: string) {
    setState((s) => ({ ...s, activeId: id }));
  }

  function handleAdd(tasbeeh: Tasbeeh) {
    setState((s) => ({
      ...s,
      tasbeehs: [...s.tasbeehs, tasbeeh],
      activeId: tasbeeh.id,
    }));
  }

  function handleDelete(id: string) {
    setState((s) => {
      const tasbeehs = s.tasbeehs.filter((t) => t.id !== id);
      const activeId = s.activeId === id ? INFINITY_ID : s.activeId;
      return { ...s, tasbeehs, activeId };
    });
  }

  function handleToggleSound() {
    setState((s) => ({ ...s, soundEnabled: !s.soundEnabled }));
  }

  return (
    <div className="flex flex-col items-center min-h-screen px-4 pt-16 pb-10 gap-8">
      {/* Header — Arabic first, the reverent centerpiece (mirrors /dua) */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        <h1
          className="lantern-rise delay-100 text-6xl sm:text-7xl leading-none text-gold font-arabic"
          lang="ar"
          dir="rtl"
        >
          تَسْبِيح
        </h1>

        {/* English name — supporting cluster settles together */}
        <p
          className="mt-6 fade-soft delay-400 text-3xl sm:text-4xl font-light tracking-[0.15em] text-foreground font-display"
        >
          Tasbeeh
        </p>

        {/* Subtitle */}
        <p className="mt-4 fade-soft delay-400 text-sm text-muted-foreground max-w-xs text-center leading-relaxed">
          A quiet space for dhikr — count, remember, and let the heart settle.
        </p>

        {/* Ornamental divider */}
        <div className="mt-6 fade-soft delay-400 flex items-center gap-3 w-full max-w-40">
          <Separator className="flex-1 bg-gold-muted/25" />
          <span className="text-gold-muted/60 text-xs">&#10070;</span>
          <Separator className="flex-1 bg-gold-muted/25" />
        </div>
      </div>

      {/* Rail + Add — the dhikr list, with Add always reachable at its end */}
      <div className="w-full max-w-md mx-auto flex items-center gap-2 fade-soft delay-500">
        <TasbeehRail
          tasbeehs={state.tasbeehs}
          activeId={state.activeId}
          onSelect={handleSelect}
          onDelete={handleDelete}
        />
        <AddTasbeehDialog onAdd={handleAdd} />
      </div>

      {/* Ring */}
      <div className="flex-1 flex items-center justify-center">
        <TasbeehRing
          count={count}
          target={active.target}
          arabic={active.arabic}
          transliteration={active.transliteration}
          rounds={rounds}
          onIncrement={handleIncrement}
        />
      </div>

      {/* Controls */}
      <TasbeehControls
        onReset={handleReset}
        soundEnabled={state.soundEnabled}
        onToggleSound={handleToggleSound}
      />
    </div>
  );
}
