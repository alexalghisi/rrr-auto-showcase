import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Sparkles, Loader2, Send, Phone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askAdvisor } from "@/lib/advisor.functions";
import { StockAlertForm } from "@/components/stock-alert-form";
import { SITE } from "@/lib/site";
import { breadcrumbSchema } from "@/lib/seo";

const TITLE = "Consilier auto AI — găsește-ți mașina | Bremen Auto Cluj";
const DESCRIPTION =
  "Spune-ne bugetul și nevoile tale, iar consilierul AI Bremen Auto îți recomandă în câteva secunde mașinile potrivite din stocul real din Florești, Cluj. Cash sau în rate.";
const URL = "https://bremenauto.ro/gaseste-masina";

export const Route = createFileRoute("/gaseste-masina")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "consilier auto AI, ce mașină să cumpăr, mașini second hand Cluj, alege mașina potrivită buget, mașini rate Cluj",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "ro_RO" },
      { property: "og:site_name", content: SITE.name },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbSchema([
            { name: "Acasă", path: "https://bremenauto.ro/" },
            { name: "Consilier auto AI", path: URL },
          ]),
        ),
      },
    ],
  }),
  component: AdvisorPage,
});

type Msg = { role: "user" | "assistant"; content: string; slugs?: string[] };

const SUGGESTIONS = [
  "Am 6000 € și vreau o mașină de familie cu consum mic",
  "Caut un break diesel după 2015, în rate",
  "Prima mașină pentru fiica mea, buget 4000 €",
  "Vreau un SUV automat sub 12.000 €",
];

function AdvisorPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const ask = useServerFn(askAdvisor);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const clean = text.trim().slice(0, 2000);
    if (!clean || loading) return;
    const history: Msg[] = [...messages, { role: "user", content: clean }];
    setMessages(history);
    setInput("");
    setLoading(true);
    try {
      const result = await ask({
        data: { messages: history.slice(-12).map((m) => ({ role: m.role, content: m.content })) },
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.reply, slugs: result.slugs },
      ]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Consilierul nu răspunde. Sună-ne la 0751 692 335.",
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="eyebrow">Exclusiv Bremen Auto</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">Consilier auto AI</h1>
      <p className="mt-4 text-muted-foreground">
        Spune-ne bugetul și cum folosești mașina. Îți recomandăm în câteva secunde exact ce avem în parc,
        pe DN1 Luna de Sus (Florești), lângă Cluj-Napoca. Cash sau în rate.
      </p>

      <div className="surface-card mt-8 rounded-xl p-4 sm:p-6">
        <div className="max-h-[55vh] space-y-4 overflow-y-auto pr-1">
          {messages.length === 0 && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
              <p className="flex items-center gap-2 font-semibold text-primary">
                <Sparkles className="size-4" /> Salut! Ce mașină cauți?
              </p>
              <p className="mt-2 text-muted-foreground">
                Scrie-mi bugetul, combustibilul preferat sau cum o folosești și îți arăt potrivirile din
                stocul real.
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-surface-strong"
                }`}
              >
                <p className="whitespace-pre-line">{m.content}</p>
                {m.slugs && m.slugs.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {m.slugs.map((slug) => (
                      <Link
                        key={slug}
                        to="/masini/$slug"
                        params={{ slug }}
                        className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                      >
                        Vezi mașina →
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Caut în stoc…
            </p>
          )}
          <div ref={endRef} />
        </div>

        {messages.length === 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => sendMessage(s)}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void sendMessage(input);
          }}
        >
          <Input
            ref={inputRef}
            value={input}
            maxLength={2000}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ex: buget 7000 €, fac 30.000 km pe an"
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            <Send className="size-4" />
            <span className="sr-only">Trimite</span>
          </Button>
        </form>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button asChild variant="outline" className="flex-1">
          <a href={SITE.phoneHref}>
            <Phone className="size-4" /> Vorbește cu un om: {SITE.phone}
          </a>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link to="/stoc">Vezi tot stocul</Link>
        </Button>
      </div>

      <section className="mt-12">
        <StockAlertForm />
      </section>
    </div>
  );
}
