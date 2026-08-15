import { createServerFn } from "@tanstack/react-start";

/**
 * Intro-urile regenerate zilnic de motorul AI pentru paginile programatice.
 * Public: sunt conținut de site, nu date sensibile.
 */
export const listPageIntros = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { createPublicClient } = await import("./cars.server");
    const { data } = await createPublicClient()
      .from("seo_page_content")
      .select("slug, intro, updated_at");
    const map: Record<string, string> = {};
    for (const row of data ?? []) {
      if (row.intro) map[row.slug] = row.intro;
    }
    return map;
  } catch {
    return {} as Record<string, string>;
  }
});
