import { test } from "node:test";
import assert from "node:assert/strict";
import { nextStudioAngle, studioFrameUrls, STUDIO_ANCHOR } from "./studio360";

test("the anchor angle is generated first", () => {
  assert.equal(nextStudioAngle(undefined), STUDIO_ANCHOR);
  assert.equal(nextStudioAngle({ files: {}, v: "1" }), STUDIO_ANCHOR);
});

test("no other angle is generated while the anchor is missing", () => {
  const failed = { files: {}, v: "1", failures: { [STUDIO_ANCHOR]: 3 } };
  assert.equal(nextStudioAngle(failed), null);
});

test("angles follow the generation order and skip done or abandoned ones", () => {
  assert.equal(nextStudioAngle({ files: { 1: "1.png" }, v: "1" }), 3);
  assert.equal(
    nextStudioAngle({ files: { 1: "1.png", 3: "3.png" }, v: "1", failures: { 5: 3 } }),
    7,
  );
  const all = Object.fromEntries([0, 1, 2, 3, 4, 5, 6, 7].map((i) => [i, `${i}.png`]));
  assert.equal(nextStudioAngle({ files: all, v: "1" }), null);
});

test("frames are public only when all eight angles exist", () => {
  assert.deepEqual(studioFrameUrls("x", { files: { 1: "1.png" }, v: "1" }), []);
  const all = Object.fromEntries([0, 1, 2, 3, 4, 5, 6, 7].map((i) => [i, `${i}.png`]));
  const urls = studioFrameUrls("audi", { files: all, v: "9" });
  assert.equal(urls.length, 8);
  assert.equal(urls[0], "/api/public/photo/studio360/audi/0.png?v=9");
});
