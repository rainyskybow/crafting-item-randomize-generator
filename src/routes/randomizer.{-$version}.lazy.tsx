import { createLazyFileRoute } from "@tanstack/react-router";

import { VanillaRandomizerView } from "@/views/vanilla-randomizer";

export const Route = createLazyFileRoute("/randomizer/{-$version}")({
  component: VanillaRandomizerView,
} as any);
