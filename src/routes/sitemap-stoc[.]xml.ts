import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { absolutePhotoUrl } from "@/lib/site";
import { renderUrlset, type SitemapEntry } from "@/lib/sitemap.server";

export const Route = createFileRoute("/sitemap-stoc.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { createPublicClient } = await import("@/lib/cars.server");
        const { data } = await createPublicClient()
          .from("cars")
          .select("slug, updated_at, make, model, trim, year, images, status")
          .eq("published", true)
          .neq("status", "vanduta")
          .order("updated_at", { ascending: false });

        const entries: SitemapEntry[] = (data ?? []).map((c) => {
          const title = [c.make, c.model, c.trim, c.year].filter(Boolean).join(" ");
          return {
            path: `/masini/${c.slug}`,
            changefreq: "weekly",
            priority: "0.8",
            lastmod: c.updated_at,
            images: (c.images ?? [])
              .filter((src: string) => Boolean(src))
              .slice(0, 6)
              .map((src: string) => ({ loc: absolutePhotoUrl(src), title })),
          };
        });

        return renderUrlset(entries);
      },
    },
  },
});
