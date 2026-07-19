import { Button } from "@/components/ui/button";

type TafsirErrorProps = {
  onRetry: () => void;
};

export function TafsirError({ onRetry }: TafsirErrorProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <p className="text-sm text-muted-foreground">
        Couldn&rsquo;t load the tafsir.
      </p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
