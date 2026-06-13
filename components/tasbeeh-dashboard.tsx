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
import { AddTasbeehDialog } from "@/components/add-tasbeeh-dialog";
import { TasbeehControls } from "@/components/tasbeeh-controls";
import { TasbeehRail } from "@/components/tasbeeh-rail";
import { TasbeehRing } from "@/components/tasbeeh-ring";

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
    <div className="flex flex-col items-center min-h-screen px-4 pt-12 pb-10 gap-8">
      {/* Header */}
      <div className="w-full max-w-md mx-auto text-center relative">
        <p className="text-[9px] uppercase tracking-[0.3em] text-gold-muted mb-1">
          Remembrance
        </p>
        <div className="flex items-center justify-center gap-3">
          <h1
            className="text-4xl font-light text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Tasbeeh
          </h1>
          <span
            className="text-xl text-gold-muted/70 leading-none mt-1"
            style={{ fontFamily: "var(--font-arabic)" }}
            lang="ar"
          >
            تَسْبِيح
          </span>
        </div>
        <div className="flex items-center justify-center gap-3 mt-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/20" />
          <span className="text-gold/50 text-xs">❖</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/20" />
        </div>

        {/* Add button — top right */}
        <div className="absolute right-0 top-0">
          <AddTasbeehDialog onAdd={handleAdd} />
        </div>
      </div>

      {/* Rail */}
      <TasbeehRail
        tasbeehs={state.tasbeehs}
        activeId={state.activeId}
        onSelect={handleSelect}
        onDelete={handleDelete}
      />

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
