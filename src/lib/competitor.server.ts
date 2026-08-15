/**
 * Analiză de concurență: citește doar pagini publice, respectă robots.txt și
 * lasă o pauză între cereri. Nu copiem conținut — extragem doar semnale
 * (title, meta description, structura de headinguri) pentru a găsi golurile noastre.
 */
import { askAi } from "./ai.server";
import { LANDING_PAGES } from "./landing-pages";
import { BLOG_POSTS } from "./blog";

const UA = "BremenAutoSeoBot/1.0 (+https://bremenauto.ro)";
const TIMEOUT_MS = 12000;

interface PageSignal {
  url: string;
  title: string;
  description: string;
  headings: string[];
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const response = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,text/plain" },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

/** Reguli Disallow pentru user-agent `*`, suficient pentru crawl-ul nostru minimal. */
async function disallowedPaths(origin: string): Promise<string[]> {
  const txt = await fetchText(`${origin}/robots.txt`);
  if (!txt) return [];
  const lines = txt.split("\n").map((l) => l.trim());
  const rules: string[] = [];
  let applies = false;
  for (const line of lines) {
    const [rawKey, ...rest] = line.split(":");
    const key = (rawKey ?? "").toLowerCase();
    const value = rest.join(":").trim();
    if (key === "user-agent") applies = value === "*";
    else if (applies && key === "disallow" && value) rules.push(value);
  }
  return rules;
}

function allowed(path: string, rules: string[]): boolean {
  return !rules.some((rule) => rule !== "" && path.startsWith(rule));
}

function extract(html: string, url: string): PageSignal {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "";
  const description =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1]?.trim() ??
    "";
  const headings = [...html.matchAll(/<h([123])[^>]*>([\s\S]*?)<\/h\1>/gi)]
    .map((m) => (m[2] ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
    .filter((h) => h.length > 2 && h.length < 120)
    .slice(0, 25);
  return { url, title: title.slice(0, 200), description: description.slice(0, 300), headings };
}

async function scanDomain(domain: string): Promise<PageSignal[]> {
  const origin = domain.startsWith("http") ? domain.replace(/\/$/, "") : `https://${domain}`;
  const rules = await disallowedPaths(origin);
  const paths = ["/", "/stoc", "/masini", "/blog", "/contact"].filter((p) => allowed(p, rules));

  const signals: PageSignal[] = [];
  for (const path of paths) {
    const html = await fetchText(`${origin}${path}`);
    if (html) signals.push(extract(html, `${origin}${path}`));
    await new Promise((resolve) => setTimeout(resolve, 1500)); // rate-limit politicos
  }
  return signals;
}

export async function runCompetitorScan(): Promise<{
  reportId: string | null;
  domains: string[];
  gaps: number;
}> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: competitors } = await supabaseAdmin
    .from("competitors")
    .select("domain")
    .eq("active", true)
    .limit(8);

  const domains = (competitors ?? []).map((c) => c.domain);
  const signals: PageSignal[] = [];
  for (const domain of domains) {
    signals.push(...(await scanDomain(domain)));
  }

  const ourTopics = [
    ...LANDING_PAGES.map((p) => p.h1),
    ...BLOG_POSTS.map((p) => p.title),
  ].join("; ");

  const theirs = signals
    .map((s) => `${s.url}\n  title: ${s.title}\n  desc: ${s.description}\n  H: ${s.headings.join(" | ")}`)
    .join("\n\n")
    .slice(0, 12000);

  let summary = "";
  let gaps: unknown[] = [];
  let findings: unknown[] = [];

  if (signals.length) {
    try {
      const raw = await askAi(
        `Ești consultant SEO tehnic pentru un dealer auto din Cluj. Analizezi semnale publice de la concurenți (title, meta, headinguri) și le compari cu subiectele acoperite de noi.
Nu copia textele lor. Returnezi JSON valid:
{"summary": "3-5 fraze", "gaps": [{"topic","why","suggestedPage","priority":"mare|medie|mica"}], "findings": [{"domain","observation"}]}
Maxim 8 gaps și 8 findings, concrete și acționabile, în română.`,
        `SUBIECTELE NOASTRE:\n${ourTopics.slice(0, 6000)}\n\nSEMNALE CONCURENȚĂ:\n${theirs}`,
        { json: true, maxTokens: 2500 },
      );
      const parsed = JSON.parse(raw) as { summary?: string; gaps?: unknown[]; findings?: unknown[] };
      summary = parsed.summary ?? "";
      gaps = parsed.gaps ?? [];
      findings = parsed.findings ?? [];
    } catch (error) {
      console.error("competitor analysis failed", error);
      summary = "Analiza AI a eșuat; au fost salvate doar semnalele brute.";
      findings = signals.map((s) => ({ domain: s.url, observation: s.title }));
    }
  } else {
    summary = "Niciun concurent accesibil (robots.txt sau rețea).";
  }

  const { data: inserted } = await supabaseAdmin
    .from("competitor_reports")
    .insert({ summary, gaps, findings, scanned_domains: domains })
    .select("id")
    .maybeSingle();

  return { reportId: inserted?.id ?? null, domains, gaps: gaps.length };
}
