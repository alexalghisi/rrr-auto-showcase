import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { orbitImages, orbitSourceIndexes } from "./orbit-order";

describe("orbitImages", () => {
  test("walks around the car 1-2-4-3 and drops interior photos", () => {
    assert.deepEqual(orbitImages(["1", "2", "3", "4", "5", "6"]), ["1", "2", "4", "3"]);
  });
  test("reorders exactly four photos", () => {
    assert.deepEqual(orbitImages(["a", "b", "c", "d"]), ["a", "b", "d", "c"]);
  });
  test("leaves fewer than four photos unchanged", () => {
    assert.deepEqual(orbitImages(["a", "b", "c"]), ["a", "b", "c"]);
  });
  test("maps orbit positions back to original photos", () => {
    assert.deepEqual(orbitSourceIndexes(7), [0, 1, 3, 2]);
    assert.deepEqual(orbitSourceIndexes(2), [0, 1]);
  });
});
