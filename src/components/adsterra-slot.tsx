import { useEffect, useRef, useState } from "react";
import { useAdsterraConsent } from "@/lib/adsterra-consent";
import { adDocument, bannerFor } from "@/lib/ad-placements";
import { useAfterLoad } from "@/lib/after-load";

export function AdsterraSlot({ variant = "banner", className = "" }: {
  variant?: "banner" | "native";
  className?: string;
}) {
  const consent = useAdsterraConsent();
  // Ads are mounted only after the page has loaded, never during the critical path.
  const loaded = useAfterLoad();
  const container = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [desktop, setDesktop] = useState<boolean | null>(null);
  const [nearby, setNearby] = useState(false);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => { setDesktop(media.matches); setHeight(0); };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const element = container.current;
    if (!element || !consent) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setNearby(true);
        observer.disconnect();
      }
    }, { rootMargin: "400px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [consent]);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (!frame.current || event.source !== frame.current.contentWindow) return;
      const data = event.data;
      if (data?.type !== "bremen:ad-fill") return;
      const next = Number(data.height);
      setHeight(data.filled === true && Number.isFinite(next) && next > 0 ? Math.min(next, 2000) : 0);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);

  const zone = variant === "banner" ? bannerFor(desktop ? 768 : 767) : null;
  const filled = consent && height > 0;
  return (
    <div ref={container} data-adsterra-slot={variant}
      className={`relative mx-auto w-full max-w-6xl ${filled ? className : "h-0 overflow-hidden"}`}>
      {desktop !== null && nearby && consent && loaded && (
        <div className={`flex flex-col items-center gap-1 ${filled ? "py-4" : "absolute inset-x-0 top-0"}`}>
          {filled && <span className="text-[10px] text-muted-foreground">Publicitate</span>}
          <iframe key={`${variant}-${desktop}`} ref={frame} title="Publicitate Adsterra"
            srcDoc={adDocument(zone)} loading="lazy" scrolling="no"
            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"
            width={zone?.width ?? "100%"} height={height || zone?.height || 250}
            className={`max-w-full border-0 ${filled ? "" : "invisible"}`} />
        </div>
      )}
    </div>
  );
}