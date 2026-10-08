import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { BlogPost, BlogCategory } from "@/lib/blog";

type Row = {
  slug: string;
  title: string;
  meta_title: string;
  description: string;
  keywords: string;
  category: string;
  excerpt: string;
  content: unknown;
  reading_minutes: number;
  created_at: string;
  updated_at: string;
};

function client() {
  return createClient(process.env["SUPABASE_URL"]!, process.env["SUPABASE_PUBLISHABLE_KEY"]!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function toPost(row: Row): BlogPost {
  const c = (row.content ?? {}) as Partial<BlogPost>;
  return {
    slug: row.slug,
    title: row.title,
    metaTitle: row.meta_title,
    description: row.description,
    keywords: row.keywords,
    category: row.category as BlogCategory,
    published: row.created_at.slice(0, 10),
    updated: row.updated_at.slice(0, 10),
    readingMinutes: row.reading_minutes,
    excerpt: row.excerpt,
    intro: c.intro ?? [],
    sections: c.sections ?? [],
    faqs: c.faqs ?? [],
    relatedLandings: c.relatedLandings ?? [],
  };
}

/** Articolele generate zilnic, publice. */
export const listDbBlogPosts = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { data } = await client()
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(300);
    return ((data ?? []) as Row[]).map(toPost);
  } catch {
    return [] as BlogPost[];
  }
});

export const getDbBlogPost = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => ({ slug: String(input.slug).slice(0, 140) }))
  .handler(async ({ data }) => {
    const { data: row } = await client()
      .from("blog_posts")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    return row ? toPost(row as Row) : null;
  });
