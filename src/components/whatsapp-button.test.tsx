import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";

import { WhatsAppButton } from "./whatsapp-button";
import { carWhatsappUrl } from "@/lib/site";

describe("Per-car WhatsApp button", () => {
  test("renders a real WhatsApp link carrying that car's listing URL", () => {
    const html = renderToStaticMarkup(
      <WhatsAppButton carSlug="audi-a6-2018" title="Audi A6 2018" />,
    );
    assert.ok(html.includes(`href="${carWhatsappUrl("audi-a6-2018")}"`), html);
    assert.ok(html.includes('target="_blank"'), html);
    assert.ok(html.includes("Scrie pe WhatsApp"), html);
    assert.ok(html.includes("Scrie pe WhatsApp despre Audi A6 2018"), html);
  });

  test("keeps a custom message after the listing link", () => {
    const html = renderToStaticMarkup(
      <WhatsAppButton carSlug="dacia-sandero-stepway-2020" message="Mai există?" />,
    );
    assert.ok(
      html.includes(encodeURIComponent("Mesajul meu: Mai există?")),
      html,
    );
  });
});
