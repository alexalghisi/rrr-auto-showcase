import { importSources } from "./import-schedule";
/** Import automat OLX (API public OLX, fără Apify) + Facebook (Graph API; Apify doar ca rezervă). */
import { slugify } from "./site";

const APIFY_GATEWAY = "https://connector-gateway.lovable.dev/apify";
const OLX_ACTOR = "abotapi~olx-scraper";
/** ID-ul contului OLX al dealerului (R R R Automobile / Bremen Auto). */
const OLX_SELLER_ID = 247268;
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
    `${APIFY_GATEWAY}/acts/${actor}/run-sync-get-dataset-items?timeout=300&limit=60`,
    { method: "POST", headers: apifyHeaders(), body: JSON.stringify(input) },
  );
  const raw = await response.text();
  if (!response.ok) throw new Error(`Apify ${response.status}: ${raw.slice(0, 300)}`);
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) throw new Error("Apify nu a returnat o listă de anunțuri");
  return parsed.filter((item): item is Json => Boolean(item && typeof item === "object"));
}

function looksLikeImage(url: string): boolean {
  if (!/^https?:\/\//i.test(url)) return false;
  if (/facebook\.com\/(?!.*\.(jpg|jpeg|png|webp))/i.test(url)) return false; // linkuri de postare, nu poze
  if (/olx\.ro\//i.test(url)) return false;
  return (
    /\.(jpg|jpeg|png|webp|avif)(\?|;|$)/i.test(url) ||
    /(olxcdn|fbcdn|fbsbx|scontent)/i.test(url) ||
    /\/image(;|\?|$)/i.test(url)
  );
}

function imageUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((entry) => {
      if (typeof entry === "string") return [entry];
      if (!entry || typeof entry !== "object") return [];
      const item = entry as Json;
      const nestedImage = item["image"] && typeof item["image"] === "object" ? (item["image"] as Json) : {};
      const photoImage =
        item["photo_image"] && typeof item["photo_image"] === "object" ? (item["photo_image"] as Json) : {};
      const url = asText(
        nestedImage["uri"] ?? photoImage["uri"] ?? item["thumbnail"] ?? item["photoUrl"] ?? item["imageUrl"] ?? item["url"],
      );
      return url ? [url] : [];
    })
    .filter(looksLikeImage);
}


function paramMap(item: Json): Record<string, string> {
  const list = Array.isArray(item["params"]) ? (item["params"] as Json[]) : [];
  const map: Record<string, string> = {};
  for (const entry of list) {
    if (!entry || typeof entry !== "object") continue;
    const key = asText(entry["key"]);
    if (key) map[key] = asText(entry["value"]);
  }
  return map;
}

function parseOlxItem(item: Json): ScrapedCar | null {
  if (asNumber(item["sellerId"]) !== OLX_SELLER_ID) return null;
  const url = asText(item["url"]);
  const title = asText(item["title"]);
  const params = paramMap(item);
  const year = asNumber(params["year"]);
  const price = asNumber(item["price"]);
  if (!url || !title || !year || !price) return null;

  const cleanTitle = title.replace(/[~|].*$/, "").trim();
  const words = cleanTitle.split(/\s+/).filter(Boolean);
  const make = words[0] ?? "Auto";
  const model = params["model"] || words.slice(1, 3).join(" ") || "Model";
  const trim = cleanTitle.replace(new RegExp(`^${make}\\s*`, "i"), "").replace(new RegExp(`^${model}\\s*`, "i"), "").trim();
  const offerId = asText(item["listingId"]) || url.match(/-ID([\w]+)\.html/i)?.[1] || slugify(title);

  return {
    url,
    externalId: `olx:${offerId}`,
    make,
    model,
    trim: trim || null,
    year: Math.round(year),
    mileage_km: Math.round(asNumber(params["rulaj_pana"])),
    fuel: params["petrol"] ?? null,
    gearbox: params["gearbox"] ?? null,
    power_hp: asNumber(params["engine_power"]) || null,
    engine_cc: asNumber(params["enginesize"]) || null,
    body_type: params["car_body"] || null,
    color: params["color"] || null,
    doors: asNumber(params["door_count"]) || null,
    price: Math.round(price),
    currency: asText(item["priceCurrency"]) || "EUR",
    description: asText(item["description"]) || title,
    features: [],
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

/** Ultima plasă de siguranță: acceptăm doar linkuri de pe pagina noastră de Facebook sau de pe OLX. */
function isOwnListing(source: SourceKey, url: string): boolean {
  if (source === "facebook") return /facebook\.com\/(bremenautocj|[^/]*bremenauto[^/]*)\b/i.test(url);
  return /(^|\.)olx\.ro\//i.test(url);
}

/** Facebook prin API-ul oficial (Graph API) — gratuit, cu token de pagină. */
async function scrapeFacebookGraph(token: string): Promise<ScrapedCar[]> {
  const fields =
    "id,message,permalink_url,full_picture,attachments{media{image{src}},subattachments{media{image{src}}}}";
  const response = await fetch(
    `https://graph.facebook.com/v21.0/me/posts?fields=${encodeURIComponent(fields)}&limit=50&access_token=${encodeURIComponent(token)}`,
  );
  const raw = await response.text();
  if (!response.ok) throw new Error(`Facebook Graph ${response.status}: ${raw.slice(0, 300)}`);
  const data = (JSON.parse(raw) as { data?: Json[] }).data ?? [];
  const cars: ScrapedCar[] = [];
  for (const post of data) {
    const images: string[] = [];
    const push = (m: unknown) => {
      const src = asText(((m as Json)?.["media"] as Json | undefined)?.["image"] && (((m as Json)["media"] as Json)["image"] as Json)["src"]);
      if (src) images.push(src);
    };
    const attachments = ((post["attachments"] as Json | undefined)?.["data"] as Json[] | undefined) ?? [];
    for (const att of attachments) {
      push(att);
      const subs = ((att["subattachments"] as Json | undefined)?.["data"] as Json[] | undefined) ?? [];
      for (const sub of subs) push(sub);
    }
    const full = asText(post["full_picture"]);
    if (full) images.push(full);
    const car = parseFacebookPost({
      text: post["message"],
      url: post["permalink_url"],
      postId: post["id"],
      images: [...new Set(images)],
    });
    if (car) cars.push(car);
  }
  return cars;
}

/** OLX direct, prin API-ul public folosit chiar de site-ul olx.ro — gratuit, fără Apify. */
const OLX_API = "https://www.olx.ro/api/v1/offers/";

/** Parametri numerici: cheia OLX e valoarea brută ("185000"); la restul eticheta e textul afișat ("Seria 3"). */
const OLX_NUMERIC_PARAMS = new Set(["year", "rulaj_pana", "engine_power", "enginesize", "door_count"]);

function olxParamValue(entry: Json): string {
  const value = entry["value"];
  if (value && typeof value === "object") {
    const v = value as Json;
    if (typeof v["value"] === "number") return String(v["value"]);
    const key = asText(v["key"]);
    const label = asText(v["label"]);
    return OLX_NUMERIC_PARAMS.has(asText(entry["key"])) ? key || label : label || key;
  }
  return asText(value);
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/gi, "&");
}

/** Transformă o ofertă din API-ul OLX în forma așteptată de parseOlxItem. */
export function olxApiOfferToItem(offer: Json): Json {
  const rawParams = Array.isArray(offer["params"]) ? (offer["params"] as Json[]) : [];
  let price = 0;
  let currency = "EUR";
  const params: Json[] = [];
  for (const entry of rawParams) {
    if (!entry || typeof entry !== "object") continue;
    const key = asText(entry["key"]);
    if (key === "price") {
      const v = (entry["value"] ?? {}) as Json;
      price = asNumber(v["value"]);
      currency = asText(v["currency"]) || currency;
      continue;
    }
    params.push({ key, value: olxParamValue(entry) });
  }
  const photos = Array.isArray(offer["photos"]) ? (offer["photos"] as Json[]) : [];
  const images = photos
    .map((p) => asText(p["link"]).replace("{width}", "1280").replace("{height}", "960"))
    .filter(Boolean);
  const user = (offer["user"] ?? {}) as Json;
  return {
    sellerId: user["id"],
    url: offer["url"],
    title: offer["title"],
    listingId: String(offer["id"] ?? ""),
    description: decodeEntities(
      asText(offer["description"])
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, ""),
    ).trim(),
    params,
    price,
    priceCurrency: currency,
    images,
  };
}

async function scrapeOlxDirect(): Promise<ScrapedCar[]> {
  const cars: ScrapedCar[] = [];
  let next: string | null = `${OLX_API}?user_id=${OLX_SELLER_ID}&limit=50&offset=0`;
  for (let page = 0; next && page < 5; page++) {
    const response = await fetch(next, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
        Accept: "application/json",
        "Accept-Language": "ro-RO,ro;q=0.9",
      },
    });
    const raw = await response.text();
    if (!response.ok) throw new Error(`OLX ${response.status}: ${raw.slice(0, 200)}`);
    const body = JSON.parse(raw) as { data?: Json[]; links?: { next?: { href?: string } } };
    for (const offer of body.data ?? []) {
      const car = parseOlxItem(olxApiOfferToItem(offer));
      if (car && isOwnListing("olx", car.url)) cars.push(car);
    }
    next = body.links?.next?.href ?? null;
  }
  return cars;
}

async function scrapeSource(source: SourceKey): Promise<ScrapedCar[]> {
  if (source === "facebook") {
    const graphToken = process.env["FB_PAGE_ACCESS_TOKEN"];
    if (graphToken) return scrapeFacebookGraph(graphToken);
    const items = await runActor(FACEBOOK_ACTOR, { startUrls: [{ url: SOURCES.facebook }], resultsLimit: 20 });
    return items
      .map(parseFacebookPost)
      .filter((car): car is ScrapedCar => Boolean(car) && isOwnListing("facebook", car!.url));
  }
  try {
    return await scrapeOlxDirect();
  } catch (error) {
    // Rezervă: dacă API-ul OLX blochează cererea și există conexiune Apify, o folosim.
    if (!process.env["APIFY_API_KEY"]) throw error;
  }
  const items = await runActor(OLX_ACTOR, {
    mode: "search",
    country: "ro",
    extraFilters: { user_id: OLX_SELLER_ID },
    fetchDetails: true,
    maxListings: 40,
  });
  return items.map(parseOlxItem).filter((car): car is ScrapedCar => Boolean(car) && isOwnListing("olx", car!.url));
}

export function fingerprintFor(car: { make: string; model: string; year: number; mileage_km: number; price: number }): string {
  return [slugify(car.make), slugify(car.model), car.year, Math.round(car.mileage_km / 1000), Math.round(car.price / 50)].join("|");
}

function normMake(make: string): string {
  const value = slugify(make);
  if (value === "vw") return "volkswagen";
  if (value === "mercedes") return "mercedes-benz";
  return value;
}

/** Primul token al modelului, ca „A7 Competition” și „A7” să fie aceeași mașină. */
function modelToken(model: string): string {
  const skip = new Set(["competition", "xdrive", "quattro", "automat", "automata", "diesel", "benzina"]);
  return slugify(model).split("-").find((token) => token && !skip.has(token)) ?? slugify(model);
}

type ListingIdentity = { make: string; model: string; year: number; mileage_km: number; price: number };

/**
 * Aceeași mașină publicată și pe OLX și pe Facebook.
 * Prețul și kilometrajul pot diferi puțin între cele două anunțuri.
 */
export function sameListing(a: ListingIdentity, b: ListingIdentity): boolean {
  if (normMake(a.make) !== normMake(b.make)) return false;
  if (a.year !== b.year) return false;
  if (modelToken(a.model) !== modelToken(b.model)) return false;
  const priceGap = Math.abs(a.price - b.price);
  const priceClose = priceGap <= Math.max(400, 0.08 * Math.max(a.price, b.price));
  const kmClose = a.mileage_km === 0 || b.mileage_km === 0 || Math.abs(a.mileage_km - b.mileage_km) <= 3000;
  return priceClose && kmClose;
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

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
  Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
} as const;

/**
 * Descarcă pozele de pe OLX/Facebook și le salvează definitiv în storage-ul propriu.
 * Link-urile Facebook expiră (parametrul `oe=`), deci fără copie locală pozele dispar.
 */
async function mirrorImages(urls: string[], slug: string): Promise<string[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const stored: string[] = [];
  for (const [index, url] of urls.entries()) {
    try {
      const normalized = url.replace(/^http:\/\//, "https://").replace(/;s=0x0$/, ";s=1600x1200");
      const response = await fetch(normalized, { headers: BROWSER_HEADERS });
      if (!response.ok) continue;
      const type = response.headers.get("content-type") ?? "image/jpeg";
      if (!type.startsWith("image/")) continue;
      const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
      const path = `${slug}/${index + 1}.${ext}`;
      const { error } = await supabaseAdmin.storage
        .from("car-photos")
        .upload(path, await response.arrayBuffer(), { contentType: type, upsert: true });
      if (!error) stored.push(path);
    } catch {
      // poza individuală eșuată nu blochează restul importului
    }
  }
  return stored;
}

/** Mută în storage pozele mașinilor deja existente care încă folosesc link-uri externe. */
export async function backfillImages(limit = 12): Promise<{ updated: number; errors: string[] }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("cars").select("id, slug, images").limit(200);
  const pending = (data ?? []).filter((car) =>
    (car.images ?? []).some((url: string) => /^https?:\/\//.test(url)),
  );
  const errors: string[] = [];
  let updated = 0;
  for (const car of pending.slice(0, limit)) {
    const external = (car.images ?? []).filter((url: string) => /^https?:\/\//.test(url));
    const local = (car.images ?? []).filter((url: string) => !/^https?:\/\//.test(url));
    const mirrored = await mirrorImages(external, car.slug);
    if (!mirrored.length) {
      errors.push(`${car.slug}: nicio poză descărcată`);
      continue;
    }
    const { error } = await supabaseAdmin
      .from("cars")
      .update({ images: [...local, ...mirrored] })
      .eq("id", car.id);
    if (error) errors.push(`${car.slug}: ${error.message}`);
    else updated++;
  }
  return { updated, errors };
}


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

  const { data: existing } = await supabaseAdmin
    .from("cars")
    .select("id, source_url, external_id, fingerprint, make, model, year, mileage_km, price");
  const known = (existing ?? []).map((car) => ({
    id: car.id,
    source_url: car.source_url,
    external_id: car.external_id,
    fingerprint: car.fingerprint,
    make: car.make,
    model: car.model,
    year: car.year,
    mileage_km: car.mileage_km,
    price: Number(car.price),
  }));

  for (const car of cars) {
    const fingerprint = fingerprintFor(car);
    const match = known.find(
      (row) =>
        row.source_url === car.url ||
        row.external_id === car.externalId ||
        row.fingerprint === fingerprint ||
        sameListing(row, car),
    );
    if (match) {
      result.skipped++;
      await supabaseAdmin.from("cars").update({ last_seen_at: new Date().toISOString() }).eq("id", match.id);
      continue;
    }
    const suffix = slugify(car.externalId).slice(-10);
    const slug = `${slugify(`${car.make}-${car.model}-${car.year}-${car.mileage_km}`)}-${suffix}`;
    const externalImages = (car.images ?? []).filter((url) => /^https?:\/\//.test(url)).slice(0, 15);
    const storedImages = await mirrorImages(externalImages, slug);
    const { error } = await supabaseAdmin.from("cars").insert({
      slug,
      make: car.make.trim(), model: car.model.trim(), trim: car.trim ?? null,
      year: car.year, mileage_km: car.mileage_km, fuel: normalizeFuel(car.fuel), gearbox: normalizeGearbox(car.gearbox),
      power_hp: car.power_hp ?? null, engine_cc: car.engine_cc ?? null, body_type: car.body_type ?? null,
      color: car.color ?? null, doors: car.doors ?? null, price: car.price,
      currency: (car.currency ?? "EUR").toUpperCase(), description: car.description ?? null,
      features: (car.features ?? []).slice(0, 40), images: storedImages.length ? storedImages : externalImages,

      published: true, status: "disponibila", source, source_url: car.url,
      external_id: car.externalId, fingerprint, last_seen_at: new Date().toISOString(),
    });
    if (error) {
      if (error.code === "23505") result.skipped++;
      else result.errors.push(`${car.url}: ${error.message}`);
      continue;
    }
    known.push({
      id: slug,
      source_url: car.url,
      external_id: car.externalId,
      fingerprint,
      make: car.make,
      model: car.model,
      year: car.year,
      mileage_km: car.mileage_km,
      price: car.price,
    });
    result.inserted++;
  }
  // Mașinile care nu mai apar în sursă sunt considerate vândute și dispar din stoc.
  // Protecție: acționăm doar dacă lista primită e consistentă (minim 3 anunțuri).
  if (cars.length >= 3) {
    const seenIds = new Set(cars.map((car) => car.externalId));
    const seenPrints = new Set(cars.map((car) => fingerprintFor(car)));
    const { data: current } = await supabaseAdmin
      .from("cars")
      .select("id, external_id, fingerprint")
      .eq("source", source)
      .eq("published", true);
    const gone = (current ?? []).filter(
      (car) => !(car.external_id && seenIds.has(car.external_id)) && !(car.fingerprint && seenPrints.has(car.fingerprint)),
    );
    if (gone.length && gone.length <= Math.ceil(cars.length / 2)) {
      await supabaseAdmin
        .from("cars")
        .update({ status: "vanduta", published: false })
        .in("id", gone.map((car) => car.id));
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


export async function importAll(options: { force?: boolean } = {}): Promise<ImportResult[]> {
  const results: ImportResult[] = [];
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: lastFb } = await supabaseAdmin
    .from("import_runs")
    .select("created_at")
    .eq("source", "facebook")
    .is("errors", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sources = importSources(lastFb?.created_at ?? null, Boolean(options.force));
  // Actorii sunt porniți serial pentru a evita timeout-urile gateway-ului la două rulări lungi simultan.
  for (const source of sources) results.push(await importSource(source));
  // Pozele vechi, încă găzduite extern, sunt mutate treptat în storage-ul propriu.
  await backfillImages(12);
  // Orice schimbare de stoc declanșează reindexarea completă (sitemap + IndexNow).
  if (results.some((r) => r.inserted > 0 || r.skipped > 0)) {
    const { dailySeoRefresh } = await import("./seo-ping.server");
    await dailySeoRefresh();
  }
  return results;
}