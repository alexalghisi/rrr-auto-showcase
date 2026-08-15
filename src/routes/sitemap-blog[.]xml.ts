import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { BLOG_POSTS } from "@/lib/blog";
import { renderUrlset, type SitemapEntry } from "@/lib/sitemap.server";

export const Route = createFileRoute("/sitemap-blog.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/blog", changefreq: "weekly", priority: "0.7" },
          ...BLOG_POSTS.map((post) => ({
            path: `/blog/${post.slug}`,
            changefreq: "monthly",
            priority: "0.6",
            lastmod: post.updated,
          })),
        ];
        return renderUrlset(entries);
      },
    },
  },
});
