/** One revolution takes one viewer width, bounded for comfortable phone and mouse use. */
export function dragTurnDistance(width: number): number {
  return Math.max(280, Math.min(480, width));
}

export function draggedPosition(
  start: number,
  startX: number,
  clientX: number,
  distance: number,
): number {
  return start - (clientX - startX) / distance;
}

export function turnFrame(position: number, count: number): number {
  if (count <= 0) return 0;
  return ((Math.round(position * count) % count) + count) % count;
}
