import { useEffect, useState } from "react";

export const ADSTERRA_CONSENT_KEY = "bremen-adsterra-consent";
export const ADSTERRA_CONSENT_EVENT = "bremen:adsterra-consent";
// The owner removed the accept/refuse prompt on 18 October 2026: ads load by
// default and only an explicit refusal ("denied") disables them.
export function allowsAdsterra(choice: string | null) { return choice !== "denied"; }

export function useAdsterraConsent() {
  const [granted, setGranted] = useState(true);
  useEffect(() => {
    const read = () => {
      try { setGranted(allowsAdsterra(localStorage.getItem(ADSTERRA_CONSENT_KEY))); }
      catch { setGranted(true); }
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