// Cars that have an AI-generated 360° turntable (files live in /public/spin/<slug>/).
// Frames are packed into WebP sprite sheets so a card needs ONE request, not ~120:
//   sm-0.webp            all small frames (320×180), 12 columns
//   lg-0.webp … lg-N.webp large frames (640×360), 6 columns × 8 rows per sheet
// 001.jpg / s/001.jpg are kept as instant posters.
// Every sequence must loop seamlessly (last frame flows into the first).
// generated: inclusive large-frame ranges filled in between real photos (never rest there).
// rest: every Nth large frame is a real photo; the rest are motion-interpolated in-betweens.
export const SPIN_360: Record<string, { frames: number; small: number; ext?: "jpg"; blend?: boolean; rest?: number; generated?: Array<[number, number]> }> = {
  "vw-touareg-4x4-automat-2008-296000-9136006809": { frames: 263, small: 132, generated: [[120, 128], [234, 242]] },
  "dacia-sandero-stepway-2016-156000-2110006809": { frames: 248, small: 124 },
  "audi-a6-2015-0-6008006809": { frames: 248, small: 124 },
  "audi-a7-competition-2015-0-4648006809": { frames: 192, small: 96, rest: 4 },
  "bmw-x1-x-2013-24300-7838006809": { frames: 266, small: 133, generated: [[120, 138]] },
  "bmw-x6-2010-278000-1520006809": { frames: 247, small: 124 },
  "suzuki-vitara-2011-0-3444006809": { frames: 211, small: 106 },
};

const V = "v=20261119-phone";

export type SpinSheet = { url: string; first: number; frames: number };

export function spinFor(slug: string, size: "lg" | "md" | "sm" = "lg") {
  const s = SPIN_360[slug];
  if (!s) return null;
  const lg = size === "lg";
  // md = the small sequence's frames (every other large frame) at 512×288, in 4×6 sheets:
  // sharp on a phone screen, a third of the decoded memory of lg, so phones never stall mid-drag.
  const md = size === "md";
  const count = lg ? s.frames : s.small;
  const frameW = lg ? 640 : md ? 512 : 320;
  const frameH = lg ? 360 : md ? 288 : 180;
  const cols = lg ? 6 : md ? 4 : 12;
  const perSheet = lg ? 48 : md ? 24 : count;
  const sheets: SpinSheet[] = [];
  for (let first = 0, i = 0; first < count; first += perSheet, i++) {
    sheets.push({
      url: `/spin/${slug}/${size}-${i}.${md ? "webp" : s.ext ?? "webp"}?${V}`,
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
    blend: s.blend !== false,
    // Small sheets keep every other frame, so the real-photo stride halves.
    generated: (s.generated ?? []).map(([a, b]) => lg ? [a, b] as [number, number] : [Math.ceil(a / 2), Math.floor(b / 2)] as [number, number]),
    rest: Math.max(1, Math.round((s.rest ?? 1) * (lg ? 1 : s.small / s.frames))),
  };
}
