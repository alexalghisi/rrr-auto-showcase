import { test } from "node:test";
import assert from "node:assert/strict";
import { draggedPosition, dragTurnDistance, turnFrame } from "./vehicle-drag";

test("short phone drag selects the next angle", () => {
  const position = draggedPosition(0, 200, 170, dragTurnDistance(360));
  assert.equal(turnFrame(position, 8), 1);
});

test("mouse drag works in both directions and wraps the circle", () => {
  assert.equal(turnFrame(draggedPosition(0, 200, 230, dragTurnDistance(280)), 8), 7);
  assert.equal(turnFrame(draggedPosition(0, 200, 170, dragTurnDistance(280)), 8), 1);
  assert.equal(turnFrame(draggedPosition(0, 480, 0, dragTurnDistance(1200)), 8), 0);
});

test("drag position is based on the starting point, not event frequency", () => {
  const start = 0.125;
  const distance = dragTurnDistance(360);
  assert.equal(draggedPosition(start, 200, 110, distance), 0.375);
  assert.equal(turnFrame(draggedPosition(start, 200, 200, distance), 8), 1);
});
