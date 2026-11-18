import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { avoidGenerated, coastTurn, followTurn, frameAt, frameBlendAt, settleTurn, dragTurn, wrapTurn, pixelsPerTurn, FOLLOW_RATIO } from "./spin-motion";

describe("turntable motion", () => {
  test("the car follows the finger: one swipe across the photo is half a turn, at every size", () => {
    for (const width of [320, 390, 412, 640, 854, 1280]) {
      const perTurn = pixelsPerTurn(width);
      assert.equal(perTurn, width * FOLLOW_RATIO);
      assert.equal(dragTurn(0, width, 0, perTurn), 0.5);
      assert.equal(dragTurn(0, 0, width, perTurn), -0.5);
      assert.equal(dragTurn(0.3, 100, 100, perTurn), 0.3);
    }
  });
  test("a frame never jumps more than a few pixels of finger travel on a phone", () => {
    const pxPerFrame = pixelsPerTurn(360) / 124;
    assert.ok(pxPerFrame > 4 && pxPerFrame < 8, String(pxPerFrame));
  });
  test("zero width never divides by zero", () => {
    assert.ok(Number.isFinite(dragTurn(0, 10, 0, pixelsPerTurn(0))));
  });
  test("one image-width drag is exactly one turn for mouse and touch at every car size", () => {
    for (const width of [320, 390, 640, 854]) {
      assert.equal(dragTurn(0, width, 0, width), 1);
      assert.equal(dragTurn(0, 0, width, width), -1);
      assert.equal(dragTurn(0.25, width / 2, width / 4, width), 0.5);
    }
  });
  test("samples between adjacent positions and blends the final frame into the first", () => {
    for (const count of [106, 123, 124, 211, 245, 247, 248]) {
      const mid = frameBlendAt(0.5 / count, count);
      assert.equal(mid.first, 0);
      assert.equal(mid.next, 1);
      assert.ok(Math.abs(mid.mix - 0.5) < 1e-10);
      const seam = frameBlendAt(1 - 0.5 / count, count);
      assert.equal(seam.first, count - 1);
      assert.equal(seam.next, 0);
      assert.ok(Math.abs(seam.mix - 0.5) < 1e-10);
    }
  });
  test("a stopped spin lands on one frame with no mix", () => {
    for (const count of [48, 124, 248]) {
      for (const turn of [0.02, 0.5, 0.98, 1 - 0.1 / count, 2.5 / count]) {
        const settled = settleTurn(turn, count);
        assert.equal(frameAt(settled, count), Math.round(wrapTurn(turn) * count) % count);
      }
    }
  });
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
describe("settleTurn stride", () => {
  test("rests only on every 4th frame when the in-betweens are generated", () => {
    assert.equal(frameAt(settleTurn(6 / 192, 192, 4), 192), 8);
    assert.equal(frameAt(settleTurn(5 / 192, 192, 4), 192), 4);
  });
});

describe("avoidGenerated", () => {
  test("a stop inside a filled gap moves to the nearest real photo", () => {
    assert.equal(avoidGenerated(122, 266, [[120, 138]]), 119);
    assert.equal(avoidGenerated(136, 266, [[120, 138]]), 139);
    assert.equal(avoidGenerated(50, 266, [[120, 138]]), 50);
  });
});
