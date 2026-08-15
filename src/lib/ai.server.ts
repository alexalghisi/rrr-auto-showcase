/** Apel simplu către Lovable AI Gateway, folosit de motorul de conținut SEO. */
export async function askAi(
  system: string,
  user: string,
  options?: { json?: boolean; maxTokens?: number },
): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("LOVABLE_API_KEY lipsește");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "google/gemini-3.6-flash",
      ...(options?.json ? { response_format: { type: "json_object" } } : {}),
      max_tokens: options?.maxTokens ?? 1200,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI gateway ${response.status}: ${await response.text()}`);
  }

  const json = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}
