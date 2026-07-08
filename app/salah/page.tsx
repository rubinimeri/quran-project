import { SalahDashboard } from "@/components/salah/salah-dashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Salah — Nur",
  description: "Daily prayer times based on your location.",
};

export default function SalahPage() {
  return (
    <main className="surah-glow min-h-screen">
      <SalahDashboard />
    </main>
  );
}
