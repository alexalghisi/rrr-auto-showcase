import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AD_ZONES,
  adDocument,
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

test("mobile banner uses the requested 300 by 250 zone", () => {
  assert.deepEqual(bannerFor(767), { key: "1a6bda8743a4c00739fc4db44bc7d91d", width: 300, height: 250 });
});

test("desktop banner starts at 768 pixels with the requested 728 by 90 zone", () => {
  assert.deepEqual(bannerFor(768), { key: "04eba6e0b9b24743b164ff6f94dd40ad", width: 728, height: 90 });
});

test("native creative uses only the provided native zone", () => {
  assert.match(adDocument(null), /https:\/\/bauval.org\/21\/8380411ac102e792dca8cfde795da227/);
  assert.match(adDocument(null), /id="container-8380411ac102e792dca8cfde795da227"/);
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
