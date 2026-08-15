import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { renderUrlset, type SitemapEntry } from "@/lib/sitemap.server";

export const Route = createFileRoute("/sitemap-static.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          { path: "/stoc", changefreq: "daily", priority: "0.9" },
          { path: "/categorii", changefreq: "weekly", priority: "0.8" },
          { path: "/gaseste-masina", changefreq: "weekly", priority: "0.8" },
          { path: "/contact", changefreq: "monthly", priority: "0.7" },
          { path: "/despre", changefreq: "monthly", priority: "0.6" },
          { path: "/recenzii", changefreq: "monthly", priority: "0.5" },
        ];
        return renderUrlset(entries);
      },
    },
  },
});
