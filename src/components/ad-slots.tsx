import { useEffect } from "react";
import { useAdsterraConsent } from "@/lib/adsterra-consent";
import { SOCIAL_BAR_SRC } from "@/lib/ad-placements";
export { AdsterraSlot } from "./adsterra-slot";

export function SocialBar() {
  const consent = useAdsterraConsent();
  useEffect(() => {
    if (!consent || document.getElementById("bremen-adsterra-social-bar")) return;
    const script = document.createElement("script");
    script.id = "bremen-adsterra-social-bar";
    script.src = SOCIAL_BAR_SRC;
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    document.body.appendChild(script);
    // Keep the global script across navigation and StrictMode remounts.
  }, [consent]);
  return null;
}
