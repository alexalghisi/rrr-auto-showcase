import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { BASE_URL, latestStockUpdate, xmlResponse } from "@/lib/sitemap.server";

/** Sitemap index: trimite Google către sub-sitemap-urile tematice. */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const stockLastmod = await latestStockUpdate();
        const now = new Date().toISOString();

        const children: Array<{ path: string; lastmod?: string | undefined }> = [
          { path: "/sitemap-static.xml" },
          { path: "/sitemap-stoc.xml", lastmod: stockLastmod },
          { path: "/sitemap-categorii.xml", lastmod: stockLastmod ?? now },
          { path: "/sitemap-orase.xml", lastmod: stockLastmod ?? now },
          { path: "/sitemap-blog.xml" },
        ];

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...children.map((c) =>
            [
              `  <sitemap>`,
              `    <loc>${BASE_URL}${c.path}</loc>`,
              c.lastmod ? `    <lastmod>${c.lastmod}</lastmod>` : null,
              `  </sitemap>`,
            ]
              .filter(Boolean)
              .join("\n"),
          ),
          `</sitemapindex>`,
        ].join("\n");

        return xmlResponse(xml);
      },
    },
  },
});
