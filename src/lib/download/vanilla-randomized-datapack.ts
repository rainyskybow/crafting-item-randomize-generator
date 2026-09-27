import { strToU8, zipSync } from "fflate";

import { getPackMetadata } from "@/data/datapack";
import { parseStringToMinecraftIdentifier } from "@/data/models/identifier/utilities";
import { MinecraftVersion, RecipeType } from "@/data/types";
import { loadRecipeCatalog } from "@/recipes/catalog/load-catalog";
import { CatalogSlotValue } from "@/recipes/catalog/types";
import { getRecipeDefinition } from "@/recipes/definitions";
import { generate } from "@/recipes/generate";
import { extractCookingInput } from "@/recipes/generate/cooking";
import { extractCraftingInput } from "@/recipes/generate/crafting";
import { createRecipeFormatter } from "@/recipes/generate/format/recipe-formatter";
import { extractSmithingInput } from "@/recipes/generate/smithing";
import { extractStonecutterInput } from "@/recipes/generate/stonecutter";
import { wrapBedrockRecipe } from "@/recipes/generate/wrapper/bedrock";
import { RecipeSlot, SLOTS } from "@/recipes/slots";
import { createEmptySlotContext } from "@/stores/recipe/slot-value";
import { createDefaultRecipe, Recipe, RecipeSlotValue } from "@/stores/recipe/types";
import { getJavaPackMetadata } from "@/versioning";

export interface RandomizeOptions {
  version: MinecraftVersion;
  recipeTypes: RecipeType[];
  randomizeCount: boolean;
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function catalogSlotToRecipeSlot(slot: CatalogSlotValue): RecipeSlotValue {
  if (slot.kind === "item") {
    return { kind: "item", id: parseStringToMinecraftIdentifier(slot.id), count: slot.count };
  } else if (slot.kind === "tag") {
    return { kind: "vanilla_tag", id: parseStringToMinecraftIdentifier(slot.id) };
  } else {
    const first = slot.values[0];
    if (first.kind === "item") {
      return { kind: "item", id: parseStringToMinecraftIdentifier(first.id) };
    } else {
      return { kind: "vanilla_tag", id: parseStringToMinecraftIdentifier(first.id) };
    }
  }
}

export function getMaxStackSize(id: string): number {
  const normalizedId = id.toLowerCase();

  const nonStackableKeywords = [
    "sword",
    "pickaxe",
    "axe",
    "shovel",
    "hoe",
    "helmet",
    "chestplate",
    "leggings",
    "boots",
    "minecart",
    "water_bucket",
    "lava_bucket",
    "powder_snow_bucket",
    "milk_bucket",
    "axolotl_bucket",
    "cod_bucket",
    "pufferfish_bucket",
    "salmon_bucket",
    "tadpole_bucket",
    "tropical_fish_bucket",
    "stew",
    "soup",
    "totem",
    "potion",
    "disc",
    "elytra",
    "trident",
    "bow",
    "crossbow",
    "shield",
    "spyglass",
    "horn",
    "brush",
    "mace",
    "saddle",
    "horse_armor",
    "spear",
    "banner_pattern",
    "cake",
    "bed",
    "shulker_box",
    "shears",
    "fishing_rod",
    "flint_and_steel",
    "enchanted_book",
    "on_a_stick",
    "bundle",
    "writable_book",
    "goat_horn",
    "trial_key",
    "ominous_trial_key",
  ];

  if (nonStackableKeywords.some((keyword) => normalizedId.includes(keyword))) {
    return 1;
  }

  const stackSize16Keywords = [
    "ender_pearl",
    "egg",
    "snowball",
    "honey_bottle",
    "sign",
    "bucket",
    "written_book",
    "armor_trim_smithing_template",
  ];

  if (stackSize16Keywords.some((keyword) => normalizedId.includes(keyword))) {
    return 16;
  }

  return 64;
}

export async function generateRandomizedDatapack(options: RandomizeOptions): Promise<Blob> {
  const { version, recipeTypes, randomizeCount } = options;
  const catalog = await loadRecipeCatalog(version);
  if (!catalog) throw new Error(`Could not load recipe catalog for version ${version}`);

  const filteredCatalog = catalog.filter((entry) => recipeTypes.includes(entry.recipeType));

  const resultSlots: RecipeSlot[] = [
    SLOTS.crafting.result,
    SLOTS.cooking.result,
    SLOTS.stonecutter.result,
    SLOTS.smithing.result,
  ];

  // Group catalog entries by recipe type
  const entriesByType: Partial<Record<RecipeType, typeof filteredCatalog>> = {};
  for (const entry of filteredCatalog) {
    if (!entriesByType[entry.recipeType]) {
      entriesByType[entry.recipeType] = [];
    }
    entriesByType[entry.recipeType]!.push(entry);
  }

  // Collect results for each type to shuffle within that type
  const resultsByType: Partial<Record<RecipeType, CatalogSlotValue[]>> = {};
  for (const type of Object.keys(entriesByType) as RecipeType[]) {
    resultsByType[type] = [];
    for (const entry of entriesByType[type]!) {
      const resultSlot = resultSlots.find((s) => entry.slots[s]);
      if (resultSlot) {
        resultsByType[type]!.push(entry.slots[resultSlot]!);
      }
    }
    resultsByType[type] = shuffle(resultsByType[type]!);
  }

  const slotContext = createEmptySlotContext(version);
  const recipeFiles: { name: string; json: object }[] = [];
  const bedrockRecipeFiles: { identifier: string; json: object }[] = [];
  const recipeNameCounts: Record<string, number> = {};

  for (const type of Object.keys(entriesByType) as RecipeType[]) {
    const entries = entriesByType[type]!;
    const shuffledResults = resultsByType[type] || [];

    if (shuffledResults.length === 0) {
      continue;
    }

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const randomizedResult = shuffledResults[i % shuffledResults.length];

      const recipe: Recipe = {
        ...createDefaultRecipe(),
        recipeType: entry.recipeType,
        slots: Object.fromEntries(
          Object.entries(entry.slots).map(([slot, val]) => [slot, catalogSlotToRecipeSlot(val!)]),
        ) as Recipe["slots"],
        cooking: (entry as any).cooking
          ? {
              time: (entry as any).cooking.time,
              experience: (entry as any).cooking.experience,
            }
          : createDefaultRecipe().cooking,
      };

      const resultSlot = resultSlots.find((s) => entry.slots[s]);

      if (resultSlot) {
        const originalResult = entry.slots[resultSlot]!;
        const randomizedRecipeSlot = catalogSlotToRecipeSlot(randomizedResult);

        if (randomizedRecipeSlot.kind === "item" || randomizedRecipeSlot.kind === "custom_item") {
          const maxStackSize =
            randomizedRecipeSlot.kind === "item" ? getMaxStackSize(randomizedRecipeSlot.id.id) : 64;

          if (!randomizeCount) {
            const count = (originalResult as any).count || 1;
            randomizedRecipeSlot.count = Math.min(count, maxStackSize);
          } else {
            randomizedRecipeSlot.count = Math.min(Math.floor(Math.random() * 4) + 1, maxStackSize);
          }
        }

        recipe.slots[resultSlot] = randomizedRecipeSlot;
      }

      let baseRecipeName = (entry as any).id ? (entry as any).id.replace("minecraft:", "") : "";
      if (!baseRecipeName && resultSlot && entry.slots[resultSlot]) {
        const resVal = entry.slots[resultSlot]!;
        if (resVal.kind === "item") {
          baseRecipeName = resVal.id.replace("minecraft:", "");
        } else if (resVal.kind === "tag") {
          baseRecipeName = resVal.id.replace("minecraft:", "");
        } else if (resVal.kind === "alternatives" && resVal.values[0]) {
          baseRecipeName = resVal.values[0].id.replace("minecraft:", "");
        }
      }
      if (!baseRecipeName) {
        baseRecipeName = `recipe_${i + 1}`;
      }

      recipeNameCounts[baseRecipeName] = (recipeNameCounts[baseRecipeName] || 0) + 1;
      const recipeName =
        recipeNameCounts[baseRecipeName] === 1
          ? baseRecipeName
          : `${baseRecipeName}_${recipeNameCounts[baseRecipeName]}`;

      if (version === MinecraftVersion.Bedrock) {
        const identifier = `crafting:${recipeName}`;
        const definition = getRecipeDefinition(recipe.recipeType);
        const formatter = createRecipeFormatter(version);

        let inner;
        if (recipe.recipeType === RecipeType.Crafting) {
          inner = (definition as any).generateBedrock({
            recipe: extractCraftingInput(recipe),
            formatter,
            slotContext,
          });
        } else if (
          [
            RecipeType.Smelting,
            RecipeType.Blasting,
            RecipeType.Smoking,
            RecipeType.CampfireCooking,
          ].includes(recipe.recipeType)
        ) {
          inner = (definition as any).generateBedrock({
            recipe: extractCookingInput(recipe),
            formatter,
            slotContext,
          });
        } else if (recipe.recipeType === RecipeType.Stonecutter) {
          inner = (definition as any).generateBedrock({
            recipe: extractStonecutterInput(recipe),
            formatter,
            slotContext,
          });
        } else if (
          [RecipeType.Smithing, RecipeType.SmithingTransform, RecipeType.SmithingTrim].includes(
            recipe.recipeType,
          )
        ) {
          inner = (definition as any).generateBedrock({
            recipe: extractSmithingInput(recipe),
            formatter,
            slotContext,
          });
        }

        if (inner) {
          const meta = (definition as any).getBedrockMeta(recipe);
          bedrockRecipeFiles.push({
            identifier,
            json: wrapBedrockRecipe({
              inner,
              wrapperKey: meta.wrapperKey,
              tags: meta.tags,
              options: {
                identifier,
                priority: 0,
                formatVersion: meta.formatVersion,
              },
            }),
          });
        }
      } else {
        recipeFiles.push({
          name: recipeName,
          json: generate({ state: recipe, version, slotContext }),
        });
      }
    }
  }

  const files: Record<string, Uint8Array> = {};

  if (version === MinecraftVersion.Bedrock) {
    const headerUuid = crypto.randomUUID();
    const moduleUuid = crypto.randomUUID();
    files["manifest.json"] = strToU8(
      JSON.stringify(
        {
          format_version: 2,
          header: {
            name: "Randomized Recipes",
            description: "Randomized vanilla recipes",
            uuid: headerUuid,
            version: [1, 0, 0],
            min_engine_version: [1, 21, 0],
          },
          modules: [
            {
              type: "data",
              uuid: moduleUuid,
              version: [1, 0, 0],
            },
          ],
        },
        null,
        2,
      ),
    );

    for (const f of bedrockRecipeFiles) {
      files[`recipes/${f.identifier.split(":")[1]}.json`] = strToU8(
        JSON.stringify(f.json, null, 2),
      );
    }
  } else {
    const { recipeDir } = getJavaPackMetadata(version);
    files["pack.mcmeta"] = strToU8(
      JSON.stringify(
        {
          pack: {
            description: "Randomized vanilla recipes",
            ...getPackMetadata(version),
          },
        },
        null,
        2,
      ),
    );

    for (const f of recipeFiles) {
      files[`data/minecraft/${recipeDir}/${f.name}.json`] = strToU8(
        JSON.stringify(f.json, null, 2),
      );
    }
  }

  return new Blob([zipSync(files).buffer as ArrayBuffer]);
}
