import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Înregistrează o vizualizare de pagină (public). */
export const trackView = createServerFn({ method: "POST" })
  .inputValidator((data: { path: string; carSlug?: string | null }) => ({
    path: String(data.path).slice(0, 300),
    carSlug: data.carSlug ? String(data.carSlug).slice(0, 200) : null,
  }))
  .handler(async ({ data }) => {
    const { createPublicClient } = await import("./cars.server");
    await createPublicClient()
      .from("page_views")
      .insert({ path: data.path, car_slug: data.carSlug });
    return { ok: true as const };
  });

export type ViewStats = {
  total: number;
  last7: number;
  last30: number;
  today: number;
  perCar: { slug: string; views: number }[];
};

/** Statistici de vizualizări (doar admin). */
export const getViewStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ViewStats> => {
    const { data, error } = await context.supabase
      .from("page_views")
      .select("car_slug, created_at")
      .order("created_at", { ascending: false })
      .limit(50000);
    if (error) throw new Error(error.message);

    const rows = data ?? [];
    const now = Date.now();
    const since = (days: number) => now - days * 86400000;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const perCarMap = new Map<string, number>();
    let last7 = 0;
    let last30 = 0;
    let today = 0;

    for (const row of rows) {
      const ts = new Date(row.created_at).getTime();
      if (ts >= since(7)) last7 += 1;
      if (ts >= since(30)) last30 += 1;
      if (ts >= startOfToday.getTime()) today += 1;
      if (row.car_slug) perCarMap.set(row.car_slug, (perCarMap.get(row.car_slug) ?? 0) + 1);
    }

    return {
      total: rows.length,
      last7,
      last30,
      today,
      perCar: [...perCarMap.entries()]
        .map(([slug, views]) => ({ slug, views }))
        .sort((a, b) => b.views - a.views),
    };
  });
