import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CalendarCheck, Loader2, Check, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { submitLead } from "@/lib/leads.functions";
import { whatsappUrl } from "@/lib/site";

type Props = {
  carSlug: string;
  carTitle: string;
  price: string;
};

export function ReserveDialog({ carSlug, carTitle, price }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [when, setWhen] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const send = useServerFn(submitLead);

  const message = `Vreau să rezerv 24h ${carTitle} (${price}).${when ? ` Aș veni la vizionare: ${when}.` : ""}`;

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
          kind: "rezervare",
          name: name.trim().slice(0, 100),
          phone: phone.trim().slice(0, 40),
          carSlug,
          carTitle,
          message,
          details: { visit: when.slice(0, 100) },
        },
      });
      setDone(true);
      toast.success("Mașina e blocată 24h pe numele tău. Te sunăm pentru confirmare.");
    } catch {
      toast.error("Nu am putut trimite rezervarea. Sună-ne la 0751 692 335.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" variant="secondary">
          <CalendarCheck className="size-4" /> Rezervă 24h gratuit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rezervă {carTitle} 24 de ore</DialogTitle>
          <DialogDescription>
            Blocăm mașina pe numele tău 24 de ore, fără plată și fără obligații. Nu o mai arătăm nimănui
            până vii la vizionare.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <p className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm font-medium text-primary">
            <Check className="size-4" /> Rezervare înregistrată. Te contactăm în cel mai scurt timp.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="res-name">Nume</Label>
              <Input
                id="res-name"
                value={name}
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
                placeholder="Numele tău"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="res-phone">Telefon</Label>
              <Input
                id="res-phone"
                value={phone}
                maxLength={40}
                inputMode="tel"
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07xx xxx xxx"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="res-when">Când ai veni la vizionare? (opțional)</Label>
              <Input
                id="res-when"
                value={when}
                maxLength={100}
                onChange={(e) => setWhen(e.target.value)}
                placeholder="ex: mâine după 18:00"
                className="mt-1.5"
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" disabled={sending} className="flex-1">
                {sending ? <Loader2 className="size-4 animate-spin" /> : null} Confirmă rezervarea
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer">
                  Rezervă pe WhatsApp
                </a>
              </Button>
            </div>
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
              Fără avans, fără card, fără costuri. Datele tale sunt folosite doar pentru această rezervare.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
