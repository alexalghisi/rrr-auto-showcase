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

const CATEGORIES = ["Cum alegi", "Piața Cluj", "Documente", "Modele recomandate", "Case study"];

function kebab(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 90);
}

/** Publică zilnic 2-4 articole noi, strict pe nișa vânzări auto second hand din Germania. */
export async function publishDailyArticles(): Promise<string[]> {
  const supabase = await adminClient();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("blog_posts")
    .select("id", { count: "exact", head: true })
    .gte("created_at", today.toISOString());
  const target = 2 + Math.floor(Math.random() * 3); // 2-4
  const remaining = target - (count ?? 0);
  if (remaining <= 0) return [];

  const { data: existing } = await supabase
    .from("blog_posts")
    .select("slug, title")
    .order("created_at", { ascending: false })
    .limit(200);
  const { data: cars } = await supabase
    .from("cars")
    .select("make, model, year, price, currency, fuel")
    .eq("published", true)
    .neq("status", "vanduta")
    .limit(12);
  const { LANDING_PAGES } = await import("./landing-pages");
  const landingSlugs = LANDING_PAGES.map((p) => p.slug);
  const takenSlugs = new Set([...BLOG_POSTS.map((p) => p.slug), ...(existing ?? []).map((e) => e.slug)]);
  const takenTitles = [...BLOG_POSTS.map((p) => p.title), ...(existing ?? []).map((e) => e.title)];
  const stock = (cars ?? []).map((c) => `${c.make} ${c.model} ${c.year}, ${c.fuel}, ${c.price} ${c.currency}`).join("; ");

  const published: string[] = [];
  for (let i = 0; i < remaining; i++) {
    try {
      const raw = await askAi(
        `Ești editor senior de conținut auto pentru Bremen Auto: parc auto pe DN1, Luna de Sus, comuna Florești, jud. Cluj. Vinde EXCLUSIV mașini second hand aduse din Germania, cash sau în rate, livrare în toată România, program non-stop, telefon 0751 692 335.
NIȘA E STRICTĂ: cumpărarea unei mașini second hand / din Germania (alegere, modele, prețuri, verificări, istoric, acte, înmatriculare, finanțare/rate, livrare, comparații de modele, piața din Cluj și orașele României). INTERZIS: piese, service, reparații, accesorii, tuning, mașini noi, alte subiecte.
Scrii în română corectă, cu diacritice, natural, pentru oameni (fraze scurte, exemple concrete, cifre realiste în euro/lei), SEO first: un keyword long-tail principal folosit în titlu, primul paragraf și un H2, variații semantice, fără keyword stuffing. Nu inventa statistici, studii, recenzii sau clienți.
Returnezi DOAR JSON valid:
{"title": "max 70 caractere, conține keyword-ul", "metaTitle": "max 58 caractere", "description": "140-155 caractere, cu beneficiu clar", "keywords": "5-7 fraze separate prin virgulă", "category": unul din ${JSON.stringify(CATEGORIES)}, "excerpt": "1-2 fraze", "intro": ["2 paragrafe"], "sections": [{"h2": "...", "paragraphs": ["2-3 paragrafe de 50-90 cuvinte"], "bullets": ["opțional, 3-6 puncte scurte"]}] (5-7 secțiuni, ultima cu pașii concreți la Bremen Auto), "faqs": [{"q","a"}] (4-5), "relatedLandings": 3-5 sloguri DOAR din lista dată}`,
        `Sloguri landing permise: ${landingSlugs.join(", ")}
Stoc actual (poți menționa ca exemple): ${stock || "-"}
Subiecte deja publicate (alege unul NOU, alt unghi): ${takenTitles.slice(0, 120).join(" | ").slice(0, 6000)}`,
        { json: true, maxTokens: 5000 },
      );
      const p = JSON.parse(raw) as Partial<import("./blog").BlogPost>;
      if (!p.title || !p.sections?.length || !p.intro?.length) continue;
      let slug = kebab(p.title);
      if (takenSlugs.has(slug)) slug = `${slug}-${Date.now().toString(36)}`;
      takenSlugs.add(slug);
      takenTitles.unshift(p.title);
      const words = [...p.intro, ...p.sections.flatMap((s) => [...(s.paragraphs ?? []), ...(s.bullets ?? [])])]
        .join(" ")
        .split(/\s+/).length;
      const { error } = await supabase.from("blog_posts").insert({
        slug,
        title: p.title.slice(0, 120),
        meta_title: (p.metaTitle ?? p.title).slice(0, 60),
        description: (p.description ?? p.excerpt ?? "").slice(0, 160),
        keywords: (p.keywords ?? "").slice(0, 400),
        category: CATEGORIES.includes(p.category ?? "") ? p.category! : "Cum alegi",
        excerpt: (p.excerpt ?? p.description ?? "").slice(0, 300),
        reading_minutes: Math.max(3, Math.round(words / 200)),
        content: {
          intro: p.intro,
          sections: p.sections.map((s) => ({
            h2: s.h2,
            paragraphs: s.paragraphs ?? [],
            ...(s.bullets?.length ? { bullets: s.bullets } : {}),
          })),
          faqs: p.faqs ?? [],
          relatedLandings: (p.relatedLandings ?? []).filter((s) => landingSlugs.includes(s)).slice(0, 5),
        },
      });
      if (!error) published.push(slug);
    } catch (error) {
      console.error("daily article failed", error);
    }
  }
  return published;
}

/** Rularea completă, apelată de cron. */
export async function runDailySeoEngine(): Promise<{
  refreshed: string[];
  articles: string[];
  submitted: number;
}> {
  const articles = await publishDailyArticles();
  const intros = await refreshProgrammaticIntros().catch(() => ({ refreshed: [] as string[] }));

  const { pingSearchEngines, buildIndexableUrls } = await import("./seo-ping.server");
  const changed = [
    ...intros.refreshed.map((slug) => `${ORIGIN}/${slug}`),
    ...articles.map((slug) => `${ORIGIN}/blog/${slug}`),
  ];
  if (articles.length) changed.push(`${ORIGIN}/blog`, `${ORIGIN}/sitemap-blog.xml`);
  const urls = changed.length ? changed : await buildIndexableUrls();
  const { submitted } = await pingSearchEngines(urls);

  return { refreshed: intros.refreshed, articles, submitted };
}
