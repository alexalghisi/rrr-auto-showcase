import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { LANDING_GROUPS } from "@/lib/landing-pages";
import { latestStockUpdate, renderUrlset, type SitemapEntry } from "@/lib/sitemap.server";

/** Landing-uri tematice: marcă, buget, an/km, servicii și combinații marcă × oraș × segment. */
export const Route = createFileRoute("/sitemap-categorii.xml")({
  server: {
    handlers: {
      GET: async () => {
        const lastmod = await latestStockUpdate();
        const pages = LANDING_GROUPS.filter((g) => g.id !== "orase").flatMap((g) => g.pages);

        const entries: SitemapEntry[] = [
          { path: "/categorii", changefreq: "weekly", priority: "0.8" },
          ...pages.map((p) => ({
            path: `/${p.slug}`,
            changefreq: "weekly",
            priority: "0.75",
            ...(lastmod ? { lastmod } : {}),
          })),
        ];

        return renderUrlset(entries);
      },
    },
  },
});
