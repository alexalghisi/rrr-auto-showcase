import { spinFor } from "./spin360";

type Sequence = { frames: HTMLImageElement[]; complete: boolean };
const cache = new Map<string, Promise<Sequence>>();
const MAX_CACHED = 8;
const pending: Array<() => void> = [];
let running = 0;

async function slot<T>(work: () => Promise<T>): Promise<T> {
  if (running >= 6) await new Promise<void>((resolve) => pending.push(resolve));
  else running++;
  try { return await work(); }
  finally {
    const next = pending.shift();
    if (next) next();
    else running--;
  }
}

/** Decode before publishing frames; share loads across cards and detail pages. */
export function loadSpinFrames(slug: string, size: "lg" | "sm") {
  const key = `${slug}:${size}`;
  const existing = cache.get(key);
  if (existing) { cache.delete(key); cache.set(key, existing); return existing; }
  const spin = spinFor(slug, size);
  if (!spin) return Promise.resolve({ frames: [], complete: false });
  const promise = (async () => {
    const frames: HTMLImageElement[] = [];
    const loadOne = (index: number) => slot(async () => {
      for (let attempt = 0; attempt < 2; attempt++) {
        const image = new Image();
        image.decoding = "async";
        image.src = spin.url(index);
        try { await image.decode(); return image; }
        catch { /* One retry for transient network failures. */ }
      }
      return null;
    });
    // Queue a small batch at a time: one car cannot monopolize the connection.
    for (let start = 0; start < spin.count; start += 6) {
      const batch = await Promise.all(Array.from({ length: Math.min(6, spin.count - start) }, (_, i) => loadOne(start + i)));
      for (const frame of batch) {
        if (!frame) { cache.delete(key); return { frames: [], complete: false }; }
        frames.push(frame);
      }
    }
    return { frames, complete: true };
  })();
  cache.set(key, promise);
  while (cache.size > MAX_CACHED) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  return promise;
}