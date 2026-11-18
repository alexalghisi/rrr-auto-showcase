import { spinFor } from "./spin360";

/** One frame = a rectangle inside a decoded sprite sheet. */
export type SpinFrame = { image: CanvasImageSource; sx: number; sy: number; sw: number; sh: number };
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

/**
 * Safari decodes/uploads an image the first time it is drawn, which froze the first
 * pass of every sheet mid-drag (skipped frames, lag behind the finger). Drawing each
 * sheet once into a tiny canvas before the frames are published moves that cost to load time.
 */
function warm(image: CanvasImageSource) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 8; canvas.height = 8;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(image, 0, 0, 8, 8);
    ctx.getImageData(0, 0, 1, 1); // force the draw to complete now
  } catch { /* warming is best-effort */ }
}

async function loadSheet(url: string) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    try {
      await image.decode();
      // A GPU-ready bitmap avoids a decode/upload hitch the first time each sheet is drawn mid-drag.
      if (typeof createImageBitmap === "function") {
        try {
          const bitmap = await createImageBitmap(image);
          image.src = ""; // drop the second decoded copy; phones run out of image memory otherwise
          warm(bitmap);
          return bitmap;
        } catch { /* fall back to the element */ }
      }
      warm(image);
      return image;
    }
    catch { /* One retry for transient network failures. */ }
  }
  return null;
}

/** Decode whole sheets before publishing frames; share loads across cards and detail pages. */
export function loadSpinFrames(slug: string, size: "lg" | "md" | "sm") {
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
  // Keep only one large (md/lg) sequence decoded: several cars' worth of big frames
  // exhausted Safari's image memory and caused re-decode stalls mid-drag.
  if (size !== "sm") for (const other of [...cache.keys()]) if (other !== key && !other.endsWith(":sm")) cache.delete(other);
  cache.set(key, promise);
  while (cache.size > MAX_CACHED) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  return promise;
}
