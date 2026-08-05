import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const BASE_URL = "https://bremenauto.ro";
        const { createPublicClient } = await import("@/lib/cars.server");
        const { data } = await createPublicClient()
          .from("cars")
          .select("slug, updated_at")
          .eq("published", true);

        const entries = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          { path: "/stoc", changefreq: "daily", priority: "0.9" },
          { path: "/despre", changefreq: "monthly", priority: "0.6" },
          { path: "/contact", changefreq: "monthly", priority: "0.7" },
          ...(data ?? []).map((c) => ({
            path: `/masini/${c.slug}`,
            changefreq: "weekly",
            priority: "0.8",
            lastmod: c.updated_at,
          })),
        ] as Array<{ path: string; changefreq: string; priority: string; lastmod?: string }>;

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...entries.map((e) =>
            [
              `  <url>`,
              `    <loc>${BASE_URL}${e.path}</loc>`,
              e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
              `    <changefreq>${e.changefreq}</changefreq>`,
              `    <priority>${e.priority}</priority>`,
              `  </url>`,
            ]
              .filter(Boolean)
              .join("\n"),
          ),
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
