// Cars that have an AI-generated 360° turntable (files live in /public/spin/<slug>/).
// Frames are packed into WebP sprite sheets so a card needs ONE request, not ~120:
//   sm-0.webp            all small frames (320×180), 12 columns
//   lg-0.webp … lg-N.webp large frames (640×360), 6 columns × 8 rows per sheet
// 001.jpg / s/001.jpg are kept as instant posters.
// Every sequence must loop seamlessly (last frame flows into the first).
export const SPIN_360: Record<string, { frames: number; small: number }> = {
  "vw-touareg-4x4-automat-2008-296000-9136006809": { frames: 245, small: 123 },
  "dacia-sandero-stepway-2016-156000-2110006809": { frames: 248, small: 124 },
  "audi-a6-2015-0-6008006809": { frames: 248, small: 124 },
  "bmw-x1-x-2013-24300-7838006809": { frames: 247, small: 124 },
  "bmw-x6-2010-278000-1520006809": { frames: 247, small: 124 },
  "suzuki-vitara-2011-0-3444006809": { frames: 211, small: 106 },
};

const V = "v=20261025-q60";

export type SpinSheet = { url: string; first: number; frames: number };

export function spinFor(slug: string, size: "lg" | "sm" = "lg") {
  const s = SPIN_360[slug];
  if (!s) return null;
  const lg = size === "lg";
  const count = lg ? s.frames : s.small;
  const frameW = lg ? 640 : 320;
  const frameH = lg ? 360 : 180;
  const cols = lg ? 6 : 12;
  const perSheet = lg ? 48 : count;
  const sheets: SpinSheet[] = [];
  for (let first = 0, i = 0; first < count; first += perSheet, i++) {
    sheets.push({
      url: `/spin/${slug}/${size}-${i}.webp?${V}`,
      first,
      frames: Math.min(perSheet, count - first),
    });
  }
  return {
    count,
    frameW,
    frameH,
    cols,
    sheets,
    poster: lg ? `/spin/${slug}/001.jpg?${V}` : `/spin/${slug}/s/001.jpg?${V}`,
  };
}
