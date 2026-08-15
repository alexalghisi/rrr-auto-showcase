import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const origin = "https://bremenauto.ro";
        const body = [
          "User-agent: *",
          "Allow: /",
          "Disallow: /admin",
          "Disallow: /auth",
          "Disallow: /api/",
          "Allow: /api/public/img",
          "Allow: /api/public/photo/",
          "",
          `Sitemap: ${origin}/sitemap.xml`,
          `Sitemap: ${origin}/sitemap-static.xml`,
          `Sitemap: ${origin}/sitemap-stoc.xml`,
          `Sitemap: ${origin}/sitemap-categorii.xml`,
          `Sitemap: ${origin}/sitemap-orase.xml`,
          `Sitemap: ${origin}/sitemap-blog.xml`,
          "",
        ].join("\n");

        return new Response(body, {
          headers: { "Content-Type": "text/plain", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
