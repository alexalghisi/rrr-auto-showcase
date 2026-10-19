import { useEffect, useRef, useState } from "react";
import { useAdsterraConsent } from "@/lib/adsterra-consent";
import {
  AD_ZONES,
  NATIVE_KEY,
  NATIVE_SRC,
  SOCIAL_BAR_SRC,
  bannerDocument,
  bannerFor,
  showsSideRails,
  type AdZone,
} from "@/lib/ad-placements";

const BREAKPOINTS = ["(min-width: 768px)", "(min-width: 1024px)", "(min-width: 1600px)"];

function useViewportWidth() {
  const [width, setWidth] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    const queries = BREAKPOINTS.map((query) => window.matchMedia(query));
    queries.forEach((query) => query.addEventListener("change", update));
    update();
    return () => queries.forEach((query) => query.removeEventListener("change", update));
  }, []);
  return width;
}

function AdLabel() {
  return (
    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Publicitate</span>
  );
}

function IframeBanner({ zone }: { zone: AdZone }) {
  return (
    <iframe
      key={zone.key}
      title="Publicitate"
      srcDoc={bannerDocument(zone)}
      width={zone.width}
      height={zone.height}
      scrolling="no"
      loading="lazy"
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"
      style={{ border: 0, maxWidth: "100%" }}
    />
  );
}

export function AdBanner() {
  const consent = useAdsterraConsent();
  const width = useViewportWidth();
  if (!consent) return null;
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-1 px-4 py-4">
      <AdLabel />
      {width === null ? (
        <div style={{ minHeight: AD_ZONES.mobile.height }} />
      ) : (
        <IframeBanner zone={bannerFor(width)} />
      )}
    </div>
  );
}

export function AdRectangle({ className = "" }: { className?: string }) {
  const consent = useAdsterraConsent();
  if (!consent) return null;
  return (
    <div className={`flex flex-col items-center justify-center gap-1 ${className}`}>
      <AdLabel />
      <IframeBanner zone={AD_ZONES.rectangle} />
    </div>
  );
}

export function AdSideRails() {
  const consent = useAdsterraConsent();
  const width = useViewportWidth();
  if (!consent || width === null || !showsSideRails(width)) return null;
  const { skyscraper } = AD_ZONES;
  return (
    <>
      {(["left-4", "right-4"] as const).map((side) => (
        <aside
          key={side}
          aria-label="Publicitate"
          className={`fixed top-28 z-30 flex flex-col items-center gap-1 ${side}`}
          style={{ width: skyscraper.width }}
        >
          <AdLabel />
          <IframeBanner zone={skyscraper} />
        </aside>
      ))}
    </>
  );
}

export function NativeAd() {
  const consent = useAdsterraConsent();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!consent) return;
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
  if (!consent) return null;
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-4">
      <AdLabel />
      <div ref={ref} id={`container-${NATIVE_KEY}`} />
    </div>
  );
}

export function SocialBar() {
  const consent = useAdsterraConsent();
  useEffect(() => {
    if (!consent) return;
    const s = document.createElement("script");
    s.src = SOCIAL_BAR_SRC;
    s.async = true;
    s.setAttribute("data-cfasync", "false");
    document.body.appendChild(s);
    return () => {
      s.remove();
    };
  }, [consent]);
  return null;
}
