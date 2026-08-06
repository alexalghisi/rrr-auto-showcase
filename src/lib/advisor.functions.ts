import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const AdvisorSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(2000),
      }),
    )
    .min(1)
    .max(20),
});

export type AdvisorReply = {
  reply: string;
  slugs: string[];
};

export const askAdvisor = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AdvisorSchema.parse(input))
  .handler(async ({ data }): Promise<AdvisorReply> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Consilierul AI nu este configurat.");

    const { createPublicClient } = await import("./cars.server");
    const { data: cars, error } = await createPublicClient()
      .from("cars")
      .select("slug, make, model, trim, year, mileage_km, fuel, gearbox, power_hp, body_type, price, currency, status")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(80);
    if (error) throw new Error(error.message);

    const stock = (cars ?? [])
      .map(
        (c) =>
          `- slug:${c.slug} | ${c.make} ${c.model}${c.trim ? ` ${c.trim}` : ""} ${c.year} | ${c.mileage_km} km | ${c.fuel} | ${c.gearbox}${c.power_hp ? ` | ${c.power_hp} CP` : ""}${c.body_type ? ` | ${c.body_type}` : ""} | ${c.price} ${c.currency} | ${c.status}`,
      )
      .join("\n");

    const system = `Ești consilierul auto al Bremen Auto, parc auto pe DN1, Luna de Sus, comuna Florești, lângă Cluj-Napoca. Vindem mașini second hand aduse din Germania, cash sau în rate, cu livrare în toată România. Program non-stop, telefon 0751 692 335.

Reguli:
- Răspunzi DOAR în limba română, scurt, prietenos și concret (max 120 de cuvinte).
- Recomanzi EXCLUSIV mașini din stocul de mai jos. Nu inventa modele, prețuri sau dotări.
- Dacă nu ai potrivire bună, spune sincer și propune cea mai apropiată variantă sau alertă de stoc.
- Poți întreba o singură întrebare de clarificare dacă bugetul sau nevoia nu e clară.
- Menționează că plata se poate face cash sau în rate când vorbești despre preț.
- Închei cu un îndemn scurt (rezervare, vizionare sau WhatsApp).

STOC ACTUAL:
${stock || "(stoc gol momentan)"}

Răspunde STRICT cu JSON valid, fără markdown: {"reply": "textul răspunsului", "slugs": ["slug-masina-1"]}. Maxim 3 slug-uri, doar din stoc.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: system }, ...data.messages],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      if (response.status === 429) throw new Error("Prea multe cereri. Încearcă din nou în câteva secunde.");
      if (response.status === 402) throw new Error("Consilierul AI este momentan indisponibil.");
      throw new Error(`Consilierul AI a returnat o eroare [${response.status}]: ${body.slice(0, 300)}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = payload.choices?.[0]?.message?.content ?? "";

    let reply = raw.trim();
    let slugs: string[] = [];
    try {
      const parsed = JSON.parse(raw) as { reply?: unknown; slugs?: unknown };
      if (typeof parsed.reply === "string") reply = parsed.reply;
      if (Array.isArray(parsed.slugs)) {
        slugs = parsed.slugs.filter((s): s is string => typeof s === "string").slice(0, 3);
      }
    } catch {
      // modelul a răspuns text simplu — îl folosim ca atare
    }

    const known = new Set((cars ?? []).map((c) => c.slug));
    return { reply, slugs: slugs.filter((s) => known.has(s)) };
  });
