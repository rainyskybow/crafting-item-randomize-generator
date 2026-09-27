import { createFileRoute } from "@tanstack/react-router";

import { VanillaRandomizerView } from "@/views/vanilla-randomizer";

const siteUrl = (import.meta.env.VITE_SITE_URL ?? "https://crafting.thedestruc7i0n.ca").replace(
  /\/$/,
  "",
);
const title = "Minecraft Vanilla Recipe Randomizer";
const description = "Create a datapack or behavior pack that randomizes vanilla Minecraft recipes.";

type IndexSearch = {
  version?: string;
  recipeType?: string;
  randomizeCount?: string;
};

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): IndexSearch => ({
    version: (search.version as string) || undefined,
    recipeType: (search.recipeType as string) || undefined,
    randomizeCount: (search.randomizeCount as string) || undefined,
  }),
  head: () => ({
    links: [{ rel: "canonical", href: `${siteUrl}/` }],
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${siteUrl}/` },
      { property: "og:description", content: description },
      { property: "og:site_name", content: "Minecraft Vanilla Recipe Randomizer" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      {
        "script:ld+json": {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Minecraft Vanilla Recipe Randomizer",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Web",
          url: `${siteUrl}/`,
          description,
        },
      },
    ],
  }),
  component: VanillaRandomizerView,
});
