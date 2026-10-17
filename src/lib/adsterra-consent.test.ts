import { test } from "node:test";
import assert from "node:assert/strict";
import { allowsAdsterra } from "./adsterra-consent";
test("Adsterra loads only after its own explicit consent, not a Google or legacy choice", () => {
  for (const choice of [null, "denied", "all", "necessary"]) assert.equal(allowsAdsterra(choice), false);
  assert.equal(allowsAdsterra("granted"), true);
});