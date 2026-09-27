import { describe, it, expect } from "vitest";

import { MinecraftVersion, RecipeType } from "@/data/types";

import { generateRandomizedDatapack, getMaxStackSize } from "./vanilla-randomized-datapack";

describe("getMaxStackSize", () => {
  it("should return 1 for non-stackable items", () => {
    expect(getMaxStackSize("minecraft:diamond_sword")).toBe(1);
    expect(getMaxStackSize("minecraft:iron_pickaxe")).toBe(1);
    expect(getMaxStackSize("minecraft:diamond_spear")).toBe(1);
    expect(getMaxStackSize("minecraft:skull_banner_pattern")).toBe(1);
    expect(getMaxStackSize("minecraft:cake")).toBe(1);
    expect(getMaxStackSize("minecraft:white_bed")).toBe(1);
    expect(getMaxStackSize("minecraft:shulker_box")).toBe(1);
    expect(getMaxStackSize("minecraft:shears")).toBe(1);
    expect(getMaxStackSize("minecraft:fishing_rod")).toBe(1);
    expect(getMaxStackSize("minecraft:flint_and_steel")).toBe(1);
    expect(getMaxStackSize("minecraft:enchanted_book")).toBe(1);
    expect(getMaxStackSize("minecraft:water_bucket")).toBe(1); // bucket is in nonStackableKeywords
    expect(getMaxStackSize("minecraft:mushroom_stew")).toBe(1);
    expect(getMaxStackSize("minecraft:rabbit_stew")).toBe(1);
  });

  it("should return 16 for items stackable up to 16", () => {
    expect(getMaxStackSize("minecraft:ender_pearl")).toBe(16);
    expect(getMaxStackSize("minecraft:egg")).toBe(16);
    expect(getMaxStackSize("minecraft:snowball")).toBe(16);
    expect(getMaxStackSize("minecraft:honey_bottle")).toBe(16);
    expect(getMaxStackSize("minecraft:oak_sign")).toBe(16);
    expect(getMaxStackSize("minecraft:bucket")).toBe(16); // Wait, "bucket" is in stackSize16Keywords too?
    expect(getMaxStackSize("minecraft:written_book")).toBe(16);
    expect(getMaxStackSize("minecraft:snout_armor_trim_smithing_template")).toBe(16);
  });

  it("should return 64 for normal stackable items", () => {
    expect(getMaxStackSize("minecraft:oak_planks")).toBe(64);
    expect(getMaxStackSize("minecraft:diamond")).toBe(64);
    expect(getMaxStackSize("minecraft:stick")).toBe(64);
    expect(getMaxStackSize("minecraft:apple")).toBe(64);
  });
});

describe("generateRandomizedDatapack", () => {
  it("generates a randomized datapack for version 26.2", async () => {
    const blob = await generateRandomizedDatapack({
      version: MinecraftVersion.V262,
      recipeTypes: [RecipeType.Crafting],
      randomizeCount: false,
    });
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  it("generates a randomized datapack for version 26.3", async () => {
    const blob = await generateRandomizedDatapack({
      version: MinecraftVersion.V263,
      recipeTypes: [RecipeType.Crafting],
      randomizeCount: true,
    });
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });
});
