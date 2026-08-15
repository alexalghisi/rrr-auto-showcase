/** Helperi comuni pentru sitemap index + sub-sitemap-uri. */

export const BASE_URL = "https://bremenauto.ro";

export function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface SitemapEntry {
  path: string;
  changefreq: string;
  priority: string;
  lastmod?: string;
  images?: Array<{ loc: string; title: string }>;
}

export function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}

export function renderUrlset(entries: SitemapEntry[]): Response {
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

  return xmlResponse(xml);
}

/** Cel mai recent `updated_at` din stocul publicat — folosit ca lastmod pentru sub-sitemap-uri. */
export async function latestStockUpdate(): Promise<string | undefined> {
  try {
    const { createPublicClient } = await import("@/lib/cars.server");
    const { data } = await createPublicClient()
      .from("cars")
      .select("updated_at")
      .eq("published", true)
      .order("updated_at", { ascending: false })
      .limit(1);
    return data?.[0]?.updated_at ?? undefined;
  } catch {
    return undefined;
  }
}
