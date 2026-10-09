import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { coastTurn, followTurn, frameAt } from "./spin-motion";

describe("turntable motion", () => {
  test("wraps in both directions for every sequence length", () => {
    for (const count of [51, 60, 101, 119, 120, 238, 240]) {
      assert.equal(frameAt(1, count), 0);
      assert.equal(frameAt(-0.5 / count, count), count - 1);
      assert.equal(frameAt(2.25, count), Math.floor(count / 4));
    }
  });
  test("drag smoothing is identical at 30 and 60 fps", () => {
    let slow = 0, fast = 0;
    for (let i = 0; i < 30; i++) slow = followTurn(slow, 1, 1 / 30);
    for (let i = 0; i < 60; i++) fast = followTurn(fast, 1, 1 / 60);
    assert.ok(Math.abs(slow - fast) < 1e-10);
    assert.ok(slow > 0.99);
  });
  test("release inertia is frame-rate independent and decelerates", () => {
    let slow = { position: 0, velocity: 0.3 }, fast = { ...slow };
    for (let i = 0; i < 30; i++) slow = coastTurn(slow.position, slow.velocity, 1 / 30);
    for (let i = 0; i < 60; i++) fast = coastTurn(fast.position, fast.velocity, 1 / 60);
    assert.ok(Math.abs(slow.position - fast.position) < 1e-10);
    assert.ok(slow.velocity < 0.01);
  });
});