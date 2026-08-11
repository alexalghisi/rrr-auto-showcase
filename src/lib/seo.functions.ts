import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Reindexare imediată după publicarea sau modificarea unui anunț (doar admin). */
export const notifySearchEngines = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { slugs?: string[] }) => ({
    slugs: (input?.slugs ?? []).filter((s) => typeof s === "string").slice(0, 50),
  }))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { pingCarSlugs } = await import("@/lib/seo-ping.server");
    return pingCarSlugs(data.slugs);
  });
