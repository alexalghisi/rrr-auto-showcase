import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { getLandingPage, LANDING_SLUGS, type Car } from "./landing-pages";

const car = (fields: Partial<Car>) =>
  ({ make: "", model: "", trim: null, drivetrain: null, body_type: null, gearbox: null, ...fields }) as Car;

describe("landing pages", () => {
  test("every slug is unique", () => {
    assert.equal(new Set(LANDING_SLUGS).size, LANDING_SLUGS.length);
  });

  test("the 4x4 page fits the search result snippet", () => {
    const page = getLandingPage("masini-4x4-second-hand-cluj");
    assert.ok(page);
    assert.ok(page.title.length <= 60);
    assert.ok(page.description.length <= 160);
    assert.equal(page.h1, "4x4 second hand în Cluj-Napoca");
  });

  test("the 4x4 page lists all-wheel-drive cars only", () => {
    const page = getLandingPage("masini-4x4-second-hand-cluj");
    assert.ok(page);
    assert.equal(page.match(car({ make: "Volkswagen", model: "Touareg 4x4" })), true);
    assert.equal(page.match(car({ make: "Audi", model: "A6", trim: "3.0 TDI quattro" })), true);
    assert.equal(page.match(car({ make: "BMW", model: "X1", trim: "xDrive20d" })), true);
    assert.equal(page.match(car({ make: "Skoda", model: "Octavia", drivetrain: "Integrală" })), true);
    assert.equal(page.match(car({ make: "Dacia", model: "Sandero Stepway" })), false);
    assert.equal(page.match(car({ make: "BMW", model: "X1", drivetrain: "Spate" })), false);
  });
});
