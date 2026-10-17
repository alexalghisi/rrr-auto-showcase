import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { GOOGLE_CONSENT_BOOTSTRAP, GOOGLE_CONSENT_DEFAULT, requestGooglePrivacySettings } from "./google-consent";

describe("EU Google advertising consent", () => {
  test("denies all four Google consent categories before the CMP responds", () => {
    assert.deepEqual(GOOGLE_CONSENT_DEFAULT, {
      ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
      analytics_storage: "denied", wait_for_update: 500,
    });
  });
  test("does not turn the legacy custom Accept all flag into Google consent", () => {
    const events: unknown[][] = [];
    const fakeWindow = { dataLayer: events, localStorage: { getItem: () => "all" } };
    new Function("window", "dataLayer", GOOGLE_CONSENT_BOOTSTRAP)(fakeWindow, events);
    assert.deepEqual(events.map((args) => Array.from(args)), [["consent", "default", GOOGLE_CONSENT_DEFAULT]]);
  });
  test("delegates reopening to the certified Google CMP callback queue", () => {
    let reopened = 0;
    const googlefc = { callbackQueue: [] as Array<() => void>, showRevocationMessage: () => { reopened++; } };
    assert.equal(requestGooglePrivacySettings(googlefc), true);
    assert.equal(googlefc.callbackQueue.length, 1);
    googlefc.callbackQueue[0]?.();
    assert.equal(reopened, 1);
  });
  test("does not simulate acceptance when the CMP is missing or blocked", () => {
    assert.equal(requestGooglePrivacySettings(), false);
    assert.equal(requestGooglePrivacySettings({ callbackQueue: [] }), false);
  });
});