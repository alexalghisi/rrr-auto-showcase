import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { INDEXNOW_KEY, pingCarSlugs } from "./seo-ping.server";

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

test("car changes are submitted once to IndexNow with the hosted key", async () => {
  const calls: Array<{ url: string; body: string }> = [];
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    calls.push({ url: String(url), body: String(init?.body) });
    return new Response(null, { status: 200 });
  }) as typeof fetch;

  const { submitted } = await pingCarSlugs(["audi-a6", ""]);

  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.url, "https://api.indexnow.org/indexnow");
  const body = JSON.parse(calls[0]!.body);
  assert.equal(body.key, INDEXNOW_KEY);
  assert.equal(body.keyLocation, `https://bremenauto.ro/${INDEXNOW_KEY}.txt`);
  assert.ok(body.urlList.includes("https://bremenauto.ro/masini/audi-a6"));
  assert.equal(submitted, body.urlList.length);
});
