import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { sameListing } from "./import.server";

const a7 = { make: "Audi", model: "A7 Competition", year: 2015, mileage_km: 0, price: 22700 };

describe("import dedupe", () => {
  test("OLX and Facebook copies of the same car are one listing", () => {
    assert.equal(
      sameListing(a7, { make: "AUDI", model: "A7", year: 2015, mileage_km: 252000, price: 22900 }),
      true,
    );
    assert.equal(
      sameListing(
        { make: "VW", model: "Touareg", year: 2008, mileage_km: 296000, price: 7900 },
        { make: "Volkswagen", model: "Touareg 4x4", year: 2008, mileage_km: 298500, price: 8000 },
      ),
      true,
    );
  });

  test("two different cars of the same make stay separate", () => {
    assert.equal(
      sameListing(a7, { make: "Audi", model: "A6", year: 2015, mileage_km: 0, price: 13400 }),
      false,
    );
    assert.equal(
      sameListing(a7, { make: "Audi", model: "A7", year: 2018, mileage_km: 0, price: 22700 }),
      false,
    );
    assert.equal(
      sameListing(
        { make: "BMW", model: "X1", year: 2013, mileage_km: 180000, price: 9000 },
        { make: "BMW", model: "X1", year: 2013, mileage_km: 243000, price: 9000 },
      ),
      false,
    );
  });
});
