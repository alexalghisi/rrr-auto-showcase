import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { openGooglePrivacySettings } from "@/lib/google-consent";

const EVENT = "bremen:cookie-settings";

export function openCookieSettings() {
  window.dispatchEvent(new Event(EVENT));
}

export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Retire the custom choice; it is not a certified TCF consent record.
    try { localStorage.removeItem("bremen-cookie-consent"); } catch { /* Storage may be disabled. */ }
    const show = () => { setOpen(!openGooglePrivacySettings()); };
    window.addEventListener(EVENT, show);
    return () => window.removeEventListener(EVENT, show);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg">
        <DialogTitle className="pr-6">Confidențialitate și cookie-uri</DialogTitle>
        <DialogDescription>
          Setările de consimțământ Google nu sunt disponibile momentan. Acordul pentru publicitate
          nu poate fi acordat prin această fereastră. Încearcă din nou mai târziu.
        </DialogDescription>
        <p className="text-sm text-muted-foreground">
          Detalii în <Link to="/cookies" onClick={() => setOpen(false)} className="text-primary underline">Politica de cookie-uri</Link> și{" "}
          <Link to="/confidentialitate" onClick={() => setOpen(false)} className="text-primary underline">Politica de confidențialitate</Link>.
        </p>
        <Button variant="outline" onClick={() => setOpen(false)}>Închide</Button>
      </DialogContent>
    </Dialog>
    </>
  );
}
