import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { HandCoins, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { calcFinance, eur, DEFAULT_APR } from "@/lib/finance";
import { submitLead } from "@/lib/leads.functions";
import { whatsappUrl } from "@/lib/site";

type Props = {
  price: number;
  carSlug?: string;
  carTitle?: string;
};

const TERMS = [12, 24, 36, 48, 60, 72, 84];

export function FinanceCalculator({ price, carSlug, carTitle }: Props) {
  const basePrice = Math.max(Math.round(price) || 5000, 500);
  const [downPct, setDownPct] = useState(20);
  const [months, setMonths] = useState(60);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const send = useServerFn(submitLead);
  const down = Math.round((basePrice * downPct) / 100);
  const result = useMemo(() => calcFinance(basePrice, down, months), [basePrice, down, months]);

  const summary = `Cerere pre-aprobare rate${carTitle ? ` pentru ${carTitle}` : ""}: preț ${eur(basePrice)}, avans ${eur(down)} (${downPct}%), ${months} luni, rată estimativă ${eur(result.monthly)}/lună.`;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2 || phone.trim().length < 6) {
      toast.error("Completează numele și un număr de telefon valid.");
      return;
    }
    setSending(true);
    try {
      await send({
        data: {
          kind: "finantare",
          name: name.trim().slice(0, 100),
          phone: phone.trim().slice(0, 40),
          carSlug,
          carTitle,
          message: summary,
          details: {
            price: basePrice,
            downPayment: down,
            downPct,
            months,
            monthly: Math.round(result.monthly),
          },
        },
      });
      setDone(true);
      toast.success("Cererea a fost trimisă. Te sunăm în cel mai scurt timp.");
    } catch {
      toast.error("Nu am putut trimite cererea. Sună-ne la 0751 692 335.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="surface-card rounded-xl p-6">
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
        <HandCoins className="size-4" /> Simulator rate — cash sau în rate
      </p>
      <h2 className="mt-2 text-2xl">Cât ai plăti pe lună?</h2>

      <div className="mt-6 space-y-6">
        <div>
          <div className="flex items-baseline justify-between">
            <Label>Avans</Label>
            <span className="text-sm font-semibold">
              {eur(down)} <span className="text-muted-foreground">({downPct}%)</span>
            </span>
          </div>
          <Slider
            className="mt-3"
            value={[downPct]}
            min={0}
            max={70}
            step={5}
            onValueChange={(v) => setDownPct(v[0] ?? 0)}
          />
        </div>

        <div>
          <Label>Perioadă</Label>
          <div className="mt-3 flex flex-wrap gap-2">
            {TERMS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setMonths(t)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  months === t
                    ? "border-primary bg-primary/10 font-semibold text-primary"
                    : "border-border text-muted-foreground hover:border-muted-foreground"
                }`}
              >
                {t} luni
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-primary/30 bg-primary/5 p-5 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Rată lunară estimativă</p>
          <p className="mt-1 font-display text-4xl font-extrabold text-primary">
            {eur(result.monthly)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Sumă finanțată {eur(result.financed)} · dobândă orientativă {DEFAULT_APR}% DAE · total{" "}
            {eur(result.totalPaid + down)}
          </p>
        </div>
      </div>

      {done ? (
        <p className="mt-6 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm font-medium text-primary">
          <Check className="size-4" /> Cererea a fost înregistrată. Te contactăm imediat.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <p className="text-sm font-semibold">Pre-aprobare în ~30 de minute</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="fin-name">Nume</Label>
              <Input
                id="fin-name"
                value={name}
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
                placeholder="Numele tău"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="fin-phone">Telefon</Label>
              <Input
                id="fin-phone"
                value={phone}
                maxLength={40}
                inputMode="tel"
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07xx xxx xxx"
                className="mt-1.5"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" size="lg" disabled={sending} className="flex-1">
              {sending ? <Loader2 className="size-4 animate-spin" /> : null} Cere pre-aprobare
            </Button>
            <Button asChild size="lg" variant="outline" className="flex-1">
              <a href={whatsappUrl(summary)} target="_blank" rel="noopener noreferrer">
                Trimite pe WhatsApp
              </a>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Simulare orientativă. Rata finală se stabilește de instituția financiară, în funcție de venit
            și perioada aleasă.
          </p>
        </form>
      )}
    </div>
  );
}
