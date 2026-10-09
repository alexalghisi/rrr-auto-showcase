import { spinFor } from "./spin360";

/** One frame = a rectangle inside a decoded sprite sheet. */
export type SpinFrame = { image: HTMLImageElement; sx: number; sy: number; sw: number; sh: number };
type Sequence = { frames: SpinFrame[]; complete: boolean };

const cache = new Map<string, Promise<Sequence>>();
const MAX_CACHED = 10;
const pending: Array<() => void> = [];
let running = 0;

async function slot<T>(work: () => Promise<T>): Promise<T> {
  if (running >= 4) await new Promise<void>((resolve) => pending.push(resolve));
  else running++;
  try { return await work(); }
  finally {
    const next = pending.shift();
    if (next) next();
    else running--;
  }
}

async function loadSheet(url: string) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    try { await image.decode(); return image; }
    catch { /* One retry for transient network failures. */ }
  }
  return null;
}

/** Decode whole sheets before publishing frames; share loads across cards and detail pages. */
export function loadSpinFrames(slug: string, size: "lg" | "sm") {
  const key = `${slug}:${size}`;
  const existing = cache.get(key);
  if (existing) { cache.delete(key); cache.set(key, existing); return existing; }
  const spin = spinFor(slug, size);
  if (!spin) return Promise.resolve({ frames: [], complete: false });
  const promise = (async (): Promise<Sequence> => {
    const images = await Promise.all(spin.sheets.map((sheet) => slot(() => loadSheet(sheet.url))));
    if (images.some((image) => !image)) { cache.delete(key); return { frames: [], complete: false }; }
    const frames: SpinFrame[] = [];
    spin.sheets.forEach((sheet, s) => {
      const image = images[s]!;
      for (let k = 0; k < sheet.frames; k++) {
        frames.push({
          image,
          sx: (k % spin.cols) * spin.frameW,
          sy: Math.floor(k / spin.cols) * spin.frameH,
          sw: spin.frameW,
          sh: spin.frameH,
        });
      }
    });
    return { frames, complete: frames.length === spin.count };
  })();
  cache.set(key, promise);
  while (cache.size > MAX_CACHED) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  return promise;
}
