import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { facebookDue, importSources } from "./import-schedule";

describe("facebookDue", () => {
  const now = Date.parse("2026-11-19T12:00:00Z");
  test("runs Facebook when it never ran", () => assert.equal(facebookDue(null, now), true));
  test("skips Facebook 2 hours after the last good run", () => assert.equal(facebookDue("2026-11-19T10:00:00Z", now), false));
  test("runs Facebook again 8 hours after the last good run", () => assert.equal(facebookDue("2026-11-19T04:00:00Z", now), true));
});

describe("importSources", () => {
  const now = Date.parse("2026-11-19T12:00:00Z");
  test("the scheduled run reads OLX only while Facebook is not due", () =>
    assert.deepEqual(importSources("2026-11-19T10:00:00Z", false, now), ["olx"]));
  test("the scheduled run reads both once Facebook is due", () =>
    assert.deepEqual(importSources("2026-11-19T04:00:00Z", false, now), ["facebook", "olx"]));
  test("a manual run always reads Facebook and OLX", () =>
    assert.deepEqual(importSources("2026-11-19T11:59:00Z", true, now), ["facebook", "olx"]));
});
