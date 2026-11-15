import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { carWhatsappUrl } from "./site";

describe("WhatsApp car contact", () => {
  test("prefills the exact listing link and leaves space for the customer's message", () => {
    const url = new URL(carWhatsappUrl("audi-a6-2018"));
    assert.equal(url.origin + url.pathname, "https://wa.me/40751692335");
    assert.equal(
      url.searchParams.get("text"),
      "Bună ziua! Am găsit anunțul tău pe linkul: https://bremenauto.ro/masini/audi-a6-2018\n\nMesajul meu: ",
    );
  });

  test("keeps reservation or financing details after the listing link", () => {
    const url = new URL(carWhatsappUrl("bmw x1/2019", "Vreau o programare mâine."));
    const text = url.searchParams.get("text") ?? "";
    assert.ok(text.includes("https://bremenauto.ro/masini/bmw%20x1%2F2019"));
    assert.ok(text.endsWith("Mesajul meu: Vreau o programare mâine."));
  });
});
