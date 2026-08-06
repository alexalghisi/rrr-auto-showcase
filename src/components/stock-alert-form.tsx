import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { BellRing, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitLead } from "@/lib/leads.functions";

export function StockAlertForm() {
  const [criteria, setCriteria] = useState("");
  const [budget, setBudget] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const send = useServerFn(submitLead);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (criteria.trim().length < 3 || phone.trim().length < 6) {
      toast.error("Spune-ne ce mașină cauți și lasă-ne un telefon valid.");
      return;
    }
    setSending(true);
    try {
      await send({
        data: {
          kind: "alerta",
          phone: phone.trim().slice(0, 40),
          message: `Alertă stoc: ${criteria.trim().slice(0, 500)}${budget ? ` — buget ${budget.slice(0, 40)}` : ""}`,
          details: { criteria: criteria.trim().slice(0, 500), budget: budget.slice(0, 40) },
        },
      });
      setDone(true);
      toast.success("Gata! Te anunțăm primul când intră mașina în parc.");
    } catch {
      toast.error("Nu am putut salva alerta. Sună-ne la 0751 692 335.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="surface-card rounded-xl p-6">
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
        <BellRing className="size-4" /> Alertă stoc
      </p>
      <h2 className="mt-2 text-2xl">Nu găsești ce cauți? Te anunțăm noi</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Aducem constant mașini din Germania. Spune-ne ce vrei și te sunăm primul, înainte să apară anunțul
        public.
      </p>

      {done ? (
        <p className="mt-5 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm font-medium text-primary">
          <Check className="size-4" /> Alertă activată. Te contactăm când găsim potrivirea.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <div>
            <Label htmlFor="alert-criteria">Ce mașină cauți?</Label>
            <Input
              id="alert-criteria"
              value={criteria}
              maxLength={500}
              onChange={(e) => setCriteria(e.target.value)}
              placeholder="ex: Skoda Octavia break, diesel, după 2016"
              className="mt-1.5"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="alert-budget">Buget (opțional)</Label>
              <Input
                id="alert-budget"
                value={budget}
                maxLength={40}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="ex: 8.000 €"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="alert-phone">Telefon</Label>
              <Input
                id="alert-phone"
                value={phone}
                maxLength={40}
                inputMode="tel"
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07xx xxx xxx"
                className="mt-1.5"
              />
            </div>
          </div>
          <Button type="submit" size="lg" disabled={sending} className="w-full">
            {sending ? <Loader2 className="size-4 animate-spin" /> : null} Activează alerta gratuit
          </Button>
        </form>
      )}
    </div>
  );
}
