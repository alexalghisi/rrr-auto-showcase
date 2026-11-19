import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { parseFacebookPost } from "./import.server";

const HEADER = `==BREMEN AUTO CLUJ Dealer Auto==
TRANSPORT GRATUIT PE RAZĂ DE 200km – SAU NUMERE ROSII !
Pt relații: 0751.692.335
* Perioada finantare : 6 - 60 Luni.
* Dobanda de la 1% pe luna,in functie de SCORING-ul clientului.`;

const post = (text: string, id: string) =>
  parseFacebookPost({ text, url: `https://www.facebook.com/bremenautocj/posts/${id}`, postId: id });

describe("Facebook post parser", () => {
  test("reads a car whose price is written as Preț CASH", () => {
    const car = post(
      `${HEADER}
~ Seat Ibiza ~Euro5~ Benzina 1.2~Import Germania ~Unic proprietar
~ Preț CASH: 4299€
~ Motorizare: 1.2 Benzina
~ Cutie manuala
~ An fabricație: 2012
~ 186.000 km`,
      "ibiza",
    );
    assert.ok(car);
    assert.equal(car.make, "Seat");
    assert.equal(car.model, "Ibiza");
    assert.equal(car.price, 4299);
    assert.equal(car.year, 2012);
    assert.equal(car.mileage_km, 186000);
    assert.equal(car.gearbox, "Manuala");
  });

  test("reads the year from a month.year date and the mileage next to km", () => {
    const car = post(
      `${HEADER}
~ ~ Porsche Cayenne ~Euro6~3.0diesel~ 4x4
Automat
~ Preț : 23700 €
~ Motorizare: 3.0 Diesel
~ Cutie Automata
~ An fabricație: 12.2016
~ 254.000 km  (Unic proprietar)`,
      "cayenne",
    );
    assert.ok(car);
    assert.equal(car.make, "Porsche");
    assert.equal(car.model, "Cayenne");
    assert.equal(car.price, 23700);
    assert.equal(car.year, 2016);
    assert.equal(car.mileage_km, 254000);
    assert.equal(car.gearbox, "Automata");
  });

  test("reads mileage written right after the number in capitals", () => {
    const car = post(
      `${HEADER}
~ Dacia Sandero STEPWAY ~Euro6~ 2016
Diesel 1.5. ~156000KM
~ Preț : 6800 €
~ An fabricație: 2016`,
      "sandero",
    );
    assert.ok(car);
    assert.equal(car.mileage_km, 156000);
    assert.equal(car.price, 6800);
  });

  test("skips posts marked as sold", () => {
    for (const mark of ["Vândut!!!", "Vândut", "☆☆Vândut☆☆", "VANDUT"]) {
      assert.equal(
        post(
          `${mark}
Dacia Duster
An fabricație: 2011
256.000km
Preț : 5000 €`,
          `sold-${mark}`,
        ),
        null,
      );
    }
  });
});
