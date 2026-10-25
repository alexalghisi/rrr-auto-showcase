import { createServerFn } from "@tanstack/react-start";

import type { Car } from "./cars.server";

// Short per-isolate cache for the public stock: SSR of the homepage and /stoc no
// longer waits on a database round-trip for every visitor. Admin changes show up
// within CACHE_TTL_MS.
const CACHE_TTL_MS = 30_000;
const MAX_CACHED_CARS = 50;
let listCache: { at: number; value: Promise<Car[]> } | null = null;
const carCache = new Map<string, { at: number; value: Promise<Car | null> }>();

function fresh(entry: { at: number } | null | undefined) {
  return !!entry && Date.now() - entry.at < CACHE_TTL_MS;
}

async function fetchPublicCars(): Promise<Car[]> {
  const { createPublicClient } = await import("./cars.server");
  const { data, error } = await createPublicClient()
    .from("cars")
    .select("*")
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

async function fetchPublicCar(slug: string): Promise<Car | null> {
  const { createPublicClient } = await import("./cars.server");
  const { data: car, error } = await createPublicClient()
    .from("cars")
    .select("*")
    .eq("published", true)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return car;
}

export const listPublicCars = createServerFn({ method: "GET" }).handler(async () => {
  if (!fresh(listCache)) {
    const value = fetchPublicCars();
    const entry = { at: Date.now(), value };
    listCache = entry;
    value.catch(() => {
      if (listCache === entry) listCache = null;
    });
  }
  return listCache!.value;
});

export const getPublicCar = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug).slice(0, 200) }))
  .handler(async ({ data }) => {
    const cached = carCache.get(data.slug);
    if (fresh(cached)) return cached!.value;
    const value = fetchPublicCar(data.slug);
    const entry = { at: Date.now(), value };
    carCache.delete(data.slug);
    carCache.set(data.slug, entry);
    while (carCache.size > MAX_CACHED_CARS) {
      const oldest = carCache.keys().next().value;
      if (oldest === undefined) break;
      carCache.delete(oldest);
    }
    value.catch(() => {
      if (carCache.get(data.slug) === entry) carCache.delete(data.slug);
    });
    return value;
  });
