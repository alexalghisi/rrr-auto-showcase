import { useEffect, useState } from "react";

export const ADSTERRA_CONSENT_KEY = "bremen-adsterra-consent";
export const ADSTERRA_CONSENT_EVENT = "bremen:adsterra-consent";
export function allowsAdsterra(choice: string | null) { return choice === "granted"; }

export function useAdsterraConsent() {
  const [granted, setGranted] = useState(false);
  useEffect(() => {
    const read = () => {
      try { setGranted(allowsAdsterra(localStorage.getItem(ADSTERRA_CONSENT_KEY))); }
      catch { setGranted(false); }
    };
    read(); window.addEventListener(ADSTERRA_CONSENT_EVENT, read);
    return () => window.removeEventListener(ADSTERRA_CONSENT_EVENT, read);
  }, []);
  return granted;
}

export function chooseAdsterra(granted: boolean) {
  try { localStorage.setItem(ADSTERRA_CONSENT_KEY, granted ? "granted" : "denied"); }
  catch { return; }
  window.dispatchEvent(new Event(ADSTERRA_CONSENT_EVENT));
}