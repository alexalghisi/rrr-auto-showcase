import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { GEO_LANDING_PAGES } from "@/lib/landing-pages-geo";
import { latestStockUpdate, renderUrlset, type SitemapEntry } from "@/lib/sitemap.server";

export const Route = createFileRoute("/sitemap-orase.xml")({
  server: {
    handlers: {
      GET: async () => {
        const lastmod = await latestStockUpdate();
        const entries: SitemapEntry[] = GEO_LANDING_PAGES.map((p) => ({
          path: `/${p.slug}`,
          changefreq: "weekly",
          priority: "0.75",
          ...(lastmod ? { lastmod } : {}),
        }));
        return renderUrlset(entries);
      },
    },
  },
});
