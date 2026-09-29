import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateSeoActionPlan } from "@/lib/seo-admin.functions";
import type { SeoPlan } from "@/lib/seo-plan.server";

const KINDS = [
  { id: "query", label: "Interogare" },
  { id: "page", label: "Pagină SEO" },
  { id: "report", label: "Raport concurență" },
] as const;

export function SeoPlanGenerator() {
  const generate = useServerFn(generateSeoActionPlan);
  const [kind, setKind] = useState<(typeof KINDS)[number]["id"]>("query");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState<SeoPlan | null>(null);

  async function submit() {
    setBusy(true);
    try {
      setPlan(await generate({ data: { kind, input } }));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Sparkles className="size-4" /> Plan de acțiuni SEO cu AI
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <Button key={k.id} size="sm" variant={kind === k.id ? "default" : "outline"} onClick={() => setKind(k.id)}>
            {k.label}
          </Button>
        ))}
      </div>
      <Textarea
        className="mt-3 min-h-28"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          kind === "query"
            ? "ex: masini second hand cluj"
            : kind === "page"
              ? "Lipește URL-ul sau textul paginii"
              : "Lipește raportul de concurență"
        }
      />
      <Button className="mt-2" size="sm" onClick={submit} disabled={busy || input.trim().length < 3}>
        {busy ? "Se generează…" : "Generează plan"}
      </Button>

      {plan && (
        <div className="mt-4 space-y-5 text-sm">
          {plan.summary && <p className="leading-relaxed">{plan.summary}</p>}
          <div>
            <p className="mb-2 font-medium">Acțiuni prioritizate</p>
            <ol className="space-y-2">
              {plan.actions.map((a, i) => (
                <li key={i} className="rounded-lg bg-surface-strong p-3">
                  <p className="font-medium">
                    {i + 1}. {a.title}
                    <span className="ml-2 text-xs uppercase text-primary">{a.priority}</span>
                  </p>
                  <p className="text-muted-foreground">{a.why}</p>
                  {a.steps?.length > 0 && (
                    <ul className="mt-1 list-disc pl-5 text-xs text-muted-foreground">
                      {a.steps.map((s, j) => <li key={j}>{s}</li>)}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="mb-2 font-medium">Titluri și meta descrieri</p>
            <ul className="space-y-2">
              {plan.titles.map((t, i) => (
                <li key={i} className="rounded-lg bg-surface-strong p-3">
                  <p className="font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.metaDescription}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 font-medium">Întrebări frecvente</p>
            <ul className="space-y-2">
              {plan.faqs.map((f, i) => (
                <li key={i} className="rounded-lg bg-surface-strong p-3">
                  <p className="font-medium">{f.question}</p>
                  <p className="text-muted-foreground">{f.answer}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 font-medium">Recomandări de optimizare</p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              {plan.recommendations.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
