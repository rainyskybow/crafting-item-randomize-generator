import type { ReactNode } from "react";

import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";

import { Analytics } from "@/components/analytics";
import { ThemeProvider } from "@/context/theme-context";

import "@/assets/css/index.css";

const siteUrl = (import.meta.env.VITE_SITE_URL ?? "https://crafting.thedestruc7i0n.ca").replace(
  /\/$/,
  "",
);
const themeScript = `
(() => {
  try {
    const theme = localStorage.getItem("ui-theme") || "system";
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolvedTheme = theme === "system" ? (prefersDark ? "dark" : "light") : theme;
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(resolvedTheme);
  } catch {
    document.documentElement.classList.add("light");
  }
})();
`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "theme-color", content: "#262626" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { property: "og:image", content: `${siteUrl}/icons/icon-512.png` },
      { property: "og:locale", content: "en_us" },
      { name: "twitter:site", content: "@thedestruc7i0n" },
      { property: "twitter:image", content: `${siteUrl}/icons/icon-512.png` },
    ],
    links: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "icon", type: "image/png", href: "/icons/icon-192.png" },
      { rel: "apple-touch-icon", href: "/icons/icon-192.png" },
      { rel: "manifest", href: "/manifest.json" },
      {
        rel: "preload",
        href: "/fonts/Minecraft.woff",
        as: "font",
        type: "font/woff",
        crossOrigin: "anonymous",
      },
      { rel: "stylesheet", href: "/fonts/minecraft-font.css" },
    ],
  }),
  component: RootRoute,
  notFoundComponent: NotFoundPage,
});

function RootRoute() {
  return (
    <RootDocument>
      <ThemeProvider defaultTheme="system">
        <Analytics />
        <Outlet />
      </ThemeProvider>
    </RootDocument>
  );
}

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-4xl font-bold mb-2">404 - Page Not Found</h1>
      <p className="text-muted-foreground mb-4">The page you are looking for does not exist.</p>
      <Link to="/" className="text-primary underline font-medium">
        Go back home
      </Link>
    </div>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-BZ61P6Z37L" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag("js", new Date());
gtag("config", "G-BZ61P6Z37L", { send_page_view: false });
`,
          }}
        />
      </head>
      <body className="bg-background font-sans">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
