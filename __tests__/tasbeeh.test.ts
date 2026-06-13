import {
  incrementTasbeeh,
  createTasbeeh,
  parseState,
  DEFAULT_STATE,
  DEFAULT_TASBEEHS,
  INFINITY_ID,
} from "@/lib/tasbeeh";

describe("incrementTasbeeh", () => {
  it("increments count normally", () => {
    expect(incrementTasbeeh({ count: 5, rounds: 0, target: 33 })).toEqual({
      count: 6,
      rounds: 0,
    });
  });

  it("loops to 1 and bumps rounds when count reaches target", () => {
    expect(incrementTasbeeh({ count: 33, rounds: 0, target: 33 })).toEqual({
      count: 1,
      rounds: 1,
    });
  });

  it("loops when count exceeds target (defensive)", () => {
    expect(incrementTasbeeh({ count: 34, rounds: 1, target: 33 })).toEqual({
      count: 1,
      rounds: 2,
    });
  });

  it("increments freely with null target (infinity mode)", () => {
    expect(incrementTasbeeh({ count: 999, rounds: 0, target: null })).toEqual({
      count: 1000,
      rounds: 0,
    });
  });

  it("never bumps rounds in infinity mode", () => {
    const result = incrementTasbeeh({ count: 100000, rounds: 5, target: null });
    expect(result.rounds).toBe(5);
  });
});

describe("createTasbeeh", () => {
  it("produces an id", () => {
    const t = createTasbeeh({ arabic: "سُبْحَانَ", transliteration: "SubhanAllah", target: 33 });
    expect(t.id).toBeTruthy();
    expect(typeof t.id).toBe("string");
  });

  it("trims arabic and transliteration", () => {
    const t = createTasbeeh({ arabic: "  سُبْحَانَ  ", transliteration: "  Sub  ", target: 33 });
    expect(t.arabic).toBe("سُبْحَانَ");
    expect(t.transliteration).toBe("Sub");
  });

  it("keeps a positive target", () => {
    const t = createTasbeeh({ arabic: "x", transliteration: "x", target: 100 });
    expect(t.target).toBe(100);
  });

  it("converts 0 target to null (infinity)", () => {
    const t = createTasbeeh({ arabic: "x", transliteration: "x", target: 0 });
    expect(t.target).toBeNull();
  });

  it("converts negative target to null", () => {
    const t = createTasbeeh({ arabic: "x", transliteration: "x", target: -5 });
    expect(t.target).toBeNull();
  });

  it("accepts null target directly", () => {
    const t = createTasbeeh({ arabic: "x", transliteration: "x", target: null });
    expect(t.target).toBeNull();
  });
});

describe("parseState", () => {
  it("returns DEFAULT_STATE when input is null", () => {
    const state = parseState(null);
    expect(state.tasbeehs).toEqual(DEFAULT_STATE.tasbeehs);
    expect(state.activeId).toBe(DEFAULT_STATE.activeId);
  });

  it("returns DEFAULT_STATE on corrupt JSON", () => {
    const state = parseState("not-json{{{");
    expect(state.tasbeehs).toEqual(DEFAULT_STATE.tasbeehs);
  });

  it("always includes all DEFAULT_TASBEEHS even on minimal payload", () => {
    const raw = JSON.stringify({ tasbeehs: [], activeId: INFINITY_ID, counts: {}, rounds: {}, soundEnabled: false });
    const state = parseState(raw);
    for (const dt of DEFAULT_TASBEEHS) {
      expect(state.tasbeehs.some((t) => t.id === dt.id)).toBe(true);
    }
  });

  it("round-trips custom dhikr", () => {
    const custom = createTasbeeh({ arabic: "لا إله إلا الله", transliteration: "La ilaha illallah", target: 100 });
    const original = { ...DEFAULT_STATE, tasbeehs: [...DEFAULT_TASBEEHS, custom] };
    const state = parseState(JSON.stringify(original));
    expect(state.tasbeehs.some((t) => t.id === custom.id)).toBe(true);
  });

  it("round-trips counts and rounds", () => {
    const stored = { ...DEFAULT_STATE, counts: { [INFINITY_ID]: 42 }, rounds: { [INFINITY_ID]: 3 } };
    const state = parseState(JSON.stringify(stored));
    expect(state.counts[INFINITY_ID]).toBe(42);
    expect(state.rounds[INFINITY_ID]).toBe(3);
  });

  it("falls back activeId to first tasbeeh when stored id is invalid", () => {
    const raw = JSON.stringify({ ...DEFAULT_STATE, activeId: "nonexistent-id-xyz" });
    const state = parseState(raw);
    expect(state.tasbeehs.some((t) => t.id === state.activeId)).toBe(true);
  });
});
