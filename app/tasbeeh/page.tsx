import { TasbeehDashboard } from "@/components/tasbeeh/tasbeeh-dashboard";

export const metadata = {
  title: "Tasbeeh — Nur",
  description: "Digital dhikr counter for remembrance.",
};

export default function TasbeehPage() {
  return (
    <main className="surah-glow min-h-screen">
      <TasbeehDashboard />
    </main>
  );
}
