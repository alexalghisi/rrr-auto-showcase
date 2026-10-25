import { useEffect } from "react";
import { useAdsterraConsent } from "@/lib/adsterra-consent";
import { SOCIAL_BAR_SRC } from "@/lib/ad-placements";
import { whenIdleAfterLoad } from "@/lib/after-load";
export { AdsterraSlot } from "./adsterra-slot";

export const ADSENSE_CLIENT = "ca-pub-4079300108937036";
const ADSENSE_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;

export function SocialBar() {
  const consent = useAdsterraConsent();
  useEffect(() => {
    if (!consent) return;
    // Injected only after the page is interactive so ads never block rendering.
    return whenIdleAfterLoad(() => {
      if (document.getElementById("bremen-adsterra-social-bar")) return;
      const script = document.createElement("script");
      script.id = "bremen-adsterra-social-bar";
      script.src = SOCIAL_BAR_SRC;
      script.async = true;
      script.setAttribute("data-cfasync", "false");
      document.body.appendChild(script);
      // Keep the global script across navigation and StrictMode remounts.
    });
  }, [consent]);
  return null;
}

/** Google AdSense (auto ads + consent messaging), loaded once after the page is interactive. */
export function GoogleAdSense() {
  useEffect(
    () =>
      whenIdleAfterLoad(() => {
        if (document.getElementById("bremen-adsense")) return;
        const script = document.createElement("script");
        script.id = "bremen-adsense";
        script.async = true;
        script.src = ADSENSE_SRC;
        script.crossOrigin = "anonymous";
        document.head.appendChild(script);
      }),
    [],
  );
  return null;
}
