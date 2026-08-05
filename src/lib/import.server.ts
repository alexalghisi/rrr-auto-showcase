/**
 * Import automat de mașini din surse externe (OLX, Facebook).
 * Server-only: folosește Firecrawl + service role.
 */
import { slugify } from "./site";

const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";

export const SOURCES = {
  olx: "https://www.olx.ro/oferte/user/12kc/",
  facebook: "https://www.facebook.com/bremenautocj",
} as const;

export type SourceKey = keyof typeof SOURCES;

type ScrapedCar = {
  make?: string | null;
  model?: string | null;
  trim?: string | null;
  year?: number | null;
  mileage_km?: number | null;
  fuel?: string | null;
  gearbox?: string | null;
  power_hp?: number | null;
  engine_cc?: number | null;
  body_type?: string | null;
  color?: string | null;
  doors?: number | null;
  price?: number | null;
  currency?: string | null;
  description?: string | null;
  features?: string[] | null;
  images?: string[] | null;
};

const CAR_SCHEMA = {
  type: "object",
  properties: {
    make: { type: "string", description: "Marca (ex: Volkswagen)" },
    model: { type: "string" },
    trim: { type: "string" },
    year: { type: "number" },
    mileage_km: { type: "number" },
    fuel: { type: "string", description: "Diesel, Benzina, Hibrid sau Electric" },
    gearbox: { type: "string", description: "Manuala sau Automata" },
    power_hp: { type: "number" },
    engine_cc: { type: "number" },
    body_type: { type: "string" },
    color: { type: "string" },
    doors: { type: "number" },
    price: { type: "number" },
    currency: { type: "string", description: "EUR sau RON" },
    description: { type: "string" },
    features: { type: "array", items: { type: "string" } },
    images: { type: "array", items: { type: "string" }, description: "URL-uri absolute ale fotografiilor" },
  },
  required: ["make", "model", "year", "price"],
} as const;

function apiKey(): string {
  const key = process.env["FIRECRAWL_API_KEY"];
  if (!key) throw new Error("FIRECRAWL_API_KEY lipsește");
  return key;
}

async function firecrawl(body: Record<string, unknown>) {
  const response = await fetch(`${FIRECRAWL_V2}/scrape`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await response.json()) as Record<string, any>;
  if (!response.ok || json["success"] === false) {
    throw new Error(json["error"] || `Firecrawl a răspuns cu ${response.status}`);
  }
  return (json["data"] ?? json) as Record<string, any>;
}

/** Colectează URL-urile anunțurilor individuale dintr-o pagină de listă. */
async function collectListingUrls(source: SourceKey): Promise<string[]> {
  const data = await firecrawl({
    url: SOURCES[source],
    formats: ["links"],
    onlyMainContent: false,
    waitFor: 3000,
  });
  const links: string[] = data["links"] ?? [];
  const matcher =
    source === "olx" ? /olx\.ro\/d\/oferta\// : /facebook\.com\/(marketplace\/item|.*\/posts)\//;
  return Array.from(new Set(links.filter((l) => matcher.test(l)))).map((l) => l.split("#")[0]!);
}

async function scrapeCar(url: string): Promise<ScrapedCar | null> {
  const data = await firecrawl({
    url,
    formats: [
      {
        type: "json",
        schema: CAR_SCHEMA,
        prompt:
          "Extrage detaliile mașinii second hand din anunț. Prețul ca număr, fără separatori. Kilometrajul în km. Fotografiile ca URL-uri absolute.",
      },
    ],
    onlyMainContent: true,
    waitFor: 2000,
  });
  return (data["json"] ?? null) as ScrapedCar | null;
}

function externalIdFor(source: SourceKey, url: string): string {
  const clean = url.replace(/\/+$/, "");
  return `${source}:${clean.split("/").pop() ?? clean}`;
}

/** Amprentă folosită pentru a bloca aceeași mașină importată din două surse. */
export function fingerprintFor(car: {
  make: string;
  model: string;
  year: number;
  mileage_km: number;
  price: number;
}): string {
  return [
    slugify(car.make),
    slugify(car.model),
    car.year,
    Math.round(car.mileage_km / 5000),
    Math.round(car.price / 250),
  ].join("|");
}

function normalizeFuel(value?: string | null): string {
  const v = (value ?? "").toLowerCase();
  if (v.includes("benz") || v.includes("petrol") || v.includes("gasoline")) return "Benzina";
  if (v.includes("hibrid") || v.includes("hybrid")) return "Hibrid";
  if (v.includes("electric")) return "Electric";
  if (v.includes("gpl")) return "GPL";
  return "Diesel";
}

function normalizeGearbox(value?: string | null): string {
  const v = (value ?? "").toLowerCase();
  return v.includes("autom") ? "Automata" : "Manuala";
}

function toEur(price: number, currency?: string | null): { price: number; currency: string } {
  if ((currency ?? "").toUpperCase() === "RON") return { price, currency: "RON" };
  return { price, currency: "EUR" };
}

export type ImportResult = {
  source: SourceKey;
  found: number;
  inserted: number;
  skipped: number;
  errors: string[];
};

export async function importSource(source: SourceKey): Promise<ImportResult> {
  const result: ImportResult = { source, found: 0, inserted: 0, skipped: 0, errors: [] };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  let urls: string[] = [];
  try {
    urls = await collectListingUrls(source);
  } catch (error) {
    result.errors.push(`listare: ${(error as Error).message}`);
    await logRun(result);
    return result;
  }
  result.found = urls.length;

  // Anunțurile deja importate nu se mai citesc a doua oară (economisim credite).
  const { data: existing } = await supabaseAdmin
    .from("cars")
    .select("source_url, external_id, fingerprint");
  const knownUrls = new Set((existing ?? []).map((c) => c.source_url).filter(Boolean) as string[]);
  const knownIds = new Set((existing ?? []).map((c) => c.external_id).filter(Boolean) as string[]);
  const knownPrints = new Set((existing ?? []).map((c) => c.fingerprint).filter(Boolean) as string[]);

  for (const url of urls) {
    const externalId = externalIdFor(source, url);
    if (knownUrls.has(url) || knownIds.has(externalId)) {
      result.skipped++;
      await supabaseAdmin
        .from("cars")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("external_id", externalId);
      continue;
    }

    try {
      const scraped = await scrapeCar(url);
      if (!scraped?.make || !scraped.model || !scraped.year || !scraped.price) {
        result.skipped++;
        continue;
      }

      const mileage = Math.max(0, Math.round(Number(scraped.mileage_km ?? 0)));
      const { price, currency } = toEur(Math.round(Number(scraped.price)), scraped.currency);
      const fingerprint = fingerprintFor({
        make: scraped.make,
        model: scraped.model,
        year: Number(scraped.year),
        mileage_km: mileage,
        price,
      });

      if (knownPrints.has(fingerprint)) {
        result.skipped++;
        continue;
      }

      const base = slugify(
        `${scraped.make} ${scraped.model} ${scraped.trim ?? ""} ${scraped.year} ${mileage}km`,
      );
      const slug = `${base}-${externalId.split(":").pop()!.slice(-6)}`;

      const { error } = await supabaseAdmin.from("cars").insert({
        slug,
        make: String(scraped.make).trim(),
        model: String(scraped.model).trim(),
        trim: scraped.trim ?? null,
        year: Number(scraped.year),
        mileage_km: mileage,
        fuel: normalizeFuel(scraped.fuel),
        gearbox: normalizeGearbox(scraped.gearbox),
        power_hp: scraped.power_hp ? Math.round(Number(scraped.power_hp)) : null,
        engine_cc: scraped.engine_cc ? Math.round(Number(scraped.engine_cc)) : null,
        body_type: scraped.body_type ?? null,
        color: scraped.color ?? null,
        doors: scraped.doors ? Math.round(Number(scraped.doors)) : null,
        price,
        currency,
        description: scraped.description ?? null,
        features: (scraped.features ?? []).slice(0, 40),
        images: (scraped.images ?? []).filter((i) => /^https?:\/\//.test(i)).slice(0, 15),
        published: true,
        status: "disponibila",
        source,
        source_url: url,
        external_id: externalId,
        fingerprint,
        last_seen_at: new Date().toISOString(),
      });

      if (error) {
        // 23505 = duplicat prins de indexurile unice (a doua plasă de siguranță)
        if (error.code === "23505") result.skipped++;
        else result.errors.push(`${url}: ${error.message}`);
        continue;
      }

      knownUrls.add(url);
      knownIds.add(externalId);
      knownPrints.add(fingerprint);
      result.inserted++;
    } catch (error) {
      result.errors.push(`${url}: ${(error as Error).message}`);
    }
  }

  await logRun(result);
  return result;
}

async function logRun(result: ImportResult) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("import_runs").insert({
    source: result.source,
    found: result.found,
    inserted: result.inserted,
    skipped: result.skipped,
    errors: result.errors.length ? result.errors.slice(0, 20).join("\n") : null,
  });
}

export async function importAll(): Promise<ImportResult[]> {
  const results: ImportResult[] = [];
  for (const source of Object.keys(SOURCES) as SourceKey[]) {
    results.push(await importSource(source));
  }
  return results;
}
