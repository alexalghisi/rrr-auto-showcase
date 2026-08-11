/**
 * Notificarea automată a motoarelor de căutare (IndexNow: Bing, Yandex, Seznam)
 * de fiecare dată când stocul se schimbă, plus o rulare zilnică de întreținere SEO.
 */
import { LANDING_SLUGS } from "./landing-pages";
import { BLOG_POSTS } from "./blog";

export const INDEXNOW_KEY = "4b35420b66f24cb7b75389827394684d";
export const SEO_HOST = "bremenauto.ro";
const ORIGIN = `https://${SEO_HOST}`;

const STATIC_PATHS = [
  "/",
  "/stoc",
  "/categorii",
  "/gaseste-masina",
  "/despre",
  "/contact",
  "/recenzii",
  "/blog",
];

/** Toate URL-urile publice indexabile (statice + landing + blog + fișe mașini). */
export async function buildIndexableUrls(): Promise<string[]> {
  const urls = [
    ...STATIC_PATHS,
    ...LANDING_SLUGS.map((slug) => `/${slug}`),
    ...BLOG_POSTS.map((post) => `/blog/${post.slug}`),
  ];

  try {
    const { createPublicClient } = await import("./cars.server");
    const { data } = await createPublicClient()
      .from("cars")
      .select("slug")
      .eq("published", true)
      .order("updated_at", { ascending: false });
    for (const car of data ?? []) urls.push(`/masini/${car.slug}`);
  } catch {
    // fără mașini, tot anunțăm paginile statice
  }

  return [...new Set(urls.map((path) => `${ORIGIN}${path}`))].slice(0, 9000);
}

/** Trimite lista de URL-uri la IndexNow + ping Bing pentru sitemap. */
export async function pingSearchEngines(urlList: string[]): Promise<{ submitted: number }> {
  const list = [...new Set([`${ORIGIN}/`, `${ORIGIN}/stoc`, `${ORIGIN}/sitemap.xml`, ...urlList])].slice(0, 9000);

  await Promise.allSettled([
    fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: SEO_HOST,
        key: INDEXNOW_KEY,
        keyLocation: `${ORIGIN}/${INDEXNOW_KEY}.txt`,
        urlList: list,
      }),
    }),
    fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(`${ORIGIN}/sitemap.xml`)}`),
  ]);

  return { submitted: list.length };
}

/** Anunță schimbările pentru anumite fișe de mașină (publicare, editare, ștergere). */
export async function pingCarSlugs(slugs: string[]): Promise<{ submitted: number }> {
  return pingSearchEngines(slugs.filter(Boolean).map((slug) => `${ORIGIN}/masini/${slug}`));
}

/** Rulare zilnică: re-trimite întregul index către motoarele de căutare. */
export async function dailySeoRefresh(): Promise<{ submitted: number }> {
  return pingSearchEngines(await buildIndexableUrls());
}
