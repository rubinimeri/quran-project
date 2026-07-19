import { Bar } from "@/components/ui/bar";

export function TafsirSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy>
      <Bar className="h-5 w-1/3" />
      <Bar className="h-4 w-full" />
      <Bar className="h-4 w-11/12" />
      <Bar className="h-4 w-full" />
      <Bar className="h-4 w-4/5" />
      <Bar className="mt-3 h-4 w-full" />
      <Bar className="h-4 w-3/4" />
    </div>
  );
}
