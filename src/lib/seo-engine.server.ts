/**
 * Motorul de conținut SEO care rulează zilnic:
 *  1. reîmprospătează intro-urile paginilor programatice în funcție de stocul curent;
 *  2. anunță motoarele de căutare (IndexNow) pentru URL-urile modificate;
 *  3. o dată pe săptămână generează un draft de articol de blog pentru aprobare umană.
 */
import { COMBO_PAGES } from "./landing-combo";
import { BLOG_POSTS } from "./blog";
import { askAi } from "./ai.server";
import type { Tables } from "@/integrations/supabase/types";

type Car = Tables<"cars">;

const ORIGIN = "https://bremenauto.ro";
/** Câte pagini reîmprospătăm pe rulare, ca să nu consumăm inutil credite AI. */
const PAGES_PER_RUN = 8;

function describe(car: Car): string {
  return `${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ""} ${car.year}, ${car.mileage_km} km, ${car.fuel}, ${car.gearbox}, ${car.price} ${car.currency}`;
}

async function adminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Reîmprospătează intro-urile paginilor programatice cu stocul real de azi. */
export async function refreshProgrammaticIntros(): Promise<{
  refreshed: string[];
  skipped: number;
}> {
  const supabase = await adminClient();

  const { data: cars } = await supabase
    .from("cars")
    .select("*")
    .eq("published", true)
    .neq("status", "vanduta");
  const stock = (cars ?? []) as Car[];

  const { data: existing } = await supabase
    .from("seo_page_content")
    .select("slug, stock_count, updated_at");
  const state = new Map((existing ?? []).map((row) => [row.slug, row]));

  const candidates = COMBO_PAGES.map((page) => {
    const matches = stock.filter(page.match);
    const previous = state.get(page.slug);
    const changed = !previous || previous.stock_count !== matches.length;
    const age = previous ? Date.now() - new Date(previous.updated_at).getTime() : Infinity;
    return { page, matches, changed, age };
  })
    .filter((c) => c.changed || c.age > 14 * 24 * 3600 * 1000)
    .sort((a, b) => b.age - a.age)
    .slice(0, PAGES_PER_RUN);

  const refreshed: string[] = [];

  for (const { page, matches } of candidates) {
    try {
      const stockLines = matches.slice(0, 8).map(describe).join("\n") || "(nicio mașină acum)";
      const intro = await askAi(
        `Ești copywriter SEO pentru Bremen Auto, parc auto pe DN1, Luna de Sus, comuna Florești, jud. Cluj, care vinde mașini second hand aduse din Germania, cash sau în rate, cu livrare în toată România. Program non-stop, telefon 0751 692 335.
Scrii în română, natural, fără keyword stuffing, fără superlative goale și fără promisiuni care nu se pot verifica. 150-230 de cuvinte, un singur paragraf, informație utilă pentru cumpărător (prețuri realiste, ce verificăm, cum ajunge la parc, cum se livrează). Nu inventa mașini care nu sunt în listă. Returnezi DOAR textul.`,
        `Pagina: "${page.h1}".
Context existent (poți reformula, nu copia): ${page.intro.slice(0, 700)}

Stoc relevant acum (${matches.length} mașini):
${stockLines}`,
        { maxTokens: 700 },
      );

      if (intro.length < 200) continue;

      await supabase.from("seo_page_content").upsert(
        {
          slug: page.slug,
          intro,
          stock_count: matches.length,
          source: "ai",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" },
      );
      refreshed.push(page.slug);
    } catch (error) {
      console.error("intro refresh failed", page.slug, error);
    }
  }

  return { refreshed, skipped: COMBO_PAGES.length - candidates.length };
}

/** Un draft de articol pe săptămână, care intră în admin pentru aprobare umană. */
export async function generateWeeklyDraft(force = false): Promise<{ created: boolean; title?: string }> {
  const supabase = await adminClient();

  if (!force) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    const { count } = await supabase
      .from("content_drafts")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgo);
    if ((count ?? 0) > 0) return { created: false };
  }

  const { data: drafts } = await supabase
    .from("content_drafts")
    .select("title")
    .order("created_at", { ascending: false })
    .limit(30);

  const taken = [
    ...BLOG_POSTS.map((p) => p.title),
    ...(drafts ?? []).map((d) => d.title),
  ].join("; ");

  const raw = await askAi(
    `Ești editor de conținut auto pentru Bremen Auto (mașini second hand din Germania, parc pe DN1 Luna de Sus, Florești, jud. Cluj). Scrii în română, pentru cumpărători reali, fără keyword stuffing.
Returnezi JSON valid: {"topic","title","slug","description","body"}.
- title: max 65 de caractere, long-tail, util (ex: "Cât costă înmatricularea unei mașini din Germania în Cluj").
- slug: kebab-case, fără diacritice.
- description: max 155 de caractere.
- body: markdown, 800-1200 de cuvinte, cu H2/H3, exemple de costuri realiste în euro/lei, și o secțiune finală de întrebări frecvente.
Nu inventa statistici sau recenzii.`,
    `Propune un subiect NOU, diferit de acestea: ${taken.slice(0, 3000)}`,
    { json: true, maxTokens: 4000 },
  );

  let parsed: { topic?: string; title?: string; slug?: string; description?: string; body?: string };
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { created: false };
  }
  if (!parsed.title || !parsed.body) return { created: false };

  await supabase.from("content_drafts").insert({
    kind: "blog",
    topic: parsed.topic ?? parsed.title,
    title: parsed.title.slice(0, 200),
    slug: (parsed.slug ?? parsed.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 120),
    description: (parsed.description ?? "").slice(0, 300),
    body: parsed.body,
    status: "draft",
  });

  return { created: true, title: parsed.title };
}

/** Rularea completă, apelată de cron. */
export async function runDailySeoEngine(): Promise<{
  refreshed: string[];
  draft: { created: boolean; title?: string };
  submitted: number;
}> {
  const intros = await refreshProgrammaticIntros();
  const draft = await generateWeeklyDraft();

  const { pingSearchEngines, buildIndexableUrls } = await import("./seo-ping.server");
  const changed = intros.refreshed.map((slug) => `${ORIGIN}/${slug}`);
  const urls = changed.length ? changed : await buildIndexableUrls();
  const { submitted } = await pingSearchEngines(urls);

  return { refreshed: intros.refreshed, draft, submitted };
}
