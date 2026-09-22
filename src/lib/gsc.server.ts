/**
 * Google Search Console prin gateway-ul Lovable.
 * Rulează doar pe server (admin) — cheile nu ajung niciodată în browser.
 */
const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";
const TARGET = "https://bremenauto.ro/";

function headers() {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connKey = process.env["GOOGLE_SEARCH_CONSOLE_API_KEY"];
  if (!lovableKey || !connKey) throw new Error("Search Console nu este conectat");
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": connKey,
    "Content-Type": "application/json",
  };
}

interface SiteEntry {
  siteUrl: string;
  permissionLevel?: string;
}

function covers(siteUrl: string, target: URL): boolean {
  if (siteUrl.startsWith("sc-domain:")) {
    const domain = siteUrl.slice("sc-domain:".length).toLowerCase();
    const host = target.hostname.toLowerCase();
    return host === domain || host.endsWith(`.${domain}`);
  }
  try {
    return target.href.startsWith(new URL(siteUrl).href);
  } catch {
    return false;
  }
}

export type SiteResolution =
  | { status: "selected"; siteUrl: string }
  | { status: "selection_required"; candidates: string[] };

export async function resolveSiteUrl(selected?: string | null): Promise<SiteResolution> {
  const response = await fetch(`${GATEWAY}/webmasters/v3/sites`, { headers: headers() });
  if (!response.ok) {
    throw new Error(`Nu am putut citi proprietățile [${response.status}]: ${await response.text()}`);
  }
  const { siteEntry = [] } = (await response.json()) as { siteEntry?: SiteEntry[] };
  const target = new URL(TARGET);
  const matches = siteEntry.filter(
    (entry) => entry.permissionLevel !== "siteUnverifiedUser" && covers(entry.siteUrl, target),
  );
  if (selected) {
    const found = matches.find((entry) => entry.siteUrl === selected);
    if (!found) throw new Error("Proprietatea selectată nu mai este verificată");
    return { status: "selected", siteUrl: found.siteUrl };
  }
  if (matches.length === 0) throw new Error("Nicio proprietate verificată nu acoperă bremenauto.ro");
  if (matches.length === 1) return { status: "selected", siteUrl: matches[0]!.siteUrl };
  return { status: "selection_required", candidates: matches.map((m) => m.siteUrl) };
}

async function query(siteUrl: string, body: Record<string, unknown>) {
  const response = await fetch(
    `${GATEWAY}/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    { method: "POST", headers: headers(), body: JSON.stringify(body) },
  );
  if (!response.ok) {
    throw new Error(`Search Console [${response.status}]: ${await response.text()}`);
  }
  return (await response.json()) as {
    rows?: Array<{ keys?: string[]; clicks: number; impressions: number; ctr: number; position: number }>;
  };
}

export interface GscRow {
  key: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscSnapshot {
  siteUrl: string;
  period: { start: string; end: string };
  totals: { clicks: number; impressions: number; ctr: number; position: number };
  queries: GscRow[];
  pages: GscRow[];
}

function day(offset: number): string {
  const d = new Date(Date.now() - offset * 86400000);
  return d.toISOString().slice(0, 10);
}

function toRows(
  rows: Array<{ keys?: string[]; clicks: number; impressions: number; ctr: number; position: number }> = [],
): GscRow[] {
  return rows.map((r) => ({
    key: r.keys?.[0] ?? "",
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }));
}

/** Ultimele 28 de zile complete: total, top query-uri și top pagini. */
export async function fetchGscSnapshot(selected?: string | null): Promise<GscSnapshot | SiteResolution> {
  const resolution = await resolveSiteUrl(selected);
  if (resolution.status === "selection_required") return resolution;

  const range = { startDate: day(30), endDate: day(2) };
  const [totals, queries, pages] = await Promise.all([
    query(resolution.siteUrl, { ...range, dimensions: [] }),
    query(resolution.siteUrl, { ...range, dimensions: ["query"], rowLimit: 25 }),
    query(resolution.siteUrl, { ...range, dimensions: ["page"], rowLimit: 25 }),
  ]);

  const t = totals.rows?.[0];
  return {
    siteUrl: resolution.siteUrl,
    period: { start: range.startDate, end: range.endDate },
    totals: {
      clicks: t?.clicks ?? 0,
      impressions: t?.impressions ?? 0,
      ctr: t?.ctr ?? 0,
      position: t?.position ?? 0,
    },
    queries: toRows(queries.rows),
    pages: toRows(pages.rows),
  };
}
