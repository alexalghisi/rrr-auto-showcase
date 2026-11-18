import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { facebookDue } from "./import-schedule";

describe("facebookDue", () => {
  const now = Date.parse("2026-11-19T12:00:00Z");
  test("runs Facebook when it never ran", () => assert.equal(facebookDue(null, now), true));
  test("skips Facebook 2 hours after the last good run", () => assert.equal(facebookDue("2026-11-19T10:00:00Z", now), false));
  test("runs Facebook again 8 hours after the last good run", () => assert.equal(facebookDue("2026-11-19T04:00:00Z", now), true));
});
