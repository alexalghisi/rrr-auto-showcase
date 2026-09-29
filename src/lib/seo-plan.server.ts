/** Plan SEO prioritizat prin Lovable AI Gateway (Responses API, streaming). */
export type SeoPlan = {
  summary: string;
  actions: { priority: "high" | "medium" | "low"; title: string; why: string; steps: string[] }[];
  titles: { title: string; metaDescription: string }[];
  faqs: { question: string; answer: string }[];
  recommendations: string[];
};

const SYSTEM = `Ești consultant SEO senior pentru Bremen Auto (bremenauto.ro), dealer de mașini second hand aduse din Germania, DN1 Luna de Sus, Florești, Cluj. Program non-stop, plată cash sau în rate. Nișă: doar vânzări auto.
Primești un raport de concurență, o interogare de căutare sau conținutul/URL-ul unei pagini. Răspunde DOAR în JSON valid, în limba română, cu forma:
{"summary":string,"actions":[{"priority":"high"|"medium"|"low","title":string,"why":string,"steps":[string]}],"titles":[{"title":string (max 60 caractere),"metaDescription":string (max 155 caractere)}],"faqs":[{"question":string,"answer":string}],"recommendations":[string]}
Ordonează acțiunile după impact. 5-8 acțiuni, 3-5 titluri, 5-6 FAQ, 5-8 recomandări. Fii concret, fără promisiuni false.`;

export async function generateSeoPlan(kind: string, input: string): Promise<SeoPlan> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("LOVABLE_API_KEY lipsește");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      stream: true,
      store: false,
      reasoning: { effort: "low" },
      text: { format: { type: "json_object" } },
      input: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `Tip intrare: ${kind}\n\n${input}` },
      ],
    }),
  });

  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => "");
    if (res.status === 402) throw new Error("Credite AI epuizate. Adaugă credite în workspace.");
    if (res.status === 429) throw new Error("Prea multe cereri AI. Încearcă din nou peste un minut.");
    throw new Error(`AI gateway ${res.status}: ${body.slice(0, 300)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const evt = JSON.parse(data) as { type?: string; delta?: string; error?: { message?: string }; response?: { error?: { message?: string } } };
        if (evt.type === "response.output_text.delta" && evt.delta) text += evt.delta;
        else if (evt.type === "error" || evt.type === "response.failed") {
          throw new Error(evt.error?.message ?? evt.response?.error?.message ?? "Eroare AI");
        }
      } catch (e) {
        if (e instanceof SyntaxError) continue;
        throw e;
      }
    }
  }

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("AI nu a returnat un plan valid.");
  const plan = JSON.parse(match[0]) as Partial<SeoPlan>;
  return {
    summary: plan.summary ?? "",
    actions: plan.actions ?? [],
    titles: plan.titles ?? [],
    faqs: plan.faqs ?? [],
    recommendations: plan.recommendations ?? [],
  };
}
