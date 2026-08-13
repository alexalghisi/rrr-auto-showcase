import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { absolutePhotoUrl } from "@/lib/site";
import { LANDING_SLUGS } from "@/lib/landing-pages";
import { BLOG_POSTS } from "@/lib/blog";

const BASE_URL = "https://bremenauto.ro";

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type Entry = {
  path: string;
  changefreq: string;
  priority: string;
  lastmod?: string;
  images?: Array<{ loc: string; title: string }>;
};

export const Route = createFileRoute("/sitemap.xml")({
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


        const cars = data ?? [];

        const entries: Entry[] = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          { path: "/stoc", changefreq: "daily", priority: "0.9" },
          { path: "/despre", changefreq: "monthly", priority: "0.6" },
         { path: "/contact", changefreq: "monthly", priority: "0.7" },
         { path: "/recenzii", changefreq: "monthly", priority: "0.5" },
         { path: "/gaseste-masina", changefreq: "weekly", priority: "0.8" },
         { path: "/categorii", changefreq: "weekly", priority: "0.8" },


          ...LANDING_SLUGS.map((slug) => ({
            path: `/${slug}`,
            changefreq: "weekly",
            priority: "0.85",
          })),
          { path: "/blog", changefreq: "weekly", priority: "0.7" },
          ...BLOG_POSTS.map((post) => ({
            path: `/blog/${post.slug}`,
            changefreq: "monthly",
            priority: "0.7",
            lastmod: post.updated,
          })),
          ...cars.map((c) => {
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
            } satisfies Entry;
          }),
        ];

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
          ...entries.map((e) =>
            [
              `  <url>`,
              `    <loc>${BASE_URL}${e.path}</loc>`,
              e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
              `    <changefreq>${e.changefreq}</changefreq>`,
              `    <priority>${e.priority}</priority>`,
              ...(e.images ?? []).map((img) =>
                [
                  `    <image:image>`,
                  `      <image:loc>${esc(img.loc)}</image:loc>`,
                  `      <image:title>${esc(img.title)}</image:title>`,
                  `    </image:image>`,
                ].join("\n"),
              ),
              `  </url>`,
            ]
              .filter(Boolean)
              .join("\n"),
          ),
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=300",
          },
        });
      },
    },
  },
});
