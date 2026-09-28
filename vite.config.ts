import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

import { minecraftTextures } from "./vite/minecraft-textures";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const siteUrl = (process.env.VITE_SITE_URL ?? "https://crafting.thedestruc7i0n.ca").replace(
  /\/$/,
  "",
);

function getBasePath(envPath?: string): string {
  if (!envPath) return "/";
  try {
    const pathname = new URL(envPath, "http://localhost").pathname;
    return pathname.endsWith("/") ? pathname : `${pathname}/`;
  } catch {
    return "/";
  }
}

const basePath = getBasePath(process.env.BASE_PATH);

export default defineConfig({
  base: basePath,
  build: {
    target: "es2020",
  },
  plugins: [
    minecraftTextures,
    tailwindcss(),
    tanstackStart({
      spa: {
        enabled: true,
        prerender: {
          enabled: true,
          outputPath: "/index",
          crawlLinks: false,
          onSuccess: ({ page }) =>
            page.path === "/"
              ? {
                  sitemap: {
                    priority: 1,
                    changefreq: "monthly",
                  },
                }
              : undefined,
        },
      },
      prerender: {
        enabled: true,
        crawlLinks: false,
        failOnError: true,
      },
      pages: [
        {
          path: "/",
          prerender: {
            enabled: true,
          },
          sitemap: {
            priority: 1,
            changefreq: "monthly",
          },
        },
      ],
      sitemap: {
        enabled: true,
        host: siteUrl,
        outputPath: "sitemap.xml",
      },
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "./src"),
    },
  },
  ssr: {
    noExternal: ["@atlaskit/pragmatic-drag-and-drop", "@nozbe/microfuzz"],
  },
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    },
  },
  test: {
    globals: true,
    // environment: "jsdom", // for ui testing
    // setupFiles: "src/setupTests", // for ui testing
    mockReset: true,
  },
});
