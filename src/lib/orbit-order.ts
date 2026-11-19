/**
 * Dealer photo convention: 1 = front-left 3/4, 2 = rear same side,
 * 3 = front other side, 4 = rear other side, 5+ = interior/details.
 * The real walk-around order is 1 → 2 → 4 → 3 (interior excluded).
 */
export function orbitImages(images: string[]): string[] {
  if (images.length >= 4) return [images[0], images[1], images[3], images[2]] as string[];
  return images;
}

/** Index in the original images array for each orbit position. */
export function orbitSourceIndexes(count: number): number[] {
  if (count >= 4) return [0, 1, 3, 2];
  return Array.from({ length: count }, (_, i) => i);
}
