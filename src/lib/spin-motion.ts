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