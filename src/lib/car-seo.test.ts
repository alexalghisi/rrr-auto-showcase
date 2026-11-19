import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { CAR_EDITORIAL, carFaq } from "./car-seo";
import { SPIN_360 } from "./spin360";

const car = {
  make: "Audi",
  model: "A6",
  year: 2015,
  mileage_km: 180000,
  fuel: "Diesel",
  gearbox: "Automată",
  price: 15900,
  currency: "EUR",
  status: "disponibila",
};

describe("carFaq", () => {
  test("names the exact car in the price question and says the price is negotiable", () => {
    const faq = carFaq(car);
    assert.equal(faq[0]!.q, "Cât costă Audi A6 2015?");
    assert.match(faq[0]!.a, /negociabil/);
  });
  test("says sold cars are sold instead of offering them", () => {
    assert.match(carFaq({ ...car, status: "vanduta" })[0]!.a, /a fost vândută/);
  });
});

describe("car editorial", () => {
  test("every entry is complete and its pitch leaves room for price and location", () => {
    for (const [slug, e] of Object.entries(CAR_EDITORIAL)) {
      assert.ok(e.pitch.length <= 110, `${slug}: pitch too long`);
      assert.ok(e.intro.length > 120, `${slug}: intro too short`);
      assert.ok(e.highlights.length >= 3, `${slug}: highlights`);
      assert.ok(e.faqs.length >= 2, `${slug}: faqs`);
    }
  });
  test("every car with a turntable in stock has its own editorial", () => {
    for (const slug of Object.keys(SPIN_360)) {
      if (slug.startsWith("dacia-sandero")) continue; // sold, the page redirects to /stoc
      assert.ok(CAR_EDITORIAL[slug], slug);
    }
  });
});
