/** Position is measured in turns, so every car has identical drag sensitivity. */
export const wrapTurn = (turn: number) => ((turn % 1) + 1) % 1;

export function followTurn(current: number, target: number, delta: number) {
  return current + (target - current) * (1 - Math.exp(-24 * Math.min(delta, 0.05)));
}

export function coastTurn(position: number, velocity: number, delta: number) {
  const damping = Math.exp(-4.5 * Math.min(delta, 0.05));
  return { position: position + velocity * (1 - damping) / 4.5, velocity: velocity * damping };
}

export function frameAt(turn: number, count: number) {
  return Math.floor(wrapTurn(turn) * count) % count;
}

/** Turn value inside one whole frame, so a stopped spin is never a cross-fade. */
export function settleTurn(turn: number, count: number, stride = 1) {
  // stride > 1: rest only on real photos, never on a generated in-between frame.
  const step = Math.max(1, Math.floor(stride));
  const index = (Math.round((wrapTurn(turn) * count) / step) * step) % count;
  return (index + 1e-4) / count;
}

/** Fractional sampling avoids snapping slow pointer movements to whole frames. */
export function frameBlendAt(turn: number, count: number) {
  const sample = wrapTurn(turn) * count;
  const first = Math.floor(sample) % count;
  return { first, next: (first + 1) % count, mix: sample - Math.floor(sample) };
}

export const FOLLOW_RATIO = 2;

export function pixelsPerTurn(width: number) {
  return Math.max(1, width) * FOLLOW_RATIO;
}

export function dragTurn(start: number, startX: number, pointerX: number, width: number) {
  return start + (startX - pointerX) / Math.max(1, width);
}
/** Move a resting frame out of generated in-between ranges to the nearest real photo. */
export function avoidGenerated(index: number, count: number, ranges: Array<[number, number]>) {
  for (const [a, b] of ranges) {
    if (index >= a && index <= b) {
      const before = (a - 1 + count) % count, after = (b + 1) % count;
      return index - a < b - index ? before : after;
    }
  }
  return index;
}
