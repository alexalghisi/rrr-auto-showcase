import { createServerFn } from "@tanstack/react-start";

export type HomeGuide = { slug: string; category: string; title: string; excerpt: string };

/**
 * Teasers for the homepage guides section. Resolved on the server so the full
 * blog content never ships in the homepage JavaScript bundle.
 */
export const listHomeGuides = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomeGuide[]> => {
    const { BLOG_POSTS } = await import("./blog");
    return BLOG_POSTS.slice(0, 6).map(({ slug, category, title, excerpt }) => ({
      slug,
      category,
      title,
      excerpt,
    }));
  },
);
