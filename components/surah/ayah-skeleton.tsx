import { Bar } from "../ui/bar";

export function AyahSkeleton() {
  return (
    <>
      {/* Arabic block — right-aligned, given the most room */}
      <div className="px-4 flex flex-col items-end gap-3">
        <Bar className="h-7 w-3/4" />
        <Bar className="h-7 w-5/6" />
      </div>

      {/* Translation — eyebrow label + lines of varied width */}
      <div className="px-4 flex flex-col gap-3">
        <Bar className="h-3 w-24" />
        <Bar className="h-4 w-full" />
        <Bar className="h-4 w-11/12" />
        <Bar className="h-4 w-2/3" />
      </div>
    </>
  );
}
