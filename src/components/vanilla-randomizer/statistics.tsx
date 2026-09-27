interface StatisticsProps {
  recipeCount: number;
}

export function Statistics({ recipeCount }: StatisticsProps) {
  return (
    <div className="border-border bg-card rounded-lg border p-6 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold">Statistics</h3>
      <p className="text-muted-foreground text-sm">
        <span className="text-foreground font-bold">{recipeCount}</span> recipes will be randomized.
      </p>
      {recipeCount === 0 && (
        <p className="text-destructive mt-2 text-xs">
          Please select at least one recipe type to randomize.
        </p>
      )}
    </div>
  );
}
