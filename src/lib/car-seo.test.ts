import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { carFaq } from "./car-seo";

const car = { make: "Audi", model: "A6", year: 2015, mileage_km: 180000, fuel: "Diesel", gearbox: "Automată", price: 15900, currency: "EUR", status: "disponibila" };

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
