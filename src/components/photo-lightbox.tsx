import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { photoUrl } from "@/lib/site";

export type LightboxState = { images: string[]; index: number; rect: DOMRect } | null;

/**
 * Vizualizator foto cu animație de deschidere în stil iOS: poza „crește"
 * din miniatura apăsată către centrul ecranului, cu un spring discret.
 */
export function PhotoLightbox({
  state,
  onClose,
}: {
  state: LightboxState;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (state) {
      setIndex(state.index);
      setClosing(false);
    }
  }, [state]);

  const close = useCallback(() => {
    setClosing(true);
    setOpen(false);
    window.setTimeout(onClose, 260);
  }, [onClose]);

  useLayoutEffect(() => {
    if (!state) return;
    const raf = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(raf);
  }, [state]);

  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % state.images.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + state.images.length) % state.images.length);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [state, close]);

  if (!state) return null;

  const { rect, images } = state;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const targetW = Math.min(vw * 0.92, 1200);
  const targetH = vh * 0.86;

  const scale = Math.max(rect.width / targetW, 0.05);
  const dx = rect.left + rect.width / 2 - vw / 2;
  const dy = rect.top + rect.height / 2 - vh / 2;

  const closed = `translate(${dx}px, ${dy}px) scale(${scale})`;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      onClick={close}
    >
      <div
        className="absolute inset-0 bg-background/85 backdrop-blur-md transition-opacity duration-250"
        style={{ opacity: open && !closing ? 1 : 0 }}
      />

      <img
        ref={imgRef}
        src={photoUrl(images[index] ?? "")}
        alt={`Fotografie mărită ${index + 1}`}
        onClick={(e) => e.stopPropagation()}
        className="relative select-none rounded-2xl object-contain shadow-2xl"
        style={{
          width: targetW,
          maxHeight: targetH,
          transform: open && !closing ? "translate(0px, 0px) scale(1)" : closed,
          opacity: open && !closing ? 1 : 0.4,
          transition:
            "transform 420ms cubic-bezier(0.22, 1.2, 0.36, 1), opacity 220ms ease-out",
          willChange: "transform",
        }}
      />

      <button
        type="button"
        aria-label="Închide"
        onClick={close}
        className="absolute right-4 top-4 rounded-full bg-surface-strong/80 p-2 text-foreground transition hover:scale-105"
      >
        <X className="size-5" />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Fotografia anterioară"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i - 1 + images.length) % images.length);
            }}
            className="absolute left-3 rounded-full bg-surface-strong/80 p-3 transition hover:scale-105"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Fotografia următoare"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i + 1) % images.length);
            }}
            className="absolute right-3 rounded-full bg-surface-strong/80 p-3 transition hover:scale-105"
          >
            <ChevronRight className="size-5" />
          </button>
          <p className="absolute bottom-5 rounded-full bg-surface-strong/80 px-3 py-1 text-xs text-muted-foreground">
            {index + 1} / {images.length}
          </p>
        </>
      )}
    </div>
  );
}
