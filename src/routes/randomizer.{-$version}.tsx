import { createFileRoute } from "@tanstack/react-router";

import { latestRecipeCatalogVersion } from "@/recipes/catalog/load-catalog";

export const Route = createFileRoute("/randomizer/{-$version}")({
  validateSearch: (search: Record<string, unknown>) => ({
    recipeType: (search.recipeType as string) || "all",
    randomizeCount: (search.randomizeCount as string) || "false",
  }),
  params: {
    parse: (params: any) => ({
      version: params.version || latestRecipeCatalogVersion,
    }),
  },
} as any);
