import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { openGooglePrivacySettings } from "@/lib/google-consent";
import { ADSTERRA_CONSENT_KEY, chooseAdsterra } from "@/lib/adsterra-consent";

const EVENT = "bremen:cookie-settings";

export function openCookieSettings() {
  window.dispatchEvent(new Event(EVENT));
}

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [adsterraPrompt, setAdsterraPrompt] = useState(false);

  useEffect(() => {
    // Retire the custom choice; it is not a certified TCF consent record.
    try { localStorage.removeItem("bremen-cookie-consent"); } catch { /* Storage may be disabled. */ }
    try { setAdsterraPrompt(localStorage.getItem(ADSTERRA_CONSENT_KEY) === null); }
    catch { /* Denied when storage is unavailable. */ }
    const show = () => { setOpen(!openGooglePrivacySettings()); setAdsterraPrompt(true); };
    window.addEventListener(EVENT, show);
    return () => window.removeEventListener(EVENT, show);
  }, []);

  return (
    <>
    {adsterraPrompt && !open && (
      <section aria-label="Consimțământ Adsterra" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-lg border border-border bg-card p-4 shadow-lg">
        <p className="text-sm text-muted-foreground">
          Permiți Adsterra să folosească cookie-uri și identificatori pentru afișarea și măsurarea reclamelor?
          Alegerea este separată de consimțământul Google. <Link to="/cookies" className="text-primary underline">Detalii</Link> ·{" "}
          <a href="https://adsterra.com/privacy-policy/" className="text-primary underline" target="_blank" rel="noreferrer">Politica Adsterra</a>
        </p>
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => { chooseAdsterra(false); setAdsterraPrompt(false); }}>Refuz Adsterra</Button>
          <Button onClick={() => { chooseAdsterra(true); setAdsterraPrompt(false); }}>Accept Adsterra</Button>
        </div>
      </section>
    )}
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
