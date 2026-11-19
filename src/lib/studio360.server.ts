import type { Car } from "./cars.server";
import {
  STUDIO_ANCHOR,
  STUDIO_ANGLES,
  nextStudioAngle,
  studioFrameUrls,
  type StudioEntry,
  type StudioManifest,
} from "./studio360";

const BUCKET = "car-photos";
const MANIFEST = "studio360/index.json";
const LOCK = "studio360/lock.json";
const LOCK_MS = 4 * 60_000;
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
/** Image models tried in order; STUDIO360_MODEL overrides the first choice. */
const IMAGE_MODELS = [
  process.env["STUDIO360_MODEL"],
  "google/gemini-3-pro-image-preview",
  "google/gemini-2.5-flash-image-preview",
  "google/gemini-2.5-flash-image",
].filter((m): m is string => Boolean(m));
const CHECK_MODEL = "google/gemini-3.6-flash";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

// ---------- manifest ----------

let manifestCache: { at: number; value: Promise<StudioManifest> } | null = null;

async function readManifest(): Promise<StudioManifest> {
  const db = await admin();
  const { data } = await db.storage.from(BUCKET).download(MANIFEST);
  if (!data) return { cars: {} };
  try {
    const parsed = JSON.parse(await data.text()) as StudioManifest;
    return parsed && typeof parsed.cars === "object" ? parsed : { cars: {} };
  } catch {
    return { cars: {} };
  }
}

async function writeManifest(manifest: StudioManifest) {
  const db = await admin();
  await db.storage.from(BUCKET).upload(MANIFEST, JSON.stringify(manifest), {
    contentType: "application/json",
    upsert: true,
  });
  manifestCache = null;
}

/** Manifest for public pages, cached for a minute per isolate. */
export function publicManifest(): Promise<StudioManifest> {
  if (!manifestCache || Date.now() - manifestCache.at > 60_000) {
    const value = readManifest().catch(() => ({ cars: {} }) as StudioManifest);
    manifestCache = { at: Date.now(), value };
  }
  return manifestCache.value;
}

export type CarWithStudio = Car & { studio360?: string[] };

export async function withStudio360<T extends Car>(
  cars: T[],
): Promise<Array<T & { studio360?: string[] }>> {
  const manifest = await publicManifest();
  return cars.map((car) => {
    const frames = studioFrameUrls(car.slug, manifest.cars[car.slug]);
    return frames.length ? { ...car, studio360: frames } : car;
  });
}

// ---------- images ----------

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function photoDataUrl(path: string): Promise<string | null> {
  try {
    if (/^https?:\/\//.test(path)) {
      const response = await fetch(path.replace(/^http:\/\//, "https://"), {
        headers: { "User-Agent": "Mozilla/5.0", Accept: "image/*" },
      });
      if (!response.ok) return null;
      const type = response.headers.get("content-type") ?? "image/jpeg";
      return `data:${type};base64,${toBase64(new Uint8Array(await response.arrayBuffer()))}`;
    }
    const db = await admin();
    const { data } = await db.storage.from(BUCKET).download(path.replace(/^\/+/, ""));
    if (!data) return null;
    return `data:${data.type || "image/jpeg"};base64,${toBase64(new Uint8Array(await data.arrayBuffer()))}`;
  } catch {
    return null;
  }
}

type Part = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };

async function gateway(body: Record<string, unknown>) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("LOVABLE_API_KEY lipsește");
  return fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  });
}

async function generateImage(parts: Part[]): Promise<string> {
  let lastError = "niciun model de imagine disponibil";
  for (const model of IMAGE_MODELS) {
    const response = await gateway({
      model,
      modalities: ["image", "text"],
      messages: [{ role: "user", content: parts }],
    });
    if (!response.ok) {
      lastError = `${model} ${response.status}: ${(await response.text()).slice(0, 200)}`;
      // Unknown/unsupported model: try the next one. Rate limits or credits: stop here.
      if (response.status === 400 || response.status === 404) continue;
      throw new Error(lastError);
    }
    const json = (await response.json()) as {
      choices?: Array<{
        message?: { images?: Array<{ image_url?: { url?: string } }>; content?: unknown };
      }>;
    };
    const url = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (url?.startsWith("data:image/")) return url;
    lastError = `${model}: răspuns fără imagine`;
  }
  throw new Error(lastError);
}

/** Asks a vision model whether the frame shows the same car from the requested angle. */
async function checkFrame(frame: string, reference: string, angle: number): Promise<boolean> {
  try {
    const response = await gateway({
      model: CHECK_MODEL,
      response_format: { type: "json_object" },
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Image A is a real photo of a car. Image B should show THE SAME car (same make, model, body, colour, wheels) in a plain studio, seen from this angle: ${STUDIO_ANGLES[angle]!.text}. Reply JSON {"sameCar": boolean, "rightAngle": boolean, "clean": boolean} where clean means no text, no people, no duplicated or deformed parts.`,
            },
            { type: "image_url", image_url: { url: reference } },
            { type: "image_url", image_url: { url: frame } },
          ],
        },
      ],
    });
    if (!response.ok) return true; // the check is advisory; never block on it
    const json = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const verdict = JSON.parse(json.choices?.[0]?.message?.content ?? "{}") as Record<
      string,
      unknown
    >;
    return (
      verdict["sameCar"] !== false && verdict["rightAngle"] !== false && verdict["clean"] !== false
    );
  } catch {
    return true;
  }
}

function prompt(car: Car, angle: number, hasAnchor: boolean): string {
  const name = `${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ""} ${car.year}${car.color ? `, ${car.color}` : ""}`;
  return [
    `Professional car-dealer studio photo of the exact car shown in the reference photos: ${name}.`,
    "Keep this exact vehicle: same body style, paint colour, wheels, trim, lights and details as in the real photos. Do not change the model or invent accessories.",
    `Camera angle: ${STUDIO_ANGLES[angle]!.text}. Camera at headlight height, slight telephoto, no tilt.`,
    "Background: seamless light-grey photo studio (cyclorama) with soft even lighting and a soft contact shadow under the car. Nothing else in the scene.",
    "Composition: landscape 4:3, the whole car visible and centred, car length about 70% of the image width, wheels resting on the same floor line at about 75% of the image height.",
    "Number plates blank. No text, no logos added, no watermark, no people.",
    hasAnchor
      ? "The LAST reference image is the studio shot already made of this car: match its background, lighting, colour grading, camera height, car size and floor line exactly, only the viewing angle changes."
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

// ---------- worker ----------

async function takeLock(): Promise<boolean> {
  const db = await admin();
  const { data } = await db.storage.from(BUCKET).download(LOCK);
  if (data) {
    try {
      const { at } = JSON.parse(await data.text()) as { at: number };
      if (Date.now() - at < LOCK_MS) return false;
    } catch {
      /* corrupt lock: take it */
    }
  }
  await db.storage.from(BUCKET).upload(LOCK, JSON.stringify({ at: Date.now() }), {
    contentType: "application/json",
    upsert: true,
  });
  return true;
}

async function releaseLock() {
  const db = await admin();
  await db.storage.from(BUCKET).remove([LOCK]);
}

export type StudioRunResult = {
  generated: string[];
  failed: string[];
  pending: number;
  busy?: boolean;
};

/**
 * Generates up to `max` missing studio angles, one car at a time, oldest pending first.
 * Called repeatedly by pg_cron; every call is resumable and idempotent.
 */
export async function runStudio360(
  options: {
    max?: number | undefined;
    slug?: string | undefined;
    reset?: boolean | undefined;
  } = {},
): Promise<StudioRunResult> {
  const max = Math.max(1, Math.min(4, options.max ?? 2));
  const result: StudioRunResult = { generated: [], failed: [], pending: 0 };
  if (!(await takeLock())) return { ...result, busy: true };
  try {
    const db = await admin();
    const manifest = await readManifest();
    if (options.reset && options.slug) {
      manifest.cars[options.slug] = { files: {}, v: String(Date.now()) };
      await writeManifest(manifest);
    }
    let query = db
      .from("cars")
      .select("*")
      .eq("published", true)
      .neq("status", "vanduta")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });
    if (options.slug) query = query.eq("slug", options.slug);
    const { data: cars, error } = await query;
    if (error) throw new Error(error.message);

    const queue = (cars ?? []).filter(
      (car) => car.images.length > 0 && nextStudioAngle(manifest.cars[car.slug]) !== null,
    );
    result.pending = queue.length;

    let budget = max;
    for (const car of queue) {
      if (budget <= 0) break;
      const references = (await Promise.all(car.images.slice(0, 4).map(photoDataUrl))).filter(
        (u): u is string => !!u,
      );
      if (!references.length) {
        result.failed.push(`${car.slug}: pozele reale nu se pot descărca`);
        continue;
      }
      const entry: StudioEntry = manifest.cars[car.slug] ?? { files: {}, v: String(Date.now()) };
      manifest.cars[car.slug] = entry;

      let angle = nextStudioAngle(entry);
      while (angle !== null && budget > 0) {
        budget--;
        const anchorFile = angle === STUDIO_ANCHOR ? null : entry.files[STUDIO_ANCHOR];
        const anchor = anchorFile
          ? await photoDataUrl(`studio360/${car.slug}/${anchorFile}`)
          : null;
        const parts: Part[] = [
          { type: "text", text: prompt(car, angle, !!anchor) },
          ...references.map((url) => ({ type: "image_url" as const, image_url: { url } })),
          ...(anchor ? [{ type: "image_url" as const, image_url: { url: anchor } }] : []),
        ];
        try {
          let frame = await generateImage(parts);
          if (!(await checkFrame(frame, references[0]!, angle))) {
            frame = await generateImage(parts);
            if (!(await checkFrame(frame, references[0]!, angle)))
              throw new Error("verificarea unghiului a eșuat");
          }
          const [, type = "image/png", data = ""] =
            frame.match(/^data:(image\/[a-z]+);base64,(.*)$/s) ?? [];
          const file = `${angle}.${type.includes("jpeg") ? "jpg" : type.split("/")[1]}`;
          const { error: uploadError } = await db.storage
            .from(BUCKET)
            .upload(`studio360/${car.slug}/${file}`, fromBase64(data), {
              contentType: type,
              upsert: true,
            });
          if (uploadError) throw new Error(uploadError.message);
          entry.files[angle] = file;
          result.generated.push(`${car.slug}#${angle}`);
        } catch (error) {
          result.failed.push(`${car.slug}#${angle}: ${(error as Error).message}`);
          // Credits or rate limits are not the car's fault: not counted, stop this run, retry next call.
          if (/\b(402|429)\b/.test((error as Error).message)) {
            budget = 0;
            break;
          }
          entry.failures = { ...entry.failures, [angle]: (entry.failures?.[angle] ?? 0) + 1 };
        }
        await writeManifest(manifest);
        angle = nextStudioAngle(entry);
      }
    }
    return result;
  } finally {
    await releaseLock();
  }
}
