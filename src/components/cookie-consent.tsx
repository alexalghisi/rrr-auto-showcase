import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const KEY = "bremen-cookie-consent";
const EVENT = "bremen:cookie-settings";

type Gtag = (...args: unknown[]) => void;

function applyConsent(granted: boolean) {
  const w = window as unknown as { gtag?: Gtag };
  const v = granted ? "granted" : "denied";
  w.gtag?.("consent", "update", { ad_storage: v, ad_user_data: v, ad_personalization: v, analytics_storage: v });
  const ads = window as unknown as { adsbygoogle?: { requestNonPersonalizedAds?: number; pauseAdRequests?: number } };
  ads.adsbygoogle = (ads.adsbygoogle ?? []) as never;
  if (ads.adsbygoogle) {
    ads.adsbygoogle.requestNonPersonalizedAds = granted ? 0 : 1;
    ads.adsbygoogle.pauseAdRequests = 0;
  }
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(EVENT));
}

export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved) applyConsent(saved === "all");
    else setOpen(true);
    const show = () => setOpen(true);
    window.addEventListener(EVENT, show);
    return () => window.removeEventListener(EVENT, show);
  }, []);

  if (!open) return null;

  const choose = (all: boolean) => {
    localStorage.setItem(KEY, all ? "all" : "necessary");
    applyConsent(all);
    setOpen(false);
  };

  return (
    <div role="dialog" aria-label="Acord cookie-uri" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-xl border border-border bg-card p-5 shadow-lg">
      <p className="text-sm text-muted-foreground">
        Folosim cookie-uri necesare pentru funcționarea site-ului și, cu acordul tău, cookie-uri Google pentru reclame
        personalizate. Detalii în <Link to="/cookies" className="text-primary underline">Politica de cookie-uri</Link> și{" "}
        <Link to="/confidentialitate" className="text-primary underline">Politica de confidențialitate</Link>.
      </p>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={() => choose(false)}>Doar necesare</Button>
        <Button onClick={() => choose(true)}>Accept toate</Button>
      </div>
    </div>
  );
}
