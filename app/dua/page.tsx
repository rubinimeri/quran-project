import { DuaExplorer } from "@/components/dua/dua-explorer";

export const metadata = {
  title: "Du'ā — Nur",
  description: "A curated collection of authentic Islamic supplications.",
};

export default function DuaPage() {
  return (
    <main className="surah-glow min-h-dvh">
      <DuaExplorer />
    </main>
  );
}
