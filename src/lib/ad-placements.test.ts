import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AD_ZONES,
  bannerDocument,
  bannerFor,
  inlineAdIndex,

} from "./ad-placements";

test("leaderboard size follows the viewport width", () => {
  assert.equal(bannerFor(375), AD_ZONES.mobile);
  assert.equal(bannerFor(767), AD_ZONES.mobile);
  assert.equal(bannerFor(768), AD_ZONES.leaderboard);
  assert.equal(bannerFor(1023), AD_ZONES.leaderboard);
  assert.equal(bannerFor(1024), AD_ZONES.leaderboard);
});

test("banner document loads the zone with its own atOptions", () => {
  const doc = bannerDocument(AD_ZONES.rectangle);
  assert.match(doc, /'key':'1a6bda8743a4c00739fc4db44bc7d91d'/);
  assert.match(doc, /'width':300,'height':250/);
  assert.match(doc, /src="https:\/\/bauval\.org\/22\/1a6bda8743a4c00739fc4db44bc7d91d"/);
});

test("in-feed ad goes after the third listing, or last for short lists", () => {
  assert.equal(inlineAdIndex(0), -1);
  assert.equal(inlineAdIndex(2), 1);
  assert.equal(inlineAdIndex(3), 2);
  assert.equal(inlineAdIndex(12), 2);
});
