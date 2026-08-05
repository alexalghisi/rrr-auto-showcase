/**
 * Afișarea vizualizărilor: numerele reale sunt amplificate pentru a arăta mai
 * atractiv în panoul de administrare. Baza per mașină e determinată de slug,
 * deci rămâne stabilă între reîncărcări.
 */
const MULTIPLIER = 4.2;

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) h = (h * 31 + input.charCodeAt(i)) % 100000;
  return h;
}

/** Vizualizări afișate pentru o mașină. */
export function displayCarViews(slug: string, real: number): number {
  const base = 90 + (hash(slug) % 170);
  return Math.round(base + real * MULTIPLIER);
}

/** Vizualizări afișate pentru întreg site-ul. */
export function displaySiteViews(real: number, baseBoost = 1800): number {
  return Math.round(baseBoost + real * MULTIPLIER);
}
