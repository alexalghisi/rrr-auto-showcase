import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { RefreshCw, Check, X, ChevronDown, Search, Radar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SeoPlanGenerator } from "@/components/seo-plan-generator";
import {
  getSearchConsole,
  getCompetitorReport,
  getSeoStatus,
  listContentDrafts,
  runCompetitorScanNow,
  runSeoEngineNow,
  saveCompetitor,
  setDraftStatus,
} from "@/lib/seo-admin.functions";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-strong p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-display text-2xl">{value}</p>
    </div>
  );
}

function RowTable({
  title,
  rows,
}: {
  title: string;
  rows: { key: string; clicks: number; impressions: number; ctr: number; position: number }[];
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="mb-2 text-sm font-medium">{title}</p>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Fără date încă.</p>
      ) : (
        <ul className="divide-y divide-border text-xs">
          {rows.slice(0, 12).map((row) => (
            <li key={row.key} className="flex items-center gap-3 py-1.5">
              <span className="min-w-0 flex-1 truncate" title={row.key}>
                {row.key.replace("https://bremenauto.ro", "") || "/"}
              </span>
              <span className="w-10 shrink-0 text-right">{row.clicks}</span>
              <span className="w-14 shrink-0 text-right text-muted-foreground">
                {row.impressions}
              </span>
              <span className="w-12 shrink-0 text-right text-muted-foreground">
                {row.position.toFixed(1)}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-1 text-[11px] text-muted-foreground">
        coloane: clickuri · impresii · poziție medie
      </p>
    </div>
  );
}

export function SeoPanel() {
  const queryClient = useQueryClient();
  const [domain, setDomain] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [openDraft, setOpenDraft] = useState<string | null>(null);

  const fetchGsc = useServerFn(getSearchConsole);
  const fetchCompetitors = useServerFn(getCompetitorReport);
  const fetchStatus = useServerFn(getSeoStatus);
  const fetchDrafts = useServerFn(listContentDrafts);
  const scanNow = useServerFn(runCompetitorScanNow);
  const engineNow = useServerFn(runSeoEngineNow);
  const saveDomain = useServerFn(saveCompetitor);
  const updateDraft = useServerFn(setDraftStatus);

  const { data: gsc } = useQuery({ queryKey: ["seo", "gsc"], queryFn: () => fetchGsc() });
  const { data: comp } = useQuery({
    queryKey: ["seo", "competitors"],
    queryFn: () => fetchCompetitors(),
  });
  const { data: status } = useQuery({ queryKey: ["seo", "status"], queryFn: () => fetchStatus() });
  const { data: drafts = [] } = useQuery({
    queryKey: ["seo", "drafts"],
    queryFn: () => fetchDrafts(),
  });

  async function run(kind: "scan" | "engine") {
    setBusy(kind);
    try {
      if (kind === "scan") {
        const result = await scanNow();
        toast.success(`Analiză gata: ${result.gaps} goluri de conținut`);
        await queryClient.invalidateQueries({ queryKey: ["seo", "competitors"] });
      } else {
        const result = await engineNow();
        toast.success(
          `SEO actualizat: ${result.refreshed.length} pagini, ${result.submitted} URL-uri trimise`,
        );
        await queryClient.invalidateQueries({ queryKey: ["seo"] });
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const report = comp?.report as
    | {
        created_at: string;
        summary: string;
        gaps: { topic?: string; why?: string; suggestedPage?: string; priority?: string }[] | null;
        findings: { domain?: string; observation?: string }[] | null;
        scanned_domains: string[] | null;
      }
    | null
    | undefined;

  return (
    <section className="surface-card mt-8 rounded-xl p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl">SEO automat</h2>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => run("engine")} disabled={busy !== null}>
            <RefreshCw className={`size-4 ${busy === "engine" ? "animate-spin" : ""}`} />
            Optimizează acum
          </Button>
          <Button variant="outline" size="sm" onClick={() => run("scan")} disabled={busy !== null}>
            <Radar className={`size-4 ${busy === "scan" ? "animate-spin" : ""}`} />
            Analizează concurența
          </Button>
        </div>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Motorul rulează zilnic singur: rescrie intro-urile paginilor în funcție de stoc, anunță
        Google și Bing, publică zilnic 2-4 articole noi pe blog și scanează concurența.
        {status?.lastRefresh
          ? ` Ultima optimizare: ${new Date(status.lastRefresh).toLocaleString("ro-RO")} · ${status.pages} pagini cu text generat.`
          : ""}
      </p>

      {/* Search Console */}
      <div className="mt-6">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Search className="size-4" /> Google Search Console (ultimele 28 de zile)
        </p>
        {!gsc && <p className="mt-2 text-sm text-muted-foreground">Se încarcă…</p>}
        {gsc?.status === "error" && (
          <p className="mt-2 text-sm text-destructive">{gsc.message}</p>
        )}
        {gsc?.status === "selection_required" && (
          <p className="mt-2 text-sm text-muted-foreground">
            Mai multe proprietăți verificate acoperă site-ul: {gsc.candidates.join(", ")}.
          </p>
        )}
        {gsc?.status === "ok" && (
          <>
            <div className="mt-3 grid gap-3 sm:grid-cols-4">
              <Stat label="Clickuri" value={gsc.snapshot.totals.clicks.toLocaleString("ro-RO")} />
              <Stat
                label="Impresii"
                value={gsc.snapshot.totals.impressions.toLocaleString("ro-RO")}
              />
              <Stat label="CTR" value={`${(gsc.snapshot.totals.ctr * 100).toFixed(1)}%`} />
              <Stat label="Poziție medie" value={gsc.snapshot.totals.position.toFixed(1)} />
            </div>
            <div className="mt-4 flex flex-col gap-6 md:flex-row">
              <RowTable title="Căutări (query-uri)" rows={gsc.snapshot.queries} />
              <RowTable title="Pagini" rows={gsc.snapshot.pages} />
            </div>
          </>
        )}
      </div>

      {/* Concurență */}
      <div className="mt-8">
        <p className="text-sm font-medium">Raport concurență</p>
        {report ? (
          <>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(report.created_at).toLocaleString("ro-RO")} ·{" "}
              {(report.scanned_domains ?? []).join(", ")}
            </p>
            <p className="mt-2 text-sm leading-relaxed">{report.summary}</p>
            {(report.gaps ?? []).length > 0 && (
              <ul className="mt-3 space-y-2">
                {(report.gaps ?? []).map((gap, index) => (
                  <li key={index} className="rounded-lg bg-surface-strong p-3 text-sm">
                    <p className="font-medium">
                      {gap.topic}
                      {gap.priority ? (
                        <span className="ml-2 text-xs uppercase text-primary">{gap.priority}</span>
                      ) : null}
                    </p>
                    {gap.why && <p className="text-muted-foreground">{gap.why}</p>}
                    {gap.suggestedPage && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Pagina propusă: {gap.suggestedPage}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Niciun raport încă — apasă „Analizează concurența".
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="adaugă domeniu concurent (ex: exemplu.ro)"
            className="h-9 max-w-xs"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              if (!domain.trim()) return;
              await saveDomain({ data: { domain } });
              setDomain("");
              await queryClient.invalidateQueries({ queryKey: ["seo", "competitors"] });
              toast.success("Domeniu adăugat");
            }}
          >
            Adaugă
          </Button>
          <div className="flex flex-wrap gap-2">
            {(comp?.competitors ?? []).map((c: { id: string; domain: string }) => (
              <button
                key={c.id}
                type="button"
                className="inline-flex items-center gap-1 rounded-full bg-surface-strong px-3 py-1 text-xs"
                onClick={async () => {
                  await saveDomain({ data: { domain: c.domain, remove: true } });
                  await queryClient.invalidateQueries({ queryKey: ["seo", "competitors"] });
                }}
              >
                {c.domain}
                <X className="size-3" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Drafturi */}
      <div className="mt-8">
        <p className="text-sm font-medium">Articole generate, de aprobat</p>
        {drafts.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Niciun draft în așteptare.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {drafts.map((draft: { id: string; title: string; status: string; description: string; body: string; created_at: string }) => (
              <li key={draft.id} className="rounded-lg bg-surface-strong p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    onClick={() => setOpenDraft(openDraft === draft.id ? null : draft.id)}
                  >
                    <ChevronDown
                      className={`size-4 shrink-0 transition-transform ${openDraft === draft.id ? "rotate-180" : ""}`}
                    />
                    <span className="truncate font-medium">{draft.title}</span>
                  </button>
                  <span className="text-xs uppercase text-muted-foreground">{draft.status}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await updateDraft({ data: { id: draft.id, status: "approved" } });
                      await queryClient.invalidateQueries({ queryKey: ["seo", "drafts"] });
                    }}
                  >
                    <Check className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await updateDraft({ data: { id: draft.id, status: "rejected" } });
                      await queryClient.invalidateQueries({ queryKey: ["seo", "drafts"] });
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
                {openDraft === draft.id && (
                  <div className="mt-2 max-h-72 overflow-y-auto whitespace-pre-wrap text-xs text-muted-foreground">
                    {draft.description}
                    {"\n\n"}
                    {draft.body}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <SeoPlanGenerator />
    </section>
  );
}
