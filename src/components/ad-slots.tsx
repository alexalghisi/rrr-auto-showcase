import { useEffect, useRef, useState } from "react";
import { useAdsterraConsent } from "@/lib/adsterra-consent";

// Adsterra zones (publisher account of the site owner).
const BANNER_728 = "04eba6e0b9b24743b164ff6f94dd40ad";
const BANNER_320 = "c35999d84d7047d5ca021b0fc5ec417b";
const NATIVE_KEY = "8380411ac102e792dca8cfde795da227";
const NATIVE_SRC = `https://pl31754794.profitableratecpmnetwork.com/${NATIVE_KEY}/invoke.js`;
const SOCIAL_BAR_SRC =
  "https://pl31754796.profitableratecpmnetwork.com/44/3f/14/443f141a0ff3ecf271527c4207eb3e20.js";

// Explicitly reactivated by the publisher on 17 October 2026.
const ADSTERRA_HIDDEN = false;

// Each banner lives in its own iframe because the Adsterra snippet uses a global `atOptions`.
function IframeBanner({ keyId, width, height }: { keyId: string; width: number; height: number }) {
  const doc = `<!doctype html><html><body style="margin:0"><script>atOptions={'key':'${keyId}','format':'iframe','height':${height},'width':${width},'params':{}};</script><script src="https://www.highperformanceformat.com/${keyId}/invoke.js"></script></body></html>`;
  return (
    <iframe
      title="Publicitate"
      srcDoc={doc}
      width={width}
      height={height}
      scrolling="no"
      loading="lazy"
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"
      style={{ border: 0, maxWidth: "100%" }}
    />
  );
}

export function AdBanner() {
  const consent = useAdsterraConsent();
  const [mobile, setMobile] = useState<boolean | null>(null);
  useEffect(() => {
    setMobile(window.matchMedia("(max-width: 767px)").matches);
  }, []);
  if (ADSTERRA_HIDDEN || !consent) return null;
  if (mobile === null) return <div style={{ minHeight: 50 }} />;
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-1 px-4 py-4">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Publicitate</span>
      {mobile ? (
        <IframeBanner keyId={BANNER_320} width={320} height={50} />
      ) : (
        <IframeBanner keyId={BANNER_728} width={728} height={90} />
      )}
    </div>
  );
}

export function NativeAd() {
  const consent = useAdsterraConsent();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ADSTERRA_HIDDEN || !consent) return;
    const el = ref.current;
    if (!el) return;
    const s = document.createElement("script");
    s.async = true;
    s.setAttribute("data-cfasync", "false");
    s.src = NATIVE_SRC;
    el.parentElement?.appendChild(s);
    return () => {
      s.remove();
    };
  }, [consent]);
  if (ADSTERRA_HIDDEN || !consent) return null;
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-4">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Publicitate</span>
      <div ref={ref} id={`container-${NATIVE_KEY}`} />
    </div>
  );
}

export function SocialBar() {
  const consent = useAdsterraConsent();
  useEffect(() => {
    if (ADSTERRA_HIDDEN || !consent) return;
    const s = document.createElement("script");
    s.src = SOCIAL_BAR_SRC;
    s.async = true;
    document.body.appendChild(s);
    return () => {
      s.remove();
    };
  }, [consent]);
  if (ADSTERRA_HIDDEN) return null;
  return null;
}
