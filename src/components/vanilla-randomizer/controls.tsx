import { MinecraftVersionSelect } from "@/components/fields/minecraft-version-select";
import { MinecraftVersion, RecipeType } from "@/data/types";
import { getRecipeTypeLabel } from "@/recipes/definitions";

interface ControlsProps {
  version: MinecraftVersion;
  onVersionChange: (version: MinecraftVersion) => void;
  selectedTypes: RecipeType[];
  onTypeToggle: (type: RecipeType) => void;
  randomizeCount: boolean;
  onRandomizeCountChange: (value: boolean) => void;
}

const SUPPORTED_TYPES = [
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

export function Controls({
  version,
  onVersionChange,
  selectedTypes,
  onTypeToggle,
  randomizeCount,
  onRandomizeCountChange,
}: ControlsProps) {
  return (
    <div className="border-border bg-card flex flex-col gap-6 rounded-lg border p-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <label className="text-muted-foreground text-sm font-medium">Minecraft Version</label>
        <MinecraftVersionSelect value={version} onChange={onVersionChange} />
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-muted-foreground text-sm font-medium">Recipe Types</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
          {SUPPORTED_TYPES.map((type) => (
            <label key={type} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => onTypeToggle(type)}
                className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
              />
              {getRecipeTypeLabel(type)}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={randomizeCount}
            onChange={(e) => onRandomizeCountChange(e.target.checked)}
            className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
          />
          Randomize item counts
        </label>
        <p className="text-muted-foreground text-xs">
          If unchecked, the randomized result will keep the original recipe's result count.
        </p>
      </div>
    </div>
  );
}
