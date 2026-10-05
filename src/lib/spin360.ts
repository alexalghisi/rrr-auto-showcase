// Cars that have an AI-generated 360° turntable (frames live in /public/spin/<slug>/).
// Large set (car page): 001..NNN.jpg, 960px. Small set (cards): s/001..MMM.jpg, 480px.
export const SPIN_360: Record<string, { frames: number; small: number }> = {
  "vw-touareg-4x4-automat-2008-296000-9136006809": { frames: 120, small: 72 },
};

export function spinFor(slug: string, size: "lg" | "sm" = "lg") {
  const s = SPIN_360[slug];
  if (!s) return null;
  const count = size === "lg" ? s.frames : s.small;
  const dir = size === "lg" ? `/spin/${slug}` : `/spin/${slug}/s`;
  return {
    count,
    url: (i: number) => `${dir}/${String(i + 1).padStart(3, "0")}.jpg`,
  };
}
