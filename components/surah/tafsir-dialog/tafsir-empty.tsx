type TafsirEmptyProps = {
  sourceName: string;
};

export function TafsirEmpty({ sourceName }: TafsirEmptyProps) {
  return (
    <p className="py-10 text-center text-sm text-muted-foreground">
      No commentary available for this verse in {sourceName}.
    </p>
  );
}
