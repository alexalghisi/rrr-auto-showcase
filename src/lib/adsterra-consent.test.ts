import { test } from "node:test";
import assert from "node:assert/strict";
import { allowsAdsterra } from "./adsterra-consent";
test("Adsterra loads by default; only an explicit refusal disables it", () => {
  for (const choice of [null, "granted", "all", "necessary"]) assert.equal(allowsAdsterra(choice), true);
  assert.equal(allowsAdsterra("denied"), false);
});