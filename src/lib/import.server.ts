/** Import automat OLX + Facebook prin conexiunea Apify. */
import { slugify } from "./site";

const APIFY_GATEWAY = "https://connector-gateway.lovable.dev/apify";
const OLX_ACTOR = "piotrv1001~olx-listings-scraper";
const FACEBOOK_ACTOR = "apify~facebook-posts-scraper";

export const SOURCES = {
  olx: "https://www.olx.ro/oferte/user/12kc/",
  facebook: "https://www.facebook.com/bremenautocj",
} as const;

export type SourceKey = keyof typeof SOURCES;
type Json = Record<string, unknown>;

type ScrapedCar = {
  url: string;
  externalId: string;
  make: string;
  model: string;
  trim?: string | null;
  year: number;
  mileage_km: number;
  fuel?: string | null;
  gearbox?: string | null;
  power_hp?: number | null;
  engine_cc?: number | null;
  body_type?: string | null;
  color?: string | null;
  doors?: number | null;
  price: number;
  currency?: string | null;
  description?: string | null;
  features?: string[] | null;
  images?: string[] | null;
};

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const clean = asText(value).replace(/\s/g, "").replace(/\.(?=\d{3}\b)/g, "").replace(",", ".");
  const parsed = Number(clean.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function firstMatch(value: string, expressions: RegExp[]): string {
  for (const expression of expressions) {
    const match = value.match(expression);
    if (match?.[1]) return match[1].trim();
  }
  return "";
}

function apifyHeaders(): HeadersInit {
  const connectionKey = process.env["APIFY_API_KEY"];
  const lovableKey = process.env["LOVABLE_API_KEY"];
  if (!connectionKey || !lovableKey) throw new Error("Conexiunea Apify nu este configurată");
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": connectionKey,
    "Content-Type": "application/json",
  };
}

async function runActor(actor: string, input: Json): Promise<Json[]> {
  const response = await fetch(
    `${APIFY_GATEWAY}/acts/${actor}/run-sync-get-dataset-items?timeout=240&limit=100`,
    { method: "POST", headers: apifyHeaders(), body: JSON.stringify(input) },
  );
  const raw = await response.text();
  if (!response.ok) throw new Error(`Apify ${response.status}: ${raw.slice(0, 300)}`);
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) throw new Error("Apify nu a returnat o listă de anunțuri");
  return parsed.filter((item): item is Json => Boolean(item && typeof item === "object"));
}

function imageUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (typeof entry === "string") return [entry];
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Json;
    const nestedImage = item["image"] && typeof item["image"] === "object" ? item["image"] as Json : {};
    const photoImage = item["photo_image"] && typeof item["photo_image"] === "object" ? item["photo_image"] as Json : {};
    const url = asText(item["thumbnail"] ?? item["photoUrl"] ?? nestedImage["uri"] ?? photoImage["uri"] ?? item["url"]);
    return url ? [url] : [];
  });
}

function parseOlxItem(item: Json): ScrapedCar | null {
  const url = asText(item["url"] ?? item["link"]);
  const title = asText(item["title"] ?? item["name"]);
  const make = asText(item["make"] ?? item["brand"]);
  const model = asText(item["model"]);
  const year = asNumber(item["year"]);
  const price = asNumber(item["price"]);
  if (!url || !make || !model || !year || !price) return null;
  const offerId = asText(item["offerId"] ?? item["id"]) || url.match(/-ID([\w]+)\.html/i)?.[1] || slugify(title);
  return {
    url,
    externalId: `olx:${offerId}`,
    make,
    model,
    trim: title.replace(new RegExp(`^${make}\\s+${model}\\s*`, "i"), "").trim() || null,
    year: Math.round(year),
    mileage_km: Math.round(asNumber(item["mileageKm"] ?? item["mileage"])),
    fuel: asText(item["fuelType"] ?? item["fuel"]),
    gearbox: asText(item["transmission"] ?? item["gearbox"]),
    power_hp: asNumber(item["powerHp"] ?? item["power"]) || null,
    engine_cc: asNumber(item["engineCapacityCm3"] ?? item["engineCapacity"]) || null,
    body_type: asText(item["bodyType"]) || null,
    color: asText(item["color"]) || null,
    doors: asNumber(item["doorCount"] ?? item["doors"]) || null,
    price: Math.round(price),
    currency: asText(item["currency"]) || "EUR",
    description: asText(item["description"]) || title,
    features: Array.isArray(item["features"]) ? item["features"].map(asText).filter(Boolean) : [],
    images: imageUrls(item["images"]),
  };
}

function parseFacebookPost(item: Json): ScrapedCar | null {
  const description = asText(item["text"] ?? item["caption"]);
  const url = asText(item["url"] ?? item["postUrl"]);
  if (!description || !url) return null;
  const year = asNumber(firstMatch(description, [/(?:an(?:ul)?|fabricatie|fabricație)\s*[:\-]?\s*((?:19|20)\d{2})/i, /\b((?:19|20)\d{2})\b/]));
  const price = asNumber(firstMatch(description, [/(?:pre[tț]|price)\s*[:\-]?\s*([\d .]+)\s*(?:€|eur)/i, /([\d .]+)\s*(?:€|eur)\b/i]));
  if (!year || !price) return null;
  const mileage = asNumber(firstMatch(description, [/(?:km|kilometri|rulaj)\s*[:\-]?\s*([\d .]+)/i, /([\d .]+)\s*km\b/i]));
  const knownMake = "Audi|BMW|Mercedes(?:-Benz)?|Volkswagen|VW|Vw|Skoda|Dacia|Renault|Ford|Opel|Peugeot|Citroen|Toyota|Honda|Hyundai|Kia|Nissan|Mazda|Volvo|Seat|Fiat|Suzuki|Mitsubishi|Land Rover|Range Rover|Porsche";
  const carLine = description.match(new RegExp(`^\\s*[~\\-*✅🚗 ]*((?:${knownMake})\\s+[^\\n~]{1,60})`, "im"))?.[1];
  const heading = (carLine ?? "").replace(/[✅🚗🔥🔴🟢⭐➡️]/gu, " ").replace(/\s+/g, " ").trim();
  const words = heading.split(/[|,–—-]/)[0]?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (words.length < 2) return null;
  const id = asText(item["postId"] ?? item["id"]) || url.split("/").filter(Boolean).pop() || slugify(heading);
  return {
    url,
    externalId: `facebook:${id}`,
    make: words[0] ?? "Auto",
    model: words.slice(1, 3).join(" ") || "Model",
    trim: words.slice(3).join(" ") || null,
    year,
    mileage_km: Math.round(mileage),
    price: Math.round(price),
    currency: "EUR",
    description,
    fuel: firstMatch(description, [/(diesel|benzin[aă]|hibrid|hybrid|electric|gpl)/i]),
    gearbox: /automat|dsg|dct|tiptronic/i.test(description) ? "Automata" : "Manuala",
    power_hp: asNumber(firstMatch(description, [/([\d]{2,4})\s*(?:cp|cai)/i])) || null,
    engine_cc: asNumber(firstMatch(description, [/(?:motor|cilindree)\s*[:\-]?\s*([\d.]+)\s*(?:cmc|cc|l)?/i])) || null,
    images: [...new Set([...imageUrls(item["media"]), ...imageUrls(item["images"])])],
  };
}

async function scrapeSource(source: SourceKey): Promise<ScrapedCar[]> {
  if (source === "facebook") {
    const items = await runActor(FACEBOOK_ACTOR, { startUrls: [{ url: SOURCES.facebook }], resultsLimit: 50 });
    return items.map(parseFacebookPost).filter((car): car is ScrapedCar => Boolean(car));
  }
  const items = await runActor(OLX_ACTOR, { startUrls: [{ url: SOURCES.olx }], maxItems: 100 });
  return items.map(parseOlxItem).filter((car): car is ScrapedCar => Boolean(car));
}

export function fingerprintFor(car: { make: string; model: string; year: number; mileage_km: number; price: number }): string {
  return [slugify(car.make), slugify(car.model), car.year, Math.round(car.mileage_km / 1000), Math.round(car.price / 50)].join("|");
}

function normalizeFuel(value?: string | null): string {
  const normalized = (value ?? "").toLowerCase();
  if (normalized.includes("benz") || normalized.includes("petrol")) return "Benzina";
  if (normalized.includes("hibr") || normalized.includes("hybrid")) return "Hibrid";
  if (normalized.includes("electric")) return "Electric";
  if (normalized.includes("gpl")) return "GPL";
  return "Diesel";
}

function normalizeGearbox(value?: string | null): string {
  return /autom|dsg|dct|tiptronic/i.test(value ?? "") ? "Automata" : "Manuala";
}

export type ImportResult = { source: SourceKey; found: number; inserted: number; skipped: number; errors: string[] };

export async function importSource(source: SourceKey): Promise<ImportResult> {
  const result: ImportResult = { source, found: 0, inserted: 0, skipped: 0, errors: [] };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let cars: ScrapedCar[];
  try {
    cars = await scrapeSource(source);
    result.found = cars.length;
  } catch (error) {
    result.errors.push(`listare: ${(error as Error).message}`);
    await logRun(result);
    return result;
  }

  const { data: existing } = await supabaseAdmin.from("cars").select("source_url, external_id, fingerprint");
  const knownUrls = new Set((existing ?? []).map((car) => car.source_url).filter(Boolean) as string[]);
  const knownIds = new Set((existing ?? []).map((car) => car.external_id).filter(Boolean) as string[]);
  const knownPrints = new Set((existing ?? []).map((car) => car.fingerprint).filter(Boolean) as string[]);

  for (const car of cars) {
    const fingerprint = fingerprintFor(car);
    if (knownUrls.has(car.url) || knownIds.has(car.externalId) || knownPrints.has(fingerprint)) {
      result.skipped++;
      await supabaseAdmin.from("cars").update({ last_seen_at: new Date().toISOString() }).eq("external_id", car.externalId);
      continue;
    }
    const suffix = slugify(car.externalId).slice(-10);
    const { error } = await supabaseAdmin.from("cars").insert({
      slug: `${slugify(`${car.make}-${car.model}-${car.year}-${car.mileage_km}`)}-${suffix}`,
      make: car.make.trim(), model: car.model.trim(), trim: car.trim ?? null,
      year: car.year, mileage_km: car.mileage_km, fuel: normalizeFuel(car.fuel), gearbox: normalizeGearbox(car.gearbox),
      power_hp: car.power_hp ?? null, engine_cc: car.engine_cc ?? null, body_type: car.body_type ?? null,
      color: car.color ?? null, doors: car.doors ?? null, price: car.price,
      currency: (car.currency ?? "EUR").toUpperCase(), description: car.description ?? null,
      features: (car.features ?? []).slice(0, 40), images: (car.images ?? []).filter((url) => /^https?:\/\//.test(url)).slice(0, 15),
      published: true, status: "disponibila", source, source_url: car.url,
      external_id: car.externalId, fingerprint, last_seen_at: new Date().toISOString(),
    });
    if (error) {
      if (error.code === "23505") result.skipped++;
      else result.errors.push(`${car.url}: ${error.message}`);
      continue;
    }
    knownUrls.add(car.url);
    knownIds.add(car.externalId);
    knownPrints.add(fingerprint);
    result.inserted++;
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
  // Actorii sunt porniți serial pentru a evita timeout-urile gateway-ului la două rulări lungi simultan.
  for (const source of Object.keys(SOURCES) as SourceKey[]) results.push(await importSource(source));
  return results;
}