import { useEffect, useState } from "react";

import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { DownloadIcon, Loader2Icon } from "lucide-react";

import { Footer } from "@/components/footer";
import { Header } from "@/components/layout/header";
import { Controls } from "@/components/vanilla-randomizer/controls";
import { Statistics } from "@/components/vanilla-randomizer/statistics";
import { downloadBlob } from "@/data/datapack";
import { MinecraftVersion, RecipeType } from "@/data/types";
import { generateRandomizedDatapack } from "@/lib/download/vanilla-randomized-datapack";
import { latestRecipeCatalogVersion, loadRecipeCatalog } from "@/recipes/catalog/load-catalog";
import { GeneratedRecipeCatalog } from "@/recipes/catalog/types";

export function VanillaRandomizerView() {
  const { version: versionParam } = useParams({ strict: false }) as any;
  const search = useSearch({ strict: false }) as any;
  const navigate = useNavigate();

  const version =
    (versionParam as MinecraftVersion) ||
    (search?.version as MinecraftVersion) ||
    latestRecipeCatalogVersion ||
    MinecraftVersion.V121;
  const [catalog, setCatalog] = useState<GeneratedRecipeCatalog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const defaultTypes = [
    RecipeType.Crafting,
    RecipeType.Smelting,
    RecipeType.Blasting,
    RecipeType.Smoking,
    RecipeType.CampfireCooking,
    RecipeType.Stonecutter,
    RecipeType.Smithing,
    RecipeType.SmithingTransform,
    RecipeType.SmithingTrim,
  ];

  const selectedTypes =
    ((search?.recipeType as string) || "all") === "all"
      ? defaultTypes
      : ((search.recipeType as string).split(",") as RecipeType[]);

  const randomizeCount = search?.randomizeCount === "true";

  useEffect(() => {
    async function fetchCatalog() {
      setIsLoading(true);
      try {
        const data = await loadRecipeCatalog(version);
        setCatalog(data || null);
      } catch (error) {
        console.error("Failed to load catalog", error);
      } finally {
        setIsLoading(false);
      }
    }
    void fetchCatalog();
  }, [version]);

  const handleVersionChange = (newVersion: MinecraftVersion) => {
    if (versionParam) {
      void navigate({
        to: "/randomizer/{-$version}",
        params: { version: newVersion },
        search: (prev: any) => prev,
      } as any);
    } else {
      void navigate({
        search: (prev: any) => ({
          ...prev,
          version: newVersion,
        }),
      } as any);
    }
  };

  const handleTypeToggle = (type: RecipeType) => {
    const currentTypes =
      ((search?.recipeType as string) || "all") === "all"
        ? defaultTypes
        : ((search.recipeType as string).split(",") as RecipeType[]);

    let newTypes;
    if (currentTypes.includes(type)) {
      newTypes = currentTypes.filter((t) => t !== type);
    } else {
      newTypes = [...currentTypes, type];
    }

    void navigate({
      search: (prev: any) => ({
        ...prev,
        recipeType: newTypes.length === defaultTypes.length ? "all" : newTypes.join(","),
      }),
    } as any);
  };

  const handleRandomizeCountChange = (value: boolean) => {
    void navigate({
      search: (prev: any) => ({
        ...prev,
        randomizeCount: value ? "true" : "false",
      }),
    } as any);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await generateRandomizedDatapack({
        version,
        recipeTypes: selectedTypes,
        randomizeCount,
      });
      const fileName =
        version === MinecraftVersion.Bedrock
          ? `vanilla-randomized-behaviorpack-${version}.mcpack`
          : `vanilla-randomized-datapack-${version}.zip`;
      downloadBlob(blob, fileName);
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to generate randomized datapack.");
    } finally {
      setIsExporting(false);
    }
  };

  const filteredCount =
    catalog?.filter((entry) => selectedTypes.includes(entry.recipeType)).length || 0;

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Header title="Vanilla Recipe Randomizer" showHelp={false} versionSelector={null} />

      <main className="mx-auto flex w-full max-w-(--app-max-width) flex-1 flex-col gap-8 px-4 py-8 md:px-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight">Vanilla Recipe Randomizer</h2>
          <p className="text-muted-foreground">
            Create a datapack that randomizes the results of vanilla Minecraft recipes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-8 lg:col-span-2">
            <Controls
              version={version}
              onVersionChange={handleVersionChange}
              selectedTypes={selectedTypes}
              onTypeToggle={handleTypeToggle}
              randomizeCount={randomizeCount}
              onRandomizeCountChange={handleRandomizeCountChange}
            />
          </div>

          <div className="flex flex-col gap-6">
            <Statistics recipeCount={isLoading ? 0 : filteredCount} />

            <button
              onClick={handleExport}
              disabled={isLoading || isExporting || filteredCount === 0}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-3 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2Icon className="h-5 w-5 animate-spin" />
              ) : (
                <DownloadIcon className="h-5 w-5" />
              )}
              {isExporting ? "Generating..." : "Export Datapack"}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
