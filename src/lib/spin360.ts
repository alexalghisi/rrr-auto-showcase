// Cars that have an AI-generated 360° turntable (frames live in /public/spin/<slug>/).
// Large set (car page): 001..NNN.jpg, 640px. Small set (cards): s/001..MMM.jpg, 320px.
// Every sequence must loop seamlessly (last frame flows into the first); partial
// orbits are stored ping-pong (forward + reverse) so they never jump at the wrap.
export const SPIN_360: Record<string, { frames: number; small: number }> = {
  "vw-touareg-4x4-automat-2008-296000-9136006809": { frames: 245, small: 123 },
  "dacia-sandero-stepway-2016-156000-2110006809": { frames: 238, small: 119 },
  "audi-a6-2015-0-6008006809": { frames: 247, small: 124 },
  "bmw-x1-x-2013-24300-7838006809": { frames: 247, small: 124 },
  "bmw-x6-2010-278000-1520006809": { frames: 247, small: 124 },
  "suzuki-vitara-2011-0-3444006809": { frames: 211, small: 106 },
};

export function spinFor(slug: string, size: "lg" | "sm" = "lg") {
  const s = SPIN_360[slug];
  if (!s) return null;
  const count = size === "lg" ? s.frames : s.small;
  const dir = size === "lg" ? `/spin/${slug}` : `/spin/${slug}/s`;
  return {
    count,
    url: (i: number) => `${dir}/${String(i + 1).padStart(3, "0")}.jpg?v=20261009`,
  };
}
