/**
 * Studio 360°: eight AI-generated angles per car, on a seamless grey studio floor,
 * built from that car's own dealer photos. Stored in the car-photos bucket under
 * studio360/<slug>/<index>.<ext>; studio360/index.json lists which cars are done.
 *
 * Turning order (45° per step): front, front-left 3/4, left side, rear-left 3/4,
 * rear, rear-right 3/4, right side, front-right 3/4.
 */
export const STUDIO_ANGLES = [
  {
    view: "front",
    text: "straight-on front view (0°): grille, both headlights and front plate area centred, car symmetric",
  },
  {
    view: "front-left",
    text: "front three-quarter view from the car's LEFT/driver side (45°): front and left flank visible, car nose pointing to the left of the image",
  },
  {
    view: "left",
    text: "full left side profile (90°): car nose pointing to the LEFT edge of the image, both left wheels fully visible",
  },
  {
    view: "rear-left",
    text: "rear three-quarter view from the car's LEFT side (135°): rear and left flank visible, car nose pointing to the right of the image",
  },
  {
    view: "rear",
    text: "straight-on rear view (180°): tail lights and boot centred, car symmetric",
  },
  {
    view: "rear-right",
    text: "rear three-quarter view from the car's RIGHT side (225°): rear and right flank visible, car nose pointing to the left of the image",
  },
  {
    view: "right",
    text: "full right side profile (270°): car nose pointing to the RIGHT edge of the image, both right wheels fully visible",
  },
  {
    view: "front-right",
    text: "front three-quarter view from the car's RIGHT side (315°): front and right flank visible, car nose pointing to the right of the image",
  },
] as const;

export const STUDIO_FRAME_COUNT = STUDIO_ANGLES.length;

/** Generation order: the anchor (front-left 3/4, matching dealer photo 1) first, then the other 3/4 views, then the straight views. */
export const STUDIO_GENERATION_ORDER = [1, 3, 5, 7, 0, 2, 4, 6] as const;
export const STUDIO_ANCHOR = 1;

export type StudioEntry = {
  /** Storage file name per angle index (e.g. "1.png"); missing until generated. */
  files: Record<string, string>;
  /** Cache-busting version, changes on reset. */
  v: string;
  /** Generation failures per angle, so a broken car doesn't block the queue forever. */
  failures?: Record<string, number>;
};
export type StudioManifest = { cars: Record<string, StudioEntry> };

export const MAX_FAILURES_PER_ANGLE = 3;

/** Next angle to generate for a car, or null when every angle is done or has given up. */
export function nextStudioAngle(entry: StudioEntry | undefined): number | null {
  for (const angle of STUDIO_GENERATION_ORDER) {
    if (entry?.files[angle]) continue;
    if ((entry?.failures?.[angle] ?? 0) >= MAX_FAILURES_PER_ANGLE) continue;
    // Never generate other angles before the anchor exists: it fixes scale, light and floor line.
    if (angle !== STUDIO_ANCHOR && !entry?.files[STUDIO_ANCHOR]) return null;
    return angle;
  }
  return null;
}

/** Public frame URLs in turning order, only when all eight angles exist. */
export function studioFrameUrls(slug: string, entry: StudioEntry | undefined): string[] {
  if (!entry) return [];
  const urls: string[] = [];
  for (let i = 0; i < STUDIO_FRAME_COUNT; i++) {
    const file = entry.files[i];
    if (!file) return [];
    urls.push(`/api/public/photo/studio360/${slug}/${file}?v=${entry.v}`);
  }
  return urls;
}
