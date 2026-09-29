import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { GscSnapshot, SiteResolution } from "./gsc.server";

type AdminContext = {
  supabase: {
    rpc: (
      fn: "has_role",
      args: { _user_id: string; _role: "admin" },
    ) => PromiseLike<{ data: unknown }>;
  };
  userId: string;
};

async function assertAdmin(context: AdminContext) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
}

export type GscResult =
  | { status: "ok"; snapshot: GscSnapshot }
  | { status: "selection_required"; candidates: string[] }
  | { status: "error"; message: string };

/** Date Google Search Console pentru bremenauto.ro (doar admin). */
export const getSearchConsole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<GscResult> => {
    await assertAdmin(context);
    try {
      const { fetchGscSnapshot } = await import("./gsc.server");
      const result = (await fetchGscSnapshot()) as GscSnapshot | SiteResolution;
      if ("status" in result && result.status === "selection_required") {
        return { status: "selection_required", candidates: result.candidates };
      }
      return { status: "ok", snapshot: result as GscSnapshot };
    } catch (error) {
      return { status: "error", message: (error as Error).message };
    }
  });

/** Ultimul raport de concurență + lista de domenii monitorizate. */
export const getCompetitorReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const [report, competitors] = await Promise.all([
      context.supabase
        .from("competitor_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      context.supabase.from("competitors").select("*").order("domain"),
    ]);
    return {
      report: report.data ?? null,
      competitors: competitors.data ?? [],
    };
  });

/** Pornește manual scanarea concurenței. */
export const runCompetitorScanNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { runCompetitorScan } = await import("./competitor.server");
    return runCompetitorScan();
  });

/** Pornește manual motorul SEO zilnic (intro-uri + draft + ping). */
export const runSeoEngineNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { runDailySeoEngine } = await import("./seo-engine.server");
    return runDailySeoEngine();
  });

/** Adaugă / șterge un concurent monitorizat. */
export const saveCompetitor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { domain: string; remove?: boolean }) => ({
    domain: String(data.domain).trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").slice(0, 120),
    remove: Boolean(data.remove),
  }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.remove) {
      await supabaseAdmin.from("competitors").delete().eq("domain", data.domain);
    } else if (data.domain) {
      await supabaseAdmin
        .from("competitors")
        .upsert({ domain: data.domain, active: true }, { onConflict: "domain" });
    }
    return { ok: true as const };
  });

/** Drafturile de articole generate automat, pentru aprobare umană. */
export const listContentDrafts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data } = await context.supabase
      .from("content_drafts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    return data ?? [];
  });

/** Aprobă sau respinge un draft. */
export const setDraftStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: "approved" | "rejected" | "draft" }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("content_drafts")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/** Plan SEO prioritizat generat de AI din raport / interogare / pagină. */
export const generateSeoActionPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { kind: "report" | "query" | "page"; input: string }) => {
    const input = String(data.input ?? "").trim().slice(0, 12000);
    if (input.length < 3) throw new Error("Introdu un text mai lung.");
    const kind = ["report", "query", "page"].includes(data.kind) ? data.kind : "query";
    return { kind, input };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { generateSeoPlan } = await import("./seo-plan.server");
    const label = { report: "raport de concurență", query: "interogare de căutare", page: "pagină SEO" }[data.kind];
    return generateSeoPlan(label, data.input);
  });

/** Câte pagini programatice au intro AI proaspăt. */
export const getSeoStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data } = await context.supabase
      .from("seo_page_content")
      .select("slug, updated_at, stock_count")
      .order("updated_at", { ascending: false })
      .limit(200);
    const rows = data ?? [];
    return {
      pages: rows.length,
      lastRefresh: rows[0]?.updated_at ?? null,
      recent: rows.slice(0, 8),
    };
  });
